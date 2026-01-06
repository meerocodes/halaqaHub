import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSuperAdminFromRequest } from '@/lib/superadminAuth'

function extractUserIdFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  const idx = segments.findIndex((segment) => segment === 'users')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

export async function POST(request: NextRequest) {
  const currentUser = await getSuperAdminFromRequest(request)
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = extractUserIdFromPath(request.nextUrl.pathname)
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    {
      app_metadata: { role: 'admin' },
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ user: data })
}
