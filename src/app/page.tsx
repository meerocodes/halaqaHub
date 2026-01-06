import type { Metadata } from 'next'
import HomeGate from '@/app/components/Home/HomeGate'

export const metadata: Metadata = {
  title: 'Halaqa Hub - Live Classes & Community Knowledge',
  description:
    'Join daily halaqat, follow along with slides, and ask questions in real time. Connect with our community through knowledge and spiritual growth.',
  openGraph: {
    title: 'Halaqa Hub - Live Classes & Community Knowledge',
    description:
      'Join daily halaqat, follow along with slides, and ask questions in real time.',
    images: [
      {
        url: 'https://halaqahub.com/social-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Halaqa Hub - Community Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Halaqa Hub - Live Classes & Community Knowledge',
    description:
      'Join daily halaqat, follow along with slides, and ask questions in real time.',
    images: ['https://halaqahub.com/social-image.jpg'],
  },
}

export default function HomePage() {
  return <HomeGate />
}
