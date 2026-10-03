import React, { useState, useContext } from "react";
import { api } from "static/js/myjs";
import { toast } from "react-toastify";
import { DesktopMainContext } from "providers/DesktopMainProvider";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { isLoggedIn, setIsLoggedIn, setUserInfo, authLoading } = useContext(DesktopMainContext);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!authLoading && isLoggedIn) {
            navigate("/desktop");
        }
    }, [isLoggedIn, authLoading, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!userid || !password) {
            toast.error("Please enter both User ID and Password");
            return;
        }

        setLoading(true);
        try {
            const data = await api("/login_user", { userid, password });
            if (data.status === 1) {
                toast.success("Login successful!");
                setIsLoggedIn(true);
                setUserInfo(data.user);
                navigate("/desktop");
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An error occurred during login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-blue">
                <div className="text-background-orange text-2xl font-bold animate-pulse">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-blue">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-bold text-background-orange">QuickDine</h1>
                    <p className="text-gray-500 mt-2">Dashboard Login</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User ID</label>
                        <input
                            type="text"
                            value={userid}
                            onChange={(e) => setUserid(e.target.value)}
                            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-background-orange focus:border-transparent outline-none transition-all"
                            placeholder="Enter your User ID"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-background-orange focus:border-transparent outline-none transition-all"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 text-white font-semibold rounded-lg bg-background-orange hover:bg-orange-600 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
