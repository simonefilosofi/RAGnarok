import { useCallback, useEffect, useRef, useState } from "react";
import { ingestUrl, uploadDocument } from "../lib/api";
import { supabase } from "../lib/supabase";
import { useSessionStore } from "../store/sessionStore";
import type { Document } from "../types";

const POLL_INTERVAL = 3000;

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const groqKey = useSessionStore((s) => s.groqKey);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDocuments = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    const { data, error: err } = await supabase
      .from("documents")
      .select("id, title, source_type, source_url, status, created_at")
      .order("created_at", { ascending: false });

    if (!err && data) setDocuments(data as Document[]);
  }, []);

  // Poll while any document is processing
  useEffect(() => {
    fetchDocuments();

    pollRef.current = setInterval(() => {
      const hasProcessing = documents.some((d) => d.status === "processing");
      if (hasProcessing) fetchDocuments();
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchDocuments, documents]);

  const upload = useCallback(
    async (file: File, title?: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("Not authenticated");
        await uploadDocument(file, token, groqKey, title);
        await fetchDocuments();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [groqKey, fetchDocuments]
  );

  const ingest = useCallback(
    async (url: string, title: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("Not authenticated");
        await ingestUrl(url, title, token, groqKey);
        await fetchDocuments();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ingest failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [groqKey, fetchDocuments]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from("documents").delete().eq("id", id);
      if (err) throw err;
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    },
    []
  );

  return { documents, loading, error, upload, ingest, remove, refresh: fetchDocuments };
}
