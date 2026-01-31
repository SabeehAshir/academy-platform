"use client";
import { useState, useEffect } from 'react';
// IMPORT THE CSS MODULE
import styles from './dashboard.module.css'; 

export default function Dashboard() {
  // --- STATE ---
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [customId, setCustomId] = useState('');
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // EDITING STATE
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // --- USE EFFECT (Load Data) ---
  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) {
      window.location.href = "/login";
    } else {
      fetchStudents(userId);
    }
  }, []);

  // --- FETCH STUDENTS (Read) ---
  const fetchStudents = async (parentId) => {
    try {
      const res = await fetch(`/api/students?parentId=${parentId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // --- ADD STUDENT (Create) ---
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setMessage("Processing...");
    setMessageType("info");
    
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
      setMessageType('success');
      setStudentName('');
      setStudentAge('');
      setCustomId('');
      fetchStudents(parentId);
    } else {
      setMessage(`⚠️ ${data.error || "Failed to add student."}`);
      setMessageType('error');
    }
  };

  // --- DELETE STUDENT (Delete) ---
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      const userId = localStorage.getItem("currentUserId");
      fetchStudents(userId); // Refresh list
    }
  };

  // --- PREPARE EDIT (Setup) ---
  const handleEdit = (student) => {
    setIsEditing(true);
    setEditId(student.id); // Remember which student we are changing
    setStudentName(student.name);
    setStudentAge(student.age || '');
    setCustomId(student.id); // Keep the ID visible
    setMessage("Editing Mode enabled. Change details and click Update.");
    setMessageType("info");
  };

  // --- UPDATE STUDENT (Update) ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/students', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editId,
        name: studentName,
        age: studentAge
      }),
    });

    if (res.ok) {
      setMessage("✅ Student updated successfully!");
      setMessageType("success");
      
      // Reset Form
      setIsEditing(false);
      setEditId(null);
      setStudentName('');
      setStudentAge('');
      setCustomId('');
      
      // Refresh List
      const userId = localStorage.getItem("currentUserId");
      fetchStudents(userId); 
    } else {
      setMessage("❌ Failed to update student.");
      setMessageType("error");
    }
  };

  // --- RENDER ---
  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1>🎓 Parent Dashboard</h1>
        <button 
          onClick={() => { localStorage.removeItem("currentUserId"); window.location.href = "/login"; }}
          className={styles.logoutBtn}
        >
          Logout
        </button>
      </div>
      
      <div className={styles.grid}>
        
        {/* LEFT COLUMN: The Form */}
        <div>
          <div className={styles.card}>
            <h3>{isEditing ? "📝 Edit Child" : "➕ Add a Child"}</h3>
    
            {/* Dynamic Form: Runs handleUpdate if editing, handleAddStudent if adding */}
            <form onSubmit={isEditing ? handleUpdate : handleAddStudent} className={styles.form}>
              
              <div>
                <label className={styles.label}>Student ID (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 44432" 
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  className={styles.input}
                  disabled={isEditing} // Prevent changing ID while editing
                  style={isEditing ? {backgroundColor: '#e9ecef', cursor: 'not-allowed'} : {}}
                />
              </div>

              <div>
                <label className={styles.label}>Name</label>
                <input 
                  type="text" 
                  placeholder="Student Name" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>

              <div>
                <label className={styles.label}>Age</label>
                <input 
                  type="number" 
                  placeholder="Age" 
                  value={studentAge}
                  onChange={(e) => setStudentAge(e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Dynamic Button Color and Text */}
              <button 
                type="submit" 
                className={styles.addBtn}
                style={{ 
                   backgroundColor: isEditing ? '#ffcc00' : '#0070f3',
                   color: isEditing ? 'black' : 'white'
                }}
              >
                {isEditing ? "Update Student" : "Add Student"}
              </button>

              {/* Cancel Button (Only visible when editing) */}
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => { 
                    setIsEditing(false); 
                    setStudentName(''); 
                    setStudentAge(''); 
                    setCustomId(''); 
                    setMessage('');
                  }}
                  style={{ 
                    marginTop: '10px', 
                    background: 'none', 
                    border: 'none', 
                    color: '#0070f3', 
                    cursor: 'pointer', 
                    textDecoration: 'underline' 
                  }}
                >
                  Cancel Edit
                </button>
              )}

            </form>

            {/* Dynamic Message Box */}
            {message && (
              <div className={`${styles.messageBox} ${styles[messageType]}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: The List */}
        <div>
          <h3>📋 Your Students</h3>
          {loading ? (
            <p>Loading...</p>
          ) : students.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No students added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {students.map((student) => (
                <div key={student.id} className={styles.studentItem}>
                  <div className={styles.studentName}>{student.name}</div>
                  <div className={styles.studentDetails}>
                    ID: <span className={styles.idBadge}>{student.id}</span>
                    <span style={{ marginLeft: '15px' }}>Age: {student.age || 'N/A'}</span>
                  </div>
                  
                  {/* ACTIONS */}
                  <div className={styles.actions}>
                    <button onClick={() => handleEdit(student)} className={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDelete(student.id)} className={styles.deleteBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}