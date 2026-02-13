"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const router = useRouter(); 
  
  // --- STATE ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); 
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', minAge: 5, maxAge: 18, category: 'General', zoomLink: ''
  });

  // NEW: State for the Student Directory
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- SECURITY CHECK & DATA LOAD ---
  useEffect(() => {
    const checkAccessAndLoad = async () => {
      const userId = localStorage.getItem("currentUserId");

      if (!userId) {
        router.push('/login');
        return;
      }

      const roleRes = await fetch(`/api/check-role?userId=${userId}`);
      const roleData = await roleRes.json();

      if (roleData.role !== 'ADMIN') {
        alert("⛔ Access Denied: Admins Only.");
        router.push('/dashboard'); 
        return;
      }

      // If Admin, load BOTH pending requests AND all students
      await fetchPendingRequests();
      await fetchAllStudents(); // <-- NEW
    };

    checkAccessAndLoad();
  }, []);

  // --- FETCH DATA ---
  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/admin/pending');
      if (res.ok) setRequests(await res.json());
    } catch (error) { console.error("Failed to load requests"); } 
    finally { setLoading(false); }
  };

  // NEW: Fetch All Students
  const fetchAllStudents = async () => {
    try {
      const res = await fetch('/api/admin/students');
      if (res.ok) setAllStudents(await res.json());
    } catch (error) { console.error("Failed to load students"); }
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

  // NEW: DELETE STUDENT
  const handleDeleteStudent = async (id) => {
    if (!confirm("Are you sure? This removes the student and all their classes.")) return;
    
    const res = await fetch(`/api/admin/students/delete?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAllStudents(); // Reload the list after deleting
    } else {
      alert("Failed to delete student.");
    }
  };

  
  // Filter Logic for Student Directory
  const filteredStudents = allStudents.filter(s => {
    const matchName = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    // Convert the ID to a string so .includes() doesn't crash
    const matchId = s.studentId && String(s.studentId).includes(searchTerm);
    
    return matchName || matchId;
  });
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

      {/* --- SECTION 1: PENDING APPROVALS --- */}
      <h2>Pending Approvals</h2>
      
      {requests.length === 0 ? <p className={styles.emptyState}>All caught up! 🎉</p> : (
        <div style={{marginBottom: '40px'}}>
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

      {/* --- SECTION 2: NEW STUDENT DIRECTORY & SEARCH --- */}
      <h2 style={{borderTop: '2px solid #eee', paddingTop: '30px'}}>Student Directory</h2>
      <p style={{color:'#666', marginBottom:'15px'}}>Search and manage all enrolled students.</p>
      
      <div style={{marginBottom: '20px'}}>
        <input 
          type="text" 
          placeholder="🔍 Search by Student ID (e.g. 66644) or Name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px'}}
        />
      </div>

      <div style={{background: 'white', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead style={{background: '#f8f9fa'}}>
            <tr style={{textAlign: 'left', borderBottom: '2px solid #eee'}}>
              <th style={{padding: '12px 15px'}}>ID</th>
              <th style={{padding: '12px 15px'}}>Name</th>
              <th style={{padding: '12px 15px'}}>Parent Email</th>
              <th style={{padding: '12px 15px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="4" style={{padding: '20px', textAlign: 'center', color: '#888'}}>No students found matching "{searchTerm}"</td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} style={{borderBottom: '1px solid #eee'}}>
                  <td style={{padding: '12px 15px', fontWeight: 'bold'}}>{student.studentId || "N/A"}</td>
                  <td style={{padding: '12px 15px'}}>{student.name}</td>
                  <td style={{padding: '12px 15px', color: '#666'}}>{student.parent?.email}</td>
                  <td style={{padding: '12px 15px'}}>
                    <button className={styles.editBtn}>Edit</button>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}