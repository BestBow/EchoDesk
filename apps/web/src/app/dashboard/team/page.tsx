'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPlus, Loader2 } from 'lucide-react'
import { api } from '@/lib/api/client'
import { useWorkspaceStore } from '@/lib/stores/workspace.store'
import { getInitials, formatDate } from '@/lib/utils'

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email'),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']),
})
type InviteForm = z.infer<typeof inviteSchema>

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  MANAGER: 'bg-green-100 text-green-700',
  VIEWER: 'bg-gray-100 text-gray-600',
}

export default function TeamPage() {
  const { currentWorkspace } = useWorkspaceStore()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<InviteForm>({ resolver: zodResolver(inviteSchema) })

  useEffect(() => {
    if (!currentWorkspace) return
    api.workspaces.getMembers(currentWorkspace.id).then(({ data }) => {
      setMembers(data)
      setLoading(false)
    })
  }, [currentWorkspace])

  const onInvite = async (data: InviteForm) => {
    if (!currentWorkspace) return
    setInviting(true)
    try {
      const { data: newMember } = await api.workspaces.invite(
        currentWorkspace.id,
        data.email,
        data.role,
      )
      setMembers((prev) => [...prev, newMember])
      reset()
      toast.success(`${data.email} added to workspace`)
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to invite member')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage workspace members and their roles
        </p>
      </div>

      <div className="bg-card border rounded-lg p-5 mb-6">
        <h2 className="font-medium mb-4">Invite member</h2>
        <form
          onSubmit={handleSubmit(onInvite)}
          className="flex gap-3 items-start"
        >
          <div className="flex-1">
            <input
              {...register('email')}
              placeholder="colleague@company.com"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <select
            {...register('role')}
            className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="VIEWER">Viewer</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            disabled={inviting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
          >
            {inviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Invite
          </button>
        </form>
      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-5 border-b">
          <h2 className="font-medium">
            Members{' '}
            <span className="text-muted-foreground font-normal text-sm">
              ({members.length})
            </span>
          </h2>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center gap-3 p-4"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium shrink-0">
                  {getInitials(member.user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Joined {formatDate(member.joinedAt)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role] ?? ''}`}
                  >
                    {member.role.toLowerCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
