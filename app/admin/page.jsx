"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <--- NEW IMPORT
import styles from './admin.module.css';

export default function AdminDashboard() {
  const router = useRouter(); // <--- Setup Router
  
  // --- STATE ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Loading covers the security check too
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', minAge: 5, maxAge: 18, category: 'General', zoomLink: ''
  });

  // --- SECURITY CHECK & DATA LOAD ---
  useEffect(() => {
    const checkAccessAndLoad = async () => {
      const userId = localStorage.getItem("currentUserId");

      // 1. No ID? Go to login.
      if (!userId) {
        router.push('/login');
        return;
      }

      // 2. Ask API: Is this user an Admin?
      const roleRes = await fetch(`/api/check-role?userId=${userId}`);
      const roleData = await roleRes.json();

      if (roleData.role !== 'ADMIN') {
        alert("⛔ Access Denied: Admins Only.");
        router.push('/dashboard'); // Kick them out!
        return;
      }

      // 3. If we are still here, we are an Admin. Load the data.
      fetchPendingRequests();
    };

    checkAccessAndLoad();
  }, []);

  // --- FETCH DATA ---
  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/admin/pending');
      if (res.ok) setRequests(await res.json());
    } catch (error) { console.error("Failed to load"); } 
    finally { setLoading(false); }
  };

  // --- HANDLE APPROVALS ---
  const handleDecision = async (enrollmentId, status) => {
    setRequests(prev => prev.filter(req => req.id !== enrollmentId)); 
    await fetch('/api/admin/enrollment', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, status }),
    });
  };

  // --- CREATE COURSE ---
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/courses/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse),
    });

    if (res.ok) {
      alert("✅ Course Created Successfully!");
      setShowCreateForm(false);
      setNewCourse({ title: '', description: '', minAge: 5, maxAge: 18, category: 'General', zoomLink: '' });
    } else {
      alert("❌ Failed to create course");
    }
  };

  // --- IF LOADING, SHOW NOTHING (Or a spinner) ---
  if (loading) {
    return <div style={{padding:'50px', textAlign:'center'}}>Checking Security clearance... 🕵️‍♂️</div>;
  }

  // --- RENDER ADMIN PAGE ---
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🛡️ Admin Command Center</h1>
        <div style={{display:'flex', gap:'10px'}}>
             <button onClick={() => setShowCreateForm(!showCreateForm)} className={styles.approveBtn} style={{backgroundColor:'#0070f3'}}>
              + New Course
            </button>
            <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
              Back to Dashboard
            </button>
        </div>
      </div>

      {/* --- MODAL: CREATE COURSE --- */}
      {showCreateForm && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeIcon} onClick={() => setShowCreateForm(false)}>✕</button>

            <h2 style={{marginTop:0}}>➕ Create New Class</h2>
            <p style={{color:'#666', fontSize:'14px', marginBottom:'20px'}}>Add a new course to the academy catalog.</p>

            <form onSubmit={handleCreateCourse}>
              <div className={styles.formGroup}>
                <label>Course Title</label>
                <input className={styles.input} placeholder="e.g. Advanced Chemistry" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea className={styles.input} placeholder="Brief description..." value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} rows={3} />
              </div>

              <div style={{display:'flex', gap:'15px'}}>
                <div className={styles.formGroup} style={{flex:1}}>
                  <label>Min Age</label>
                  <input type="number" className={styles.input} value={newCourse.minAge} onChange={e => setNewCourse({...newCourse, minAge: +e.target.value})} />
                </div>
                <div className={styles.formGroup} style={{flex:1}}>
                  <label>Max Age</label>
                  <input type="number" className={styles.input} value={newCourse.maxAge} onChange={e => setNewCourse({...newCourse, maxAge: +e.target.value})} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                <select className={styles.input} value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})}>
                  <option value="General">General</option>
                  <option value="Keystage 2">Keystage 2</option>
                  <option value="Keystage 3">Keystage 3</option>
                  <option value="A-Levels">A-Levels</option>
                  <option value="Languages">Languages</option>
                  <option value="Religious Knowledge">Religious Knowledge</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Zoom Link</label>
                <input className={styles.input} placeholder="https://zoom.us/j/..." value={newCourse.zoomLink} onChange={e => setNewCourse({...newCourse, zoomLink: e.target.value})} />
              </div>

              <button type="submit" className={styles.approveBtn} style={{width:'100%', marginTop:'10px'}}>Publish Course</button>
            </form>
          </div>
        </div>
      )}

      <h2>Pending Approvals</h2>
      
      {requests.length === 0 ? <p className={styles.emptyState}>All caught up! 🎉</p> : (
        <div>
          {requests.map((req) => (
            <div key={req.id} className={styles.requestCard}>
              <div className={styles.infoGroup}>
                <span className={styles.studentName}>{req.student.name}</span>
                <span className={styles.courseName}>{req.course.title}</span>
                <span className={styles.parentInfo}>{req.student.parent?.email}</span>
              </div>
              <div className={styles.actions}>
                <button onClick={() => handleDecision(req.id, 'REJECTED')} className={styles.rejectBtn}>Reject</button>
                <button onClick={() => handleDecision(req.id, 'APPROVED')} className={styles.approveBtn}>Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}