import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import Groq from 'groq-sdk'

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)
  private groq: Groq | null = null

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get('GROQ_API_KEY')
    if (apiKey) {
      this.groq = new Groq({ apiKey })
    }
  }

  async getFormAnalytics(formId: string) {
    const [responses, form] = await Promise.all([
      this.prisma.response.findMany({
        where: { formId },
        include: { answers: { include: { question: true } } },
      }),
      this.prisma.form.findUnique({
        where: { id: formId },
        include: { questions: true },
      }),
    ])

    if (!form) return null

    const totalResponses = responses.length
    const responsesByDay = this.groupByDay(responses)
    const questionBreakdown = this.buildBreakdown(form.questions, responses)
    const npsScore = this.calculateNps(form.questions, responses)

    return {
      totalResponses,
      responsesByDay,
      questionBreakdown,
      npsScore,
    }
  }

  async getAiSummary(formId: string) {
    if (!this.groq) {
      return { summary: 'AI summaries not configured — add GROQ_API_KEY to enable.' }
    }
    const responses = await this.prisma.response.findMany({
      where: { formId },
      include: { answers: { include: { question: true } } },
      take: 100,
    })

    if (responses.length === 0) {
      return { summary: 'No responses yet to summarize.' }
    }

    const textAnswers = responses
      .flatMap((r) => r.answers)
      .filter((a) => ['SHORT_TEXT', 'LONG_TEXT'].includes(a.question.type))
      .map((a) => `Q: ${a.question.title}\nA: ${String(a.value)}`)
      .join('\n\n')

    if (!textAnswers) {
      return { summary: 'No text responses to summarize.' }
    }

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content:
              'You are a feedback analyst. Summarize these responses concisely. Identify: 1) The main themes, 2) Overall sentiment, 3) Top 3 actionable takeaways. Be direct and specific.',
          },
          {
            role: 'user',
            content: `Analyze these ${responses.length} feedback responses:\n\n${textAnswers}`,
          },
        ],
        max_tokens: 600,
        temperature: 0.3,
      })

      return { summary: completion.choices[0]?.message?.content ?? 'Unable to generate summary.' }
    } catch (error) {
      this.logger.error('Groq API error', error)
      return { summary: 'AI summary temporarily unavailable.' }
    }
  }

  private groupByDay(responses: any[]) {
    const map: Record<string, number> = {}
    responses.forEach((r) => {
      const day = new Date(r.submittedAt).toISOString().split('T')[0]
      map[day] = (map[day] ?? 0) + 1
    })
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private buildBreakdown(questions: any[], responses: any[]) {
    return questions.map((q) => {
      const answers = responses
        .flatMap((r) => r.answers)
        .filter((a: any) => a.questionId === q.id)
        .map((a: any) => a.value)

      if (['SINGLE_CHOICE', 'MULTI_CHOICE'].includes(q.type)) {
        const counts: Record<string, number> = {}
        answers.flat().forEach((v: string) => {
          counts[v] = (counts[v] ?? 0) + 1
        })
        return { questionId: q.id, title: q.title, type: q.type, data: counts }
      }

      if (['RATING', 'NPS'].includes(q.type)) {
        const counts: Record<string, number> = {}
        answers.forEach((v: unknown) => {
          const k = String(v)
          counts[k] = (counts[k] ?? 0) + 1
        })
        return { questionId: q.id, title: q.title, type: q.type, data: counts }
      }

      return {
        questionId: q.id,
        title: q.title,
        type: q.type,
        data: answers.slice(0, 50),
      }
    })
  }

  private calculateNps(questions: any[], responses: any[]) {
    const npsQ = questions.find((q) => q.type === 'NPS')
    if (!npsQ) return null

    const scores = responses
      .flatMap((r) => r.answers)
      .filter((a: any) => a.questionId === npsQ.id)
      .map((a: any) => Number(a.value))
      .filter((n) => !isNaN(n))

    if (scores.length === 0) return null

    const promoters = scores.filter((s) => s >= 9).length
    const detractors = scores.filter((s) => s <= 6).length
    return Math.round(((promoters - detractors) / scores.length) * 100)
  }
}
