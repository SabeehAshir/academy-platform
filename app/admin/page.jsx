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

  const [showDirectory, setShowDirectory] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null); 
  const [allStudents, setAllStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- SECURITY CHECK & DATA LOAD ---
  useEffect(() => {
    const checkAccessAndLoad = async () => {
      const userId = localStorage.getItem("currentUserId");
      if (!userId) return router.push('/login');

      const roleRes = await fetch(`/api/check-role?userId=${userId}`);
      const roleData = await roleRes.json();

      if (roleData.role !== 'ADMIN') {
        alert("⛔ Access Denied: Admins Only.");
        return router.push('/dashboard'); 
      }

      await fetchPendingRequests();
      await fetchAllStudents(); 
    };
    checkAccessAndLoad();
  }, [router]);

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/admin/pending');
      if (res.ok) setRequests(await res.json());
    } catch (error) { console.error("Failed to load requests"); } 
    finally { setLoading(false); }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await fetch('/api/admin/students');
      if (res.ok) setAllStudents(await res.json());
    } catch (error) { console.error("Failed to load students"); }
  };

  const handleDecision = async (enrollmentId, status) => {
    setRequests(prev => prev.filter(req => req.id !== enrollmentId)); 
    await fetch('/api/admin/enrollment', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, status }),
    });
  };

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
    } else alert("❌ Failed to create course");
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm("Are you sure? This removes the student and all their classes.")) return;
    const res = await fetch(`/api/admin/students/delete?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAllStudents(); 
      setViewingStudent(null); 
    } else alert("Failed to delete student.");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUserId");
    router.push('/login');
  };

  // Safe Search Filter
  const filteredStudents = allStudents.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();
    const nameMatch = `${s.firstName} ${s.surname}`.toLowerCase().includes(term);
    const idMatch = s.studentId && String(s.studentId).includes(term);
    return nameMatch || idMatch;
  });

  if (loading) return <div className={styles.loadingState}>Checking Security clearance... 🕵️‍♂️</div>;

  return (
    <div className={styles.container}>
      
      {/* --- COMMAND CENTER HEADER --- */}
      <div className={styles.header}>
        <h1 className={styles.title}>🛡️ Admin </h1>
        <div className={styles.headerNav}>
            <button onClick={() => router.push('/dashboard')} className={styles.backBtn}>
              Parent View
            </button>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
        </div>
      </div>

      {/* --- QUICK ACTIONS ROW --- */}
      <div className={styles.actionRow}>
        <button onClick={() => setShowCreateForm(true)} className={styles.newCourseBtn}>
          ➕ New Course
        </button>
        <button onClick={() => setShowDirectory(true)} className={styles.directoryBtn}>
          👥 Student Directory
        </button>
      </div>

      {/* --- MAIN PAGE: PENDING APPROVALS ONLY --- */}
      <h2 className={styles.modalTitle}>Pending Approvals</h2>
      {requests.length === 0 ? <p className={styles.emptyState}>All caught up! 🎉</p> : (
        <div className={styles.pendingContainer}>
          {requests.map((req) => (
            <div key={req.id} className={styles.requestCard}>
              <div className={styles.infoGroup}>
                <span className={styles.studentName}>{req.student.firstName} {req.student.surname}</span>
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

      {/* --- MODAL 1: CREATE COURSE --- */}
      {showCreateForm && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>➕ Create New Class</h2>
              <button className={styles.closeIcon} onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateCourse}>
              <div className={styles.formGroup}>
                <label>Course Title</label>
                <input className={styles.input} value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea className={styles.input} value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} rows={3} />
              </div>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.flex1}`}>
                  <label>Min Age</label>
                  <input type="number" className={styles.input} value={newCourse.minAge} onChange={e => setNewCourse({...newCourse, minAge: +e.target.value})} />
                </div>
                <div className={`${styles.formGroup} ${styles.flex1}`}>
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
                <input className={styles.input} value={newCourse.zoomLink} onChange={e => setNewCourse({...newCourse, zoomLink: e.target.value})} />
              </div>
              <button type="submit" className={`${styles.approveBtn} ${styles.submitFullBtn}`}>Publish Course</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: STUDENT DIRECTORY --- */}
      {showDirectory && (
        <div className={styles.modalOverlay} onClick={() => setShowDirectory(false)}>
          <div className={styles.directoryModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>👥 Student Directory</h2>
              <button className={styles.closeIcon} onClick={() => setShowDirectory(false)}>✕</button>
            </div>
            
            <input 
              type="text" 
              placeholder="🔍 Search by Student ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${styles.input} ${styles.searchInput}`}
            />

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Parent Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td className={styles.tdBold}>{student.studentId || "N/A"}</td>
                    <td>{student.firstName} {student.surname}</td>
                    <td className={styles.tdGray}>{student.parent?.name || "Unknown"}</td>
                    <td>
                      <button className={styles.viewBtn} onClick={() => setViewingStudent(student)}>View</button>
                      <button className={styles.deleteBtn} onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL 3: FULL STUDENT PROFILE --- */}
      {viewingStudent && (
        <div className={styles.modalOverlay} onClick={() => setViewingStudent(null)}>
          <div className={`${styles.modalContent} ${styles.profileModalContent}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>📄 Full Profile</h2>
              <button className={styles.closeIcon} onClick={() => setViewingStudent(null)}>✕</button>
            </div>

            <div className={styles.profileGrid}>
              
              {/* Box 1: Student Details */}
              <div className={styles.profileBox}>
                <h4>Student Info</h4>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Name:</span> <span className={styles.detailValue}>{viewingStudent.firstName} {viewingStudent.surname}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Student ID:</span> <span className={styles.detailValue}>{viewingStudent.studentId || "N/A"}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Age:</span> <span className={styles.detailValue}>{viewingStudent.age || "N/A"}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Year:</span> <span className={styles.detailValue}>{viewingStudent.schoolYear || "N/A"}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Student Email:</span> <span className={styles.detailValue}>{viewingStudent.email || "N/A"}</span></div>
              </div>

              {/* Box 2: Location & Contact */}
              <div className={styles.profileBox}>
                <h4>Account / Parent Info</h4>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Parent Name:</span> <span className={styles.detailValue}>{viewingStudent.parent?.name || "N/A"}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Phone:</span> <span className={styles.detailValue}>{viewingStudent.parent?.phone || "N/A"}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Login Email:</span> <span className={styles.detailValue}>{viewingStudent.parent?.email || "N/A"}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>Jamat:</span> <span className={styles.detailValue}>{viewingStudent.jamat || "N/A"}</span></div>
                <div className={styles.detailRow}><span className={styles.detailLabel}>City:</span> <span className={styles.detailValue}>{viewingStudent.city || "N/A"}</span></div>
              </div>

            </div>

            {/* Enrolled Classes summary at the bottom */}
            <div className={styles.enrollmentsSummary}>
              <h4 className={styles.summaryTitle}>Current Enrollments</h4>
              {viewingStudent.enrollments?.length === 0 ? <span className={styles.emptyText}>No classes enrolled.</span> : 
                viewingStudent.enrollments.map(enr => (
                  <div key={enr.id} className={styles.enrollmentItem}>
                    • {enr.course.title} <strong>({enr.status})</strong>
                  </div>
                ))
              }
            </div>

          </div>
        </div>
      )}

    </div>
  );
}