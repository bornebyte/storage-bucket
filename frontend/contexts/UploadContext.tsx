'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { uploadMultipleFiles } from '@/lib/api';

export interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

interface UploadContextType {
    uploads: UploadFile[];
    addFiles: (files: File[]) => void;
    removeUpload: (id: string) => void;
    clearCompleted: () => void;
    isUploading: boolean;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [uploads, setUploads] = useState<UploadFile[]>([]);
    const uploadQueueRef = useRef<UploadFile[]>([]);
    const isProcessingRef = useRef(false);

    const processQueue = useCallback(async () => {
        if (isProcessingRef.current || uploadQueueRef.current.length === 0) {
            return;
        }

        isProcessingRef.current = true;

        while (uploadQueueRef.current.length > 0) {
            const currentBatch = uploadQueueRef.current.filter(u => u.status === 'pending');

            if (currentBatch.length === 0) break;

            // Process files in batches of 3
            const batch = currentBatch.slice(0, 3);

            await Promise.all(
                batch.map(async (uploadFile) => {
                    try {
                        // Update status to uploading
                        setUploads(prev =>
                            prev.map(u => u.id === uploadFile.id ? { ...u, status: 'uploading' as const } : u)
                        );

                        await uploadMultipleFiles([uploadFile.file], (progress) => {
                            setUploads(prev =>
                                prev.map(u =>
                                    u.id === uploadFile.id ? { ...u, progress } : u
                                )
                            );
                        });

                        // Mark as completed
                        setUploads(prev =>
                            prev.map(u =>
                                u.id === uploadFile.id
                                    ? { ...u, status: 'completed' as const, progress: 100 }
                                    : u
                            )
                        );

                        // Remove from queue
                        uploadQueueRef.current = uploadQueueRef.current.filter(
                            u => u.id !== uploadFile.id
                        );
                    } catch (error: any) {
                        // Mark as error
                        setUploads(prev =>
                            prev.map(u =>
                                u.id === uploadFile.id
                                    ? {
                                        ...u,
                                        status: 'error' as const,
                                        error: error.response?.data?.error || 'Upload failed',
                                    }
                                    : u
                            )
                        );

                        // Remove from queue
                        uploadQueueRef.current = uploadQueueRef.current.filter(
                            u => u.id !== uploadFile.id
                        );
                    }
                })
            );
        }

        isProcessingRef.current = false;
    }, []);

    const addFiles = useCallback(
        (files: File[]) => {
            const newUploads: UploadFile[] = files.map(file => ({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file,
                progress: 0,
                status: 'pending',
            }));

            setUploads(prev => [...prev, ...newUploads]);
            uploadQueueRef.current = [...uploadQueueRef.current, ...newUploads];

            // Start processing
            processQueue();
        },
        [processQueue]
    );

    const removeUpload = useCallback((id: string) => {
        setUploads(prev => prev.filter(u => u.id !== id));
        uploadQueueRef.current = uploadQueueRef.current.filter(u => u.id !== id);
    }, []);

    const clearCompleted = useCallback(() => {
        setUploads(prev => prev.filter(u => u.status !== 'completed'));
    }, []);

    const isUploading = uploads.some(u => u.status === 'uploading' || u.status === 'pending');

    return (
        <UploadContext.Provider
            value={{
                uploads,
                addFiles,
                removeUpload,
                clearCompleted,
                isUploading,
            }}
        >
            {children}
        </UploadContext.Provider>
    );
}

export function useUpload() {
    const context = useContext(UploadContext);
    if (context === undefined) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
}
