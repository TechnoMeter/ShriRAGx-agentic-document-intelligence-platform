const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  async uploadFile(file: File): Promise<{ message: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/v1/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Ingestion transmission failed.');
    }
    return response.json();
  },

  async chatStream(message: string): Promise<Response> {
    const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status} - ${errorText}`);
    }
    return res;
  },

  async getDocuments(): Promise<{ documents: any[] }> {
    const res = await fetch(`${API_BASE}/api/v1/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents.');
    return res.json();
  },

  async getDocumentChunks(filename: string): Promise<{ chunks: string[] }> {
    const res = await fetch(`${API_BASE}/api/v1/documents/${encodeURIComponent(filename)}/chunks`);
    if (!res.ok) throw new Error('Failed to fetch chunks.');
    return res.json();
  },

  async toggleDocument(id: number, isActive: boolean): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/documents/${id}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive })
    });
    if (!res.ok) throw new Error('Failed to toggle document state.');
  },

  async deleteDocument(id: number, filename: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/documents/${id}?filename=${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete document.');
  },

  async getDocumentCount(): Promise<string> {
    const res = await fetch(`${API_BASE}/api/v1/tools/document_count`);
    const data = await res.json();
    return data.result;
  },

  async listRecentDocuments(limit = 5): Promise<string> {
    const res = await fetch(`${API_BASE}/api/v1/tools/recent_documents?limit=${limit}`);
    const data = await res.json();
    return data.result;
  }
};