"use client";

// components/admin/RichTextEditor.tsx — a modular rich-text editor built on
// Tiptap (open-source, MIT). Reusable anywhere the admin needs to enter
// long formatted text: blog article bodies, and any future long-text field
// (event write-ups, journal abstracts, …). The value in/out contract is a
// plain HTML string, so callers never touch the editor internals.

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

export interface RichTextEditorProps {
  /** Current HTML value. */
  value: string;
  /** Fires with the edited HTML on every change. */
  onChange: (html: string) => void;
  /** Placeholder shown when the document is empty. */
  placeholder?: string;
  /** Minimum height of the editing area, e.g. "16rem". */
  minHeight?: string;
  /** Field label rendered above the toolbar (optional). */
  label?: React.ReactNode;
}

/** The font families offered in the "font" dropdown. */
const FONT_OPTIONS = [
  { label: "Sans (Work Sans)", value: "var(--font-work-sans), sans-serif" },
  { label: "Serif (Fraunces)", value: "var(--font-fraunces), serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, 'Courier New', monospace" },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`w-8 h-8 flex items-center justify-center rounded-sm border transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-brand-primary text-cream-50 border-brand-primary"
          : "border-transparent text-ink-700 hover:border-ink-900/20 hover:bg-cream-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write the article…",
  minHeight = "18rem",
  label,
}: RichTextEditorProps) {
  // Keep the latest callback in a ref so re-renders never recreate the editor.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // The link & underline marks ship with StarterKit in v3.
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    // Avoid an SSR/client markup mismatch — render only on the client.
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(current.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rte-content font-sans text-sm text-ink-900 outline-none px-3.5 py-3",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync external value changes (e.g. opening another post in the form)
  // into the editor without clobbering the caret mid-typing.
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className="border border-ink-900/20 rounded-sm bg-cream-50 animate-pulse"
        style={{ minHeight }}
      />
    );
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", previous ?? "https://");
    if (url === null) return;
    if (url === "" || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const setImage = () => {
    const url = window.prompt("Image URL (https://…)");
    if (url && url !== "https://") {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div>
      {label && (
        <p className="block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 mb-1.5">
          {label}
        </p>
      )}
      <div className="border border-ink-900/20 rounded-sm bg-cream-50 focus-within:border-brand-primary transition-colors duration-300">
        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-1 px-2 py-2 border-b border-ink-900/10 bg-white rounded-t-sm"
          role="toolbar"
          aria-label="Text formatting"
        >
          <ToolbarButton
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo2 size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo2 size={14} aria-hidden="true" />
          </ToolbarButton>

          <span aria-hidden="true" className="w-px h-5 bg-ink-900/10 mx-1" />

          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Inline code"
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code size={14} aria-hidden="true" />
          </ToolbarButton>

          <span aria-hidden="true" className="w-px h-5 bg-ink-900/10 mx-1" />

          <ToolbarButton
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 size={14} aria-hidden="true" />
          </ToolbarButton>

          <span aria-hidden="true" className="w-px h-5 bg-ink-900/10 mx-1" />

          {/* Font family */}
          <select
            aria-label="Font family"
            value={(editor.getAttributes("textStyle").fontFamily as string) ?? ""}
            onChange={(event) => {
              const family = event.target.value;
              if (family) {
                editor.chain().focus().setFontFamily(family).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
            }}
            className="h-8 px-2 rounded-sm border border-ink-900/20 bg-white font-sans text-xs text-ink-700 outline-none focus:border-brand-primary"
          >
            <option value="">Font</option>
            {FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Text colour */}
          <label
            className="h-8 w-8 flex items-center justify-center rounded-sm border border-transparent hover:border-ink-900/20 hover:bg-cream-100 cursor-pointer"
            title="Text colour"
          >
            <span className="relative flex flex-col items-center leading-none">
              <span className="font-sans text-[10px] font-bold text-ink-700">A</span>
              <span className="w-3.5 h-1 rounded-sm bg-brand-primary -mt-0.5" />
            </span>
            <input
              type="color"
              className="sr-only"
              onChange={(event) =>
                editor.chain().focus().setColor(event.target.value).run()
              }
            />
          </label>

          {/* Highlight */}
          <label
            className="h-8 w-8 flex items-center justify-center rounded-sm border border-transparent hover:border-ink-900/20 hover:bg-cream-100 cursor-pointer"
            title="Highlight colour"
          >
            <Highlighter size={14} className="text-ink-700" aria-hidden="true" />
            <input
              type="color"
              className="sr-only"
              onChange={(event) =>
                editor.chain().focus().setHighlight({ color: event.target.value }).run()
              }
            />
          </label>

          <span aria-hidden="true" className="w-px h-5 bg-ink-900/10 mx-1" />

          <ToolbarButton
            label="Align left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Align centre"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Align right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight size={14} aria-hidden="true" />
          </ToolbarButton>

          <span aria-hidden="true" className="w-px h-5 bg-ink-900/10 mx-1" />

          <ToolbarButton
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Horizontal rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus size={14} aria-hidden="true" />
          </ToolbarButton>

          <span aria-hidden="true" className="w-px h-5 bg-ink-900/10 mx-1" />

          <ToolbarButton
            label="Insert link"
            active={editor.isActive("link")}
            onClick={setLink}
          >
            <Link2 size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Remove link"
            disabled={!editor.isActive("link")}
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Link2Off size={14} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton label="Insert image by URL" onClick={setImage}>
            <ImagePlus size={14} aria-hidden="true" />
          </ToolbarButton>
        </div>

        {/* ── Editing area ────────────────────────────────────── */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
