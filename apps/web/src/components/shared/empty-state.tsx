import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="border-2 border-dashed rounded-lg p-16 text-center">
      <Icon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <h2 className="font-medium mb-1">{title}</h2>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
