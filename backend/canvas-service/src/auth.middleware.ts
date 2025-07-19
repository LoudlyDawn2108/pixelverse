import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// This is the same secret we defined in our Auth Service.
// In a real production app, this would be loaded from a secure environment variable.
const JWT_SECRET = "super-secret-key-that-is-long-and-secure";

// We extend the default Express Request type to include our user payload
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        username: string;
    };
}

export function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    // Get the token from the Authorization header (e.g., "Bearer <token>")
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Unauthorized: No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify the token using our secret
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach the decoded payload (which contains userId and username) to the request object
        req.user = decoded as { userId: string; username: string };

        // Continue to the next middleware or the route handler
        next();
    } catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token." });
    }
}
