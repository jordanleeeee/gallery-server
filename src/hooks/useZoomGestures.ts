import {useState, useEffect, useCallback, TouchEventHandler} from "react";

interface ZoomGestureConfig {
    initialZoom?: number;
    zoomMin?: number;
    zoomMax?: number;
    touchSensitivity?: number;
    wheelSensitivity?: number;
    storageKey?: string;
}

interface ZoomGestureReturn {
    zoom: number;
    setZoom: (zoom: number) => void;
    onTouchStart: TouchEventHandler<HTMLDivElement>;
    onTouchMove: TouchEventHandler<HTMLDivElement>;
    handleSliderChange: (event: Event, newValue: number | number[]) => void;
    zoomMin: number;
    zoomMax: number;
}

let diffStart: number;
let zoomStart: number;

/**
 * Custom hook for handling zoom gestures via touch and wheel events
 * @author Jordan
 */
const useZoomGestures = (config: ZoomGestureConfig = {}): ZoomGestureReturn => {
    const {initialZoom = 50, zoomMin = 20, zoomMax = 180, touchSensitivity = 5, wheelSensitivity = 2, storageKey = "zoomLevel"} = config;

    const [zoom, setZoomState] = useState(initialZoom);
    const [isClient, setIsClient] = useState(false);

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load zoom level from localStorage - only on client side
    useEffect(() => {
        if (!isClient) return;

        const savedZoom = window.localStorage.getItem(storageKey);
        if (savedZoom !== null) {
            setZoomState(parseInt(savedZoom));
        }
    }, [isClient, storageKey]);

    // Save zoom level to localStorage
    useEffect(() => {
        if (!isClient) return;

        window.localStorage.setItem(storageKey, String(zoom));
    }, [zoom, isClient, storageKey]);

    const setZoom = useCallback(
        (newZoom: number) => {
            const clampedZoom = Math.max(zoomMin, Math.min(zoomMax, newZoom));
            setZoomState(clampedZoom);
        },
        [zoomMin, zoomMax]
    );

    const onTouchStart: TouchEventHandler<HTMLDivElement> = event => {
        // Only handle multi-touch for pinch gestures
        if (event.touches.length !== 2) {
            return;
        }

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        diffStart = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        zoomStart = zoom;
    };

    const onTouchMove: TouchEventHandler<HTMLDivElement> = event => {
        // Only handle multi-touch for pinch gestures
        if (event.touches.length !== 2) return;

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        const diffNow = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        const scaleFactor = (diffNow - diffStart) / touchSensitivity;
        const targetZoom = zoomStart + scaleFactor;

        setZoom(Math.round(targetZoom));
    };

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setZoom(newValue as number);
    };

    // Global wheel event handler for trackpad zoom
    useEffect(() => {
        if (!isClient) return;

        const handleWheel = (event: WheelEvent) => {
            // Only handle pinch gestures on trackpad (Ctrl key + wheel)
            if (!event.ctrlKey) return;

            event.preventDefault(); // Prevent browser zoom only when over gallery
            event.stopPropagation(); // Stop event bubbling

            const delta = event.deltaY;
            const scaleFactor = -delta / wheelSensitivity;
            const targetZoom = zoom + scaleFactor;

            setZoom(Math.round(targetZoom));
        };

        window.addEventListener("wheel", handleWheel, {passive: false});

        return () => {
            window.removeEventListener("wheel", handleWheel);
        };
    }, [isClient, zoom, wheelSensitivity, setZoom]);

    return {
        zoom,
        setZoom,
        onTouchStart,
        onTouchMove,
        handleSliderChange,
        zoomMin,
        zoomMax,
    };
};

export default useZoomGestures;
