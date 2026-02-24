import type { Document } from "../../types";

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

const statusBadge: Record<Document["status"], string> = {
  processing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

const statusLabel: Record<Document["status"], string> = {
  processing: "Processing…",
  ready: "Ready",
  error: "Error",
};

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-6 px-2">
        No documents yet. Upload a PDF or add a URL.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm"
        >
          <span className="text-base">{doc.source_type === "pdf" ? "📄" : "🌐"}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate" title={doc.title}>
              {doc.title}
            </p>
            <span
              className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-medium ${statusBadge[doc.status]}`}
            >
              {statusLabel[doc.status]}
            </span>
          </div>
          <button
            onClick={() => onDelete(doc.id)}
            aria-label={`Delete ${doc.title}`}
            className="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-0.5"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
