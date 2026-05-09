'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
import { api } from '@/lib/api/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { getInitials } from '@/lib/utils'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})
type ProfileForm = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  })

  const onSave = async (data: ProfileForm) => {
    setSaving(true)
    try {
      await api.users.updateProfile(data)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await api.uploads.avatar(file)
      toast.success('Avatar updated')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your account preferences
        </p>
      </div>

      <div className="bg-card border rounded-lg p-5 mb-6">
        <h2 className="font-medium mb-4">Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-medium">
              {user ? getInitials(user.name) : '?'}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-card border rounded-full flex items-center justify-center cursor-pointer hover:bg-accent">
              {uploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Display name
            </label>
            <input
              {...register('name')}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input
              value={user?.email ?? ''}
              disabled
              className="w-full border rounded-md px-3 py-2 text-sm bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email is managed by your sign-in provider
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save changes
          </button>
        </form>
      </div>
    </div>
  )
}
