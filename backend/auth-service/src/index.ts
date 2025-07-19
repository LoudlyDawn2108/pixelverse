import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --- 1. DEFINE CONSTANTS ---
const PORT = 3000;
// It's bad practice to have secrets in code, but for this tutorial it's okay.
// In a real app, you'd use environment variables.
const JWT_SECRET = "super-secret-key-that-is-long-and-secure";

// --- 2. SETUP DATABASE CONNECTION ---
// This configures our connection to the PostgreSQL container.
const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost", // The service name in docker-compose is 'postgres', but from our local machine it's 'localhost'
    port: 5432,
    username: "admin",
    password: "password",
    database: "auth_db",
    entities: [User], // Tells TypeORM which entities to use
    synchronize: true, // DEV ONLY: Automatically creates database tables on connection.
    logging: true, // Shows SQL queries in the console
});

// --- 3. CREATE AND CONFIGURE THE EXPRESS APP ---
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// --- 4. DEFINE API ENDPOINTS ---

// ## REGISTER ##
// Creates a new user
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required." });
    }

    try {
        const userRepository = AppDataSource.getRepository(User);

        // Check if user already exists
        const existingUser = await userRepository.findOneBy({ username });
        if (existingUser) {
            return res.status(409).json({ message: "Username already taken." });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create and save the new user
        const newUser = userRepository.create({ username, passwordHash });
        await userRepository.save(newUser);
        console.log("INFO: New user registered:", newUser);

        return res
            .status(201)
            .json({ id: newUser.id, username: newUser.username });
    } catch (error) {
        console.error("ERROR: Registration error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// ## LOGIN ##
// Authenticates a user and returns a JWT
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required." });
    }

    try {
        const userRepository = AppDataSource.getRepository(User);

        // Find the user by their username
        const user = await userRepository.findOneBy({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." }); // User not found
        }

        // Check if the provided password matches the stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." }); // Password incorrect
        }

        // If credentials are valid, create a JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username }, // Payload
            JWT_SECRET,
            { expiresIn: "1h" } // Token expires in 1 hour
        );
        console.log("INFO: User logged in:", user.username);

        return res.json({ token });
    } catch (error) {
        console.error("ERROR: Login error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

// --- 5. INITIALIZE DATABASE AND START SERVER ---
AppDataSource.initialize()
    .then(() => {
        console.log("INFO: Database connected successfully!");

        app.listen(PORT, () => {
            console.log(
                `INFO: Auth Service running on http://localhost:${PORT}`
            );
        });
    })
    .catch((error) =>
        console.error("ERROR: Database connection failed:", error)
    );
