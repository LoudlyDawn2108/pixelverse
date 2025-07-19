import express from "express";
import { Client as HazelcastClient } from "hazelcast-client";
// import { DistributedMap } from "hazelcast-client/lib/DistributedMap";

// --- 1. DEFINE CONSTANTS ---
const PORT = 3001;
const COOLDOWN_SECONDS = 60;
const USER_COOLDOWNS_MAP_NAME = "user-cooldowns"; // The name for our map in Hazelcast

// --- 2. SETUP THE EXPRESS APP ---
const app = express();
app.use(express.json());

// --- 3. CONNECT TO HAZELCAST ---

async function main() {
    try {
        console.log("INFO: Attempting to connect to Hazelcast...");
        // Configure and create the Hazelcast client
        const hazelcastClient = await HazelcastClient.newHazelcastClient({
            clusterName: "dev-cluster",
            network: {
                clusterMembers: ["localhost:5701"], // Connect to the port we exposed in Docker
            },
        });
        console.log("INFO: Successfully connected to Hazelcast!");

        // Get the distributed map where we'll store cooldowns.
        // This is the Hazelcast equivalent of Ignite's "cache".
        const cooldownsMap = await hazelcastClient.getMap<string, number>(
            USER_COOLDOWNS_MAP_NAME
        );

        // --- 4. DEFINE API ENDPOINTS ---

        /**
         * GET /internal/cooldown/:userId
         * Checks if a user is currently on cooldown.
         */
        app.get("/internal/cooldown/:userId", async (req, res) => {
            const { userId } = req.params;

            // Get the user's cooldown expiry timestamp from the Hazelcast map.
            const cooldownExpiry = await cooldownsMap.get(userId);

            if (cooldownExpiry === null || cooldownExpiry === undefined) {
                // If there's no entry, they are not on cooldown.
                return res.json({ onCooldown: false });
            }

            // Compare the stored expiry time with the current time.
            const isOnCooldown = Date.now() < cooldownExpiry;

            return res.json({ onCooldown: isOnCooldown });
        });

        /**
         * POST /internal/cooldown/:userId
         * Starts the cooldown period for a user.
         */
        app.post("/internal/cooldown/:userId", async (req, res) => {
            const { userId } = req.params;

            // Calculate when the cooldown will end.
            const newExpiryTimestamp = Date.now() + COOLDOWN_SECONDS * 1000;

            // Store the new expiry timestamp in the Hazelcast map with the userId as the key.
            await cooldownsMap.put(userId, newExpiryTimestamp);

            console.log(
                `INFO: Cooldown started for user ${userId}. Expires at ${new Date(
                    newExpiryTimestamp
                ).toLocaleTimeString()}`
            );

            return res.status(200).json({
                message: "Cooldown started.",
                expiresAt: newExpiryTimestamp,
            });
        });

        // --- 5. START THE SERVER ---
        app.listen(PORT, () => {
            console.log(
                `INFO: Cooldown Service running on http://localhost:${PORT}`
            );
        });
    } catch (err) {
        console.error(
            "ERROR: Failed to connect to Hazelcast or start server:",
            err
        );
        process.exit(1);
    }
}

main();
