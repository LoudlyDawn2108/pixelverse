import express from "express";
import { Client as HazelcastClient } from "hazelcast-client";
import { Kafka } from "kafkajs";
import { canvasRouter } from "./canvas.routes";
import { IMap } from "hazelcast-client";
import cors from "cors";

// --- 1. DEFINE CONSTANTS ---
const PORT = 3002;
const KAFKA_BROKER = "localhost:9092";
const KAFKA_TOPIC = "pixel-placed-topic";
const HAZELCAST_CLUSTER_MEMBERS = ["localhost:5701"];
const CANVAS_STATE_MAP_NAME = "canvas-state";

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

    console.log("INFO: Connected to Hazelcast and got canvas state map.");

    // --- CONNECT TO KAFKA ---
    const kafka = new Kafka({
        clientId: "canvas-service",
        brokers: [KAFKA_BROKER],
    });
    const producer = kafka.producer();
    const consumer = kafka.consumer({ groupId: "canvas-state-updater-group" });
    await producer.connect();
    await consumer.connect();
    console.log("INFO: Connected to Kafka producer and consumer.");

    // --- KAFKA CONSUMER LOGIC ---
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (!message.value) return;

            console.log(
                `INFO: Received event from Kafka: ${message.value.toString()}`
            );
            const { x, y, color, username } = JSON.parse(
                message.value.toString()
            );

            // The key for our map will be "x:y"
            const pixelKey = `${x}:${y}`;
            const pixelData: PixelData = { color, author: username };

            // Update the authoritative state in the Hazelcast grid
            await canvasState.put(pixelKey, pixelData);
            console.log(
                `INFO: Updated canvas state in Hazelcast: ${pixelKey} -> }`,
                pixelData
            );
        },
    });

    // --- SETUP EXPRESS APP ---
    const app = express();
    app.use(express.json());
    // Pass our connected clients to the routes
    app.use("/api/canvas", cors(), canvasRouter(producer, canvasState));

    // --- START SERVER ---
    app.listen(PORT, () => {
        console.log(`INFO: Canvas Service running on http://localhost:${PORT}`);
    });
}

main().catch(console.error);
