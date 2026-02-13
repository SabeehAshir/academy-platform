"use client";
import { useState, useEffect } from 'react';
import styles from './dashboard.module.css'; 

export default function Dashboard() {
  // --- STATE ---
  const [formData, setFormData] = useState({
    studentId: '', firstName: '', surname: '', age: '', email: '', jamat: '', city: '', schoolYear: ''
  });
  const [accountProfile, setAccountProfile] = useState({ name: '' });
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // --- USE EFFECT ---
  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) {
      window.location.href = "/login";
    } else {
      fetchProfile(userId);
      fetchStudents(userId);
      fetchCourses(); 
    }
  }, []);

  // --- FETCH PROFILE (Just to get the name for the header!) ---
  const fetchProfile = async (userId) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAccountProfile({ name: data.name || '' });
      }
    } catch (error) { console.error("Failed to load profile"); }
  };

  // --- FETCH STUDENTS ---
  const fetchStudents = async (parentId) => {
    try {
      const res = await fetch(`/api/students?parentId=${parentId}`);
      if (res.ok) setStudents(await res.json());
    } catch (error) { console.error("Failed to load students"); } 
    finally { setLoading(false); }
  };

  // --- FETCH COURSES ---
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) setCourses(await res.json());
    } catch (error) { console.error("Failed to load courses"); }
  };

  // --- ENROLL STUDENT ---
  const handleEnroll = async (e, course) => {
    e.preventDefault();
    const studentId = e.target.studentId.value;
    const selectedStudent = students.find(s => s.id === studentId);

    if (!selectedStudent) {
      alert("Please select a student!");
      return;
    }

    if (selectedStudent.age && (selectedStudent.age < course.minAge || selectedStudent.age > course.maxAge)) {
      alert(`⚠️ Age mismatch! This course is for ages ${course.minAge}-${course.maxAge}.`);
      return;
    }

    const res = await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, courseId: course.id }),
    });

    const data = await res.json();
    if (res.ok) alert("🎉 Enrollment Successful!");
    else alert("⚠️ " + (data.error || "Enrollment failed"));
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
      body: JSON.stringify({ ...formData, parentId }), 
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`✅ Success! Added ${formData.firstName}`);
      setMessageType('success');
      setFormData({ studentId: '', firstName: '', surname: '', age: '', email: '', jamat: '', city: '', schoolYear: '' });
      fetchStudents(parentId);
    } else {
      setMessage(`⚠️ ${data.error || "Failed to add student."}`);
      setMessageType('error');
    }
  };

  // --- DELETE STUDENT ---
  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchStudents(localStorage.getItem("currentUserId"));
  };

  // --- EDIT STUDENT ---
  const handleEdit = (student) => {
    setIsEditing(true);
    setEditId(student.id);
    setFormData({
      studentId: student.studentId || '',
      firstName: student.firstName || '',
      surname: student.surname || '',
      age: student.age || '',
      email: student.email || '',
      jamat: student.jamat || '',
      city: student.city || '',
      schoolYear: student.schoolYear || ''
    });
    setMessage("Editing Mode enabled.");
    setMessageType("info");
  };

  // --- UPDATE STUDENT ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/students', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, ...formData }),
    });
    if (res.ok) {
      setMessage("✅ Student updated!");
      setMessageType("success");
      setIsEditing(false); 
      setEditId(null); 
      setFormData({ studentId: '', firstName: '', surname: '', age: '', email: '', jamat: '', city: '', schoolYear: '' });
      fetchStudents(localStorage.getItem("currentUserId"));
    } else {
      setMessage("❌ Failed to update.");
      setMessageType("error");
    }
  };

  // --- GROUP COURSES ---
  const groupedCourses = courses.reduce((acc, course) => {
    const cat = course.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {});

  // --- RENDER ---
  return (
    <div className={styles.container}>
      
      {/* 1. DYNAMIC HEADER */}
      <div className={styles.header}>
        <h1>🎓 {accountProfile.name ? `${accountProfile.name.split(' ')[0]}'s Dashboard` : 'Dashboard'}</h1>
        
        <div className={styles.headerActions}>
          <button onClick={() => { localStorage.removeItem("currentUserId"); window.location.href = "/login"; }} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD MAIN GRID */}
      <div className={styles.grid}>
        
        {/* LEFT: FORM */}
        <div>
          <div className={styles.card}>
            <h3>{isEditing ? "📝 Edit Student" : "➕ Add a Student"}</h3>
            <form onSubmit={isEditing ? handleUpdate : handleAddStudent} className={styles.form}>
              
              <div className={styles.inputRowFirst}>
                <input type="text" placeholder="First Name *" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required className={`${styles.input} ${styles.flexInput}`} />
                <input type="text" placeholder="Surname *" value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} required className={`${styles.input} ${styles.flexInput}`} />
              </div>

              <div className={styles.inputRow}>
                <input type="email" placeholder="Student Email (Optional)" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`${styles.input} ${styles.flexInput}`} />
                <input type="text" placeholder="Jamat" value={formData.jamat} onChange={(e) => setFormData({...formData, jamat: e.target.value})} className={`${styles.input} ${styles.flexInput}`} />
                <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={`${styles.input} ${styles.flexInput}`} />
              </div>

              <div className={styles.inputRow}>
                <input type="text" placeholder="School Year (e.g. Year 10)" value={formData.schoolYear} onChange={(e) => setFormData({...formData, schoolYear: e.target.value})} className={`${styles.input} ${styles.flexInput}`} />
                <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className={`${styles.input} ${styles.smallInput}`} />
                <input type="text" placeholder="Student ID (Optional)" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} disabled={isEditing} className={`${styles.input} ${styles.flexInput} ${isEditing ? styles.disabledInput : ''}`} />
              </div>

              <button type="submit" className={`${styles.addBtn} ${styles.fullWidthBtn} ${isEditing ? styles.updateModeBtn : ''}`}>
                {isEditing ? "Update Student" : "Register Student"}
              </button>
              
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(false); setFormData({ studentId: '', firstName: '', surname: '', age: '', email: '', jamat: '', city: '', schoolYear: '' }); setMessage(''); }} className={styles.cancelBtn}>
                  Cancel Edit
                </button>
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
            <p className={styles.emptyState}>No students added yet.</p>
          ) : (
            <div className={styles.studentListContainer}>
              {students.map((student) => (
                <div key={student.id} className={styles.studentItem}>
                  
                  <div className={styles.studentHeaderRow}>
                    <div>
                      <div className={styles.studentName}>{student.firstName} {student.surname}</div>
                      <div className={styles.studentDetails}>
                        ID: <span className={styles.idBadge}>{student.studentId || 'N/A'}</span>
                        <span className={styles.detailSpacing}>Age: {student.age || 'N/A'}</span>
                        <span className={`${styles.detailSpacing} ${styles.detailGray}`}>{student.schoolYear || ''}</span>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <button onClick={() => handleEdit(student)} className={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(student.id)} className={styles.deleteBtn}>Delete</button>
                    </div>
                  </div>

                  {student.enrollments && student.enrollments.length > 0 && (
                    <div className={styles.enrolledList}>
                      <strong className={styles.noLinkText}>MY CLASSES:</strong>
                      {student.enrollments.map((enrollment) => (
                        <div key={enrollment.id} className={styles.enrolledItem}>
                          <span>
                            {enrollment.course.title}
                            <span className={`${styles.badge} ${enrollment.status === 'APPROVED' ? styles.badgeApproved : styles.badgePending}`}>
                              {enrollment.status}
                            </span>
                          </span>

                          {enrollment.status === 'APPROVED' ? (
                            enrollment.course.zoomLink ? (
                              <a href={enrollment.course.zoomLink} target="_blank" className={styles.zoomLink}>Join Zoom 🎥</a>
                            ) : (
                              <span className={styles.noLinkText}>No Link Set</span>
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

      {/* 3. COURSE SECTION */}
      <div className={styles.courseSection}>
        <h2>📚 Available Courses</h2>
        {Object.keys(groupedCourses).map(category => (
          <div key={category} className={styles.categoryWrapper}> 
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
                        <option key={student.id} value={student.id}>{student.firstName}</option>
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