import { authService } from './auth';

export interface FileItem {
  id: number;
  filename: string;
  size_bytes: number;
  mime_type: string;
  created_at: string;
  is_public: boolean;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalFiles: number;
}

export interface FileListResponse {
  files: FileItem[];
  pagination: Pagination;
}

export interface StatsResponse {
  total_storage_used_bytes: number;
  original_storage_used_bytes: number;
  storage_savings_bytes: number;
  storage_savings_percentage: number;
  storage_quota_mb: number;
  quota_used_percentage: number;
}

export interface UploadResponse {
  message: string;
  filename: string;
  size: number;
  hash: string;
  deduplicated?: boolean;
}

class ApiService {
  private baseUrl = 'http://localhost:8080';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...authService.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getFiles(page = 1, pageSize = 20): Promise<FileListResponse> {
    return this.request(`/files?page=${page}&pageSize=${pageSize}`);
  }

  async getPublicFiles(page = 1, pageSize = 20): Promise<FileListResponse> {
    return this.request(`/files/public?page=${page}&pageSize=${pageSize}`);
  }

  async getStats(): Promise<StatsResponse> {
    return this.request('/stats');
  }

  async uploadFiles(files: FileList, tags?: string): Promise<UploadResponse[]> {
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('file', file);
    });
    
    if (tags) {
      formData.append('tags', tags);
    }

    return this.request('/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteFile(fileId: number): Promise<{ message: string; physical_file_deleted: boolean }> {
    return this.request(`/files/${fileId}/delete`, {
      method: 'DELETE',
    });
  }

  async makeFilePublic(fileId: number): Promise<{ message: string; is_public: boolean }> {
    return this.request(`/files/${fileId}/make-public`, {
      method: 'PATCH',
    });
  }

  async searchFiles(params: {
    filename?: string;
    tags?: string;
    mime_type?: string;
    min_size_bytes?: number;
    max_size_bytes?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    pageSize?: number;
  }): Promise<FileListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/search?${searchParams.toString()}`);
  }

  getDownloadUrl(fileId: number): string {
    const token = authService.getToken();
    return `${this.baseUrl}/files/${fileId}/download?auth=${token}`;
  }

  getPreviewUrl(fileId: number): string {
    const token = authService.getToken();
    return `${this.baseUrl}/files/${fileId}/preview?auth=${token}`;
  }
}

export const apiService = new ApiService();