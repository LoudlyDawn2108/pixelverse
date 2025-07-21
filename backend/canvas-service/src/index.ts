import express from "express";
import { Client as HazelcastClient } from "hazelcast-client";
import { Kafka } from "kafkajs";
import { canvasRouter } from "./canvas.routes";
import { IMap } from "hazelcast-client";

// --- 1. DEFINE CONSTANTS ---
const PORT = 3002;
const KAFKA_BROKER = "localhost:9092";
const KAFKA_TOPIC = "pixel-placed-topic";
const HAZELCAST_CLUSTER_MEMBERS = ["localhost:5701"];
const CANVAS_STATE_MAP_NAME = "canvas-state";
const USER_COOLDOWNS_MAP_NAME = "user-cooldowns";

// --- 2. DEFINE A GLOBAL TYPE FOR OUR CANVAS STATE ---
// This helps ensure type safety across our application
export type PixelData = {
    color: string;
    author: string;
};
export type CanvasStateMap = IMap<string, PixelData>;

// --- 3. MAIN APPLICATION FUNCTION ---
async function main() {
    // --- CONNECT TO HAZELCAST ---
    console.log("Connecting to Hazelcast...");
    const hazelcastClient = await HazelcastClient.newHazelcastClient({
        clusterName: "dev-cluster",
        network: { clusterMembers: HAZELCAST_CLUSTER_MEMBERS },
    });
    const canvasState = await hazelcastClient.getMap<string, PixelData>(
        CANVAS_STATE_MAP_NAME
    );
    const cooldownsMap = await hazelcastClient.getMap<string, number>(
        USER_COOLDOWNS_MAP_NAME
    );
    console.log("INFO: Connected to Hazelcast and got canvas state map.");

    // --- CONNECT TO KAFKA ---
    const kafka = new Kafka({
        clientId: "canvas-service",
        brokers: [KAFKA_BROKER],
    });
    const producer = kafka.producer();
    await producer.connect();
    console.log("INFO: Connected to Kafka producer.");

    // --- SETUP EXPRESS APP ---
    const app = express();
    app.use(express.json());
    // Pass our connected clients to the routes
    app.use("/api/canvas", canvasRouter(producer, canvasState, cooldownsMap));

    // --- START SERVER ---
    app.listen(PORT, () => {
        console.log(`INFO: Canvas Service running on http://localhost:${PORT}`);
    });
}

main().catch(console.error);
