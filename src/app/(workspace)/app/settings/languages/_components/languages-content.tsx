'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getAllAdminLanguages } from '@/config/admin-languages';
import { useState } from 'react';
import { toast } from 'sonner';
import DynamicBreadcrumb from '@/components/dynamic-breadcrumbs';

export function LanguagesContent() {
  const [languages, setLanguages] = useState(getAllAdminLanguages());
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggleLanguage = (code: string) => {
    setLanguages(prev =>
      prev.map(lang =>
        lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real implementation, this would save to a backend API
    // For now, we'll just show a success message
    toast.success('Language settings saved successfully');
    setHasChanges(false);
    
    // Note: This is a client-side only implementation
    // In production, you would need to:
    // 1. Create a backend API endpoint to save language settings
    // 2. Call that API here
    // 3. Update the admin-languages.ts file or store in database
    console.log('Languages to save:', languages);
  };

  return (
    <div className="space-y-6">
      <DynamicBreadcrumb />

      <div>
        <h1 className="text-2xl font-bold">Language Settings</h1>
        <p className="text-muted-foreground">
          Manage which languages are available for keyword searches
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Languages</CardTitle>
          <CardDescription>
            Enable or disable languages for the Keyword Lab feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {languages.map((language) => (
              <div
                key={language.code}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <Label htmlFor={`lang-${language.code}`} className="text-base font-medium">
                    {language.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">Code: {language.code}</p>
                </div>
                <Switch
                  id={`lang-${language.code}`}
                  checked={language.enabled}
                  onCheckedChange={() => handleToggleLanguage(language.code)}
                />
              </div>
            ))}
          </div>

          {hasChanges && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is a client-side implementation. To make language settings persistent, you need to:
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
            <li>Create a backend API endpoint to save/load language settings</li>
            <li>Store settings in a database or configuration file</li>
            <li>Update the admin-languages.ts configuration or use the API response</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
