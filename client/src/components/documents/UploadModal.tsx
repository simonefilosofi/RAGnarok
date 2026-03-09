import { useRef, useState } from "react";
import { useDocuments } from "../../hooks/useDocuments";
import { useSessionStore } from "../../store/sessionStore";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "pdf" | "url";

export function UploadModal({ open, onClose }: UploadModalProps) {
  const { upload, ingest, loading } = useDocuments();
  const groqKey = useSessionStore((s) => s.groqKey);
  const [tab, setTab] = useState<Tab>("pdf");
  const [url, setUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    try {
      await upload(file, pdfTitle.trim() || file.name);
      setPdfTitle("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await ingest(url.trim(), urlTitle.trim() || url.trim());
      setUrl("");
      setUrlTitle("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingest failed");
    }
  };

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      tab === t
        ? "border-brand-600 text-brand-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;

  return (
    <Modal open={open} onClose={onClose} title="Add Document">
      {!groqKey && (
        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Set your Groq API key before uploading documents.
        </p>
      )}

      <div className="flex gap-1 border-b border-gray-200 mb-4">
        <button className={tabClass("pdf")} onClick={() => setTab("pdf")}>
          PDF Upload
        </button>
        <button className={tabClass("url")} onClick={() => setTab("url")}>
          URL Ingest
        </button>
      </div>

      {tab === "pdf" ? (
        <form onSubmit={handlePdfSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select PDF file
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>
          <Input
            label="Custom name (optional)"
            id="pdf-title"
            type="text"
            value={pdfTitle}
            onChange={(e) => setPdfTitle(e.target.value)}
            placeholder="e.g. File_A, Report_2024"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!groqKey}>
              Upload
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4">
          <Input
            label="URL"
            id="ingest-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            required
          />
          <Input
            label="Title (optional)"
            id="ingest-title"
            type="text"
            value={urlTitle}
            onChange={(e) => setUrlTitle(e.target.value)}
            placeholder="My article"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!groqKey}>
              Ingest
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
