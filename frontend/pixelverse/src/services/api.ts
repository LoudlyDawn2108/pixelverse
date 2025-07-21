import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import { useAuthStore } from "../store/authStore";

// API base URLs
const AUTH_BASE_URL = "http://localhost:3000";
const CANVAS_BASE_URL = "http://localhost:3002/api/canvas";

// Create axios instances
const authApi: AxiosInstance = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const canvasApi: AxiosInstance = axios.create({
    baseURL: CANVAS_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to include JWT token
canvasApi.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
canvasApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token is invalid or expired
            useAuthStore.getState().clearAuth();
        }
        return Promise.reject(error);
    }
);

// Types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface RegisterResponse {
    id: string;
    username: string;
}

export interface PlacePixelRequest {
    x: number;
    y: number;
    color: string;
}

export interface PlacePixelResponse {
    message: string;
}

export interface CanvasStateResponse {
    [key: string]: {
        color: string;
        author: string;
    };
}

// API functions
export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response: AxiosResponse<LoginResponse> = await authApi.post(
            "/login",
            credentials
        );
        return response.data;
    },

    register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
        const response: AxiosResponse<RegisterResponse> = await authApi.post(
            "/register",
            userData
        );
        return response.data;
    },
};

export const canvasService = {
    getCanvasState: async (): Promise<CanvasStateResponse> => {
        const response: AxiosResponse<CanvasStateResponse> =
            await canvasApi.get("/");
        return response.data;
    },

    placePixel: async (
        pixelData: PlacePixelRequest
    ): Promise<PlacePixelResponse> => {
        const response: AxiosResponse<PlacePixelResponse> =
            await canvasApi.post("/place-pixel", pixelData);
        return response.data;
    },
};
