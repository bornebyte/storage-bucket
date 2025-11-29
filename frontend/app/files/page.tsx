'use client';

import { useEffect, useState } from 'react';
import { getFiles, deleteFile, renameFile, deleteMultipleFiles, FileData, FileFilters } from '@/lib/api';
import FileTable from '@/components/FileTable';
import FileUploader from '@/components/FileUploader';
import FilterBar from '@/components/FilterBar';
import FilePreviewModal from '@/components/FilePreviewModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export default function FilesPage() {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showUploader, setShowUploader] = useState(false);
    const [filters, setFilters] = useState<FileFilters>({});
    const [previewFile, setPreviewFile] = useState<FileData | null>(null);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const data = await getFiles(page, 10, filters);
            setFiles(data.files);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [page, filters]);

    const handleFilterChange = (newFilters: FileFilters) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page on filter change
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteFile(id);
            fetchFiles();
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };

    const handleRename = async (id: number, currentName: string) => {
        const newName = prompt('Enter new name:', currentName);
        if (newName && newName !== currentName) {
            try {
                await renameFile(id, newName);
                fetchFiles();
            } catch (error) {
                console.error('Failed to rename file:', error);
                alert('Failed to rename file');
            }
        }
    };

    const handleBulkDelete = async (ids: number[]) => {
        try {
            await deleteMultipleFiles(ids);
            fetchFiles();
        } catch (error) {
            console.error('Failed to delete files:', error);
            alert('Failed to delete files');
        }
    };

    const handleUploadComplete = () => {
        setShowUploader(false);
        fetchFiles();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
                    >
                        Files
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2"
                    >
                        Manage your uploaded files
                    </motion.p>
                </div>
                <button
                    onClick={() => setShowUploader(!showUploader)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                >
                    {showUploader ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {showUploader ? 'Close Uploader' : 'Upload New'}
                </button>
            </header>

            <FilterBar onFilterChange={handleFilterChange} />

            {showUploader && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <FileUploader onUploadComplete={handleUploadComplete} />
                </motion.div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    <FileTable
                        files={files}
                        onDelete={handleDelete}
                        onRename={handleRename}
                        onPreview={setPreviewFile}
                        onBulkDelete={handleBulkDelete}
                    />

                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            <AnimatePresence>
                {previewFile && (
                    <FilePreviewModal
                        file={previewFile}
                        onClose={() => setPreviewFile(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
