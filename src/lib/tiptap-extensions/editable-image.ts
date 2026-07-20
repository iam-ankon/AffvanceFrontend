import { Node, mergeAttributes, type Editor } from '@tiptap/core';

export const EditableImage = Node.create({
  name: 'image',
  
  group: 'block',
  
  inline: false,
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      class: {
        default: 'w-full rounded-lg cursor-pointer',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            title: element.getAttribute('title'),
            width: element.getAttribute('width'),
            height: element.getAttribute('height'),
            class: element.getAttribute('class') || 'w-full rounded-lg cursor-pointer',
          };
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },
  
  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('div');
      dom.className = 'relative my-4 group';
      dom.style.display = 'block';
      
      const img = document.createElement('img');
      img.src = node.attrs.src || '';
      img.alt = node.attrs.alt || '';
      img.title = node.attrs.title || '';
      img.className = HTMLAttributes.class || 'w-full rounded-lg cursor-pointer';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 flex items-center justify-center gap-2 bg-black/60 rounded-lg transition-opacity';
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'px-3 py-1.5 bg-white text-gray-900 text-sm font-medium rounded hover:bg-gray-100 transition-colors';
      button.textContent = 'Change Image';
      button.style.pointerEvents = 'auto';
      
      const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const pos = getPos();
        const editorWithExtension = editor as Editor & { __onImageSelect?: (src: string, pos: number) => void };
        if (typeof pos === 'number' && editorWithExtension.__onImageSelect) {
          editorWithExtension.__onImageSelect(node.attrs.src, pos);
        }
      };
      
      button.addEventListener('click', handleClick);
      img.addEventListener('click', handleClick);
      
      overlay.appendChild(button);
      
      dom.appendChild(img);
      dom.appendChild(overlay);
      
      const showOverlay = () => {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
      };
      
      const hideOverlay = () => {
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
      };
      
      dom.addEventListener('mouseenter', showOverlay);
      dom.addEventListener('mouseleave', hideOverlay);
      
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') {
            return false;
          }
          img.src = updatedNode.attrs.src || '';
          img.alt = updatedNode.attrs.alt || '';
          img.title = updatedNode.attrs.title || '';
          return true;
        },
      };
    };
  },
});
