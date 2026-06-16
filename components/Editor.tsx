'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Note } from '../lib/types';

interface Props {
  note: Note | null;
  onUpdate: (note: Note) => void;
}

function ToolBtn({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`h-7 min-w-[28px] px-1.5 rounded text-sm font-medium transition-colors ${
        active ? 'bg-[#00a82d] text-white' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-300 mx-0.5" />;
}

export default function Editor({ note, onUpdate }: Props) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIdRef = useRef<string | null>(null);
  const titleRef = useRef(title);
  titleRef.current = title;

  const save = useCallback(async (id: string, updates: { title?: string; content?: string }) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      onUpdate(updated as Note);
    } finally {
      setSaving(false);
    }
  }, [onUpdate]);

  const scheduleSave = useCallback((id: string, updates: { title?: string; content?: string }) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => save(id, updates), 800);
  }, [save]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: '내용을 입력하세요...' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (!currentIdRef.current) return;
      scheduleSave(currentIdRef.current, { content: editor.getHTML() });
    },
    editorProps: {
      attributes: { class: 'min-h-full focus:outline-none text-gray-800 text-[15px] leading-relaxed' },
    },
  });

  useEffect(() => {
    if (!note) {
      currentIdRef.current = null;
      setTitle('');
      editor?.commands.setContent('');
      return;
    }
    if (note.id === currentIdRef.current) return;
    currentIdRef.current = note.id;
    setTitle(note.title || '');
    editor?.commands.setContent(note.content || '', false);
  }, [note, editor]);

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (currentIdRef.current) scheduleSave(currentIdRef.current, { title: val });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); editor?.commands.focus(); }
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-gray-300 mb-4">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p className="text-gray-400 text-base">노트를 선택하거나 새 노트를 만드세요</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-200 bg-gray-50 flex-wrap">
        <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="굵게 (Ctrl+B)">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="기울임 (Ctrl+I)">
          <em>I</em>
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="밑줄 (Ctrl+U)">
          <span className="underline">U</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="취소선">
          <span className="line-through">S</span>
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} title="제목 1">
          H1
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="제목 2">
          H2
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} title="제목 3">
          H3
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="글머리 목록">
          <span className="text-base leading-none">☰</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="번호 목록">
          <span className="text-xs">1.</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="인용">
          <span className="text-base leading-none">"</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="코드">
          {'<>'}
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="코드 블록">
          {'{ }'}
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => editor?.chain().focus().undo().run()} title="실행 취소 (Ctrl+Z)">↩</ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().redo().run()} title="다시 실행 (Ctrl+Y)">↪</ToolBtn>

        <div className="ml-auto flex items-center gap-2">
          {saving && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              저장 중
            </span>
          )}
          <span className="text-xs text-gray-400">
            {new Date(note.updated_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="px-10 pt-7 pb-3">
        <input
          type="text"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="제목"
          className="w-full text-[26px] font-bold text-gray-900 outline-none placeholder-gray-300 bg-transparent"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="tiptap-editor px-10 pb-10 h-full">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
