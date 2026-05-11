'use client'

import { create } from 'zustand'

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

const useWorkspaceStoreBase = create<WorkspaceStore>()((set) => ({
  workspaces: [],
  currentWorkspace: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  clearWorkspaces: () => set({ workspaces: [], currentWorkspace: null }),
}))

export const useWorkspaceStore = useWorkspaceStoreBase