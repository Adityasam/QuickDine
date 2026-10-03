import React, { createContext, useState, useEffect } from "react";
import { api } from "static/js/myjs";

// Create a Context for Desktop
export const DesktopMainContext = createContext();

// Create a Provider Component for Desktop
export const DesktopMainProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const logout = async () => {
        try {
            await api("/logout_user");
            setIsLoggedIn(false);
            setUserInfo(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    useEffect(() => {
        const fetchLoginStatus = async () => {
            try {
                const data = await api("/check_login_status");
                if (data.isLoggedIn) {
                    setIsLoggedIn(true);
                    setUserInfo(data.user);
                } else {
                    setIsLoggedIn(false);
                    setUserInfo(null);
                }
            } catch (error) {
                console.error("Error checking login status:", error);
            } finally {
                setAuthLoading(false);
            }
        };
        fetchLoginStatus();
    }, []);

    return (
        <DesktopMainContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                userInfo,
                setUserInfo,
                logout,
                authLoading,
            }}
        >
            {children}
        </DesktopMainContext.Provider>
    );
};
