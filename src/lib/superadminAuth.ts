import type { NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from './supabaseAdmin'

const SUPERADMIN_EMAIL = 'amir@kc.com'

export async function getSuperAdminFromRequest(
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

  return data.user.email?.toLowerCase() === SUPERADMIN_EMAIL ? data.user : null
}
