import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAdminFromRequest } from '@/lib/adminAuth'
import { getSuperAdminFromRequest } from '@/lib/superadminAuth'

const MAX_RESULTS = 10
const PAGE_SIZE = 200

const normalize = (value: string) => value.trim().toLowerCase()

const getFullName = (user: { user_metadata?: Record<string, unknown> | null }) => {
  const meta = user.user_metadata ?? {}
  const fullName = typeof meta.full_name === 'string' ? meta.full_name : ''
  if (fullName.trim()) return fullName
  const first = typeof meta.first_name === 'string' ? meta.first_name : ''
  const last = typeof meta.last_name === 'string' ? meta.last_name : ''
  return [first, last].filter(Boolean).join(' ').trim()
}

const matchesQuery = (user: { email?: string | null; user_metadata?: Record<string, unknown> | null }, query: string) => {
  const email = normalize(user.email ?? '')
  const fullName = normalize(getFullName(user))
  if (!query) return false

  if (email.includes(query)) return true

  if (fullName.includes(query)) return true

  const parts = query.split(/\s+/).filter(Boolean)
  if (parts.length > 1) {
    return parts.every((part) => fullName.includes(part))
  }

  return false
}

export async function GET(request: NextRequest) {
  const adminUser =
    (await getAdminFromRequest(request)) ||
    (await getSuperAdminFromRequest(request))

  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = normalize(searchParams.get('q') ?? '')

  if (!query) {
    return NextResponse.json({ users: [] })
  }

  const matches: Array<{ id: string; email: string | null; full_name: string }> =
    []
  let page = 1
  let keepFetching = true

  while (keepFetching && matches.length < MAX_RESULTS) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const users = data?.users ?? []
    for (const user of users) {
      if (matches.length >= MAX_RESULTS) break
      if (matchesQuery(user, query)) {
        matches.push({
          id: user.id,
          email: user.email ?? null,
          full_name: getFullName(user),
        })
      }
    }

    if (!data?.next_page || users.length === 0) {
      keepFetching = false
    } else {
      page = data.next_page
    }
  }

  return NextResponse.json({ users: matches })
}
