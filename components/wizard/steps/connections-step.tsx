"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Linkedin, 
  Users, 
  Upload, 
  Download, 
  Mail, 
  Phone, 
  Globe,
  UserPlus,
  FileText,
  ExternalLink
} from "lucide-react";
import { WizardData } from "@/hooks/use-wizard";

interface ConnectionsStepProps {
  language: 'de' | 'en';
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

const importOptions = {
  de: [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Importiere deine LinkedIn Kontakte und dein Profil',
      icon: Linkedin,
      color: 'bg-blue-600',
      available: true
    },
    {
      id: 'xing',
      name: 'XING',
      description: 'Importiere deine XING Kontakte und dein Profil',
      icon: Users,
      color: 'bg-green-600',
      available: true
    },
    {
      id: 'csv',
      name: 'CSV Datei',
      description: 'Lade eine CSV-Datei mit deinen Kontakten hoch',
      icon: FileText,
      color: 'bg-gray-600',
      available: true
    },
    {
      id: 'google',
      name: 'Google Kontakte',
      description: 'Importiere deine Google Kontakte',
      icon: Mail,
      color: 'bg-red-600',
      available: false
    }
  ],
  en: [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Import your LinkedIn contacts and profile',
      icon: Linkedin,
      color: 'bg-blue-600',
      available: true
    },
    {
      id: 'xing',
      name: 'XING',
      description: 'Import your XING contacts and profile',
      icon: Users,
      color: 'bg-green-600',
      available: true
    },
    {
      id: 'csv',
      name: 'CSV File',
      description: 'Upload a CSV file with your contacts',
      icon: FileText,
      color: 'bg-gray-600',
      available: true
    },
    {
      id: 'google',
      name: 'Google Contacts',
      description: 'Import your Google contacts',
      icon: Mail,
      color: 'bg-red-600',
      available: false
    }
  ]
};

const content = {
  de: {
    title: "Verbinde dich mit anderen",
    subtitle: "Importiere deine bestehenden Kontakte oder überspringe diesen Schritt für später",
    importContacts: "Kontakte importieren",
    manualAdd: "Manuell hinzufügen",
    skipStep: "Schritt überspringen",
    privacySettings: "Privatsphäre-Einstellungen",
    allowNetworking: "Netzwerken erlauben",
    allowNetworkingDescription: "Andere LifeQuest-Nutzer können dich finden und sich mit dir vernetzen",
    shareProgress: "Fortschritt teilen",
    shareProgressDescription: "Teile deine Erfolge und Meilensteine mit deinem Netzwerk",
    allowMentoring: "Mentoring erlauben",
    allowMentoringDescription: "Biete Mentoring an oder frage nach Mentoren in deinen Fähigkeitsbereichen",
    importSuccess: "Import erfolgreich",
    importError: "Fehler beim Import",
    connecting: "Verbinde...",
    connect: "Verbinden",
    comingSoon: "Bald verfügbar",
    contactName: "Name",
    contactEmail: "E-Mail",
    contactRole: "Rolle",
    addContact: "Kontakt hinzufügen",
    manualContacts: "Manuell hinzugefügte Kontakte",
    importedContacts: "Importierte Kontakte",
    noContacts: "Noch keine Kontakte hinzugefügt"
  },
  en: {
    title: "Connect with others",
    subtitle: "Import your existing contacts or skip this step for later",
    importContacts: "Import Contacts",
    manualAdd: "Add Manually",
    skipStep: "Skip Step",
    privacySettings: "Privacy Settings",
    allowNetworking: "Allow Networking",
    allowNetworkingDescription: "Other LifeQuest users can find and connect with you",
    shareProgress: "Share Progress",
    shareProgressDescription: "Share your achievements and milestones with your network",
    allowMentoring: "Allow Mentoring",
    allowMentoringDescription: "Offer mentoring or ask for mentors in your skill areas",
    importSuccess: "Import successful",
    importError: "Import error",
    connecting: "Connecting...",
    connect: "Connect",
    comingSoon: "Coming Soon",
    contactName: "Name",
    contactEmail: "Email",
    contactRole: "Role",
    addContact: "Add Contact",
    manualContacts: "Manually Added Contacts",
    importedContacts: "Imported Contacts",
    noContacts: "No contacts added yet"
  }
};

