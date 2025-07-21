import { Router } from "express";
import { Producer } from "kafkajs";
import { authMiddleware, AuthenticatedRequest } from "./auth.middleware";
import axios from "axios";
import { type CanvasStateMap, type PixelData } from "./index";
import { IMap } from "hazelcast-client";

// The topic we publish our events to
const KAFKA_TOPIC = "pixel-placed-topic";

// This function creates and returns the Express router
export function canvasRouter(
    producer: Producer,
    canvasState: CanvasStateMap,
    cooldownsMap: IMap<string, number>
) {
    const router = Router();

    /**
     * POST /api/canvas/place-pixel
     * The main endpoint for placing a single pixel.
     * This endpoint is protected by our authentication middleware.
     */
    router.post(
        "/place-pixel",
        authMiddleware,
        async (req: AuthenticatedRequest, res) => {
            const { x, y, color } = req.body;

            if (req.user === undefined) {
                throw new Error("Auth middleware did not set req.user");
            }
            const userId = req.user.userId; // Get userId from the token payload
            const username = req.user.username; // Get username for logging
            const pixelData = {
                color: color,
                author: username,
            };

            // Basic validation
            if (typeof x !== "number" || typeof y !== "number" || !color) {
                return res.status(400).json({
                    message: "Invalid request body. Requires x, y, and color.",
                });
            }

            try {
                // 1. Check Cooldown Status
                console.log(`INFO: Checking cooldown for user ${userId}...`);
                const cooldownExpiry = await cooldownsMap.get(userId!);
                if (cooldownExpiry && Date.now() < cooldownExpiry) {
                    return res
                        .status(429)
                        .json({ message: "You are on a cooldown." });
                }
                console.log(`INFO: User ${userId} is not on cooldown.`);

                // 2. Publish to the "Fast Lane" - Write to Hazelcast
                const pixelKey = `${x}:${y}`;
                await canvasState.put(pixelKey, pixelData);
                console.log(
                    `INFO: [Hazelcast] Updated canvas state: ${pixelKey} -> }`,
                    pixelData
                );

                // 3. Publish to the "Durable Log" - Write to Kafka for persistence
                const eventPayload = { userId, x, y, color };
                await producer.send({
                    topic: KAFKA_TOPIC,
                    messages: [
                        {
                            value: JSON.stringify(eventPayload),
                            timestamp: String(Date.now()),
                        },
                    ],
                });
                console.log(`INFO: [Kafka] Logged PIXEL_PLACED event.`);

                return res
                    .status(202)
                    .json({ message: "Pixel placement request accepted." });
            } catch (error) {
                console.error("ERROR: Error placing pixel:", error);
                return res
                    .status(500)
                    .json({ message: "Internal server error." });
            }
        }
    );

    /**
     * GET /api/canvas
     * Provides the full current state of the canvas.
     * Useful for when a new client connects to the app.
     */
    router.get("/", async (req, res) => {
        try {
            // Get all key-value pairs from the Hazelcast map
            const allPixels = await canvasState.entrySet();
            // Convert the array of [key, value] pairs into a more friendly object
            const canvasData = Object.fromEntries(allPixels);

            res.json(canvasData);
        } catch (error) {
            console.error("ERROR: Error fetching canvas state:", error);
            res.status(500).json({ message: "Failed to fetch canvas state." });
        }
    });

    return router;
}
