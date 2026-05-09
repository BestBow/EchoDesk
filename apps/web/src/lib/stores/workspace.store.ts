'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Workspace {
  id: string
  name: string
  slug: string
  logoUrl?: string
  members?: { role: string }[]
}

interface WorkspaceStore {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  setWorkspaces: (workspaces: Workspace[]) => void
  setCurrentWorkspace: (workspace: Workspace) => void
  clearWorkspaces: () => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      workspaces: [],
      currentWorkspace: null,
      setWorkspaces: (workspaces) => set({ workspaces }),
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      clearWorkspaces: () => set({ workspaces: [], currentWorkspace: null }),
    }),
    {
      name: 'echodesk-workspace',
    },
  ),
)
