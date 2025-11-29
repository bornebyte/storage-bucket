'use client';

import { FileData, getPreviewUrl, getDownloadUrl } from '@/lib/api';
import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilePreviewModalProps {
    file: FileData;
    onClose: () => void;
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
    const previewUrl = getPreviewUrl(file.id);
    const downloadUrl = getDownloadUrl(file.id);

    const renderContent = () => {
        if (file.mimeType.startsWith('image/')) {
            return (
                <img
                    src={previewUrl}
                    alt={file.originalName}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
            );
        }

        if (file.mimeType.startsWith('video/')) {
            return (
                <video
                    src={previewUrl}
                    controls
                    className="max-w-full max-h-[80vh] rounded-lg"
                >
                    Your browser does not support the video tag.
                </video>
            );
        }

        if (file.mimeType.startsWith('audio/')) {
            return (
                <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <audio src={previewUrl} controls className="w-full min-w-[300px]" />
                </div>
            );
        }

        if (file.mimeType === 'application/pdf') {
            return (
                <iframe
                    src={previewUrl}
                    className="w-full h-[80vh] rounded-lg border border-gray-200 dark:border-gray-700"
                    title={file.originalName}
                />
            );
        }

        return (
            <div className="text-center p-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Preview not available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    This file type cannot be previewed in the browser.
                </p>
                <a
                    href={downloadUrl}
                    download={file.originalName}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
                >
                    <Download className="w-5 h-5" />
                    Download File
                </a>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 gap-2">
                    <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {file.originalName}
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                            title="Open in new tab"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-gray-50 dark:bg-black/50">
                    {renderContent()}
                </div>
            </motion.div>
        </div>
    );
}
