'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Settings, Sword, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useTranslation } from '@/hooks/use-translation'

export function Navbar() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold text-primary">
            {t('appName')}
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Sword className="h-4 w-4" />
                {t('navigation.dashboard')}
              </Button>
            </Link>
            <Link href="/crew">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('navigation.crews')}
              </Button>
            </Link>
            <Link href="/side-quests">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {t('navigation.startSideQuest')}
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher variant="compact" />
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(user.email || '')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('navigation.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('navigation.settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('navigation.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost">{t('navigation.login')}</Button>
              </Link>
              <Link href="/signup">
                <Button>{t('navigation.signup')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}