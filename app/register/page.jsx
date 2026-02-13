// app/register/page.jsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert("Account created! Please log in.");
      router.push('/login');
    } else {
      const data = await res.json();
      alert(`Error: ${data.error}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
        <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>Parent or Independent Student</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input 
            type="text" 
            placeholder="Full Name" 
            className={styles.input}
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <input 
            type="tel" 
            placeholder="Contact Number" 
            className={styles.input}
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            required
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            className={styles.input}
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className={styles.input}
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit" className={styles.submitBtn}>Sign Up</button>
        </form>
      </div>
    </div>
  );
}