import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSuperAdminFromRequest } from '@/lib/superadminAuth'

export async function GET(request: NextRequest) {
  const currentUser = await getSuperAdminFromRequest(request)
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '1')
  const perPage = Number(searchParams.get('perPage') ?? '10')

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page,
    perPage,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    users: data?.users ?? [],
    page: data?.page ?? page,
    perPage: data?.per_page ?? perPage,
    total: data?.total ?? 0,
    nextPage: data?.next_page ?? null,
  })
}
