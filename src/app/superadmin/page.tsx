import type { Metadata } from 'next'
import SuperAdminGate from './SuperAdminGate'

export const metadata: Metadata = {
  title: 'Superadmin | Halaqa Hub',
}

export default function SuperAdminPage() {
  return <SuperAdminGate />
}
