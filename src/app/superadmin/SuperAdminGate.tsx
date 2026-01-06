'use client'

import { useAuth } from '@/contexts/AuthContext'
import SuperAdminPanel from './SuperAdminPanel'

const SuperAdminGate = () => {
  const { user, isSuperAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className='container py-20 text-center'>
        <p className='text-gray-500'>Checking privileges…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='container py-20 text-center space-y-4'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Sign in required
        </h1>
        <p className='text-gray-600'>
          You must be signed in to access the superadmin console.
        </p>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className='container py-20 text-center space-y-4'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Superadmin only
        </h1>
        <p className='text-gray-600'>
          This tool is reserved for the Halaqa Hub stewardship team.
        </p>
      </div>
    )
  }

  return (
    <div className='container py-16'>
      <SuperAdminPanel />
    </div>
  )
}

export default SuperAdminGate