export function ConnectionsStep({
  language,
  data,
  onUpdate
}: ConnectionsStepProps) {
  const t = content[language];
  const [importingFrom, setImportingFrom] = useState<string | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', role: '' });
  
  const connections = data.connections || {
    imported: [],
    manual: [],
    privacySettings: {
      allowNetworking: true,
      shareProgress: true,
      allowMentoring: true
    }
  };

  const handleImport = async (platform: string) => {
    setImportingFrom(platform);
    
    // Simulate import process
    setTimeout(() => {
      // Mock imported contacts
      const mockContacts = [
        { id: '1', name: 'Max Mustermann', email: 'max@example.com', platform, avatar: null },
        { id: '2', name: 'Anna Schmidt', email: 'anna@example.com', platform, avatar: null },
        { id: '3', name: 'Peter Müller', email: 'peter@example.com', platform, avatar: null }
      ];
      
      onUpdate({
        connections: {
          ...connections,
          imported: [...connections.imported, ...mockContacts]
        }
      });
      
      setImportingFrom(null);
    }, 2000);
  };

  const handleAddManualContact = () => {
    if (newContact.name && newContact.email) {
      const contact = {
        id: `manual-${Date.now()}`,
        name: newContact.name,
        email: newContact.email,
        role: newContact.role,
        platform: 'manual'
      };
      
      onUpdate({
        connections: {
          ...connections,
          manual: [...connections.manual, contact]
        }
      });
      
      setNewContact({ name: '', email: '', role: '' });
      setShowManualAdd(false);
    }
  };

  const handlePrivacyChange = (setting: string, value: boolean) => {
    onUpdate({
      connections: {
        ...connections,
        privacySettings: {
          ...connections.privacySettings,
          [setting]: value
        }
      }
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      // Mock CSV processing
      setImportingFrom('csv');
      setTimeout(() => {
        const mockContacts = [
          { id: 'csv-1', name: 'CSV Contact 1', email: 'csv1@example.com', platform: 'csv', avatar: null },
          { id: 'csv-2', name: 'CSV Contact 2', email: 'csv2@example.com', platform: 'csv', avatar: null }
        ];
        
        onUpdate({
          connections: {
            ...connections,
            imported: [...connections.imported, ...mockContacts]
          }
        });
        
        setImportingFrom(null);
      }, 1500);
    }
  };

  const totalContacts = connections.imported.length + connections.manual.length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t.title}
        </h2>
        <p className="text-gray-600">
          {t.subtitle}
        </p>
      </div>

      {/* Import Options */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t.importContacts}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importOptions[language].map((option) => {
              const Icon = option.icon;
              const isImporting = importingFrom === option.id;
              
              return (
                <div key={option.id}>
                  {option.id === 'csv' ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={!option.available || isImporting}
                      />
                      <Card className={`cursor-pointer transition-all duration-200 ${
                        !option.available 
                          ? 'opacity-50 cursor-not-allowed' 
                          : isImporting
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-blue-200 hover:shadow-md'
                      }`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{option.name}</h4>
                                {!option.available && (
                                  <Badge variant="secondary">{t.comingSoon}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {option.description}
                              </p>
                            </div>
                            {isImporting && (
                              <div className="text-blue-600">
                                <Download className="w-5 h-5 animate-bounce" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        !option.available 
                          ? 'opacity-50 cursor-not-allowed' 
                          : isImporting
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-blue-200 hover:shadow-md'
                      }`}
                      onClick={() => option.available && !isImporting && handleImport(option.id)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{option.name}</h4>
                              {!option.available && (
                                <Badge variant="secondary">{t.comingSoon}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {option.description}
                            </p>
                          </div>
                          {isImporting ? (
                            <div className="text-blue-600">
                              <Download className="w-5 h-5 animate-bounce" />
                            </div>
                          ) : (
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual Add */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{t.manualAdd}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManualAdd(!showManualAdd)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t.addContact}
            </Button>
          </div>
          
          {showManualAdd && (
            <Card className="border-dashed mb-4">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contactName">{t.contactName} *</Label>
                    <Input
                      id="contactName"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder={t.contactName}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">{t.contactEmail} *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder={t.contactEmail}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactRole">{t.contactRole}</Label>
                    <Input
                      id="contactRole"
                      value={newContact.role}
                      onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                      placeholder={t.contactRole}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManualAdd(false)}
                  >
                    {language === 'de' ? 'Abbrechen' : 'Cancel'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddManualContact}
                    disabled={!newContact.name || !newContact.email}
                  >
                    {t.addContact}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Contacts List */}
          {totalContacts > 0 ? (
            <div className="space-y-4">
              {connections.imported.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t.importedContacts} ({connections.imported.length})
                  </h4>
                  <div className="space-y-2">
                    {connections.imported.slice(0, 3).map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{contact.platform}</Badge>
                      </div>
                    ))}
                    {connections.imported.length > 3 && (
                      <p className="text-sm text-gray-500">
                        {language === 'de' 
                          ? `... und ${connections.imported.length - 3} weitere`
                          : `... and ${connections.imported.length - 3} more`
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {connections.manual.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t.manualContacts} ({connections.manual.length})
                  </h4>
                  <div className="space-y-2">
                    {connections.manual.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.email}</p>
                            {contact.role && (
                              <p className="text-xs text-gray-400">{contact.role}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">manual</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>{t.noContacts}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t.privacySettings}</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{t.allowNetworking}</h4>
                <p className="text-sm text-gray-600">{t.allowNetworkingDescription}</p>
              </div>
              <Switch
                checked={connections.privacySettings.allowNetworking}
                onCheckedChange={(checked) => handlePrivacyChange('allowNetworking', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{t.shareProgress}</h4>
                <p className="text-sm text-gray-600">{t.shareProgressDescription}</p>
              </div>
              <Switch
                checked={connections.privacySettings.shareProgress}
                onCheckedChange={(checked) => handlePrivacyChange('shareProgress', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{t.allowMentoring}</h4>
                <p className="text-sm text-gray-600">{t.allowMentoringDescription}</p>
              </div>
              <Switch
                checked={connections.privacySettings.allowMentoring}
                onCheckedChange={(checked) => handlePrivacyChange('allowMentoring', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}