'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from './Sidebar';
import NoteList from './NoteList';
import { Notebook, Note } from '@/lib/types';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

export default function MainLayout() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialized, setInitialized] = useState(false);
  const prevNoteIdRef = useRef<string | null>(null);

  useEffect(() => {
    fetch('/api/init', { method: 'POST' })
      .then(() => setInitialized(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    fetch('/api/notebooks')
      .then(r => r.json())
      .then(data => setNotebooks(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [initialized]);

  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams();
    if (selectedNotebookId) params.set('notebookId', selectedNotebookId);
    if (searchQuery) params.set('search', searchQuery);

    fetch(`/api/notes?${params}`)
      .then(r => r.json())
      .then((data: Note[]) => {
        const list = Array.isArray(data) ? data : [];
        setNotes(list);
        const stillValid = list.some(n => n.id === prevNoteIdRef.current);
        if (!stillValid) {
          const next = list[0]?.id ?? null;
          setSelectedNoteId(next);
          prevNoteIdRef.current = next;
        }
      })
      .catch(console.error);
  }, [initialized, selectedNotebookId, searchQuery]);

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    prevNoteIdRef.current = id;
  };

  const handleCreateNotebook = async () => {
    const res = await fetch('/api/notebooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '새 노트북' }),
    });
    const nb: Notebook = await res.json();
    setNotebooks(prev => [{ ...nb, note_count: 0 }, ...prev]);
    setSelectedNotebookId(nb.id);
  };

  const handleRenameNotebook = async (id: string, title: string) => {
    await fetch(`/api/notebooks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setNotebooks(prev => prev.map(nb => nb.id === id ? { ...nb, title } : nb));
  };

  const handleDeleteNotebook = async (id: string) => {
    if (!confirm('노트북을 삭제하시겠습니까?\n노트북 안의 노트는 보존됩니다.')) return;
    await fetch(`/api/notebooks/${id}`, { method: 'DELETE' });
    setNotebooks(prev => prev.filter(nb => nb.id !== id));
    if (selectedNotebookId === id) setSelectedNotebookId(null);
  };

  const handleCreateNote = async () => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '제목 없음', content: '', notebook_id: selectedNotebookId }),
    });
    const note: Note = await res.json();
    setNotes(prev => [note, ...prev]);
    setSelectedNoteId(note.id);
    prevNoteIdRef.current = note.id;

    if (selectedNotebookId) {
      setNotebooks(prev => prev.map(nb =>
        nb.id === selectedNotebookId ? { ...nb, note_count: (nb.note_count ?? 0) + 1 } : nb
      ));
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('이 노트를 삭제하시겠습니까?')) return;
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);

    if (selectedNoteId === id) {
      const next = remaining[0]?.id ?? null;
      setSelectedNoteId(next);
      prevNoteIdRef.current = next;
    }

    const nb = notes.find(n => n.id === id);
    if (nb?.notebook_id) {
      setNotebooks(prev => prev.map(n =>
        n.id === nb.notebook_id ? { ...n, note_count: Math.max(0, (n.note_count ?? 1) - 1) } : n
      ));
    }
  };

  const handleNoteUpdate = (updated: Note) => {
    setNotes(prev => prev.map(n => n.id === updated.id ? { ...n, ...updated } : n));
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId) ?? null;
  const totalNoteCount = notebooks.reduce((s, nb) => s + (nb.note_count ?? 0), 0);
  const notebookTitle = selectedNotebookId
    ? (notebooks.find(nb => nb.id === selectedNotebookId)?.title ?? '노트')
    : '모든 노트';

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#232323]">
        <div className="text-center">
          <svg className="animate-spin mx-auto mb-3 text-[#00a82d]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <p className="text-gray-400 text-sm">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        notebooks={notebooks}
        selectedNotebookId={selectedNotebookId}
        onSelectNotebook={setSelectedNotebookId}
        onCreateNotebook={handleCreateNotebook}
        onDeleteNotebook={handleDeleteNotebook}
        onRenameNotebook={handleRenameNotebook}
        totalNoteCount={totalNoteCount}
      />
      <NoteList
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        notebookTitle={notebookTitle}
      />
      <Editor note={selectedNote} onUpdate={handleNoteUpdate} />
    </div>
  );
}
