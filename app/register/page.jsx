"use client";
import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) window.location.href = "/login";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleRegister} className="p-8 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Create Academy Account</h1>
        <input type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} className="border p-2 mb-4 w-full" required />
        <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} className="border p-2 mb-4 w-full" required />
        <button className="bg-green-600 text-white p-2 w-full rounded">Sign Up</button>
      </form>
    </div>
  );
}