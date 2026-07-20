import { Node, mergeAttributes } from '@tiptap/core';

export const Figure = Node.create({
  name: 'figure',
  
  group: 'block',
  
  content: 'image figcaption?',
  
  draggable: true,
  
  addAttributes() {
    return {
      class: {
        default: 'my-4',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'figure',
        preserveWhitespace: 'full',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      mergeAttributes(HTMLAttributes, { class: 'my-4' }),
      0,
    ];
  },
});

export const Figcaption = Node.create({
  name: 'figcaption',
  
  group: 'block',
  
  content: 'paragraph+',
  
  parseHTML() {
    return [
      {
        tag: 'figcaption',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'figcaption',
      mergeAttributes(HTMLAttributes, {
        class: 'mt-2 text-sm text-gray-600 text-center italic',
      }),
      0,
    ];
  },
  
  addAttributes() {
    return {
      class: {
        default: 'mt-2 text-sm text-gray-600 text-center italic',
      },
    };
  },
});
