'use client'

import { useWorkspaceStore } from '@/lib/stores/workspace.store'

export function useWorkspace() {
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspaceStore()
  return { currentWorkspace, workspaces, setCurrentWorkspace }
}
