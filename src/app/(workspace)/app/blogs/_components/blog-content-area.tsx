'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { useSaveBlogContent } from '@/lib/hooks/use-blogs';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Figure, Figcaption } from '@/lib/tiptap-extensions/figure';
import { EditableImage } from '@/lib/tiptap-extensions/editable-image';
import Image from 'next/image';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Save,
  Underline as UnderlineIcon,
  ImageIcon,
  FolderOpen,
  Trash2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PublishingDialog } from './publishing-dialog';
import { EditPublicationDialog } from './edit-publication-dialog';
import { Send, CheckCircle2, Calendar, Loader2 as LoaderIcon, AlertCircle } from 'lucide-react';
import { useContentPublications } from '@/lib/hooks/use-publishing';
import { Badge } from '@/components/ui/badge';
import { ScheduledPublication } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { MediaLibraryPicker } from '@/features/blogs/components/shared/form-blocks/media-library-picker';

interface BlogContentAreaProps {
  id?: string;
  content?: string;
  title?: string;
  featuredImage?: string | null;
  onContentChange?: (html: string) => void;
}

export function BlogContentArea({ id, content, title, onContentChange, featuredImage }: BlogContentAreaProps) {
  const [currentTitle, setCurrentTitle] = useState(title || '');
  const [currentFeaturedImage, setCurrentFeaturedImage] = useState(featuredImage || null);
  const [hasChanges, setHasChanges] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isPublishingDialogOpen, setIsPublishingDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isContentImagePickerOpen, setIsContentImagePickerOpen] = useState(false);
  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<ScheduledPublication | null>(null);
  const currentContentRef = useRef(content || '');
  const { mutate: saveBlogContent, isPending: isSaving } = useSaveBlogContent(id || '');
  const { data: publicationsData, isLoading: isLoadingPublications } = useContentPublications(id || null);

  const publications = publicationsData?.data?.publications || [];

  // Update currentTitle when title prop changes
  useEffect(() => {
    if (title) {
      setCurrentTitle(title);
    }
  }, [title]);

  // Update currentFeaturedImage when prop changes
  useEffect(() => {
    setCurrentFeaturedImage(featuredImage || null);
    setImgError(false);
  }, [featuredImage]);

  // Update currentContentRef when content prop changes
  useEffect(() => {
    if (content) {
      currentContentRef.current = content;
    }
  }, [content]);

  const handleSave = () => {
    if (!id) return;

    saveBlogContent(
      {
        title: currentTitle,
        html_content: currentContentRef.current,
        featured_image_url: currentFeaturedImage
      },
      {
        onSuccess: () => {
          setHasChanges(false);
        }
      }
    );
  };

  const handleImageSelect = (urls: string[]) => {
    if (urls.length > 0) {
      setCurrentFeaturedImage(urls[0]);
      setImgError(false);
      setHasChanges(true);
    }
  };

  const handleRemoveImage = () => {
    setCurrentFeaturedImage(null);
    setHasChanges(true);
  };

  const handleContentImageSelect = (urls: string[]) => {
    if (urls.length > 0 && selectedImagePos !== null && editor) {
      const { state } = editor;
      const { tr } = state;
      const pos = selectedImagePos;

      // Find the image node at this position
      const node = state.doc.nodeAt(pos);
      if (node && node.type.name === 'image') {
        // Update the image attributes
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          src: urls[0],
        });
        editor.view.dispatch(tr);
        setHasChanges(true);
      }

      setIsContentImagePickerOpen(false);
      setSelectedImagePos(null);
      setSelectedImageSrc(null);
    }
  };

  const handleImageClick = (src: string, pos: number) => {
    setSelectedImageSrc(src);
    setSelectedImagePos(pos);
    setIsContentImagePickerOpen(true);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      EditableImage,
      Figure,
      Figcaption
    ],
    content: content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[400px] p-4'
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      currentContentRef.current = html;
      setHasChanges(true);
      onContentChange?.(html);
    }
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Set up image click handler on editor
  useEffect(() => {
    if (editor) {
      (editor as Editor & { __onImageSelect?: (src: string, pos: number) => void }).__onImageSelect = (src: string, pos: number) => {
        setSelectedImageSrc(src);
        setSelectedImagePos(pos);
        setIsContentImagePickerOpen(true);
      };
      return () => {
        const editorWithExtension = editor as Editor & { __onImageSelect?: (src: string, pos: number) => void };
        delete editorWithExtension.__onImageSelect;
      };
    }
  }, [editor]);

  // Calculate publication status
  const getPublishingStatus = () => {
    if (isLoadingPublications) {
      return { type: 'loading', count: 0 };
    }

    if (publications.length === 0) {
      return { type: 'none', count: 0 };
    }

    const published = publications.filter(p => p.status === 'published');
    const pending = publications.filter(p => p.status === 'pending');
    const publishing = publications.filter(p => p.status === 'publishing');
    const failed = publications.filter(p => p.status === 'failed');

    if (publishing.length > 0) {
      return { type: 'publishing', count: publishing.length };
    }
    if (published.length > 0) {
      return { type: 'published', count: published.length, total: publications.length };
    }
    if (pending.length > 0) {
      return { type: 'scheduled', count: pending.length, total: publications.length };
    }
    if (failed.length > 0) {
      return { type: 'failed', count: failed.length, total: publications.length };
    }

    return { type: 'none', count: 0 };
  };

  const publishingStatus = getPublishingStatus();

  const getPublishingButtonContent = () => {
    switch (publishingStatus.type) {
      case 'loading':
        return (
          <>
            <LoaderIcon className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        );
      case 'published':
        return (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span>Published</span>
            {publishingStatus.total && publishingStatus.total > 1 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {publishingStatus.count}/{publishingStatus.total}
              </Badge>
            )}
          </>
        );
      case 'scheduled':
        return (
          <>
            <Calendar className="h-4 w-4" />
            <span>Scheduled</span>
            {publishingStatus.total && publishingStatus.total > 1 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {publishingStatus.count}/{publishingStatus.total}
              </Badge>
            )}
          </>
        );
      case 'publishing':
        return (
          <>
            <LoaderIcon className="h-4 w-4 animate-spin" />
            <span>Publishing...</span>
            {publishingStatus.count > 1 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {publishingStatus.count}
              </Badge>
            )}
          </>
        );
      case 'failed':
        return (
          <>
            <AlertCircle className="h-4 w-4" />
            <span>Failed</span>
            {publishingStatus.total && publishingStatus.total > 1 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                {publishingStatus.count}/{publishingStatus.total}
              </Badge>
            )}
          </>
        );
      default:
        return (
          <>
            <Send className="h-4 w-4" />
            <span>Publish</span>
          </>
        );
    }
  };

  const getPublishingButtonVariant = (): 'default' | 'outline' | 'destructive' => {
    switch (publishingStatus.type) {
      case 'published':
        return 'default';
      case 'scheduled':
        return 'outline';
      case 'publishing':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPublishingButtonClassName = () => {
    switch (publishingStatus.type) {
      case 'published':
        return 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed';
      case 'scheduled':
        return 'border-yellow-300 text-yellow-700 hover:bg-yellow-50';
      case 'publishing':
        return 'border-blue-300 text-blue-700 hover:bg-blue-50';
      default:
        return '';
    }
  };

  // Check if content is published
  const isPublished = publications.some(p => p.status === 'published');

  // Handle Publishing button click
  const handlePublishingButtonClick = () => {
    // If there are scheduled publications (pending or failed), open edit dialog with first one
    const editablePublications = publications.filter(p => p.status === 'pending' || p.status === 'failed');
    if (editablePublications.length > 0) {
      // Prioritize pending over failed
      const pendingPub = editablePublications.find(p => p.status === 'pending');
      setSelectedPublication(pendingPub || editablePublications[0]);
      setIsEditDialogOpen(true);
    } else {
      // Otherwise, open create dialog
      setIsPublishingDialogOpen(true);
    }
  };



  return (
    <div className="flex h-full flex-col">
      {/* Header - Fixed */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Content Title</div>
              <h2 className="text-xl font-semibold">
                {currentTitle || 'Ready to create your blog?'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {id && (
              <>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant={getPublishingButtonVariant()}
                  onClick={handlePublishingButtonClick}
                  disabled={
                    publishingStatus.type === 'loading' ||
                    publishingStatus.type === 'publishing' ||
                    isPublished
                  }
                  className={cn("gap-2", getPublishingButtonClassName())}
                >
                  {getPublishingButtonContent()}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          {/* Toolbar - Fixed at top */}
          <div className="shrink-0 border-b border-gray-200 bg-white p-2">
            <div className="flex flex-wrap items-center gap-1">
              {/* Text formatting */}
              <div className="flex items-center gap-0.5">
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('bold')}
                  onPressedChange={() => editor?.chain().focus().toggleBold().run()}
                  aria-label="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('italic')}
                  onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
                  aria-label="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('underline')}
                  onPressedChange={() => editor?.chain().focus().toggleUnderline().run()}
                  aria-label="Underline"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('highlight')}
                  onPressedChange={() => editor?.chain().focus().toggleHighlight().run()}
                  aria-label="Highlight"
                  className="data-[state=on]:bg-yellow-200"
                >
                  <Highlighter className="h-4 w-4" />
                </Toggle>
              </div>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Headings */}
              <div className="flex items-center gap-0.5">
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('heading', { level: 1 })}
                  onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  aria-label="Heading 1"
                >
                  <Heading1 className="h-4 w-4" />
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('heading', { level: 2 })}
                  onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  aria-label="Heading 2"
                >
                  <Heading2 className="h-4 w-4" />
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('heading', { level: 3 })}
                  onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  aria-label="Heading 3"
                >
                  <Heading3 className="h-4 w-4" />
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('heading', { level: 4 })}
                  onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
                  aria-label="Heading 4"
                >
                  <Heading4 className="h-4 w-4" />
                </Toggle>
              </div>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Lists */}
              <div className="flex items-center gap-0.5">
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('bulletList')}
                  onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
                  aria-label="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={editor?.isActive('orderedList')}
                  onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
                  aria-label="Ordered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
          </div>

          {/* Editor Content - Scrollable */}
          <ScrollArea className="h-0 flex-1">
            <div className="p-4">
              {/* Featured Image with hover controls */}
              <div className="group relative mb-4 aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={currentFeaturedImage && !imgError ? currentFeaturedImage : '/images/blog-placeholder.png'}
                  alt="Featured image"
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    (!currentFeaturedImage || imgError) && "opacity-50 dark:opacity-40"
                  )}
                  onError={() => setImgError(true)}
                />

                {/* Hover overlay with actions */}
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center gap-2 bg-black/60 transition-opacity",
                  currentFeaturedImage && !imgError ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                )}>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsImagePickerOpen(true)}
                  >
                    <FolderOpen className="mr-1 h-4 w-4" />
                    {currentFeaturedImage && !imgError ? 'Change' : 'Add Image'}
                  </Button>
                  {currentFeaturedImage && !imgError && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              {editor ? (
                <EditorContent editor={editor} />
              ) : (
                <div className="flex min-h-[400px] items-center justify-center text-gray-400">
                  No content generated yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      {id && (
        <>
          <PublishingDialog
            contentId={id}
            open={isPublishingDialogOpen}
            onOpenChange={setIsPublishingDialogOpen}
          />
          {selectedPublication && (
            <EditPublicationDialog
              publication={selectedPublication}
              open={isEditDialogOpen}
              onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) {
                  setSelectedPublication(null);
                }
              }}
            />
          )}
        </>
      )}

      {/* Media Library Picker for Featured Image */}
      <MediaLibraryPicker
        open={isImagePickerOpen}
        onOpenChange={setIsImagePickerOpen}
        onSelect={handleImageSelect}
        mode="single"
        mediaType="image"
        title="Select Featured Image"
        description="Choose an image from your library or upload a new one"
      />

      {/* Media Library Picker for Content Images */}
      <MediaLibraryPicker
        open={isContentImagePickerOpen}
        onOpenChange={(open) => {
          setIsContentImagePickerOpen(open);
          if (!open) {
            setSelectedImagePos(null);
            setSelectedImageSrc(null);
          }
        }}
        onSelect={handleContentImageSelect}
        mode="single"
        mediaType="image"
        title="Replace Image"
        description="Choose a new image from your library or upload a new one"
      />
    </div>
  );
}
