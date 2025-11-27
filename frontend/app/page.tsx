'use client';

import { useEffect, useState } from 'react';
import { getStats, getFiles, deleteFile, renameFile, StatsData, FileData } from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import FileUploader from '@/components/FileUploader';
import FileTable from '@/components/FileTable';
import FilePreviewModal from '@/components/FilePreviewModal';
import { HardDrive, FileText, PieChart, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);

  const fetchData = async () => {
    try {
      const [statsData, filesData] = await Promise.all([
        getStats(),
        getFiles(1, 5) // Get 5 most recent files
      ]);
      setStats(statsData);
      setRecentFiles(filesData.files);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadComplete = () => {
    fetchData();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFile(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleRename = async (id: number, currentName: string) => {
    const newName = prompt('Enter new name:', currentName);
    if (newName && newName !== currentName) {
      try {
        await renameFile(id, newName);
        fetchData();
      } catch (error) {
        console.error('Failed to rename file:', error);
        alert('Failed to rename file');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
        >
          Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 dark:text-gray-400 mt-2"
        >
          Overview of your storage bucket
        </motion.p>
      </header>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Files"
            value={stats.totalFiles}
            icon={FileText}
            color="bg-blue-500"
            delay={0.1}
          />
          <StatsCard
            title="Total Storage"
            value={stats.totalSizeFormatted}
            icon={HardDrive}
            color="bg-purple-500"
            delay={0.2}
          />
          <StatsCard
            title="File Types"
            value={stats.filesByType.length}
            icon={PieChart}
            color="bg-pink-500"
            delay={0.3}
          />
          <StatsCard
            title="Recent Uploads"
            value={recentFiles.length}
            icon={Upload}
            color="bg-green-500"
            delay={0.4}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Files</h2>
          </div>
          <FileTable
            files={recentFiles}
            onDelete={handleDelete}
            onRename={handleRename}
            onPreview={setPreviewFile}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Upload</h2>
          <FileUploader onUploadComplete={handleUploadComplete} />
        </div>
      </div>

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
