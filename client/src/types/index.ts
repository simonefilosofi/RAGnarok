export interface Document {
  id: string;
  title: string;
  source_type: "pdf" | "url";
  source_url?: string;
  status: "processing" | "ready" | "error";
  created_at: string;
}

export interface Source {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}
