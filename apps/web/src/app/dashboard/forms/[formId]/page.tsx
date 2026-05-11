'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart2, Eye, Loader2, Play, Pause } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api/client'
import { useWorkspaceStore } from '@/lib/stores/workspace.store'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default function FormDetailPage() {
  const params = useParams()
  const { currentWorkspace } = useWorkspaceStore()
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!currentWorkspace || !params.formId) return
    api.forms.get(currentWorkspace.id, params.formId as string).then(({ data }) => {
      setForm(data)
      setLoading(false)
    })
  }, [currentWorkspace, params.formId])

  const handlePublish = async () => {
    if (!currentWorkspace || !form) return
    setPublishing(true)
    try {
      await api.forms.publish(currentWorkspace.id, form.id)
      setForm((prev: any) => ({ ...prev, status: 'ACTIVE' }))
      toast.success('Form is now live!')
    } catch {
      toast.error('Failed to publish form')
    } finally {
      setPublishing(false)
    }
  }

  const handlePause = async () => {
    if (!currentWorkspace || !form) return
    try {
      await api.forms.pause(currentWorkspace.id, form.id)
      setForm((prev: any) => ({ ...prev, status: 'PAUSED' }))
      toast.success('Form paused')
    } catch {
      toast.error('Failed to pause form')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!form) return null

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/f/${form.id}`
    : ''

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/forms" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold truncate">{form.title}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Created {formatDate(form.createdAt)} · {form._count?.responses ?? 0} responses
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/forms/${form.id}/analytics`}
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-sm hover:bg-accent transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Analytics
          </Link>
          <Link
            href={`/f/${form.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-sm hover:bg-accent transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Link>
          {form.status === 'DRAFT' || form.status === 'PAUSED' ? (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Publish
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-sm hover:bg-accent"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          )}
        </div>
      </div>

      {form.status === 'ACTIVE' && shareUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-green-800 mb-1">Form is live</p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-white border border-green-200 rounded px-2 py-1 flex-1 truncate text-green-700">
              {shareUrl}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl)
                toast.success('Link copied!')
              }}
              className="text-xs text-green-700 hover:underline shrink-0"
            >
              Copy link
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg">
        <div className="p-5 border-b">
          <h2 className="font-medium">Questions ({form.questions?.length ?? 0})</h2>
        </div>
        <div className="divide-y">
          {form.questions?.map((question: any, index: number) => (
            <div key={question.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{question.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground capitalize">
                      {question.type.replace('_', ' ').toLowerCase()}
                    </span>
                    {question.required && (
                      <span className="text-xs text-destructive">required</span>
                    )}
                  </div>
                  {question.options && question.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {question.options.map((opt: string) => (
                        <span key={opt} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}