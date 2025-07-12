import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Emoji from '@tiptap/extension-emoji';
import {
  Box,
  HStack,
  Button,
  Divider,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  VStack,
  Text,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatStrikethrough,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdInsertLink,
  MdImage,
  MdEmojiEmotions,
} from 'react-icons/md';

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😜', '😝', '😛', '🤑', '🤗', '🤩', '🤔', '🤨', '😐',
  '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪',
  '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓',
  '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟',
  '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰',
  '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷',
  '🤒', '🤕', '🤢', '🤮', '🥴', '😇', '🥳', '🥺', '🤠', '🤡',
];

const RichTextEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.70', 'gray.900');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'image',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Emoji,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const addEmoji = (emoji) => {
    editor.chain().focus().insertContent(emoji.emoji).run();
    setShowEmojiPicker(false);
  };

  // Helper to ensure focus before running a command
  const runWithFocus = (command) => {
    if (!editor.isFocused) {
      editor.commands.focus();
      setTimeout(command, 0);
    } else {
      command();
    }
  };

  // Memoized ToolbarButton for performance
  const ToolbarButton = React.memo(({ icon, onClick, isActive, tooltip, ...props }) => (
    <Tooltip label={tooltip} placement="top">
      <Button
        size="sm"
        variant={isActive ? "solid" : "ghost"}
        colorScheme={isActive ? "brand" : "gray"}
        onClick={onClick}
        _hover={{ bg: hoverBg }}
        aria-label={tooltip}
        {...props}
      >
        {icon}
      </Button>
    </Tooltip>
  ));

  // WARNING: For best performance, do NOT pass a new `value` prop to RichTextEditor on every keystroke.
  // Only set the initial value, and let the editor manage its own state. If you must sync, debounce the parent onChange.

  return (
    <Box border="1px" borderColor={borderColor} borderRadius="md" bg={bg}>
      {/* Toolbar */}
      <Box p={2} borderBottom="1px" borderColor={borderColor}>
        <HStack spacing={2} flexWrap="wrap">
          {/* Text Formatting */}
          <ToolbarButton
            icon={<MdFormatBold size={20} />}
            onClick={() => runWithFocus(() => editor.chain().focus().toggleBold().run())}
            isActive={editor.isActive('bold')}
            tooltip="Bold"
          />
          <ToolbarButton
            icon={<MdFormatItalic size={20} />}
            onClick={() => runWithFocus(() => editor.chain().focus().toggleItalic().run())}
            isActive={editor.isActive('italic')}
            tooltip="Italic"
          />
          <ToolbarButton
            icon={<MdFormatStrikethrough size={20} />}
            onClick={() => runWithFocus(() => editor.chain().focus().toggleStrike().run())}
            isActive={editor.isActive('strike')}
            tooltip="Strikethrough"
          />
          <Divider orientation="vertical" h="24px" />
          {/* Lists */}
          <ToolbarButton
            icon={<MdFormatListBulleted size={20} />}
            onClick={() => runWithFocus(() => editor.chain().focus().toggleBulletList().run())}
            isActive={editor.isActive('bulletList')}
            tooltip="Bullet List"
          />
          <ToolbarButton
            icon={<MdFormatListNumbered size={20} />}
            onClick={() => runWithFocus(() => editor.chain().focus().toggleOrderedList().run())}
            isActive={editor.isActive('orderedList')}
            tooltip="Numbered List"
          />
          <Divider orientation="vertical" h="24px" />
          {/* Text Alignment */}
          <ToolbarButton
            icon={<MdFormatAlignLeft size={20} />}
            onClick={() => runWithFocus(() => editor.chain().focus().setTextAlign('left').run())}
            isActive={editor.isActive({ textAlign: 'left' })}
            tooltip="Align Left"
          />
          <ToolbarButton
            icon={<MdFormatAlignCenter size={20} />}
            onClick={() => runWithFocus(() => editor.chain().focus().setTextAlign('center').run())}
            isActive={editor.isActive({ textAlign: 'center' })}
            tooltip="Align Center"
          />
          <ToolbarButton
            icon={<MdFormatAlignRight size={20} />}
            onClick={() => runWithFocus(() => editor.chain().focus().setTextAlign('right').run())}
            isActive={editor.isActive({ textAlign: 'right' })}
            tooltip="Align Right"
          />
          <Divider orientation="vertical" h="24px" />
          {/* Link */}
          <Popover isOpen={showLinkInput} onClose={() => setShowLinkInput(false)}>
            <PopoverTrigger>
              <ToolbarButton
                icon={<MdInsertLink size={20} />}
                onClick={() => setShowLinkInput(true)}
                isActive={editor.isActive('link')}
                tooltip="Add Link"
              />
            </PopoverTrigger>
            <PopoverContent p={4}>
              <PopoverArrow />
              <PopoverBody>
                <VStack spacing={3}>
                  <Text fontSize="sm" fontWeight="medium">Add Link</Text>
                  <Input
                    placeholder="Enter URL..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    size="sm"
                  />
                  <HStack spacing={2}>
                    <Button size="sm" onClick={addLink} colorScheme="brand">
                      Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          {/* Image */}
          <Popover isOpen={showImageInput} onClose={() => setShowImageInput(false)}>
            <PopoverTrigger>
              <ToolbarButton
                icon={<MdImage size={20} />}
                onClick={() => setShowImageInput(true)}
                tooltip="Add Image"
              />
            </PopoverTrigger>
            <PopoverContent p={4}>
              <PopoverArrow />
              <PopoverBody>
                <VStack spacing={3}>
                  <Text fontSize="sm" fontWeight="medium">Add Image</Text>
                  <Input
                    placeholder="Enter image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    size="sm"
                  />
                  <HStack spacing={2}>
                    <Button size="sm" onClick={addImage} colorScheme="brand">
                      Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowImageInput(false)}>
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          {/* Emoji */}
          <Popover isOpen={showEmojiPicker} onClose={() => setShowEmojiPicker(false)}>
            <PopoverTrigger>
              <ToolbarButton
                icon={<MdEmojiEmotions size={20} />}
                onClick={() => setShowEmojiPicker((v) => !v)}
                isActive={false}
                tooltip="Insert Emoji"
              />
            </PopoverTrigger>
            <PopoverContent width="240px">
              <PopoverArrow />
              <PopoverBody>
                <Box maxH="160px" overflowY="auto">
                  <HStack wrap="wrap" spacing={1}>
                    {EMOJI_LIST.map((emoji, idx) => (
                      <Button
                        key={emoji + '-' + idx}
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          editor.chain().focus().insertContent(emoji).run();
                          setShowEmojiPicker(false);
                        }}
                        fontSize="xl"
                        p={1}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </HStack>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </HStack>
      </Box>
      
      {/* Editor Content */}
      <Box p={4} minH="200px">
        <EditorContent 
          editor={editor} 
          style={{
            minHeight: '200px',
            outline: 'none',
          }}
        />
        {!editor.getText() && (
          <Text color="gray.400" fontSize="md" pointerEvents="none" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
            {placeholder}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default RichTextEditor; 