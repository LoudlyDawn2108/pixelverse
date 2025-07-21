import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
    Client as HazelcastClient,
    EntryEvent,
    EntryEventListener,
    MapListener,
} from "hazelcast-client";

// --- 1. DEFINE CONSTANTS ---
const PORT = 3003;
const HAZELCAST_CLUSTER_MEMBERS = ["localhost:5701"];
const CANVAS_STATE_MAP_NAME = "canvas-state";

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

    // --- CONNECT TO HAZELCAST ---
    const hazelcastClient = await HazelcastClient.newHazelcastClient({
        clusterName: "dev-cluster",
        network: { clusterMembers: HAZELCAST_CLUSTER_MEMBERS },
    });
    const canvasStateMap = await hazelcastClient.getMap<string, string>(
        CANVAS_STATE_MAP_NAME
    );
    console.log("✅ Connected to Hazelcast.");

    // --- SETUP HAZELCAST ENTRY LISTENER ---
    // This is the core of the new logic. We listen for changes directly on the map.
    const listener: MapListener<string, string> = {
        // We only care when a new pixel is added or an existing one is updated.
        added: (event: EntryEvent<string, string>) => {
            console.log(
                `📢 [Hazelcast Listener] New pixel added: ${event.key}`
            );
            const [x, y] = event.key.split(":").map(Number);
            io.emit("pixel-update", { x, y, color: event.value });
        },
        updated: (event: EntryEvent<string, string>) => {
            console.log(`📢 [Hazelcast Listener] Pixel updated: ${event.key}`);
            const [x, y] = event.key.split(":").map(Number);
            io.emit("pixel-update", { x, y, color: event.value });
        },
    };

    await canvasStateMap.addEntryListener(listener, undefined, true);
    console.log("✅ Attached Entry Listener to canvas state map.");

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
