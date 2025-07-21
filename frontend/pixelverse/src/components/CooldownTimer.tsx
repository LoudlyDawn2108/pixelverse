import React from "react";

interface CooldownTimerProps {
    timeLeft: number; // in milliseconds
    isActive: boolean;
}

const CooldownTimer: React.FC<CooldownTimerProps> = ({
    timeLeft,
    isActive,
}) => {
    if (!isActive || timeLeft <= 0) {
        return null;
    }

    const seconds = Math.ceil(timeLeft / 1000);
    const progressPercentage = Math.max(
        0,
        Math.min(100, (timeLeft / 60000) * 100)
    );

    return (
        <div
            style={{
                padding: "12px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "8px",
                marginBottom: "16px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                }}
            >
                <span
                    style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#856404",
                    }}
                >
                    Cooldown Active
                </span>
                <span
                    style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#856404",
                    }}
                >
                    {seconds}s
                </span>
            </div>

            <div
                style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${progressPercentage}%`,
                        height: "100%",
                        backgroundColor: "#ffc107",
                        transition: "width 0.1s ease",
                    }}
                />
            </div>

            <div
                style={{
                    marginTop: "4px",
                    fontSize: "12px",
                    color: "#6c757d",
                    textAlign: "center",
                }}
            >
                You can place another pixel when the timer reaches zero
            </div>
        </div>
    );
};

export default CooldownTimer;
