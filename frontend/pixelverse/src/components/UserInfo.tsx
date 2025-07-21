import React from "react";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "../hooks/useAuth";

const UserInfo: React.FC = () => {
    const { user, isAuthenticated } = useAuthStore();
    const { logout } = useAuth();

    if (!isAuthenticated || !user) {
        return null;
    }

    const handleLogout = () => {
        logout();
    };

    return (
        <div
            style={{
                padding: "16px",
                backgroundColor: "#e8f5e8",
                border: "1px solid #4caf50",
                borderRadius: "8px",
                marginBottom: "16px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#2e7d32",
                            marginBottom: "4px",
                        }}
                    >
                        Welcome back!
                    </div>
                    <div
                        style={{
                            fontSize: "14px",
                            color: "#388e3c",
                        }}
                    >
                        @{user.username}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default UserInfo;
