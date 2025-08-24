'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useCrew } from '@/hooks/use-crew';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Mail, Link, Users, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface InviteModalProps {
  crewId: string;
  crewName: string;
  onClose: () => void;
}

export function InviteModal({ crewId, crewName, onClose }: InviteModalProps) {
  const { t } = useTranslation();
  const { sendInvitation, generateInviteLink, loading } = useCrew();
  
  const [inviteMethod, setInviteMethod] = useState<'email' | 'link'>('email');
  const [emailForm, setEmailForm] = useState({
    emails: '',
    message: ''
  });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleEmailInvite = async () => {
    const emails = emailForm.emails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emails.length === 0) {
      toast.error(t('Please enter at least one valid email address'));
      return;
    }

    if (emails.length > 10) {
      toast.error(t('Maximum 10 invites per batch'));
      return;
    }

    try {
      await Promise.all(
        emails.map(email => 
          sendInvitation(crewId, email, emailForm.message)
        )
      );
      
      toast.success(t('Invitations sent successfully!'));
      setEmailForm({ emails: '', message: '' });
      onClose();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error(t('Failed to send some invitations'));
    }
  };

  const handleGenerateLink = async () => {
    try {
      const link = await generateInviteLink(crewId);
      setGeneratedLink(link);
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error(t('Failed to generate invite link'));
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopiedLink(true);
      toast.success(t('Link copied to clipboard!'));
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const parseEmails = (input: string) => {
    return input
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email);
  };

  const validEmails = parseEmails(emailForm.emails).filter(email => 
    email.includes('@') && email.includes('.')
  );
  const invalidEmails = parseEmails(emailForm.emails).filter(email => 
    email && (!email.includes('@') || !email.includes('.'))
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('Invite Members')}
          </DialogTitle>
          <DialogDescription>
            {t('Invite people to join "{{crewName}}"', { crewName })}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={inviteMethod} onValueChange={(value) => setInviteMethod(value as 'email' | 'link')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              {t('Email')}
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <Link className="h-4 w-4" />
              {t('Link')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">
                {t('Email Addresses')}
                <span className="text-sm text-muted-foreground ml-2">
                  ({t('Separate with commas or new lines')})
                </span>
              </Label>
              <Textarea
                id="emails"
                placeholder={t('Enter email addresses...\nexample@email.com, friend@email.com')}
                value={emailForm.emails}
                onChange={(e) => setEmailForm(prev => ({ ...prev, emails: e.target.value }))}
                rows={4}
                className="resize-none"
              />
              
              {/* Email validation feedback */}
              {emailForm.emails && (
                <div className="space-y-2">
                  {validEmails.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {validEmails.slice(0, 5).map((email, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          {email}
                        </Badge>
                      ))}
                      {validEmails.length > 5 && (
                        <Badge variant="outline">
                          +{validEmails.length - 5} {t('more')}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {invalidEmails.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {invalidEmails.slice(0, 3).map((email, index) => (
                        <Badge key={index} variant="destructive" className="gap-1">
                          <X className="h-3 w-3" />
                          {email}
                        </Badge>
                      ))}
                      {invalidEmails.length > 3 && (
                        <Badge variant="destructive">
                          +{invalidEmails.length - 3} {t('invalid')}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {t('{{count}}/10 invites', { count: validEmails.length })}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{t('Personal Message')} ({t('Optional')})</Label>
              <Textarea
                id="message"
                placeholder={t('Add a personal message to your invitation...')}
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                maxLength={200}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {emailForm.message.length}/200
              </p>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('Generate a shareable link that anyone can use to join your crew')}
              </p>
              
              {!generatedLink ? (
                <Button 
                  onClick={handleGenerateLink} 
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Link className="h-4 w-4" />
                  {loading ? t('Generating...') : t('Generate Invite Link')}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      readOnly 
                      value={generatedLink}
                      className="text-sm"
                    />
                    <Button 
                      onClick={handleCopyLink}
                      variant="outline"
                      className="gap-2 shrink-0"
                    >
                      {copiedLink ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedLink ? t('Copied') : t('Copy')}
                    </Button>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">{t('Share this link:')}</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• {t('Anyone with this link can join')}</li>
                      <li>• {t('Link expires in 7 days')}</li>
                      <li>• {t('Can be used multiple times')}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('Cancel')}
          </Button>
          
          {inviteMethod === 'email' && (
            <Button 
              onClick={handleEmailInvite}
              disabled={loading || validEmails.length === 0 || validEmails.length > 10}
              className="gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {t('Send {{count}} Invites', { count: validEmails.length })}
            </Button>
          )}
          
          {inviteMethod === 'link' && generatedLink && (
            <Button onClick={onClose} className="gap-2">
              <Check className="h-4 w-4" />
              {t('Done')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}