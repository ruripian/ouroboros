/**
 * 리치 텍스트 에디터 — tiptap 기반, Notion 스타일
 *
 * - 상시 툴바 없음 — 텍스트 선택 시 플로팅 메뉴 팝업
 * - 클린한 편집 영역, blur 시 자동 저장
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Bold, Italic, Strikethrough, Code, Quote, List, ListOrdered,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
  autoFocus?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  onBlur,
  placeholder,
  editable = true,
  minHeight = "80px",
  autoFocus = false,
}: Props) {
  const { t } = useTranslation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Placeholder.configure({
        placeholder: placeholder || t("editor.placeholder"),
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
    ],
    content,
    editable,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: "outline-none",
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    onBlur: ({ event }) => {
      /* 메뉴 버튼 클릭이면 blur 무시 */
      const related = (event as FocusEvent)?.relatedTarget as Node | null;
      if (menuRef.current?.contains(related)) return;
      onBlur?.();
    },
    onSelectionUpdate: ({ editor: e }) => {
      /* 선택 해제 시 메뉴 숨김 (mouseup 핸들러에서 표시) */
      const { from, to } = e.state.selection;
      if (from === to) setMenuPos(null);
    },
  });

  /* 외부 content 변경 시 에디터 동기화 */
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content]);

  /* 드래그 완료(mouseup) 시 선택 영역이 있으면 메뉴 표시 */
  useEffect(() => {
    const handleMouseUp = () => {
      if (!editor) return;
      /* 약간의 딜레이로 selection이 확정된 후 계산 */
      requestAnimationFrame(() => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        if (from === to) { setMenuPos(null); return; }
        const domSel = window.getSelection();
        if (!domSel || domSel.rangeCount === 0) { setMenuPos(null); return; }
        const range = domSel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0) { setMenuPos(null); return; }
        /* 뷰포트 기준 fixed 좌표 — 선택 영역 바로 위, 가운데 정렬 */
        const menuHeight = 40;
        const gap = 8;
        setMenuPos({
          top: rect.top - menuHeight - gap,
          left: rect.left + rect.width / 2,
        });
      });
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [editor]);

  /* 링크 삽입 */
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      ref={wrapperRef}
      className="relative rounded-md border border-border p-3 hover:border-border focus-within:border-primary/50 bg-card/50 transition-colors cursor-text"
      onClick={() => { if (!editor.isFocused) editor.chain().focus().run(); }}
    >
      {/* 텍스트 선택 완료 시 플로팅 메뉴 — Portal로 body에 직접 렌더 */}
      {menuPos && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] flex items-center gap-0.5 rounded-lg border bg-popover px-1 py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: menuPos.top,
            left: menuPos.left,
            transform: "translateX(-50%)",
          }}
        >
          <BubbleBtn
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title={t("editor.bold")}
          >
            <Bold className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title={t("editor.italic")}
          >
            <Italic className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title={t("editor.strikethrough")}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title={t("editor.code")}
          >
            <Code className="h-3.5 w-3.5" />
          </BubbleBtn>

          <div className="w-px h-4 bg-border/50 mx-0.5" />

          <BubbleBtn
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title={t("editor.bulletList")}
          >
            <List className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title={t("editor.orderedList")}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title={t("editor.quote")}
          >
            <Quote className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn
            active={editor.isActive("link")}
            onClick={setLink}
            title={t("editor.link")}
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </BubbleBtn>
        </div>,
        document.body
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

/* 플로팅 메뉴 버튼 */
function BubbleBtn({
  active = false,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onMouseDown={(e) => {
        /* 선택 해제 방지 */
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </button>
  );
}
