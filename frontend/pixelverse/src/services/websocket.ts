import io from "socket.io-client";
import { useCanvasStore } from "../store/canvasStore";

class WebSocketService {
    private socket: SocketIOClient.Socket | null = null;
    private isConnected = false;

    connect(): void {
        if (this.socket && this.isConnected) {
            return; // Already connected
        }

        this.socket = io("http://localhost:3003", {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        this.socket.on("connect", () => {
            console.log("✅ Connected to WebSocket Gateway:", this.socket?.id);
            this.isConnected = true;
        });

        this.socket.on("disconnect", (reason: string) => {
            console.log("❌ Disconnected from WebSocket Gateway:", reason);
            this.isConnected = false;
        });

        this.socket.on(
            "pixel-placed",
            (pixelData: {
                userId: string;
                username: string;
                x: number;
                y: number;
                color: string;
            }) => {
                console.log("🎨 Pixel update received:", pixelData);

                // Update the canvas store with the new pixel
                useCanvasStore
                    .getState()
                    .updatePixel(pixelData.x, pixelData.y, {
                        color: pixelData.color,
                        author: pixelData.username,
                    });
            }
        );

        this.socket.on("connect_error", (error: Error) => {
            console.error("WebSocket connection error:", error);
        });

        this.socket.on("reconnect", (attemptNumber: number) => {
            console.log(
                `🔄 Reconnected to WebSocket Gateway (attempt ${attemptNumber})`
            );
        });

        this.socket.on("reconnect_error", (error: Error) => {
            console.error("WebSocket reconnection error:", error);
        });

        this.socket.on("reconnect_failed", () => {
            console.error("❌ Failed to reconnect to WebSocket Gateway");
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log("🔌 Disconnected from WebSocket Gateway");
        }
    }

    isSocketConnected(): boolean {
        return this.isConnected && this.socket?.connected === true;
    }

    getSocket(): SocketIOClient.Socket | null {
        return this.socket;
    }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();
