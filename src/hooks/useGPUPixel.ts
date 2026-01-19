/**
 * React hook for GPUPixel WASM integration
 * Manages camera with beauty filter processing
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Declare global GPUPixelAdapter type
declare global {
    interface Window {
        GPUPixelAdapter?: {
            wasmModule: unknown;
            isActive: boolean;
            videoElement: HTMLVideoElement | null;
            canvasContext: CanvasRenderingContext2D | null;
            displayCanvas: HTMLCanvasElement | null;
            glCanvas: HTMLCanvasElement | null;
            requestID: number | null;
            isModuleLoading: boolean;
            moduleLoadPromise: Promise<unknown> | null;
            defaultSmoothing: number;
            defaultWhitening: number;
            loadModule: (displayCanvasId: string) => Promise<unknown>;
            init: () => void;
            startCamera: (canvasId: string) => void;
            stopCamera: () => void;
            pauseCamera: () => void;
            resumeCamera: () => void;
            capture: (canvasId: string) => string | null;
            setBeauty: (smooth: number, white: number) => void;
        };
    }
}

interface UseGPUPixelOptions {
    canvasId?: string;
    smoothing?: number;
    whitening?: number;
    onError?: (error: Error) => void;
}

interface UseGPUPixelReturn {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    isLoading: boolean;
    isActive: boolean;
    error: string | null;
    isGPUPixelAvailable: boolean;
    startCamera: () => void;
    stopCamera: () => void;
    pauseCamera: () => void;
    resumeCamera: () => void;
    capture: () => string | null;
    setBeauty: (smoothing: number, whitening: number) => void;
}

// Script loading state (singleton)
let scriptLoadPromise: Promise<void> | null = null;
let isScriptLoaded = false;

const loadGPUPixelScript = (): Promise<void> => {
    if (isScriptLoaded && window.GPUPixelAdapter) {
        return Promise.resolve();
    }

    if (scriptLoadPromise) return scriptLoadPromise;

    scriptLoadPromise = new Promise((resolve, reject) => {
        // Check if already exists
        if (window.GPUPixelAdapter) {
            isScriptLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = '/gpupixel_adapter.js';
        script.async = true;
        script.onload = () => {
            console.log('[useGPUPixel] Adapter script loaded');
            isScriptLoaded = true;
            resolve();
        };
        script.onerror = () => {
            scriptLoadPromise = null;
            reject(new Error('Failed to load gpupixel_adapter.js'));
        };
        document.head.appendChild(script);
    });

    return scriptLoadPromise;
};

export function useGPUPixel(options: UseGPUPixelOptions = {}): UseGPUPixelReturn {
    const {
        canvasId = 'gpupixel-display-canvas',
        smoothing = 3,
        whitening = 4,
        onError,
    } = options;

    // Use refs to avoid stale closures and prevent re-renders
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasIdRef = useRef(canvasId);
    const smoothingRef = useRef(smoothing);
    const whiteningRef = useRef(whitening);
    const onErrorRef = useRef(onError);
    const isStartingRef = useRef(false);
    const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Update refs when props change
    canvasIdRef.current = canvasId;
    smoothingRef.current = smoothing;
    whiteningRef.current = whitening;
    onErrorRef.current = onError;

    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGPUPixelAvailable, setIsGPUPixelAvailable] = useState(false);

    // Load the adapter script - only once on mount
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                await loadGPUPixelScript();
                if (mounted && window.GPUPixelAdapter) {
                    setIsGPUPixelAvailable(true);
                    // Set default beauty params
                    window.GPUPixelAdapter.defaultSmoothing = smoothingRef.current;
                    window.GPUPixelAdapter.defaultWhitening = whiteningRef.current;
                }
            } catch (err) {
                if (mounted) {
                    const error = err instanceof Error ? err : new Error('Unknown error');
                    setError(error.message);
                    onErrorRef.current?.(error);
                }
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, []); // Empty deps - only run once

    // Consolidated cleanup on unmount (single effect instead of multiple)
    useEffect(() => {
        return () => {
            // Clear intervals/timeouts
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Stop camera if active
            if (window.GPUPixelAdapter?.isActive) {
                window.GPUPixelAdapter.stopCamera();
            }
        };
    }, []);

    const startCamera = useCallback(() => {
        // Prevent multiple simultaneous starts
        if (isStartingRef.current) {
            console.log('[useGPUPixel] Already starting camera, skipping...');
            return;
        }

        if (!window.GPUPixelAdapter) {
            const err = new Error('GPUPixelAdapter not available');
            setError(err.message);
            onErrorRef.current?.(err);
            return;
        }

        // Check if already active
        if (window.GPUPixelAdapter.isActive) {
            console.log('[useGPUPixel] Camera already active');
            setIsActive(true);
            setIsLoading(false);
            return;
        }

        isStartingRef.current = true;
        setIsLoading(true);
        setError(null);

        // Clear any existing intervals
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Wait a bit for canvas to be in DOM
        timeoutRef.current = setTimeout(() => {
            try {
                window.GPUPixelAdapter!.startCamera(canvasIdRef.current);

                // Poll for active state
                checkIntervalRef.current = setInterval(() => {
                    if (window.GPUPixelAdapter?.isActive) {
                        setIsActive(true);
                        setIsLoading(false);
                        isStartingRef.current = false;
                        if (checkIntervalRef.current) {
                            clearInterval(checkIntervalRef.current);
                            checkIntervalRef.current = null;
                        }
                    }
                }, 100);

                // Timeout after 10 seconds
                timeoutRef.current = setTimeout(() => {
                    if (checkIntervalRef.current) {
                        clearInterval(checkIntervalRef.current);
                        checkIntervalRef.current = null;
                    }
                    isStartingRef.current = false;
                    if (!window.GPUPixelAdapter?.isActive) {
                        setIsLoading(false);
                        // Don't set error, might still work with fallback mode
                    }
                }, 10000);
            } catch (err) {
                setIsLoading(false);
                isStartingRef.current = false;
                const error = err instanceof Error ? err : new Error('Failed to start camera');
                setError(error.message);
                onErrorRef.current?.(error);
            }
        }, 100);
    }, []); // No deps needed - using refs

    const stopCamera = useCallback(() => {
        // Clear intervals
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        isStartingRef.current = false;

        if (window.GPUPixelAdapter) {
            window.GPUPixelAdapter.stopCamera();
            setIsActive(false);
            setIsLoading(false);
        }
    }, []);

    const pauseCamera = useCallback(() => {
        if (window.GPUPixelAdapter) {
            window.GPUPixelAdapter.pauseCamera();
        }
    }, []);

    const resumeCamera = useCallback(() => {
        if (window.GPUPixelAdapter) {
            window.GPUPixelAdapter.resumeCamera();
        }
    }, []);

    const capture = useCallback((): string | null => {
        if (window.GPUPixelAdapter) {
            return window.GPUPixelAdapter.capture(canvasIdRef.current);
        }

        // Fallback: capture from canvas ref
        if (canvasRef.current) {
            return canvasRef.current.toDataURL('image/jpeg');
        }

        return null;
    }, []);

    const setBeauty = useCallback((smooth: number, white: number) => {
        if (window.GPUPixelAdapter) {
            window.GPUPixelAdapter.setBeauty(smooth, white);
        }
    }, []);

    // Note: Cleanup is handled in the consolidated useEffect above

    return {
        canvasRef,
        isLoading,
        isActive,
        error,
        isGPUPixelAvailable,
        startCamera,
        stopCamera,
        pauseCamera,
        resumeCamera,
        capture,
        setBeauty,
    };
}
