import { useState } from "react";
import { useDocuments } from "../../hooks/useDocuments";
import { Button } from "../ui/Button";
import { DocumentList } from "./DocumentList";
import { UploadModal } from "./UploadModal";

export function DocumentsView() {
  const { documents, remove } = useDocuments();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
          Your Documents
        </h2>
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          + Add Document
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DocumentList documents={documents} onDelete={remove} />
      </div>
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
