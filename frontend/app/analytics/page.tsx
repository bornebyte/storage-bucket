'use client';

import { useEffect, useState } from 'react';
import { getStats, StatsData } from '@/lib/api';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import StatsCard from '@/components/StatsCard';
import { HardDrive, FileText, PieChart, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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
                    className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
                >
                    Analytics
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2"
                >
                    Detailed insights about your storage usage
                </motion.p>
            </header>

            {stats && (
                <>
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
                            title="Average Size"
                            value={stats.totalFiles > 0 ? (stats.totalSize / stats.totalFiles / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}
                            icon={Layers}
                            color="bg-orange-500"
                            delay={0.4}
                        />
                    </div>

                    <AnalyticsCharts stats={stats} />
                </>
            )}
        </div>
    );
}
