import React from "react";
import { useCanvasStore } from "../store/canvasStore";

const CanvasInfo: React.FC = () => {
    const { pixels, selectedColor } = useCanvasStore();

    const pixelCount = Object.keys(pixels).length;
    const totalPixels = 1000 * 1000; // 1000x1000 grid
    const percentageFilled = ((pixelCount / totalPixels) * 100).toFixed(3);

    // Get unique colors and authors
    const uniqueColors = new Set(
        Object.values(pixels).map((pixel) => pixel.color)
    );
    const uniqueAuthors = new Set(
        Object.values(pixels).map((pixel) => pixel.author)
    );

    return (
        <div
            style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                marginBottom: "16px",
            }}
        >
            <h3
                style={{
                    margin: "0 0 12px 0",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#495057",
                }}
            >
                Canvas Statistics
            </h3>

            <div style={{ fontSize: "14px", color: "#6c757d" }}>
                <div style={{ marginBottom: "4px" }}>
                    <strong>Pixels Placed:</strong>{" "}
                    {pixelCount.toLocaleString()} /{" "}
                    {totalPixels.toLocaleString()}
                </div>
                <div style={{ marginBottom: "4px" }}>
                    <strong>Canvas Filled:</strong> {percentageFilled}%
                </div>
                <div style={{ marginBottom: "4px" }}>
                    <strong>Unique Colors:</strong> {uniqueColors.size}
                </div>
                <div style={{ marginBottom: "4px" }}>
                    <strong>Contributors:</strong> {uniqueAuthors.size}
                </div>
                <div style={{ marginTop: "8px" }}>
                    <strong>Selected Color:</strong>
                    <span
                        style={{
                            marginLeft: "8px",
                            padding: "2px 6px",
                            backgroundColor: selectedColor,
                            color: getContrastColor(selectedColor),
                            borderRadius: "3px",
                            fontSize: "12px",
                            fontFamily: "monospace",
                        }}
                    >
                        {selectedColor}
                    </span>
                </div>
            </div>

            <div
                style={{
                    marginTop: "12px",
                    padding: "8px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#6c757d",
                }}
            >
                <strong>Controls:</strong> Click to place pixels • Scroll to
                zoom • Drag to pan
            </div>
        </div>
    );
};

// Helper function to determine contrast color for text
function getContrastColor(hexColor: string): string {
    // Remove # if present
    const color = hexColor.replace("#", "");

    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000000" : "#ffffff";
}

export default CanvasInfo;
