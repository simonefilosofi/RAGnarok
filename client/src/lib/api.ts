const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

interface UploadResult {
  document_id: string;
  status: string;
}

export async function uploadDocument(
  file: File,
  token: string,
  groqKey: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-LLM-Key": groqKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Upload failed");
  }

  return response.json();
}

export async function ingestUrl(
  url: string,
  title: string,
  token: string,
  groqKey: string
): Promise<UploadResult> {
  const response = await fetch(`${API_BASE}/documents/ingest-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-LLM-Key": groqKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, title }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "URL ingest failed");
  }

  return response.json();
}

export async function* streamChat(
  question: string,
  token: string,
  groqKey: string
): AsyncGenerator<string> {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-LLM-Key": groqKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok || !response.body) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Chat request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload) as { token?: string; error?: string };
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.token) yield parsed.token;
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}
