'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/index';
import { type UnsplashImage, useImageSearch } from '@/lib/hooks/use-image-search';
import {
  CheckIcon,
  CopyIcon,
  FolderOpenIcon,
  ImageIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  XIcon
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { MediaLibraryPicker } from './media-library-picker';

interface ImageUrlsInputProps {
  featuredImage?: string;
  additionalImages?: string[];
  useAffvanceSuggestedPhotos?: boolean;
  onFeaturedImageChange: (value: string) => void;
  onAdditionalImagesChange: (value: string[]) => void;
  onUseAffvanceSuggestedPhotosChange?: (value: boolean) => void;
  className?: string;
}

export default function ImageUrlsInput({
  featuredImage = '',
  additionalImages = [],
  useAffvanceSuggestedPhotos = true,
  onFeaturedImageChange,
  onAdditionalImagesChange,
  onUseAffvanceSuggestedPhotosChange,
  className = ''
}: ImageUrlsInputProps) {
  const [newImage, setNewImage] = useState('');
  const [featuredPickerOpen, setFeaturedPickerOpen] = useState(false);
  const [additionalPickerOpen, setAdditionalPickerOpen] = useState(false);

  // Unsplash search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTarget, setSearchTarget] = useState<'featured' | 'additional'>('additional');
  const [selectedSearchImages, setSelectedSearchImages] = useState<string[]>([]);
  const { mutate: searchImages, data: searchResults, isPending: isSearching } = useImageSearch();

  // The user has supplied at least one of their own images. While true, the
  // "Let Affvance choose free images" option is frozen (disabled + unchecked).
  const hasUserImages = Boolean((featuredImage || '').trim()) || additionalImages.length > 0;

  const disableSuggestedPhotos = () => {
    if (useAffvanceSuggestedPhotos) {
      onUseAffvanceSuggestedPhotosChange?.(false);
    }
  };

  // When the user clears all of their own images, unfreeze the option and
  // restore it to its default (checked) so Affvance resumes choosing images.
  const reenableSuggestedPhotosIfNoUserImages = (
    nextFeatured: string,
    nextAdditional: string[]
  ) => {
    if (!nextFeatured.trim() && nextAdditional.length === 0) {
      onUseAffvanceSuggestedPhotosChange?.(true);
    }
  };

  const handleManualFeaturedImageChange = (value: string) => {
    if (value.trim()) {
      disableSuggestedPhotos();
    } else {
      reenableSuggestedPhotosIfNoUserImages('', additionalImages);
    }
    onFeaturedImageChange(value);
  };

  const handleRemoveFeaturedImage = () => {
    reenableSuggestedPhotosIfNoUserImages('', additionalImages);
    onFeaturedImageChange('');
  };

  const addAdditionalImage = () => {
    if (newImage.trim()) {
      disableSuggestedPhotos();
      onAdditionalImagesChange([...additionalImages, newImage.trim()]);
      setNewImage('');
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = [...additionalImages];
    newImages.splice(index, 1);
    onAdditionalImagesChange(newImages);
    reenableSuggestedPhotosIfNoUserImages(featuredImage || '', newImages);
  };

  const updateAdditionalImage = (index: number, newValue: string) => {
    disableSuggestedPhotos();
    const newImages = [...additionalImages];
    newImages[index] = newValue;
    onAdditionalImagesChange(newImages);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const copyAllUrls = () => {
    const allUrls = [featuredImage, ...additionalImages].filter(Boolean);
    if (allUrls.length === 0) {
      toast.error('No URLs to copy');
      return;
    }
    navigator.clipboard.writeText(allUrls.join('\n'));
    toast.success(`${allUrls.length} URL${allUrls.length !== 1 ? 's' : ''} copied to clipboard`);
  };

  // Handle featured image selection from library
  const handleFeaturedSelect = (urls: string[]) => {
    if (urls.length > 0) {
      disableSuggestedPhotos();
      onFeaturedImageChange(urls[0]);
    }
  };

  // Handle additional images selection from library
  const handleAdditionalSelect = (urls: string[]) => {
    if (urls.length > 0) {
      disableSuggestedPhotos();
      onAdditionalImagesChange([...additionalImages, ...urls]);
    }
  };

  // Unsplash search helpers
  const openSearch = (target: 'featured' | 'additional') => {
    setSearchTarget(target);
    setSelectedSearchImages([]);
    setSearchOpen(true);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    searchImages({ query: searchQuery.trim(), count: 12 });
  };

  const toggleSearchImage = (url: string) => {
    if (searchTarget === 'featured') {
      setSelectedSearchImages([url]);
    } else {
      setSelectedSearchImages((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    }
  };

  const confirmSearchSelection = () => {
    if (selectedSearchImages.length === 0) return;
    if (searchTarget === 'featured') {
      onFeaturedImageChange(selectedSearchImages[0]);
    } else {
      onAdditionalImagesChange([...additionalImages, ...selectedSearchImages]);
    }
    setSearchOpen(false);
    setSelectedSearchImages([]);
    toast.success(
      searchTarget === 'featured'
        ? 'Featured image set from Unsplash'
        : `${selectedSearchImages.length} image${selectedSearchImages.length !== 1 ? 's' : ''} added from Unsplash`
    );
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/30 px-3 py-2.5">
          <Checkbox
            id="use-affvance-suggested-photos"
            checked={hasUserImages ? false : useAffvanceSuggestedPhotos}
            disabled={hasUserImages}
            onCheckedChange={(checked) =>
              onUseAffvanceSuggestedPhotosChange?.(checked === true)
            }
          />
          <label
            htmlFor="use-affvance-suggested-photos"
            className={cn(
              'text-sm font-medium leading-none',
              hasUserImages ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer'
            )}
          >
            Let Affvance choose free images related to the content
          </label>
          {hasUserImages && (
            <span className="text-muted-foreground ml-auto text-xs">
              Disabled while you use your own images
            </span>
          )}
        </div>

        {/* Featured Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="featured-image">Featured Image (Optional)</Label>
            {(featuredImage || additionalImages.length > 0) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyAllUrls}
                className="h-7 text-xs"
              >
                <CopyIcon className="h-3 w-3 mr-1" />
                Copy All URLs
              </Button>
            )}
          </div>

          {/* Featured Image Preview or Input */}
          {featuredImage ? (
            <div className="relative group rounded-lg overflow-hidden border bg-muted">
              <img
                src={featuredImage}
                alt="Featured"
                className="w-full h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).classList.add('hidden');
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => copyUrl(featuredImage)}
                >
                  <CopyIcon className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setFeaturedPickerOpen(true)}
                >
                  <FolderOpenIcon className="h-3 w-3 mr-1" />
                  Change
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveFeaturedImage}
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2">
                <p className="text-white text-xs truncate">{featuredImage}</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="featured-image"
                  value={featuredImage}
                  onChange={(e) => handleManualFeaturedImageChange(e.target.value)}
                  placeholder="https://example.com/featured-image.jpg"
                  type="url"
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFeaturedPickerOpen(true)}
              >
                <FolderOpenIcon className="h-4 w-4 mr-1" />
                Browse
              </Button>
              {useAffvanceSuggestedPhotos && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openSearch('featured')}
                >
                  <SearchIcon className="h-4 w-4 mr-1" />
                  Search
                </Button>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Main image for the blog post. Select from URL, upload, browse library, or search free images.
          </p>
        </div>

        {/* Additional Images */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Additional Images (Optional)</Label>
            <span className="text-xs text-muted-foreground">
              {additionalImages.length} image{additionalImages.length !== 1 ? 's' : ''}
            </span>
          </div>


          {additionalImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {additionalImages.map((image, index) => (
                <div
                  key={index}
                  className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
                >
                  <img
                    src={image}
                    alt={`Additional ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => copyUrl(image)}
                    >
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => removeAdditionalImage(index)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                    <p className="text-white text-[10px] truncate">{image.split('/').pop()}</p>
                  </div>
                </div>
              ))}


              <button
                type="button"
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => setAdditionalPickerOpen(true)}
              >
                <PlusIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Add More</span>
              </button>
            </div>
          )}


          <div className="flex gap-2">
            <div className="relative flex-1">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="Enter image URL or browse library"
                type="url"
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAdditionalImage();
                  }
                }}
              />
            </div>
            <Button type="button" variant="outline" onClick={addAdditionalImage}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAdditionalPickerOpen(true)}
            >
              <FolderOpenIcon className="h-4 w-4 mr-1" />
              Browse
            </Button>
            {useAffvanceSuggestedPhotos && (
              <Button
                type="button"
                variant="outline"
                onClick={() => openSearch('additional')}
              >
                <SearchIcon className="h-4 w-4 mr-1" />
                Search
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Additional images to include in the blog post
          </p>
        </div>
      </div>

      {/* Media Library Picker for Featured Image */}
      <MediaLibraryPicker
        open={featuredPickerOpen}
        onOpenChange={setFeaturedPickerOpen}
        onSelect={handleFeaturedSelect}
        mode="single"
        mediaType="image"
        title="Select Featured Image"
        description="Media should be selected either from the url or by uploading"
      />

      {/* Media Library Picker for Additional Images */}
      <MediaLibraryPicker
        open={additionalPickerOpen}
        onOpenChange={setAdditionalPickerOpen}
        onSelect={handleAdditionalSelect}
        mode="multiple"
        mediaType="image"
        title="Select Additional Images"
        description="Media should be selected either from the url or by uploading"
      />

      {/* Unsplash Image Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {searchTarget === 'featured' ? 'Search Featured Image' : 'Search Images'}
            </DialogTitle>
            <DialogDescription>
              Search free images from Unsplash.{' '}
              {searchTarget === 'featured' ? 'Select one image.' : 'Select one or more images.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. coffee, technology, nature..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
            />
            <Button onClick={handleSearchSubmit} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 py-2">
                {searchResults.map((img) => {
                  const isSelected = selectedSearchImages.includes(img.url);
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => toggleSearchImage(img.url)}
                      className={cn(
                        'relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all',
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      <img
                        src={img.thumbnail}
                        alt={img.alt_description}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                        <p className="text-white text-[10px] truncate">
                          by {img.photographer.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : searchResults && searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="h-10 w-10 mb-2" />
                <p className="text-sm">No images found. Try different keywords.</p>
              </div>
            ) : !isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <SearchIcon className="h-10 w-10 mb-2" />
                <p className="text-sm">Search for free images from Unsplash</p>
              </div>
            ) : null}
          </div>

          {selectedSearchImages.length > 0 && (
            <div className="flex items-center justify-between border-t pt-3">
              <p className="text-sm text-muted-foreground">
                {selectedSearchImages.length} image{selectedSearchImages.length !== 1 ? 's' : ''} selected
              </p>
              <Button onClick={confirmSearchSelection}>
                Use Selected
              </Button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Photos provided by{' '}
            <a href="https://unsplash.com?utm_source=affvance&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline">
              Unsplash
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
