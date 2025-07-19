import { Router } from "express";
import { Producer } from "kafkajs";
import { authMiddleware, AuthenticatedRequest } from "./auth.middleware";
import axios from "axios";
import { CanvasStateMap } from "./index";

// The topic we publish our events to
const KAFKA_TOPIC = "pixel-placed-topic";

// This function creates and returns the Express router
export function canvasRouter(producer: Producer, canvasState: CanvasStateMap) {
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
            const userId = req.user?.userId; // Get userId from the token payload

            // Basic validation
            if (typeof x !== "number" || typeof y !== "number" || !color) {
                return res.status(400).json({
                    message: "Invalid request body. Requires x, y, and color.",
                });
            }

            try {
                // 1. Check Cooldown Status
                console.log(`Checking cooldown for user ${userId}...`);
                const cooldownResponse = await axios.get(
                    `http://localhost:3001/internal/cooldown/${userId}`
                );

                if (cooldownResponse.data.onCooldown) {
                    console.log(`User ${userId} is on cooldown.`);
                    return res.status(429).json({
                        message: "You are on a cooldown. Please wait.",
                    });
                }
                console.log(`User ${userId} is not on cooldown.`);

                // 2. Publish PIXEL_PLACED Event to Kafka
                // The service does NOT update its own state directly. It publishes an event.
                // The consumer (in index.ts) will pick it up and update the state.
                const eventPayload = { userId, x, y, color };
                await producer.send({
                    topic: KAFKA_TOPIC,
                    messages: [{ value: JSON.stringify(eventPayload) }],
                });
                console.log(
                    `📤 Published PIXEL_PLACED event to Kafka:`,
                    eventPayload
                );

                // 3. We don't need to make a separate call to the Cooldown Service to START
                // the cooldown. We will have the Cooldown Service itself listen for the
                // PIXEL_PLACED event. This is a more robust, event-driven approach.
                // (We will add this functionality to the Cooldown Service later).

                return res
                    .status(202)
                    .json({ message: "Pixel placement request accepted." });
            } catch (error) {
                console.error("Error placing pixel:", error);
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
            console.error("Error fetching canvas state:", error);
            res.status(500).json({ message: "Failed to fetch canvas state." });
        }
    });

    return router;
}
