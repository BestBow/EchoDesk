'use client'

import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'
import { useWorkspaceStore } from '@/lib/stores/workspace.store'
import { getInitials } from '@/lib/utils'

export function Topbar() {
  const { user, logout } = useAuth()
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
    toast.success('Signed out successfully')
  }

  return (
    <header className="h-14 border-b bg-card px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        {workspaces.length > 1 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">Workspace:</span>
            <select
              value={currentWorkspace?.id ?? ''}
              onChange={(e) => {
                const ws = workspaces.find((w) => w.id === e.target.value)
                if (ws) setCurrentWorkspace(ws)
              }}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                {getInitials(user.name)}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
