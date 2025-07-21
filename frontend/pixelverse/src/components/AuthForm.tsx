import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthFormProps {
    onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { login, register, isLoading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            alert("Please fill in all fields");
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            if (isLogin) {
                await login({ username: username.trim(), password });
            } else {
                await register({ username: username.trim(), password });
            }

            // Clear form
            setUsername("");
            setPassword("");
            setConfirmPassword("");

            // Call success callback
            onSuccess?.();
        } catch (err) {
            // Error is already handled in the hook
            console.error("Auth error:", err);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setUsername("");
        setPassword("");
        setConfirmPassword("");
    };

    return (
        <div
            style={{
                maxWidth: "400px",
                margin: "0 auto",
                padding: "24px",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
        >
            <h2
                style={{
                    textAlign: "center",
                    marginBottom: "24px",
                    color: "#333",
                    fontSize: "24px",
                }}
            >
                {isLogin ? "Login to PixelVerse" : "Join PixelVerse"}
            </h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "16px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "4px",
                            fontSize: "14px",
                            fontWeight: "bold",
                        }}
                    >
                        Username:
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "2px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            boxSizing: "border-box",
                        }}
                        placeholder="Enter your username"
                    />
                </div>

                <div style={{ marginBottom: "16px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "4px",
                            fontSize: "14px",
                            fontWeight: "bold",
                        }}
                    >
                        Password:
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "2px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            boxSizing: "border-box",
                        }}
                        placeholder="Enter your password"
                    />
                </div>

                {!isLogin && (
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "4px",
                                fontSize: "14px",
                                fontWeight: "bold",
                            }}
                        >
                            Confirm Password:
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                            }}
                            placeholder="Confirm your password"
                        />
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "12px",
                            backgroundColor: "#f8d7da",
                            color: "#721c24",
                            border: "1px solid #f5c6cb",
                            borderRadius: "4px",
                            fontSize: "14px",
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: isLoading ? "#6c757d" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        marginBottom: "16px",
                    }}
                >
                    {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
                </button>
            </form>

            <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "14px", color: "#666" }}>
                    {isLogin
                        ? "Don't have an account? "
                        : "Already have an account? "}
                </span>
                <button
                    type="button"
                    onClick={toggleMode}
                    disabled={isLoading}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#007bff",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        textDecoration: "underline",
                    }}
                >
                    {isLogin ? "Register here" : "Login here"}
                </button>
            </div>
        </div>
    );
};

export default AuthForm;
