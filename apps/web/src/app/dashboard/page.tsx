'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Users, TrendingUp, Plus } from 'lucide-react'
import { api } from '@/lib/api/client'
import { useWorkspaceStore } from '@/lib/stores/workspace.store'
import { formatRelativeTime } from '@/lib/utils'

export default function DashboardPage() {
  const { currentWorkspace } = useWorkspaceStore()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentWorkspace) return
    api.forms.list(currentWorkspace.id).then(({ data }) => {
      const forms = data as any[]
      setStats({
        totalForms: forms.length,
        activeForms: forms.filter((f) => f.status === 'ACTIVE').length,
        totalResponses: forms.reduce((sum: number, f: any) => sum + (f._count?.responses ?? 0), 0),
        recentForms: forms.slice(0, 5),
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [currentWorkspace])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentWorkspace?.name ?? 'Your workspace'}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Total forms</p>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-semibold">
            {loading ? '—' : (stats?.totalForms ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Active forms</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-semibold">
            {loading ? '—' : (stats?.activeForms ?? 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Total responses</p>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-semibold">
            {loading ? '—' : (stats?.totalResponses ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-medium">Recent forms</h2>
          <Link href="/dashboard/forms" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : !stats || stats.recentForms.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm mb-3">
                No forms yet. Create your first one.
              </p>
              <Link
                href="/dashboard/forms/new"
                className="text-primary text-sm hover:underline"
              >
                Create a form →
              </Link>
            </div>
          ) : (
            stats.recentForms.map((form: any) => (
              <Link
                key={form.id}
                href={`/dashboard/forms/${form.id}`}
                className="flex items-center justify-between p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{form.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {form._count?.responses ?? 0} responses ·{' '}
                      {formatRelativeTime(form.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    form.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : form.status === 'DRAFT'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {form.status.toLowerCase()}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}export const dynamic = 'force-dynamic'
