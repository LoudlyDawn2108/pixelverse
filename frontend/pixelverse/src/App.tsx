import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import { useCanvas } from "./hooks/useCanvas";
import { webSocketService } from "./services/websocket";
import PixelCanvas from "./components/PixelCanvas";
import ColorPicker from "./components/ColorPicker";
import AuthForm from "./components/AuthForm";
import UserInfo from "./components/UserInfo";
import CooldownTimer from "./components/CooldownTimer";
import CanvasInfo from "./components/CanvasInfo";
import "./App.css";

function App() {
    const { isAuthenticated } = useAuthStore();
    const {
        loadCanvasState,
        isLoading,
        error,
        isOnCooldown,
        cooldownTimeLeft,
    } = useCanvas();
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize app
    useEffect(() => {
        const initializeApp = async () => {
            try {
                await loadCanvasState();
                setIsInitialized(true);
            } catch (err) {
                console.error("Failed to initialize app:", err);
                setIsInitialized(true); // Still show the UI even if canvas loading fails
            }
        };

        initializeApp();
    }, [loadCanvasState]);

    // Connect to WebSocket when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            webSocketService.connect();
        } else {
            webSocketService.disconnect();
        }

        return () => {
            webSocketService.disconnect();
        };
    }, [isAuthenticated]);

    if (!isInitialized) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    fontSize: "18px",
                    color: "#6c757d",
                }}
            >
                Loading PixelVerse...
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8f9fa",
                padding: "20px",
            }}
        >
            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                }}
            >
                {/* Header */}
                <header
                    style={{
                        textAlign: "center",
                        marginBottom: "24px",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "48px",
                            fontWeight: "bold",
                            color: "#343a40",
                            margin: "0 0 8px 0",
                        }}
                    >
                        🎨 PixelVerse
                    </h1>
                    <p
                        style={{
                            fontSize: "18px",
                            color: "#6c757d",
                            margin: 0,
                        }}
                    >
                        Real-time collaborative pixel canvas
                    </p>
                </header>

                {/* Main Content */}
                {!isAuthenticated ? (
                    <AuthForm
                        onSuccess={() =>
                            console.log("Authentication successful!")
                        }
                    />
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "300px 1fr",
                            gap: "24px",
                        }}
                    >
                        {/* Sidebar */}
                        <aside>
                            <UserInfo />
                            <CooldownTimer
                                timeLeft={cooldownTimeLeft}
                                isActive={isOnCooldown}
                            />
                            <ColorPicker disabled={isOnCooldown || isLoading} />
                            <CanvasInfo />

                            {error && (
                                <div
                                    style={{
                                        padding: "12px",
                                        backgroundColor: "#f8d7da",
                                        color: "#721c24",
                                        border: "1px solid #f5c6cb",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        marginTop: "16px",
                                    }}
                                >
                                    <strong>Error:</strong> {error}
                                </div>
                            )}
                        </aside>

                        {/* Main Canvas Area */}
                        <main>
                            <div
                                style={{
                                    backgroundColor: "white",
                                    borderRadius: "12px",
                                    padding: "24px",
                                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                <PixelCanvas
                                    width={1000}
                                    height={700}
                                    pixelSize={4}
                                    gridSize={1000}
                                />

                                <div
                                    style={{
                                        marginTop: "16px",
                                        padding: "12px",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        color: "#6c757d",
                                        textAlign: "center",
                                    }}
                                >
                                    {isOnCooldown
                                        ? "You are on cooldown. Wait for the timer to finish before placing another pixel."
                                        : isAuthenticated
                                        ? "Click anywhere on the canvas to place a pixel!"
                                        : "Please log in to start placing pixels."}
                                </div>
                            </div>
                        </main>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
