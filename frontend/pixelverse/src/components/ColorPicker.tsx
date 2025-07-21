import React from "react";
import { useCanvasStore } from "../store/canvasStore";

interface ColorPickerProps {
    disabled?: boolean;
}

const predefinedColors = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#FFC0CB", // Pink
    "#000000", // Black
    "#FFFFFF", // White
    "#808080", // Gray
    "#8B4513", // Brown
    "#90EE90", // Light Green
    "#FFB6C1", // Light Pink
    "#87CEEB", // Sky Blue
];

const ColorPicker: React.FC<ColorPickerProps> = ({ disabled = false }) => {
    const { selectedColor, setSelectedColor } = useCanvasStore();

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) {
            setSelectedColor(event.target.value);
        }
    };

    const handlePredefinedColorClick = (color: string) => {
        if (!disabled) {
            setSelectedColor(color);
        }
    };

    return (
        <div
            style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
            }}
        >
            <h3
                style={{
                    margin: "0 0 12px 0",
                    fontSize: "16px",
                    fontWeight: "bold",
                }}
            >
                Color Picker
            </h3>

            {/* Current color display */}
            <div style={{ marginBottom: "12px" }}>
                <label
                    style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                    }}
                >
                    Selected Color:
                </label>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: selectedColor,
                            border: "2px solid #333",
                            borderRadius: "4px",
                        }}
                    />
                    <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
                        {selectedColor}
                    </span>
                </div>
            </div>

            {/* Custom color input */}
            <div style={{ marginBottom: "16px" }}>
                <label
                    style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "14px",
                    }}
                >
                    Custom Color:
                </label>
                <input
                    type="color"
                    value={selectedColor}
                    onChange={handleColorChange}
                    disabled={disabled}
                    style={{
                        width: "100%",
                        height: "40px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.6 : 1,
                    }}
                />
            </div>

            {/* Predefined colors */}
            <div>
                <label
                    style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                    }}
                >
                    Quick Colors:
                </label>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "6px",
                    }}
                >
                    {predefinedColors.map((color) => (
                        <button
                            key={color}
                            onClick={() => handlePredefinedColorClick(color)}
                            disabled={disabled}
                            style={{
                                width: "36px",
                                height: "36px",
                                backgroundColor: color,
                                border:
                                    selectedColor === color
                                        ? "3px solid #007bff"
                                        : "2px solid #333",
                                borderRadius: "4px",
                                cursor: disabled ? "not-allowed" : "pointer",
                                opacity: disabled ? 0.6 : 1,
                                transition: "border-color 0.2s",
                            }}
                            title={color}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
