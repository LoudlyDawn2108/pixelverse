import React, { useEffect, useRef, useState, useCallback } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useCanvasStore } from "../store/canvasStore";
import { useCanvas } from "../hooks/useCanvas";
import Konva from "konva";

interface PixelCanvasProps {
    width?: number;
    height?: number;
    pixelSize?: number;
    gridSize?: number;
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({
    width = 800,
    height = 600,
    pixelSize = 4,
    gridSize = 1000,
}) => {
    const stageRef = useRef<Konva.Stage>(null);
    const [stageScale, setStageScale] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const { pixels } = useCanvasStore();
    const { placePixel, isOnCooldown } = useCanvas();

    // Calculate the actual canvas size based on grid size and pixel size
    const canvasWidth = gridSize * pixelSize;
    const canvasHeight = gridSize * pixelSize;

    // Center the canvas initially
    useEffect(() => {
        const centerX = (width - canvasWidth * stageScale) / 2;
        const centerY = (height - canvasHeight * stageScale) / 2;
        setStagePosition({ x: centerX, y: centerY });
    }, [width, height, canvasWidth, canvasHeight, stageScale]);

    // Handle wheel zoom
    const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const stage = e.target.getStage();
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const factor = 1.1;
        const newScale = Math.min(
            Math.max(oldScale * Math.pow(factor, direction), 0.1),
            10
        );

        setStageScale(newScale);
        setStagePosition({
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
    }, []);

    // Handle canvas click to place pixel
    const handleStageClick = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (isDragging) return;
            if (isOnCooldown) return;

            const stage = e.target.getStage();
            if (!stage) return;

            const pointer = stage.getPointerPosition();
            if (!pointer) return;

            // Convert screen coordinates to canvas coordinates
            const x = Math.floor(
                (pointer.x - stage.x()) / (pixelSize * stage.scaleX())
            );
            const y = Math.floor(
                (pointer.y - stage.y()) / (pixelSize * stage.scaleY())
            );

            // Check if click is within bounds
            if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
                placePixel(x, y).catch((error) => {
                    console.error("Failed to place pixel:", error);
                });
            }
        },
        [isDragging, isOnCooldown, pixelSize, gridSize, placePixel]
    );

    // Handle drag start
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback(
        (e: Konva.KonvaEventObject<DragEvent>) => {
            setIsDragging(false);
            setStagePosition({
                x: e.target.x(),
                y: e.target.y(),
            });
        },
        []
    );

    // Render pixels
    const renderPixels = () => {
        return Object.entries(pixels).map(([key, pixel]) => {
            const [x, y] = key.split(":").map(Number);

            return (
                <Rect
                    key={key}
                    x={x * pixelSize}
                    y={y * pixelSize}
                    width={pixelSize}
                    height={pixelSize}
                    fill={pixel.color}
                    perfectDrawEnabled={false}
                />
            );
        });
    };

    return (
        <div
            style={{
                width,
                height,
                border: "2px solid #333",
                borderRadius: "8px",
                overflow: "hidden",
                cursor: isOnCooldown ? "not-allowed" : "crosshair",
                backgroundColor: "#f0f0f0",
            }}
        >
            <Stage
                ref={stageRef}
                width={width}
                height={height}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePosition.x}
                y={stagePosition.y}
                draggable
                onWheel={handleWheel}
                onClick={handleStageClick}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <Layer>
                    {/* Grid background */}
                    <Rect
                        x={0}
                        y={0}
                        width={canvasWidth}
                        height={canvasHeight}
                        fill="white"
                        stroke="#ddd"
                        strokeWidth={0.5}
                    />

                    {/* Render all pixels */}
                    {renderPixels()}
                </Layer>
            </Stage>
        </div>
    );
};

export default PixelCanvas;
