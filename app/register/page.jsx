"use client";
import { useState } from "react";
import styles from './register.module.css'; // Using the shared styles

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Reset error on new attempt

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Good practice to include
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      window.location.href = "/login";
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleRegister} className={styles.form}>
          <input 
            type="email" 
            placeholder="Email" 
            className={styles.input} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className={styles.input} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button className={styles.button}>Sign Up</button>
        </form>
        
        <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          Already have an account? <a href="/login" style={{ color: '#0070f3' }}>Login here</a>
        </p>
      </div>
    </div>
  );
}