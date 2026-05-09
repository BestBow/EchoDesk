import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

interface SubmitResponseDto {
  formId: string
  answers: { questionId: string; value: unknown }[]
  isAnonymous?: boolean
  respondentId?: string
  metadata?: Record<string, unknown>
}

@Injectable()
export class ResponsesService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(dto: SubmitResponseDto) {
    const form = await this.prisma.form.findUnique({
      where: { id: dto.formId, status: 'ACTIVE' },
      include: { questions: true },
    })

    if (!form) throw new BadRequestException('Form is not accepting responses')

    const requiredQuestions = form.questions.filter((q) => q.required)
    const answeredIds = new Set(dto.answers.map((a) => a.questionId))
    const missing = requiredQuestions.filter((q) => !answeredIds.has(q.id))

    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required questions: ${missing.map((q) => q.title).join(', ')}`,
      )
    }

    return this.prisma.response.create({
      data: {
        formId: dto.formId,
        isAnonymous: dto.isAnonymous ?? form.isAnonymous,
        respondentId: dto.isAnonymous ? null : dto.respondentId,
        metadata: (dto.metadata ?? {}) as any,
        answers: {
          create: dto.answers.map((a) => ({
            questionId: a.questionId,
            value: a.value as any,
          })),
        },
      },
      include: { answers: true },
    })
  }

  async findByForm(formId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.response.findMany({
        where: { formId },
        include: {
          answers: {
            include: { question: { select: { title: true, type: true } } },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.response.count({ where: { formId } }),
    ])

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
