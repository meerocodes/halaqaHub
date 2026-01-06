import { Documentation } from '@/app/components/Documentation/Documentation'
import RequireAuth from '@/app/components/Auth/RequireAuth'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Featurs | SiEducational',
}

export default function Page() {
  return (
    <RequireAuth>
      <Documentation />
    </RequireAuth>
  )
}
