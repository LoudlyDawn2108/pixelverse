import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    userId: string;
    username: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (token: string, user: User) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            setAuth: (token: string, user: User) => {
                set({
                    token,
                    user,
                    isAuthenticated: true,
                });
            },
            clearAuth: () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                });
            },
            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);
