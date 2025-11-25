const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with ${response.status}`);
  }

  // Handle empty responses (204)
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  async generateMontage(payload) {
    return request('/api/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getJobStatus(jobId) {
    return request(`/api/status/${jobId}`);
  },

  async listJobs() {
    return request('/api/jobs');
  },

  async createEdit(payload) {
    return request('/api/edits', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async listMontages() {
    return request('/api/edits');
  },

  async deleteMontage(id) {
    return request(`/api/edits/${id}`, {
      method: 'DELETE'
    });
  },

  async getAudioLibrary() {
    return request('/api/audio-library');
  },

  async sendContactMessage(payload) {
    return request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

// Backward compatibility
api.uploadMusic = api.uploadFile;
api.generateEdit = api.generateMontage;
api.listEdits = api.listMontages;
api.deleteEdit = api.deleteMontage;



