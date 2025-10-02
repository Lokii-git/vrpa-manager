import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, FloppyDisk } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface EmailTemplateEditorProps {
  onSave: (content: string) => void;
}

export function EmailTemplateEditor({ onSave }: EmailTemplateEditorProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load the email template from API
    const loadTemplate = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/email-template`);
        const data = await response.json();
        setContent(data.template);
        setOriginalContent(data.template);
      } catch (err) {
        console.error('Failed to load email template:', err);
        toast.error('Failed to load email template');
        // Fallback to file
        try {
          const res = await fetch('/vRPAemail.md');
          const text = await res.text();
          setContent(text);
          setOriginalContent(text);
        } catch (fallbackErr) {
          console.error('Failed to load fallback template:', fallbackErr);
        }
      }
    };
    
    loadTemplate();
  }, []);

  useEffect(() => {
    setHasChanges(content !== originalContent);
  }, [content, originalContent]);

  const handleSave = () => {
    onSave(content);
    setOriginalContent(content);
    setHasChanges(false);
  };

  const handleReset = () => {
    setContent(originalContent);
    setHasChanges(false);
    toast.info('Changes discarded');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Email Template Editor
            </CardTitle>
            <CardDescription>
              Edit the vRPA deployment email template. Use [Insert Link Here] as a placeholder for the sharefile link.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleReset}>
                Discard Changes
              </Button>
            )}
            <Button onClick={handleSave} disabled={!hasChanges}>
              <FloppyDisk className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-mono text-sm min-h-[500px]"
            placeholder="Loading email template..."
          />
          <p className="text-xs text-muted-foreground">
            Tip: The placeholder [Insert Link Here] will be automatically replaced with each device's sharefile link when copied.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
