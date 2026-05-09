'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { api } from '@/lib/api/client'
import { useWorkspaceStore } from '@/lib/stores/workspace.store'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export default function FormAnalyticsPage() {
  const params = useParams()
  const { currentWorkspace } = useWorkspaceStore()
  const [analytics, setAnalytics] = useState<any>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [loadingAi, setLoadingAi] = useState(false)
  const formId = params.formId as string

  useEffect(() => {
    api.analytics.getFormAnalytics(formId).then(({ data }) => {
      setAnalytics(data)
      setLoadingAnalytics(false)
    })
  }, [formId])

  const fetchAiSummary = async () => {
    setLoadingAi(true)
    try {
      const { data } = await api.analytics.getAiSummary(formId)
      setAiSummary(data.summary)
    } finally {
      setLoadingAi(false)
    }
  }

  if (loadingAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/dashboard/forms/${formId}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-semibold">Analytics</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total responses', value: analytics?.totalResponses ?? 0 },
          { label: 'NPS score', value: analytics?.npsScore ?? 'N/A' },
          {
            label: 'Questions',
            value: analytics?.questionBreakdown?.length ?? 0,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border rounded-lg p-5">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {analytics?.responsesByDay?.length > 0 && (
        <div className="bg-card border rounded-lg p-5 mb-6">
          <h2 className="font-medium mb-4">Responses over time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.responsesByDay}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-card border rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">AI summary</h2>
          <button
            onClick={fetchAiSummary}
            disabled={loadingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 disabled:opacity-50"
          >
            {loadingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Generate summary
          </button>
        </div>
        {aiSummary ? (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {aiSummary}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click &quot;Generate summary&quot; to get an AI-powered analysis of
            your text responses.
          </p>
        )}
      </div>

      {analytics?.questionBreakdown?.map((q: any) => (
        <div key={q.questionId} className="bg-card border rounded-lg p-5 mb-4">
          <h3 className="font-medium text-sm mb-4">{q.title}</h3>

          {['SINGLE_CHOICE', 'MULTI_CHOICE', 'RATING', 'NPS'].includes(q.type) &&
            typeof q.data === 'object' &&
            !Array.isArray(q.data) && (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={Object.entries(q.data).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {Object.keys(q.data).map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

          {['SHORT_TEXT', 'LONG_TEXT'].includes(q.type) &&
            Array.isArray(q.data) && (
              <div className="space-y-2">
                {q.data.slice(0, 5).map((answer: string, i: number) => (
                  <p
                    key={i}
                    className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2"
                  >
                    {String(answer)}
                  </p>
                ))}
                {q.data.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{q.data.length - 5} more responses
                  </p>
                )}
              </div>
            )}
        </div>
      ))}
    </div>
  )
}
