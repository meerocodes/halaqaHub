'use client'

import AdminPanel from '@/app/components/Admin/Panel'
import Signin from '@/app/components/Auth/SignIn'
import { useAuth } from '@/contexts/AuthContext'

const AdminGate = () => {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className='container py-20 text-center'>
        <p className='text-lg text-gray-600'>Checking your access...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='container py-20 flex flex-col gap-6 items-center'>
        <h1 className='text-3xl font-bold text-center'>
          Admin access required
        </h1>
        <p className='text-gray-600 text-center max-w-xl'>
          Please sign in with your admin email and password to manage the
          community content.
        </p>
        <div className='w-full max-w-md rounded-2xl border border-gray-200 p-8 bg-white shadow-lg'>
          <Signin />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className='container py-20 text-center'>
        <h1 className='text-3xl font-bold mb-4'>Not authorized</h1>
        <p className='text-gray-600'>
          This account does not have admin privileges. Please contact the Si
          Educational team if you believe this is an error.
        </p>
      </div>
    )
  }

  return (
    <div className='container py-20'>
      <AdminPanel />
    </div>
  )
}

export default AdminGate
