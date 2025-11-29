import axios from 'axios';

// In production with Caddy, API is at /api, in development it's at localhost:3201
const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3201');

const api = axios.create({
    baseURL: API_URL,
});

export interface FileData {
    id: number;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadDate: string;
    hash: string;
}

export interface StatsData {
    totalFiles: number;
    totalSize: number;
    totalSizeFormatted: string;
    filesByType: {
        mimeType: string;
        count: number;
    }[];
}

export interface FileFilters {
    search?: string;
    type?: string;
    minSize?: number;
    maxSize?: number;
    startDate?: string;
    endDate?: string;
}

export const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
    return response.data;
};

export const uploadMultipleFiles = async (files: File[], onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });

    const response = await api.post('/upload-multiple', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
    return response.data;
}

export const getFiles = async (page = 1, limit = 10, filters?: FileFilters) => {
    const params = { page, limit, ...filters };
    const response = await api.get('/files', { params });
    return response.data;
};

export const deleteFile = async (id: number) => {
    const response = await api.delete(`/file/${id}`);
    return response.data;
};

export const deleteMultipleFiles = async (ids: number[]) => {
    const response = await api.post('/files/delete', { ids });
    return response.data;
};

export const renameFile = async (id: number, newName: string) => {
    const response = await api.put(`/file/${id}`, { newName });
    return response.data;
};

export const getStats = async () => {
    const response = await api.get('/stats');
    return response.data;
};

export const getDownloadUrl = (id: number) => {
    return `${API_URL}/download/${id}`;
};

export const getPreviewUrl = (id: number) => {
    return `${API_URL}/preview/${id}`;
};
