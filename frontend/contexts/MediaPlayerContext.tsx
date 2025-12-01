'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { FileData } from '@/lib/api';

interface MediaState {
    file: FileData | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMinimized: boolean;
}

interface MediaPlayerContextType {
    mediaState: MediaState;
    playMedia: (file: FileData) => void;
    pauseMedia: () => void;
    resumeMedia: () => void;
    stopMedia: () => void;
    seekTo: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMinimize: () => void;
    audioRef: React.RefObject<HTMLAudioElement | HTMLVideoElement | null>;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export function MediaPlayerProvider({ children }: { children: React.ReactNode }) {
    const [mediaState, setMediaState] = useState<MediaState>({
        file: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMinimized: false,
    });

    const audioRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

    const playMedia = useCallback((file: FileData) => {
        setMediaState(prev => ({
            ...prev,
            file,
            isPlaying: true,
            currentTime: 0,
            isMinimized: false,
        }));
    }, []);

    const pauseMedia = useCallback(() => {
        setMediaState(prev => ({ ...prev, isPlaying: false }));
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);

    const resumeMedia = useCallback(() => {
        setMediaState(prev => ({ ...prev, isPlaying: true }));
        if (audioRef.current) {
            audioRef.current.play();
        }
    }, []);

    const stopMedia = useCallback(() => {
        setMediaState({
            file: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 1,
            isMinimized: false,
        });
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    const seekTo = useCallback((time: number) => {
        setMediaState(prev => ({ ...prev, currentTime: time }));
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    }, []);

    const setVolume = useCallback((volume: number) => {
        setMediaState(prev => ({ ...prev, volume }));
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, []);

    const toggleMinimize = useCallback(() => {
        setMediaState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    }, []);

    // Update current time
    useEffect(() => {
        const updateTime = () => {
            if (audioRef.current) {
                setMediaState(prev => ({
                    ...prev,
                    currentTime: audioRef.current?.currentTime || 0,
                    duration: audioRef.current?.duration || 0,
                }));
            }
        };

        const interval = setInterval(updateTime, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <MediaPlayerContext.Provider
            value={{
                mediaState,
                playMedia,
                pauseMedia,
                resumeMedia,
                stopMedia,
                seekTo,
                setVolume,
                toggleMinimize,
                audioRef,
            }}
        >
            {children}
        </MediaPlayerContext.Provider>
    );
}

export function useMediaPlayer() {
    const context = useContext(MediaPlayerContext);
    if (context === undefined) {
        throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
    }
    return context;
}
