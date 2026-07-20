import { ArticleStructureType, getTemplateSections } from '@/app/data/templates';
import { useArticleTemplates } from '@/lib/hooks/use-article-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SortableContent as Content,
  SortableItem as Item,
  SortableItemHandle as ItemHandle,
  Sortable
} from '@/components/ui/sortable';
import { GripVertical, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SectionTemplatesProps {
  structureType: ArticleStructureType;
  onSectionsChange?: (sections: string[]) => void;
  initialSections?: string[];
}

export function SectionTemplates({
  structureType,
  onSectionsChange,
  initialSections
}: SectionTemplatesProps) {
  const { templates, isLoading } = useArticleTemplates();
  const [sections, setSections] = useState<string[]>(
    initialSections || getTemplateSections(structureType, templates)
  );
  const [newSection, setNewSection] = useState('');

  // Use ref to store latest callback to avoid stale closures
  const onSectionsChangeRef = useRef(onSectionsChange);

  useEffect(() => {
    onSectionsChangeRef.current = onSectionsChange;
  }, [onSectionsChange]);

  // Track the last structure type to only reset sections when it actually changes
  const lastStructureTypeRef = useRef<ArticleStructureType | null>(null);

  // Update sections when structureType changes or templates load for the first time
  useEffect(() => {
    if (!isLoading && templates) {
      const template = templates[structureType];
      if (template && lastStructureTypeRef.current !== structureType) {
        const newSections = getTemplateSections(structureType, templates);
        setSections(newSections);
        if (onSectionsChangeRef.current) {
          onSectionsChangeRef.current(newSections);
        }
        lastStructureTypeRef.current = structureType;
      }
    }
  }, [structureType, templates, isLoading]);

  const handleAddSection = useCallback(() => {
    if (newSection.trim()) {
      const updatedSections = [...sections, newSection.trim()];
      setSections(updatedSections);
      if (onSectionsChangeRef.current) {
        onSectionsChangeRef.current(updatedSections);
      }
      setNewSection('');
    }
  }, [newSection, sections]); // Only depend on local state

  const handleDeleteSection = useCallback(
    (index: number) => {
      const updatedSections = sections.filter((_, i) => i !== index);
      setSections(updatedSections);
      if (onSectionsChangeRef.current) {
        onSectionsChangeRef.current(updatedSections);
      }
    },
    [sections] // Only depend on sections
  );

  const handleSortChange = useCallback(
    (newSections: string[]) => {
      setSections(newSections);
      if (onSectionsChangeRef.current) {
        onSectionsChangeRef.current(newSections);
      }
    },
    [] // No dependencies - use ref for callback
  );

  return (
    <ScrollArea className="bg-muted/20 h-80 w-full rounded-md border p-3">
      <Sortable
        value={sections}
        onValueChange={handleSortChange}
        orientation="vertical"
      >
        <Content>
          {sections.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center">
              No sections yet. Add one above.
            </div>
          ) : (
            sections.map((section, index) => (
              <Item key={section} value={section} className="mb-2">
                <div className="bg-background/50 flex items-center space-x-2 rounded-md border p-2">
                  <ItemHandle className="hover:bg-accent cursor-grab rounded p-1 active:cursor-grabbing">
                    <GripVertical className="text-muted-foreground h-4 w-4" />
                  </ItemHandle>
                  <Input
                    value={section}
                    readOnly
                    className="flex-1 cursor-default border-0 bg-transparent focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Item>
            ))
          )}
        </Content>
      </Sortable>
      <div className="mt-3 flex gap-2">
        <Input
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          placeholder="Enter new section name"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSection}
          disabled={!newSection.trim()}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Section
        </Button>
      </div>
    </ScrollArea>
  );
}
