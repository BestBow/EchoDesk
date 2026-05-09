import axios from 'axios'
import { auth } from '../firebase/config'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') return config
  try {
    const token = localStorage.getItem('echodesk_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {}
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await auth.signOut()
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  },
)

export const api = {
  auth: {
    exchange: (idToken: string) =>
      apiClient.post('/auth/exchange', { idToken }),
  },
  users: {
    me: () => apiClient.get('/users/me'),
    updateProfile: (data: { name?: string; avatarUrl?: string }) =>
      apiClient.patch('/users/me', data),
  },
  workspaces: {
    list: () => apiClient.get('/workspaces'),
    create: (name: string) => apiClient.post('/workspaces', { name }),
    getMembers: (workspaceId: string) =>
      apiClient.get(`/workspaces/${workspaceId}/members`),
    invite: (workspaceId: string, email: string, role: string) =>
      apiClient.post(`/workspaces/${workspaceId}/members`, { email, role }),
    updateRole: (workspaceId: string, userId: string, role: string) =>
      apiClient.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role }),
    removeMember: (workspaceId: string, userId: string) =>
      apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`),
  },
  forms: {
    list: (workspaceId: string) =>
      apiClient.get(`/workspaces/${workspaceId}/forms`),
    create: (workspaceId: string, data: any) =>
      apiClient.post(`/workspaces/${workspaceId}/forms`, data),
    get: (workspaceId: string, formId: string) =>
      apiClient.get(`/workspaces/${workspaceId}/forms/${formId}`),
    update: (workspaceId: string, formId: string, data: any) =>
      apiClient.patch(`/workspaces/${workspaceId}/forms/${formId}`, data),
    publish: (workspaceId: string, formId: string) =>
      apiClient.patch(`/workspaces/${workspaceId}/forms/${formId}/publish`),
    pause: (workspaceId: string, formId: string) =>
      apiClient.patch(`/workspaces/${workspaceId}/forms/${formId}/pause`),
    archive: (workspaceId: string, formId: string) =>
      apiClient.patch(`/workspaces/${workspaceId}/forms/${formId}/archive`),
    delete: (workspaceId: string, formId: string) =>
      apiClient.delete(`/workspaces/${workspaceId}/forms/${formId}`),
    getPublic: (formId: string) =>
      apiClient.get(`/public/forms/${formId}`),
  },
  responses: {
    submit: (data: any) => apiClient.post('/responses', data),
    list: (formId: string, page = 1) =>
      apiClient.get(`/responses/form/${formId}?page=${page}`),
  },
  analytics: {
    getFormAnalytics: (formId: string) =>
      apiClient.get(`/analytics/forms/${formId}`),
    getAiSummary: (formId: string) =>
      apiClient.get(`/analytics/forms/${formId}/ai-summary`),
  },
  uploads: {
    avatar: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return apiClient.post('/uploads/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    workspaceLogo: (workspaceId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return apiClient.post(`/uploads/workspace/${workspaceId}/logo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
  },
}

export default apiClient
