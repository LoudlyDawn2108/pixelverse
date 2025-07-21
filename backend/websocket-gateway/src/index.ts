import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Kafka } from "kafkajs";

// --- 1. DEFINE CONSTANTS ---
const PORT = 3003;
const KAFKA_TOPIC = "pixel-placed-topic";

// --- 2. MAIN FUNCTION ---
async function main() {
    // --- SETUP EXPRESS & SOCKET.IO SERVER ---
    const app = express();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        // Configure CORS to allow your React app's origin
        cors: {
            origin: "*", // For development, allow all. For production, restrict to your frontend URL.
            methods: ["GET", "POST"],
        },
    });
    console.log("Socket.IO server created.");

    // --- CONNECT TO KAFKA ---
    const kafka = new Kafka({
        clientId: "websocket-gateway",
        brokers: ["localhost:9092"],
    });
    const consumer = kafka.consumer({ groupId: "websocket-group" });
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });
    console.log("INFO: ✅ Connected to Kafka.");

    consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return;

            const pixelData = JSON.parse(message.value.toString());
            console.log("INFO: New pixel data received:", pixelData);

            // Emit the pixel data to all connected WebSocket clients
            io.emit("pixel-placed", pixelData);
            console.log("INFO: Emitted 'pixel-placed' event to all clients.");
        },
    });

    // --- SOCKET.IO CONNECTION HANDLING ---
    io.on("connection", (socket) => {
        console.log(`INFO: A user connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`INFO: A user disconnected: ${socket.id}`);
        });
    });

    // --- START THE SERVER ---
    httpServer.listen(PORT, () => {
        console.log(
            `INFO: WebSocket Gateway running on http://localhost:${PORT}`
        );
    });
}

main().catch(console.error);
