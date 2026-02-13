"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css'; // Import styles

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (res.ok) {
      // 1. Save the ID so the app remembers who is logged in
      localStorage.setItem("currentUserId", data.userId);
      
      // 2. SMART ROUTING: Check the role and send them to the right page!
      if (data.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit" className={styles.button}>Sign In</button>
        </form>
      </div>
    </div>
  );
}