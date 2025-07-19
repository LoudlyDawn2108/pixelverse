import express from "express";
import { Client as HazelcastClient } from "hazelcast-client";
import { Kafka } from "kafkajs";

// --- 1. DEFINE CONSTANTS ---
const PORT = 3001;
const COOLDOWN_SECONDS = 60;
const USER_COOLDOWNS_MAP_NAME = "user-cooldowns";
const KAFKA_BROKER = "localhost:9092";
const KAFKA_TOPIC = "pixel-placed-topic";

// --- 2. SETUP THE EXPRESS APP ---
const app = express();
app.use(express.json());

// --- 3. MAIN FUNCTION ---
async function main() {
    try {
        // --- CONNECT TO HAZELCAST ---
        console.log("INFO: Connecting to Hazelcast...");
        const hazelcastClient = await HazelcastClient.newHazelcastClient({
            clusterName: "dev-cluster",
            network: { clusterMembers: ["localhost:5701"] },
        });
        const cooldownsMap = await hazelcastClient.getMap<string, number>(
            USER_COOLDOWNS_MAP_NAME
        );
        console.log("INFO: Successfully connected to Hazelcast!");

        // --- CONNECT TO KAFKA ---
        const kafka = new Kafka({
            clientId: "cooldown-service",
            brokers: [KAFKA_BROKER],
        });
        const consumer = kafka.consumer({ groupId: "cooldown-manager-group" });
        await consumer.connect();
        await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });
        console.log("INFO: Connected to Kafka and subscribed to topic.");

        // --- KAFKA CONSUMER LOGIC ---
        // This is the new, reactive part of our service.
        await consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) return;

                const { userId } = JSON.parse(message.value.toString());
                if (!userId) return;

                // When a pixel is placed, automatically start the cooldown for that user.
                const newExpiryTimestamp = Date.now() + COOLDOWN_SECONDS * 1000;
                await cooldownsMap.put(userId, newExpiryTimestamp);

                console.log(
                    `INFO: Cooldown started for user ${userId} due to PIXEL_PLACED event.`
                );
            },
        });

        // --- DEFINE API ENDPOINTS ---
        // The Canvas Service still needs to CHECK the cooldown, so the GET endpoint remains.
        app.get("/internal/cooldown/:userId", async (req, res) => {
            const { userId } = req.params;
            const cooldownExpiry = await cooldownsMap.get(userId);

            if (!cooldownExpiry) {
                return res.json({ onCooldown: false });
            }

            const isOnCooldown = Date.now() < cooldownExpiry;
            return res.json({ onCooldown: isOnCooldown });
        });

        // The POST endpoint is no longer needed! It has been removed.

        // --- START THE SERVER ---
        app.listen(PORT, () => {
            console.log(
                `INFO: Cooldown Service running on http://localhost:${PORT}`
            );
        });
    } catch (err) {
        console.error("ERROR: Failed to start Cooldown Service:", err);
        process.exit(1);
    }
}

main();
