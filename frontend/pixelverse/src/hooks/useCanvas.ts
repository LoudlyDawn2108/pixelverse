import { useEffect, useState, useCallback } from "react";
import { useCanvasStore } from "../store/canvasStore";
import { useAuthStore } from "../store/authStore";
import { canvasService } from "../services/api";
import type { PlacePixelRequest } from "../services/api";

interface UseCanvasReturn {
    placePixel: (x: number, y: number) => Promise<void>;
    loadCanvasState: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    isOnCooldown: boolean;
    cooldownTimeLeft: number;
}

const COOLDOWN_DURATION = 60000; // 60 seconds in milliseconds

export const useCanvas = (): UseCanvasReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);

    const {
        selectedColor,
        isPlacingPixel,
        lastPlacedTime,
        setPixels,
        setPlacingPixel,
        setLastPlacedTime,
    } = useCanvasStore();

    const { isAuthenticated } = useAuthStore();

    // Calculate if user is on cooldown
    const isOnCooldown = lastPlacedTime
        ? Date.now() - lastPlacedTime < COOLDOWN_DURATION
        : false;

    // Update cooldown timer
    useEffect(() => {
        if (!isOnCooldown) {
            setCooldownTimeLeft(0);
            return;
        }

        const updateTimer = () => {
            if (lastPlacedTime) {
                const timeLeft =
                    COOLDOWN_DURATION - (Date.now() - lastPlacedTime);
                setCooldownTimeLeft(Math.max(0, timeLeft));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [lastPlacedTime, isOnCooldown]);

    const loadCanvasState = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const canvasData = await canvasService.getCanvasState();
            setPixels(canvasData);
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to load canvas state";
            setError(errorMessage);
            console.error("Error loading canvas state:", err);
        } finally {
            setIsLoading(false);
        }
    }, [setPixels]);

    const placePixel = useCallback(
        async (x: number, y: number): Promise<void> => {
            if (!isAuthenticated) {
                throw new Error("You must be logged in to place pixels");
            }

            if (isOnCooldown) {
                throw new Error("You are still on cooldown");
            }

            if (isPlacingPixel) {
                throw new Error("Already placing a pixel");
            }

            try {
                setPlacingPixel(true);
                setError(null);

                const pixelData: PlacePixelRequest = {
                    x,
                    y,
                    color: selectedColor,
                };

                await canvasService.placePixel(pixelData);

                // Set the time when pixel was placed to start cooldown
                setLastPlacedTime(Date.now());
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : (
                              err as {
                                  response?: { data?: { message?: string } };
                              }
                          )?.response?.data?.message || "Failed to place pixel";

                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setPlacingPixel(false);
            }
        },
        [
            isAuthenticated,
            isOnCooldown,
            isPlacingPixel,
            selectedColor,
            setPlacingPixel,
            setLastPlacedTime,
        ]
    );

    return {
        placePixel,
        loadCanvasState,
        isLoading,
        error,
        isOnCooldown,
        cooldownTimeLeft,
    };
};
