"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import { WizardData } from "@/hooks/use-wizard";

interface PersonalInfoStepProps {
  language: 'de' | 'en';
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

const content = {
  de: {
    title: "Erzähle uns von dir",
    subtitle: "Diese Informationen helfen uns, deine Erfahrung zu personalisieren",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    age: "Alter",
    location: "Wohnort",
    occupation: "Beruf",
    bio: "Kurze Beschreibung",
    bioPlaceholder: "Erzähle uns etwas über dich, deine Interessen und was du erreichen möchtest...",
    profilePicture: "Profilbild",
    uploadImage: "Bild hochladen",
    ageGroups: [
      { value: "18-25", label: "18-25" },
      { value: "26-35", label: "26-35" },
      { value: "36-45", label: "36-45" },
      { value: "46-55", label: "46-55" },
      { value: "56+", label: "56+" }
    ]
  },
  en: {
    title: "Tell us about yourself",
    subtitle: "This information helps us personalize your experience",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    age: "Age",
    location: "Location",
    occupation: "Occupation",
    bio: "Short Description",
    bioPlaceholder: "Tell us about yourself, your interests and what you'd like to achieve...",
    profilePicture: "Profile Picture",
    uploadImage: "Upload Image",
    ageGroups: [
      { value: "18-25", label: "18-25" },
      { value: "26-35", label: "26-35" },
      { value: "36-45", label: "36-45" },
      { value: "46-55", label: "46-55" },
      { value: "56+", label: "56+" }
    ]
  }
};

export function PersonalInfoStep({
  language,
  data,
  onUpdate
}: PersonalInfoStepProps) {
  const t = content[language];
  const [imagePreview, setImagePreview] = useState<string | null>(data.personalInfo?.profilePicture || null);

  const handleInputChange = (field: string, value: string) => {
    onUpdate({
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        handleInputChange('profilePicture', result);
      };
      reader.readAsDataURL(file);
    }
  };

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

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={imagePreview || undefined} />
              <AvatarFallback>
                <User className="w-12 h-12 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {t.uploadImage}
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">{t.firstName} *</Label>
              <Input
                id="firstName"
                value={data.personalInfo?.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder={t.firstName}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">{t.lastName} *</Label>
              <Input
                id="lastName"
                value={data.personalInfo?.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder={t.lastName}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t.email} *</Label>
              <Input
                id="email"
                type="email"
                value={data.personalInfo?.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t.email}
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">{t.age}</Label>
              <Select 
                value={data.personalInfo?.age || ''} 
                onValueChange={(value) => handleInputChange('age', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.age} />
                </SelectTrigger>
                <SelectContent>
                  {t.ageGroups.map((group) => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">{t.location}</Label>
              <Input
                id="location"
                value={data.personalInfo?.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t.location}
              />
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <Label htmlFor="occupation">{t.occupation}</Label>
              <Input
                id="occupation"
                value={data.personalInfo?.occupation || ''}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder={t.occupation}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">{t.bio}</Label>
            <Textarea
              id="bio"
              value={data.personalInfo?.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder={t.bioPlaceholder}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}