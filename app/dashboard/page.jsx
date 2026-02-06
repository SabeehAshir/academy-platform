"use client";
import { useState, useEffect } from 'react';
import styles from './dashboard.module.css'; 

export default function Dashboard() {
  // --- STATE ---
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [customId, setCustomId] = useState('');
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]); // <--- NEW: Store courses here
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
      fetchCourses(); // <--- NEW: Load courses when page opens
    }
  }, []);

  // --- FETCH STUDENTS ---
  const fetchStudents = async (parentId) => {
    try {
      const res = await fetch(`/api/students?parentId=${parentId}`);
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch (error) { console.error("Failed to load students"); } 
    finally { setLoading(false); }
  };

  // --- FETCH COURSES (NEW) ---
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        setCourses(await res.json());
      }
    } catch (error) { console.error("Failed to load courses"); }
  };

  // --- ENROLL STUDENT (NEW) ---
  const handleEnroll = async (e, course) => {
  e.preventDefault();
  const studentId = e.target.studentId.value;
  const selectedStudent = students.find(s => s.id === studentId);

  if (!selectedStudent) {
    alert("Please select a student!");
    return;
  }

  // Check age against the course limits
  if (selectedStudent.age < course.minAge || selectedStudent.age > course.maxAge) {
    alert(`⚠️ Age mismatch! ${selectedStudent.name} is ${selectedStudent.age}, but this course is for ages ${course.minAge}-${course.maxAge}.`);
    return;
  }

  // If age is fine, proceed with the fetch call we wrote earlier...
  const res = await fetch('/api/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, courseId: course.id }),
  });

    const data = await res.json();

    if (res.ok) {
      alert("🎉 Enrollment Successful!");
    } else {
      alert("⚠️ " + (data.error || "Enrollment failed"));
    }
  };

  // --- ADD STUDENT ---
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setMessage("Processing...");
    setMessageType("info");
    const parentId = localStorage.getItem("currentUserId");

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: studentName, age: studentAge, parentId, studentId: customId }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`✅ Success! Added ${studentName}`);
      setMessageType('success');
      setStudentName(''); setStudentAge(''); setCustomId('');
      fetchStudents(parentId);
    } else {
      setMessage(`⚠️ ${data.error || "Failed to add student."}`);
      setMessageType('error');
    }
  };

  // --- DELETE & EDIT HANDLERS (Same as before) ---
  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchStudents(localStorage.getItem("currentUserId"));
  };

  const handleEdit = (student) => {
    setIsEditing(true);
    setEditId(student.id);
    setStudentName(student.name);
    setStudentAge(student.age || '');
    setCustomId(student.id);
    setMessage("Editing Mode enabled.");
    setMessageType("info");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/students', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, name: studentName, age: studentAge }),
    });
    if (res.ok) {
      setMessage("✅ Student updated!");
      setMessageType("success");
      setIsEditing(false); setEditId(null); setStudentName(''); setStudentAge(''); setCustomId('');
      fetchStudents(localStorage.getItem("currentUserId"));
    } else {
      setMessage("❌ Failed to update.");
      setMessageType("error");
    }
  };
  // --- GROUP COURSES BY CATEGORY (Optional) ---
    const groupedCourses = courses.reduce((acc, course) => {
      const cat = course.category || "General"; // Default to General if category is empty
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(course);
      return acc;
    }, {});

  // --- RENDER ---
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎓 Parent Dashboard</h1>
        <button onClick={() => { localStorage.removeItem("currentUserId"); window.location.href = "/login"; }} className={styles.logoutBtn}>Logout</button>
      </div>
      
      <div className={styles.grid}>
        {/* LEFT: FORM */}
        <div>
          <div className={styles.card}>
            <h3>{isEditing ? "📝 Edit Child" : "➕ Add a Child"}</h3>
            <form onSubmit={isEditing ? handleUpdate : handleAddStudent} className={styles.form}>
              <div>
                <label className={styles.label}>Student ID (Optional)</label>
                <input type="text" placeholder="e.g. 44432" value={customId} onChange={(e) => setCustomId(e.target.value)} className={styles.input} disabled={isEditing} style={isEditing ? {backgroundColor: '#e9ecef', cursor: 'not-allowed'} : {}} />
              </div>
              <div>
                <label className={styles.label}>Name</label>
                <input type="text" placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>Age</label>
                <input type="number" placeholder="Age" value={studentAge} onChange={(e) => setStudentAge(e.target.value)} className={styles.input} />
              </div>
              <button type="submit" className={styles.addBtn} style={{ backgroundColor: isEditing ? '#ffcc00' : '#0070f3', color: isEditing ? 'black' : 'white' }}>
                {isEditing ? "Update Student" : "Add Student"}
              </button>
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(false); setStudentName(''); setStudentAge(''); setCustomId(''); setMessage(''); }} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}>Cancel Edit</button>
              )}
            </form>
            {message && <div className={`${styles.messageBox} ${styles[messageType]}`}>{message}</div>}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {students.map((student) => (
                    <div key={student.id} className={styles.studentItem}>
                      
                      {/* Header: Name and ID */}
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div>
                          <div className={styles.studentName}>{student.name}</div>
                          <div className={styles.studentDetails}>
                            ID: <span className={styles.idBadge}>{student.id}</span>
                            <span style={{ marginLeft: '15px' }}>Age: {student.age || 'N/A'}</span>
                          </div>
                        </div>
                        {/* Actions (Edit/Delete) */}
                        <div className={styles.actions}>
                          <button onClick={() => handleEdit(student)} className={styles.editBtn}>Edit</button>
                          <button onClick={() => handleDelete(student.id)} className={styles.deleteBtn}>Delete</button>
                        </div>
                      </div>

                      {/* NEW: ENROLLED CLASSES LIST */}
                      {student.enrollments && student.enrollments.length > 0 && (
                        <div className={styles.enrolledList}>
                          <strong style={{fontSize:'12px', color:'#555'}}>MY CLASSES:</strong>
                          {student.enrollments.map((enrollment) => (
                            <div key={enrollment.id} className={styles.enrolledItem}>
                              <span>
                                {enrollment.course.title}
                                {/* SHOW BADGE */}
                                <span className={`${styles.badge} ${enrollment.status === 'APPROVED' ? styles.badgeApproved : styles.badgePending}`}>
                                  {enrollment.status}
                                </span>
                              </span>

                              {/* SHOW LINK ONLY IF APPROVED */}
                              {enrollment.status === 'APPROVED' ? (
                                enrollment.course.zoomLink ? (
                                  <a href={enrollment.course.zoomLink} target="_blank" className={styles.zoomLink}>Join Zoom 🎥</a>
                                ) : (
                                  <span style={{color:'#666', fontSize:'12px'}}>No Link Set</span>
                                )
                              ) : (
                                <span className={styles.lockedMessage}>🔒 Waiting for Admin</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
      </div>

      <div className={styles.courseSection}>
  <h2>📚 Available Courses</h2>
  
        {Object.keys(groupedCourses).map(category => (
          <div key={category} style={{ marginBottom: '30px' }}>
            <h3 className={styles.categoryHeader}>{category}</h3> 
            <div className={styles.courseGrid}>
              {groupedCourses[category].map(course => (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.courseTitle}>{course.title}</div>
                  <p className={styles.courseDesc}>{course.description}</p>
                  
                  <form onSubmit={(e) => handleEnroll(e, course)} className={styles.enrollRow}>
                    <select name="studentId" className={styles.studentSelect} required>
                      <option value="">Select Child...</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
                      ))}
                    </select>
                    <button type="submit" className={styles.enrollBtn}>Enroll</button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}