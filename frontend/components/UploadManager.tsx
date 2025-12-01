'use client';

import { useUpload } from '@/contexts/UploadContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function UploadManager() {
    const { uploads, removeUpload, clearCompleted, isUploading } = useUpload();
    const [isExpanded, setIsExpanded] = useState(true);

    if (uploads.length === 0) return null;

    const completedCount = uploads.filter(u => u.status === 'completed').length;
    const errorCount = uploads.filter(u => u.status === 'error').length;
    const activeCount = uploads.filter(u => u.status === 'uploading' || u.status === 'pending').length;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
                        <h3 className="font-semibold">
                            Uploads ({activeCount} active, {completedCount} done)
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {completedCount > 0 && (
                        <button
                            onClick={clearCompleted}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            title="Clear completed"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Upload List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                            {uploads.map((upload) => (
                                <motion.div
                                    key={upload.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {upload.file.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {upload.status === 'completed' && (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            )}
                                            {upload.status === 'error' && (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            )}
                                            {upload.status === 'uploading' && (
                                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                            )}
                                            <button
                                                onClick={() => removeUpload(upload.id)}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {(upload.status === 'uploading' || upload.status === 'pending') && (
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${upload.progress}%` }}
                                            />
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {upload.status === 'error' && upload.error && (
                                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                            {upload.error}
                                        </p>
                                    )}

                                    {/* Status Text */}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {upload.status === 'pending' && 'Waiting...'}
                                        {upload.status === 'uploading' && `Uploading... ${upload.progress}%`}
                                        {upload.status === 'completed' && 'Upload complete'}
                                        {upload.status === 'error' && 'Upload failed'}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
