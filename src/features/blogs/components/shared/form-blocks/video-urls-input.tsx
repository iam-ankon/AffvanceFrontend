'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface VideoUrlsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export default function VideoUrlsInput({
  value = [],
  onChange,
  className = ''
}: VideoUrlsInputProps) {
  const [newVideo, setNewVideo] = useState('');

  const addVideoUrl = () => {
    if (newVideo.trim()) {
      onChange([...value, newVideo.trim()]);
      setNewVideo('');
    }
  };

  const removeVideoUrl = (index: number) => {
    const newVideos = [...value];
    newVideos.splice(index, 1);
    onChange(newVideos);
  };

  const updateVideoUrl = (index: number, newValue: string) => {
    const newVideos = [...value];
    newVideos[index] = newValue;
    onChange(newVideos);
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label>Video URLs (Optional)</Label>
        {value.length > 0 && (
          <div className="space-y-2">
            {value.map((video, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={video}
                  onChange={(e) => updateVideoUrl(index, e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  type="url"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeVideoUrl(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newVideo}
            onChange={(e) => setNewVideo(e.target.value)}
            placeholder="Enter video URL (YouTube, Vimeo, etc.)"
            type="url"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addVideoUrl();
              }
            }}
          />
          <Button type="button" onClick={addVideoUrl}>
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Add YouTube, Vimeo, or other video URLs to embed in your blog post
        </p>
      </div>
    </div>
  );
}
