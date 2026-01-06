'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

const SuperAdminPanel = () => {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null)
    })
  }, [])

  const fetchUsers = useCallback(
    async (targetPage = page) => {
      if (!token) return
      setLoading(true)
      try {
        const response = await fetch(
          `/api/superadmin/users?page=${targetPage}&perPage=${PAGE_SIZE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        if (!response.ok) {
          throw new Error('Unable to load users')
        }
        const payload = await response.json()
        setUsers(payload.users ?? [])
        setTotal(payload.total ?? 0)
        setPage(payload.page ?? targetPage)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load users'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    [token, page]
  )

  useEffect(() => {
    if (!token) return
    fetchUsers(1)
  }, [token, fetchUsers])

  const promoteUser = async (id: string, email?: string | null) => {
    if (!token) return
    const toastId = toast.loading('Updating role…')
    try {
      const response = await fetch(
        `/api/superadmin/users/${id}/promote`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? 'Unable to update user')
      }
      toast.success(`${email ?? 'User'} is now an admin.`, { id: toastId })
      fetchUsers(page)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to update user'
      toast.error(message, { id: toastId })
    }
  }

  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold text-gray-900'>Superadmin</h1>
        <p className='text-gray-600 text-sm'>
          Manage trusted users and elevate them to full admin access.
        </p>
      </div>

      <div className='bg-white border border-gray-100 rounded-3xl shadow-sm'>
        <div className='p-6 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-lg font-semibold text-gray-900'>
              Authorized accounts
            </p>
            <p className='text-sm text-gray-500'>
              Showing {users.length} of {total} users
            </p>
          </div>
          <div className='flex items-center gap-3 text-sm'>
            <button
              onClick={() => fetchUsers(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
              className='px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-40'>
              Previous
            </button>
            <span className='text-gray-600'>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchUsers(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
              className='px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-40'>
              Next
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm text-gray-700'>
            <thead className='bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500'>
              <tr>
                <th className='px-6 py-3'>User</th>
                <th className='px-6 py-3'>Joined</th>
                <th className='px-6 py-3'>Last active</th>
                <th className='px-6 py-3 text-right'>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className='px-6 py-10 text-center text-gray-500'>
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-6 py-10 text-center text-gray-500'>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((userItem) => {
                  const isAdmin =
                    userItem.app_metadata?.role === 'admin' ||
                    userItem.user_metadata?.role === 'admin'
                  return (
                    <tr
                      key={userItem.id}
                      className='border-t border-gray-100 hover:bg-gray-50'>
                      <td className='px-6 py-4'>
                        <p className='font-semibold text-gray-900'>
                          {userItem.email ?? 'Unknown'}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {userItem.id.slice(0, 8)}…
                        </p>
                      </td>
                      <td className='px-6 py-4 text-xs text-gray-500'>
                        {userItem.created_at
                          ? new Date(userItem.created_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className='px-6 py-4 text-xs text-gray-500'>
                        {userItem.last_sign_in_at
                          ? new Date(userItem.last_sign_in_at).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className='px-6 py-4 text-right'>
                        {isAdmin ? (
                          <span className='px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary'>
                            Admin
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              promoteUser(userItem.id, userItem.email)
                            }
                            className='px-3 py-1.5 text-xs font-semibold rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition'>
                            Promote to admin
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminPanel
