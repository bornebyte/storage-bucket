'use client';

import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import { getPreviewUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    X,
    Volume2,
    VolumeX,
    ChevronDown,
    ChevronUp,
    SkipBack,
    SkipForward,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PersistentMediaPlayer() {
    const {
        mediaState,
        pauseMedia,
        resumeMedia,
        stopMedia,
        seekTo,
        setVolume,
        toggleMinimize,
        audioRef,
    } = useMediaPlayer();

    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    useEffect(() => {
        if (!mediaState.file) return;

        const element = audioRef.current;
        if (element && mediaState.isPlaying) {
            element.play().catch(console.error);
        }
    }, [mediaState.file, mediaState.isPlaying, audioRef]);

    if (!mediaState.file) return null;

    const isVideo = mediaState.file.mimeType.startsWith('video/');
    const isAudio = mediaState.file.mimeType.startsWith('audio/');
    const previewUrl = getPreviewUrl(mediaState.file.id);

    const formatTime = (seconds: number) => {
        if (!isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVolumeToggle = () => {
        if (isMuted) {
            setVolume(1);
            setIsMuted(false);
        } else {
            setVolume(0);
            setIsMuted(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        seekTo(time);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        setIsMuted(vol === 0);
    };

    const skip = (seconds: number) => {
        const newTime = Math.max(0, Math.min(mediaState.duration, mediaState.currentTime + seconds));
        seekTo(newTime);
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 z-40 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            style={{
                width: mediaState.isMinimized ? '320px' : isVideo ? '480px' : '400px',
            }}
        >
            {/* Video Display (when not minimized) */}
            {isVideo && !mediaState.isMinimized && (
                <div className="relative bg-black aspect-video">
                    <video
                        ref={audioRef as React.RefObject<HTMLVideoElement>}
                        src={previewUrl}
                        className="w-full h-full"
                        onEnded={stopMedia}
                    />
                </div>
            )}

            {/* Audio Element (hidden) */}
            {isAudio && (
                <audio
                    ref={audioRef as React.RefObject<HTMLAudioElement>}
                    src={previewUrl}
                    onEnded={stopMedia}
                />
            )}

            {/* Controls */}
            <div className="p-4">
                {/* File Info */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {mediaState.file.originalName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isVideo ? 'Video' : 'Audio'} • {(mediaState.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleMinimize}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            {mediaState.isMinimized ? (
                                <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                        <button
                            onClick={stopMedia}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                    <input
                        type="range"
                        min="0"
                        max={mediaState.duration || 0}
                        value={mediaState.currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatTime(mediaState.currentTime)}</span>
                        <span>{formatTime(mediaState.duration)}</span>
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => skip(-10)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={mediaState.isPlaying ? pauseMedia : resumeMedia}
                            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        >
                            {mediaState.isPlaying ? (
                                <Pause className="w-5 h-5 text-white" fill="white" />
                            ) : (
                                <Play className="w-5 h-5 text-white" fill="white" />
                            )}
                        </button>
                        <button
                            onClick={() => skip(10)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Volume Control */}
                    <div
                        className="relative"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                        <button
                            onClick={handleVolumeToggle}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            {isMuted || mediaState.volume === 0 ? (
                                <VolumeX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Volume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                        <AnimatePresence>
                            {showVolumeSlider && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={mediaState.volume}
                                        onChange={handleVolumeChange}
                                        className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        style={{ writingMode: 'vertical-lr' } as React.CSSProperties}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
