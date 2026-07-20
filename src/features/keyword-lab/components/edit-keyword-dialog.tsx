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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { KeywordCollectionItem } from '@/lib/hooks/use-keyword-collections';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const editKeywordSchema = z.object({
  user_priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  user_notes: z.string().max(500, 'Notes are too long').optional(),
  is_selected: z.boolean().optional()
});

type EditKeywordFormValues = z.infer<typeof editKeywordSchema>;

interface EditKeywordDialogProps {
  keyword: KeywordCollectionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (keywordId: string, updates: EditKeywordFormValues) => Promise<void>;
}

export function EditKeywordDialog({
  keyword,
  open,
  onOpenChange,
  onSave
}: EditKeywordDialogProps) {
  const form = useForm<EditKeywordFormValues>({
    resolver: zodResolver(editKeywordSchema),
    defaultValues: {
      user_priority: undefined,
      user_notes: '',
      is_selected: false
    }
  });

  // Reset form when keyword changes
  useEffect(() => {
    if (keyword) {
      form.reset({
        user_priority: keyword.user_priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined,
        user_notes: keyword.user_notes || '',
        is_selected: keyword.is_selected || false
      });
    }
  }, [keyword, form]);

  const onSubmit = async (data: EditKeywordFormValues) => {
    if (!keyword) return;

    try {
      await onSave(keyword.id, data);
      onOpenChange(false);
    } catch (error) {
      console.error('Update keyword error:', error);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Keyword</DialogTitle>
          <DialogDescription>
            {keyword && (
              <span className="font-medium text-foreground">&quot;{keyword.keyword}&quot;</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="user_priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Set the priority level for this keyword</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this keyword..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional notes or observations</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
