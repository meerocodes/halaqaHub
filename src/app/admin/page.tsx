import type { Metadata } from 'next'
import AdminGate from './AdminGate'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Si Educational',
}

export default function AdminPage() {
  return <AdminGate />
}
