'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/index';
import {
  MediaItem,
  useDeleteMedia,
  useMediaLibrary,
  useUploadMedia
} from '@/lib/hooks/use-media-library';
import {
  CheckIcon,
  CopyIcon,
  ImageIcon,
  Loader2Icon,
  SearchIcon,
  TrashIcon,
  UploadCloudIcon,
  XIcon
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface MediaLibraryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (urls: string[]) => void;
  mode: 'single' | 'multiple';
  mediaType?: 'image' | 'video' | 'all';
  title?: string;
  description?: string;
}

export function MediaLibraryPicker({
  open,
  onOpenChange,
  onSelect,
  mode = 'single',
  mediaType = 'image',
  title = 'Media Library',
  description = 'Media should be selected either from the url or by uploading'
}: MediaLibraryPickerProps) {
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API hooks
  const { data: mediaData, isLoading } = useMediaLibrary({
    search: search || undefined,
    media_type: mediaType === 'all' ? undefined : mediaType,
    page_size: 50
  });

  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();

  const mediaItems = mediaData?.data?.results || [];

  // Handle selection
  const toggleSelection = (url: string) => {
    if (mode === 'single') {
      setSelectedItems([url]);
    } else {
      setSelectedItems((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    }
  };

  const isSelected = (url: string) => selectedItems.includes(url);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
          toast.error(`Invalid file type: ${file.name}`);
          continue;
        }

        if (mediaType === 'image' && !isImage) {
          toast.error(`Only images are allowed: ${file.name}`);
          continue;
        }

        if (mediaType === 'video' && !isVideo) {
          toast.error(`Only videos are allowed: ${file.name}`);
          continue;
        }

        // Validate file size (25MB)
        if (file.size > 25 * 1024 * 1024) {
          toast.error(`File too large (max 25MB): ${file.name}`);
          continue;
        }

        try {
          const result = await uploadMutation.mutateAsync({
            file,
            onProgress: setUploadProgress
          });

          // Auto-select uploaded file
          if (result?.data?.file_url) {
            if (mode === 'single') {
              setSelectedItems([result.data.file_url]);
            } else {
              setSelectedItems((prev) => [...prev, result.data.file_url]);
            }
          }
        } catch {
          // Error handled by mutation
        } finally {
          setUploadProgress(0);
        }
      }
    },
    [mediaType, mode, uploadMutation]
  );

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  // Copy URL to clipboard
  const copyUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  // Delete media
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this media?')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle Confirm
  const handleConfirm = () => {
    // Collect all selected items
    let finalUrls = [...selectedItems];

    // If we're on the URL tab and have a non-empty input that wasn't "added" yet (for single mode)
    if (activeTab === 'url' && urlInput.trim() && !selectedItems.includes(urlInput.trim())) {
      if (mode === 'single') {
        finalUrls = [urlInput.trim()];
      } else {
        finalUrls = [...selectedItems, urlInput.trim()];
      }
    }

    onSelect(finalUrls);
    setSelectedItems([]);
    setUrlInput('');
    onOpenChange(false);
  };

  // Cancel
  const handleCancel = () => {
    setSelectedItems([]);
    onOpenChange(false);
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'library'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('library')}
          >
            Library
          </button>
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'upload'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </button>
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'url'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('url')}
          >
            URL
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'library' && (
            <div className="flex flex-col h-full">
              {/* Search */}
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <p>No media found</p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab('upload')}
                      className="mt-2"
                    >
                      Upload your first file
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {mediaItems.map((item: MediaItem) => (
                      <div
                        key={item.id}
                        className={cn(
                          'group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                          isSelected(item.file_url)
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-transparent hover:border-muted-foreground/30'
                        )}
                        onClick={() => toggleSelection(item.file_url)}
                      >
                        {/* Thumbnail */}
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.alt_text || item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : item.media_type === 'video' ? (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Video</span>
                          </div>
                        ) : (
                          <img
                            src={item.file_url}
                            alt={item.alt_text || item.name}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Selection indicator */}
                        {isSelected(item.file_url) && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <CheckIcon className="h-3 w-3" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                          <p className="text-white text-xs truncate">{item.name}</p>
                          <p className="text-white/70 text-xs">{formatSize(item.file_size)}</p>

                          {/* Action buttons */}
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-white hover:bg-white/20"
                              onClick={(e) => copyUrl(item.file_url, e)}
                            >
                              <CopyIcon className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-white hover:bg-red-500/50"
                              onClick={(e) => handleDelete(item.id, e)}
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div
              className={cn(
                'h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors',
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadMutation.isPending ? (
                <div className="flex flex-col items-center">
                  <Loader2Icon className="h-10 w-10 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                  <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloudIcon className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Drag and drop files here, or
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    {mediaType === 'image' && 'Supported: JPG, PNG, GIF, WebP, SVG (max 25MB)'}
                    {mediaType === 'video' && 'Supported: MP4, WebM, MOV (max 25MB)'}
                    {mediaType === 'all' && 'Supported: Images & Videos (max 25MB)'}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                      mediaType === 'image'
                        ? 'image/*'
                        : mediaType === 'video'
                          ? 'video/*'
                          : 'image/*,video/*'
                    }
                    multiple={mode === 'multiple'}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex flex-col h-full gap-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Paste image or video URL (e.g., https://example.com/image.jpg)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="pl-9"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && mode === 'multiple' && urlInput.trim()) {
                          toggleSelection(urlInput.trim());
                          setUrlInput('');
                        }
                      }}
                    />
                  </div>
                  {mode === 'multiple' && (
                    <Button
                      type="button"
                      disabled={!urlInput.trim()}
                      onClick={() => {
                        toggleSelection(urlInput.trim());
                        setUrlInput('');
                      }}
                    >
                      Add
                    </Button>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg border-2 border-dashed p-4 flex flex-col items-center justify-center min-h-[200px]">
                  {urlInput.trim() ? (
                    <div className="space-y-3 w-full flex flex-col items-center">
                      <p className="text-xs font-medium self-start">Preview:</p>
                      <img
                        src={urlInput}
                        alt="Preview"
                        className="max-h-40 rounded-lg border shadow-sm object-contain bg-white"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/400x300?text=Invalid+URL+or+Access+Denied';
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground break-all text-center max-w-md">
                        {urlInput}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                        <UploadCloudIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">Enter a URL above to see a preview</p>
                        <p className="text-xs text-muted-foreground/60">Supports direct links to images and videos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected items indicator */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedItems([])}
              className="ml-auto h-7"
            >
              <XIcon className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedItems.length === 0 && !urlInput.trim()}>
            {mode === 'single' ? 'Select' : `Select (${selectedItems.length + (activeTab === 'url' && urlInput.trim() && !selectedItems.includes(urlInput) ? 1 : 0)})`}
          </Button> 
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
