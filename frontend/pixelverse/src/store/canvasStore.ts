import { create } from "zustand";

export interface PixelData {
    color: string;
    author: string;
}

export interface CanvasPixel extends PixelData {
    x: number;
    y: number;
}

interface CanvasState {
    pixels: Record<string, PixelData>;
    selectedColor: string;
    isPlacingPixel: boolean;
    lastPlacedTime: number | null;
    cooldownEndTime: number | null;
    setPixels: (pixels: Record<string, PixelData>) => void;
    updatePixel: (x: number, y: number, pixelData: PixelData) => void;
    setSelectedColor: (color: string) => void;
    setPlacingPixel: (placing: boolean) => void;
    setLastPlacedTime: (time: number | null) => void;
    setCooldownEndTime: (time: number | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
    pixels: {},
    selectedColor: "#FF0000",
    isPlacingPixel: false,
    lastPlacedTime: null,
    cooldownEndTime: null,
    setPixels: (pixels: Record<string, PixelData>) => {
        set({ pixels });
    },
    updatePixel: (x: number, y: number, pixelData: PixelData) => {
        set((state) => ({
            pixels: {
                ...state.pixels,
                [`${x}:${y}`]: pixelData,
            },
        }));
    },
    setSelectedColor: (color: string) => {
        set({ selectedColor: color });
    },
    setPlacingPixel: (placing: boolean) => {
        set({ isPlacingPixel: placing });
    },
    setLastPlacedTime: (time: number | null) => {
        set({ lastPlacedTime: time });
    },
    setCooldownEndTime: (time: number | null) => {
        set({ cooldownEndTime: time });
    },
}));
