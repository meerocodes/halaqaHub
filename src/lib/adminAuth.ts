import type { NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from './supabaseAdmin'

const isAdminUser = (user: User) => {
  const appMeta = user.app_metadata as Record<string, unknown> | undefined
  const userMeta = user.user_metadata as Record<string, unknown> | undefined
  return appMeta?.role === 'admin' || userMeta?.role === 'admin'
}

export async function getAdminFromRequest(
  request: NextRequest
): Promise<User | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.split(' ')[1]
  if (!token) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    return null
  }

  return isAdminUser(data.user) ? data.user : null
}
