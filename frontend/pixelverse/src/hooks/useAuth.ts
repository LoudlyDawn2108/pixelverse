import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/api";
import type { LoginRequest, RegisterRequest } from "../services/api";

interface UseAuthReturn {
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}

// Helper function to decode JWT (client-side, for getting user info)
const decodeToken = (token: string) => {
    try {
        // Note: This is just for extracting payload, not for verification
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

export const useAuth = (): UseAuthReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setAuth, clearAuth } = useAuthStore();

    const login = async (credentials: LoginRequest): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await authService.login(credentials);
            const { token } = response;

            // Decode token to get user info
            const decoded = decodeToken(token);
            if (!decoded || !decoded.userId || !decoded.username) {
                throw new Error("Invalid token received");
            }

            const user = {
                userId: decoded.userId,
                username: decoded.username,
            };

            setAuth(token, user);
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message || "Login failed";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterRequest): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            await authService.register(userData);

            // After successful registration, automatically log in
            await login(userData);
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : (err as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message || "Registration failed";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        clearAuth();
        setError(null);
    };

    return {
        login,
        register,
        logout,
        isLoading,
        error,
    };
};
