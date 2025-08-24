import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LifeQuest - Verwandle dein Leben in ein episches Abenteuer',
  description: 'Eine moderne Gamification-Plattform, die dein Leben in ein RPG-ähnliches Abenteuer verwandelt. Erstelle Quests, sammle Erfahrungspunkte und erreiche deine Ziele.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans antialiased">
          {children}
        </div>
      </body>
    </html>
  )
}