'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, CheckCircle, MessageSquare } from 'lucide-react'
import { api } from '@/lib/api/client'

export default function PublicFormPage() {
  const params = useParams()
  const formId = params.formId as string
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  useEffect(() => {
    api.forms.getPublic(formId).then(({ data }) => {
      setForm(data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [formId])

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const required = form.questions.filter((q: any) => q.required)
    const missing = required.filter((q: any) => !answers[q.id] && answers[q.id] !== 0)
    if (missing.length > 0) {
      toast.error(`Please answer all required questions`)
      return
    }

    setSubmitting(true)
    try {
      await api.responses.submit({
        formId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
        isAnonymous: form.isAnonymous,
      })
      setSubmitted(true)
    } catch {
      toast.error('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Form not found</p>
          <p className="text-muted-foreground text-sm">
            This form may no longer be active.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Thank you!</h1>
          <p className="text-muted-foreground text-sm">
            Your response has been recorded.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">EchoDesk</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
          {form.isAnonymous && (
            <p className="text-xs text-muted-foreground mt-2 bg-muted px-3 py-1.5 rounded-md inline-block">
              Your response is anonymous
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.questions.map((question: any, index: number) => (
            <div key={question.id} className="bg-card border rounded-lg p-5">
              <label className="block text-sm font-medium mb-3">
                {index + 1}. {question.title}
                {question.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </label>

              {question.type === 'SHORT_TEXT' && (
                <input
                  value={answers[question.id] ?? ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  placeholder="Your answer"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}

              {question.type === 'LONG_TEXT' && (
                <textarea
                  value={answers[question.id] ?? ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  placeholder="Your answer"
                  rows={4}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              )}

              {question.type === 'SINGLE_CHOICE' && (
                <div className="space-y-2">
                  {question.options?.map((opt: string) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={opt}
                        checked={answers[question.id] === opt}
                        onChange={() => handleAnswer(question.id, opt)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm group-hover:text-foreground text-muted-foreground">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'MULTI_CHOICE' && (
                <div className="space-y-2">
                  {question.options?.map((opt: string) => {
                    const selected: string[] = answers[question.id] ?? []
                    return (
                      <label
                        key={opt}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(opt)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...selected, opt]
                              : selected.filter((s) => s !== opt)
                            handleAnswer(question.id, next)
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm group-hover:text-foreground text-muted-foreground">
                          {opt}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}

              {question.type === 'RATING' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleAnswer(question.id, n)}
                      className={`w-10 h-10 rounded-md border text-sm font-medium transition-colors ${
                        answers[question.id] === n
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'NPS' && (
                <div>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: 11 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnswer(question.id, i)}
                        className={`w-9 h-9 rounded-md border text-sm font-medium transition-colors ${
                          answers[question.id] === i
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-accent'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      Not likely
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Very likely
                    </span>
                  </div>
                </div>
              )}

              {question.type === 'DATE' && (
                <input
                  type="date"
                  value={answers[question.id] ?? ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit response
          </button>
        </form>
      </div>
    </div>
  )
}
