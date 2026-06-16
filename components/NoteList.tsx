'use client';

import { Note } from '@/lib/types';

interface Props {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  notebookTitle: string;
}

function getPreview(content: string): string {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 120) || '내용 없음';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
  notebookTitle,
}: Props) {
  return (
    <div className="w-72 bg-[#f5f5f5] border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 truncate">{notebookTitle}</h2>
          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{notes.length}개</span>
        </div>
        <button
          onClick={onCreateNote}
          className="w-full flex items-center justify-center gap-1.5 bg-[#00a82d] text-white text-sm py-1.5 rounded-md hover:bg-[#009428] active:bg-[#007a20] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          새 노트
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white border-b border-gray-200">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="노트 검색..."
            className="w-full bg-[#f0f0f0] rounded-md text-sm px-3 py-1.5 pl-7 outline-none focus:ring-2 focus:ring-[#00a82d] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-gray-300">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-sm text-center">
              {searchQuery ? '검색 결과가 없습니다' : '노트가 없습니다'}
            </p>
            {!searchQuery && (
              <button onClick={onCreateNote} className="mt-2 text-sm text-[#00a82d] hover:underline">
                첫 노트 작성하기
              </button>
            )}
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`relative px-4 py-3 border-b border-gray-200 cursor-pointer group transition-all ${
                selectedNoteId === note.id
                  ? 'bg-white border-l-4 border-l-[#00a82d] shadow-sm'
                  : 'border-l-4 border-l-transparent hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <p className={`text-sm font-medium leading-snug flex-1 min-w-0 truncate ${
                  selectedNoteId === note.id ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {note.title || '제목 없음'}
                </p>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-red-500 transition-all p-0.5 rounded"
                  title="삭제"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {getPreview(note.content)}
              </p>
              <p className="text-xs text-gray-400 mt-1.5">{formatDate(note.updated_at)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
