# PixelVerse

PixelVerse is a real-time collaborative pixel canvas platform inspired by Reddit Place. Users can place colored pixels on a shared canvas, with all updates instantly synchronized across clients. The backend is built with Node.js, TypeScript, Kafka, Hazelcast, and Express, following a microservices architecture.

## Features

-   **Distributed Canvas State:** Uses Hazelcast for fast, concurrent pixel state management.
-   **Event-Driven Updates:** Kafka ensures real-time pixel placement events and synchronization.
-   **RESTful API:** Express routes for pixel placement and canvas queries.
-   **Scalable Architecture:** Microservices for authentication, canvas management, cooldown enforcement, and real-time updates.
-   **Planned Frontend:** React-based UI for live pixel placement and updates (to be implemented).

## Architecture

-   **Canvas Service:** Handles pixel placement, updates Hazelcast state, and publishes events to Kafka.
-   **Auth Service:** Manages user registration and authentication (JWT, bcrypt, PostgreSQL).
-   **Cooldown Service:** Enforces rate limits for pixel placement.
-   **WebSocket Gateway:** Broadcasts pixel updates to clients using Socket.IO.
-   **Kafka:** Facilitates communication between services.
-   **Hazelcast:** Stores the authoritative canvas state.

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   Docker & Docker Compose (for Hazelcast, Kafka, PostgreSQL)
-   Yarn or npm

### Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/pixelverse.git
    cd pixelverse
    ```

2. **Start dependencies (Hazelcast, Kafka, PostgreSQL):**

    ```bash
    docker-compose up -d
    ```

3. **Install backend dependencies:**

    ```bash
    cd backend/canvas-service
    yarn install
    ```

4. **Run the Canvas Service:**

    ```bash
    yarn start
    ```

5. **Other services:** Repeat install/start for `auth-service`, `cooldown-service`, and `ws-gateway` as needed.

### API Endpoints

-   `POST /api/canvas/place` – Place a pixel (requires authentication)
-   `GET /api/canvas/state` – Get current canvas state

### Planned Frontend

A React-based frontend will allow users to:

-   View the live canvas
-   Place pixels with cooldown enforcement
-   See real-time updates via WebSocket

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements.

## License

MIT
