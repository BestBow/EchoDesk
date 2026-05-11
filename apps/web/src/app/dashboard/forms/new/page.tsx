'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api } from '@/lib/api/client'
import { useWorkspaceStore } from '@/lib/stores/workspace.store'

const QUESTION_TYPES = [
  { value: 'SHORT_TEXT', label: 'Short text' },
  { value: 'LONG_TEXT', label: 'Long text' },
  { value: 'SINGLE_CHOICE', label: 'Single choice' },
  { value: 'MULTI_CHOICE', label: 'Multiple choice' },
  { value: 'RATING', label: 'Rating (1–5)' },
  { value: 'NPS', label: 'NPS (0–10)' },
  { value: 'DATE', label: 'Date' },
]

const formSchema = z.object({
  title: z.string().min(1, 'Form title is required').max(200),
  description: z.string().optional(),
  isAnonymous: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface Question {
  id: string
  title: string
  type: string
  required: boolean
  options: string[]
}

function SortableQuestion({
  question,
  onUpdate,
  onDelete,
}: {
  question: Question
  onUpdate: (id: string, updates: Partial<Question>) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const needsOptions = ['SINGLE_CHOICE', 'MULTI_CHOICE'].includes(question.type)

  return (
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-2 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <input
              value={question.title}
              onChange={(e) => onUpdate(question.id, { title: e.target.value })}
              placeholder="Question title"
              className="flex-1 border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={question.type}
              onChange={(e) => onUpdate(question.id, { type: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {needsOptions && (
            <div className="space-y-2 pl-1">
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...question.options]
                      newOptions[i] = e.target.value
                      onUpdate(question.id, { options: newOptions })
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options.filter((_, idx) => idx !== i)
                      onUpdate(question.id, { options: newOptions })
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => onUpdate(question.id, { options: [...question.options, ''] })}
                className="text-xs text-primary hover:underline"
              >
                + Add option
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={question.required}
              onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
              className="rounded"
            />
            <label htmlFor={`required-${question.id}`} className="text-xs text-muted-foreground">
              Required
            </label>
          </div>
        </div>

        <button
          onClick={() => onDelete(question.id)}
          className="mt-2 p-1 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function NewFormPage() {
  const router = useRouter()
  const { currentWorkspace } = useWorkspaceStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: '', type: 'SHORT_TEXT', required: false, options: [] },
    ])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!currentWorkspace) return
    if (questions.length === 0) {
      toast.error('Add at least one question')
      return
    }
    setSaving(true)
    try {
      const { data: form } = await api.forms.create(currentWorkspace.id, {
        ...data,
        questions: questions.map((q) => ({
          title: q.title,
          type: q.type,
          required: q.required,
          options: q.options.length > 0 ? q.options : undefined,
        })),
      })
      toast.success('Form created!')
      router.push(`/dashboard/forms/${form.id}`)
    } catch {
      toast.error('Failed to create form')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create form</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Build your feedback form</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Form title</label>
            <input
              {...register('title')}
              placeholder="e.g. Employee satisfaction survey"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.title && (
              <p className="text-destructive text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              placeholder="Tell respondents what this form is about"
              rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAnonymous"
              {...register('isAnonymous')}
              className="rounded"
            />
            <label htmlFor="isAnonymous" className="text-sm">
              Anonymous responses
              <span className="text-muted-foreground ml-1 text-xs">
                — respondent identities won&apos;t be stored
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-medium text-sm">
            Questions{' '}
            <span className="text-muted-foreground font-normal">({questions.length})</span>
          </h2>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {questions.map((q) => (
                  <SortableQuestion
                    key={q.id}
                    question={q}
                    onUpdate={updateQuestion}
                    onDelete={deleteQuestion}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full border-2 border-dashed rounded-lg py-3 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add question
          </button>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save form
          </button>
        </div>
      </form>
    </div>
  )
}export const dynamic = 'force-dynamic'
