export interface Notebook {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  note_count?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  notebook_id: string | null;
  created_at: string;
  updated_at: string;
}
