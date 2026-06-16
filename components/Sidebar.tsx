'use client';

import { useState } from 'react';
import { Notebook } from '@/lib/types';

interface Props {
  notebooks: Notebook[];
  selectedNotebookId: string | null;
  onSelectNotebook: (id: string | null) => void;
  onCreateNotebook: () => void;
  onDeleteNotebook: (id: string) => void;
  onRenameNotebook: (id: string, title: string) => void;
  totalNoteCount: number;
}

export default function Sidebar({
  notebooks,
  selectedNotebookId,
  onSelectNotebook,
  onCreateNotebook,
  onDeleteNotebook,
  onRenameNotebook,
  totalNoteCount,
}: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);

  const startRename = (nb: Notebook) => {
    setRenamingId(nb.id);
    setRenameValue(nb.title);
    setContextMenu(null);
  };

  const submitRename = (id: string) => {
    if (renameValue.trim()) onRenameNotebook(id, renameValue.trim());
    setRenamingId(null);
  };

  return (
    <div
      className="w-60 bg-[#232323] text-white flex flex-col h-full select-none flex-shrink-0"
      onClick={() => setContextMenu(null)}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#3a3a3a]">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" fill="#00a82d"/>
            <path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="text-base font-semibold tracking-tight">메모장</span>
        </div>
      </div>

      {/* All Notes */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => onSelectNotebook(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
            selectedNotebookId === null
              ? 'bg-[#00a82d] text-white'
              : 'text-gray-300 hover:bg-[#333]'
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span className="flex-1 text-left">모든 노트</span>
          <span className="text-xs opacity-60">{totalNoteCount}</span>
        </button>
      </div>

      {/* Notebooks */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">노트북</span>
          <button
            onClick={onCreateNotebook}
            className="text-gray-500 hover:text-white transition-colors"
            title="새 노트북"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <div className="px-3 pb-3">
          {notebooks.length === 0 && (
            <p className="text-xs text-gray-600 px-3 py-2">노트북이 없습니다</p>
          )}
          {notebooks.map(nb => (
            <div key={nb.id} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, id: nb.id }); }}>
              {renamingId === nb.id ? (
                <div className="px-2 py-1">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => submitRename(nb.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') submitRename(nb.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    className="w-full bg-[#3a3a3a] text-white text-sm px-2 py-1.5 rounded outline-none ring-1 ring-[#00a82d]"
                  />
                </div>
              ) : (
                <button
                  onClick={() => onSelectNotebook(nb.id)}
                  onDoubleClick={() => startRename(nb)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedNotebookId === nb.id
                      ? 'bg-[#00a82d] text-white'
                      : 'text-gray-300 hover:bg-[#333]'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  <span className="flex-1 text-left truncate">{nb.title}</span>
                  <span className="text-xs opacity-60">{nb.note_count ?? 0}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#3a3a3a] rounded-lg shadow-xl border border-[#555] z-50 py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { const nb = notebooks.find(n => n.id === contextMenu.id); if (nb) startRename(nb); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#4a4a4a] transition-colors"
          >
            이름 변경
          </button>
          <button
            onClick={() => { onDeleteNotebook(contextMenu.id); setContextMenu(null); }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#4a4a4a] transition-colors"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
