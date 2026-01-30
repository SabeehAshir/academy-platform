"use client";
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [customId, setCustomId] = useState('');
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // New: 'success' or 'error'
  
  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) {
      window.location.href = "/login"; 
    }
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setMessage("Processing...");
    setMessageType("info"); // distinct color for processing
    
    const parentId = localStorage.getItem("currentUserId");

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: studentName,
        age: studentAge,
        parentId: parentId,
        studentId: customId
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`✅ Success! Added ${studentName}`);
      setMessageType('success'); // Make it Green
      
      setStudentName('');
      setStudentAge('');
      setCustomId(''); 
    } else {
      setMessage(`⚠️ ${data.error || "Failed to add student."}`);
      setMessageType('error'); // Make it Red
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '600px', fontFamily: 'sans-serif' }}>
      <h1>🎓 Parent Dashboard</h1>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
        <h3>➕ Add a Child</h3>
        
        <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Student ID (Optional):</label>
            <input 
              type="text" 
              placeholder="Leave empty to auto-generate" 
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              style={{ padding: '8px', width: '100%', border: '1px solid #999' }}
            />
            <small style={{ color: '#666' }}>If the student already has a School ID, enter it here.</small>
          </div>

          <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Name:</label>
            <input 
              type="text" 
              placeholder="Harry Potter" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              style={{ padding: '8px', width: '100%' }}
            />
          </div>

          <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Age:</label>
            <input 
              type="number" 
              placeholder="11" 
              value={studentAge}
              onChange={(e) => setStudentAge(e.target.value)}
              style={{ padding: '8px', width: '100%' }}
            />
          </div>

          <button type="submit" style={{ padding: '12px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer', fontSize:'16px' }}>
            Add Student
          </button>
        </form>

        {/* IMPROVED MESSAGE BOX */}
        {message && (
          <div style={{ 
            marginTop: '15px', 
            padding:'15px', 
            borderRadius: '5px',
            fontWeight: 'bold',
            // Dynamic Styling based on message type
            backgroundColor: messageType === 'error' ? '#ffebee' : messageType === 'success' ? '#e8f5e9' : '#e3f2fd',
            color: messageType === 'error' ? '#c62828' : messageType === 'success' ? '#2e7d32' : '#0d47a1',
            border: messageType === 'error' ? '1px solid #ef9a9a' : messageType === 'success' ? '1px solid #a5d6a7' : '1px solid #90caf9'
          }}>
            {message}
          </div>
        )}

      </div>
    </div>
  );
}