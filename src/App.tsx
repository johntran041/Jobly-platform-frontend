// src/App.tsx

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { LoginPage } from "./components/LoginPage";
import "./App.css";

interface ValidateUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  refreshToken?: string;
}

function App() {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const IDLE_TIMEOUT = 30 * 60 * 1000;

  const [user, setUser] = useState<ValidateUser | null>(() => {
    const storedUser = localStorage.getItem("user");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (storedUser && tokenExpiry) {
      if (Date.now() > parseInt(tokenExpiry)) {
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
        return null;
      }
      return JSON.parse(storedUser);
    }
    return null;
  });

  function handleLogin(userData: ValidateUser) {
    const expiryTime = Date.now() + IDLE_TIMEOUT;
    console.log("🔐 Login successful!");
    console.log("⏰ Initial expiry time:", expiryTime);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("tokenExpiry", expiryTime.toString());
  }

  const handleLogout = useCallback(() => {
    console.log("🚪 Logging out...");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");
    navigate("/");
  }, [navigate]);

  const resetIdleTimer = useCallback(() => {
    if (!user) return;
    const newExpiryTime = Date.now() + IDLE_TIMEOUT;
    localStorage.setItem("tokenExpiry", newExpiryTime.toString());
    console.log(
      "🔄 Activity detected! Timer reset. New expiry:",
      new Date(newExpiryTime).toLocaleTimeString()
    );
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      console.log("⏰ Idle timeout! Logging out...");
      alert(
        "⏰ You've been inactive for 30 minutes. Logging out for security."
      );
      handleLogout();
    }, IDLE_TIMEOUT);
  }, [user, handleLogout, IDLE_TIMEOUT]);

  useEffect(() => {
    if (!user) return;
    console.log("✅ Setting up idle timeout for user:", user.username);
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer);
    });
    resetIdleTimer();
    return () => {
      console.log("🧹 Cleaning up idle timeout");
      events.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [user, resetIdleTimer]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/jobs" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />

      {/* Will add /jobs, /applications routes tomorrow */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
