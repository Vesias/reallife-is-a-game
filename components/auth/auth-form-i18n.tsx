'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { Loader2, User, Lock, Mail, UserPlus } from 'lucide-react'

// Create dynamic validation schema based on current locale
const createAuthSchema = (t: any, mode: 'login' | 'signup') => {
  const baseSchema = z.object({
    email: z.string().email(t('validation.email')),
    password: z.string().min(8, t('validation.password')),
  })

  if (mode === 'signup') {
    return baseSchema.extend({
      firstName: z.string().min(1, t('validation.required')),
      lastName: z.string().min(1, t('validation.required')),
      confirmPassword: z.string().min(8, t('validation.password')),
    }).refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordMatch'),
      path: ['confirmPassword'],
    })
  }

  return baseSchema
}

type AuthFormData = z.infer<ReturnType<typeof createAuthSchema>>

interface AuthFormI18nProps {
  mode: 'login' | 'signup'
  onSuccess?: () => void
  className?: string
}

export function AuthFormI18n({ mode, onSuccess, className }: AuthFormI18nProps) {
  const { signIn, signUp, loading, error } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t, currentLocale } = useTranslation()

  // Create schema with current translations
  const authSchema = createAuthSchema(t, mode)
  
  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(mode === 'signup' && {
        firstName: '',
        lastName: '',
        confirmPassword: '',
      }),
    },
  })

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await signIn(data.email, data.password)
      } else {
        await signUp(data.email, data.password)
      }
      onSuccess?.()
    } catch (err) {
      // Error is handled by the useAuth hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = loading || isSubmitting

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 ${className || ''}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-center">
                {mode === 'login' ? t('auth.signInTitle') : t('auth.signUpTitle')}
              </CardTitle>
              <CardDescription className="text-center mt-2">
                {mode === 'login' 
                  ? t('onboarding.createAgent')
                  : t('onboarding.createAgent')
                }
              </CardDescription>
            </div>
            <LanguageSwitcher variant="compact" />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* First Name and Last Name for Signup */}
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {t('auth.firstName')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t('auth.firstNamePlaceholder')}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          {t('auth.lastName')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t('auth.lastNamePlaceholder')}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t('auth.email')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t('auth.password')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password for Signup */}
              {mode === 'signup' && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {t('auth.confirmPassword')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t('auth.confirmPasswordPlaceholder')}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Error Display */}
              {error && (
                <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' ? t('auth.signIn') : t('auth.signUp')}
              </Button>

              {/* Switch Mode Link */}
              <div className="text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <p>
                    {t('auth.noAccountYet')}{' '}
                    <Button variant="link" className="p-0 h-auto font-normal" type="button">
                      {t('auth.signUp')}
                    </Button>
                  </p>
                ) : (
                  <p>
                    {t('auth.alreadyHaveAccount')}{' '}
                    <Button variant="link" className="p-0 h-auto font-normal" type="button">
                      {t('auth.signIn')}
                    </Button>
                  </p>
                )}
              </div>

              {/* Language Indicator */}
              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                <p>
                  {currentLocale === 'de' ? 'Sprache' : 'Language'}: {' '}
                  <span className="font-medium">
                    {currentLocale === 'de' ? 'Deutsch' : 'English'}
                  </span>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}