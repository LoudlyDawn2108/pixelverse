# PixelVerse

PixelVerse is a real-time collaborative pixel canvas platform inspired by Reddit Place. Users can place colored pixels on a shared 1000x1000 canvas, with all updates instantly synchronized across clients. The project features a complete microservices backend built with Node.js/TypeScript and a modern React frontend with real-time capabilities.

## Features

### Frontend

-   **Interactive Canvas:** Real-time pixel canvas with zoom, pan, and click-to-place functionality using React-Konva
-   **User Authentication:** Complete login/registration system with JWT token management
-   **Real-Time Updates:** Live pixel updates via WebSocket connections to all connected clients
-   **Color Picker:** Custom color selection with predefined palette and hex input
-   **Cooldown System:** Visual cooldown timer preventing spam (60-second restriction per user)
-   **Canvas Statistics:** Live stats showing pixels placed, unique colors, and contributors
-   **Responsive UI:** Modern design with sidebar controls and fullscreen canvas view
-   **State Management:** Zustand for client-side state with persistence

### Backend

-   **Distributed Canvas State:** Hazelcast distributed map for fast, concurrent pixel state management
-   **Event-Driven Architecture:** Kafka for reliable real-time pixel placement events and synchronization
-   **RESTful API:** Express routes for pixel placement and canvas state queries
-   **Microservices:** Independent services for authentication, canvas, cooldown, and WebSocket communication
-   **JWT Authentication:** Secure user authentication with token-based authorization
-   **Rate Limiting:** Distributed cooldown enforcement to prevent abuse

## Architecture

### Backend Services

-   **Auth Service (Port 3000):** User registration/login with JWT, bcrypt, and PostgreSQL
-   **Canvas Service (Port 3002):** Pixel placement API, Hazelcast state management, and Kafka event publishing
-   **Cooldown Service (Port 3001):** Rate limiting and cooldown enforcement using Hazelcast
-   **WebSocket Gateway (Port 3003):** Real-time pixel updates broadcasting via Socket.IO
-   **Kafka:** Event streaming for service communication and pixel placement events
-   **Hazelcast:** Distributed caching for canvas state and user cooldowns
-   **PostgreSQL:** User data persistence

### Frontend (Vite + React)

-   **React 19** with TypeScript for component-based UI
-   **Zustand** for state management with persistence
-   **React-Konva** for high-performance canvas rendering
-   **Socket.IO Client** for real-time WebSocket communication
-   **Axios** for HTTP API calls with automatic JWT token handling

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
    cd backend
    docker-compose up -d
    ```

3. **Install and run backend services:**

    ```bash
    # Auth Service
    cd backend/auth-service
    yarn install && yarn start

    # Canvas Service
    cd backend/canvas-service
    yarn install && yarn start

    # Cooldown Service
    cd backend/cooldown-service
    yarn install && yarn start

    # WebSocket Gateway
    cd backend/websocket-gateway
    yarn install && yarn start
    ```

4. **Install and run frontend:**

    ```bash
    cd frontend/pixelverse
    yarn install
    yarn dev
    ```

5. **Access the application:**
    - Frontend: http://localhost:5173
    - Backend APIs:
        - Auth: http://localhost:3000
        - Canvas: http://localhost:3002
        - Cooldown: http://localhost:3001
        - WebSocket: http://localhost:3003

### API Endpoints

#### Auth Service (Port 3000)

-   `POST /register` – Register a new user
-   `POST /login` – User login with JWT token

#### Canvas Service (Port 3002)

-   `POST /api/canvas/place-pixel` – Place a pixel (requires authentication)
-   `GET /api/canvas/` – Get current canvas state

#### Cooldown Service (Port 3001)

-   `GET /internal/cooldown/:userId` – Check user's cooldown status

## How It Works

1. **User Registration/Login:** Users create accounts and authenticate via JWT tokens
2. **Canvas Loading:** Frontend loads the current canvas state on initialization
3. **Pixel Placement:** Users click on the canvas to place pixels with their selected color
4. **Real-Time Updates:** Pixel placements are published to Kafka and broadcast via WebSocket
5. **Cooldown System:** Users must wait 60 seconds between pixel placements
6. **State Persistence:** Canvas state is maintained in Hazelcast for fast access

## Technology Stack

### Backend

-   **Node.js & TypeScript:** Core runtime and type safety
-   **Express:** REST API framework
-   **Kafka:** Event streaming for microservice communication
-   **Hazelcast:** Distributed in-memory data grid for canvas state
-   **PostgreSQL:** User data persistence
-   **JWT & bcrypt:** Secure authentication
-   **Docker:** Service containerization

### Frontend

-   **React 19:** Modern UI framework with hooks
-   **TypeScript:** Type safety for frontend code
-   **Vite:** Fast build tool and development server
-   **React-Konva:** High-performance 2D canvas rendering
-   **Zustand:** Lightweight state management
-   **Socket.IO:** Real-time WebSocket communication
-   **Axios:** HTTP client with interceptors

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements.

## License

MIT
