"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("isLogin", "true");
      router.push("/admin");

    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan server");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.decorativeCircle}></div>
      <form onSubmit={handleLogin} className={styles.loginBox}>
        <img src="/logo_lsp.png" alt="Logo LSP" className={styles.logo} />
        
        <h2 className={styles.title}>Login</h2>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
            disabled={isLoading}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.passwordToggle}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Login"}
        </button>
      </form>
    </div>
  );
}