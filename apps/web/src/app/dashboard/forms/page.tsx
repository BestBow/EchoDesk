'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, MoreHorizontal, Trash2, BarChart2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api/client'
import { useWorkspaceStore } from '@/lib/stores/workspace.store'
import { formatRelativeTime } from '@/lib/utils'

export default function FormsPage() {
  const { currentWorkspace } = useWorkspaceStore()
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    if (!currentWorkspace) return
    api.forms.list(currentWorkspace.id).then(({ data }) => {
      setForms(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [currentWorkspace])

  const handleDelete = async (formId: string) => {
    if (!currentWorkspace) return
    if (!confirm('Delete this form? This cannot be undone.')) return
    try {
      await api.forms.delete(currentWorkspace.id, formId)
      setForms((prev) => prev.filter((f) => f.id !== formId))
      toast.success('Form deleted')
    } catch {
      toast.error('Failed to delete form')
    }
  }

  const handlePublish = async (formId: string) => {
    if (!currentWorkspace) return
    try {
      await api.forms.publish(currentWorkspace.id, formId)
      setForms((prev) =>
        prev.map((f) => (f.id === formId ? { ...f, status: 'ACTIVE' } : f)),
      )
      toast.success('Form published')
    } catch {
      toast.error('Failed to publish form')
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Forms</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {forms.length} form{forms.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New form
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
      ) : forms.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-16 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-medium mb-1">No forms yet</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first form to start collecting feedback.
          </p>
          <Link
            href="/dashboard/forms/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Create a form
          </Link>
        </div>
      ) : (
        <div className="bg-card border rounded-lg divide-y">
          {forms.map((form) => (
            <div
              key={form.id}
              className="flex items-center gap-4 p-4 hover:bg-accent transition-colors group"
            >
              <div className="w-9 h-9 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/dashboard/forms/${form.id}`}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {form.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {form._count?.responses ?? 0} responses ·{' '}
                  {form.questions?.length ?? 0} questions ·{' '}
                  {formatRelativeTime(form.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  form.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : form.status === 'DRAFT'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {form.status.toLowerCase()}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === form.id ? null : form.id)}
                    className="p-1.5 rounded-md hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {menuOpen === form.id && (
                    <div className="absolute right-0 top-8 bg-card border rounded-lg shadow-lg py-1 z-10 w-40">
                      <Link
                        href={`/dashboard/forms/${form.id}/analytics`}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        Analytics
                      </Link>
                      <Link
                        href={`/f/${form.id}`}
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </Link>
                      {form.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(form.id)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent w-full text-left text-green-600"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent w-full text-left text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}export const dynamic = 'force-dynamic'
