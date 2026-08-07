import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import { useAuth } from './AuthContext';
import API from './api';

const RecyclerDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchRecycleRequests();
    }, []);

    const fetchRecycleRequests = async () => {
        try {
            setLoading(true);
            // 🔄 Admin පැත්තේ තියෙන API එකම පාවිච්චි කර සියලුම රික්වෙස්ට්ස් ලබා ගැනීම
            const response = await API.get('/recycle-requests/all');
            setRequests(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching recycle requests:", error);
            alert("❌ Failed to load recycling requests.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRecycled = async (requestId) => {
        try {
            setActionLoading(requestId);
            const response = await API.put(`/recycler/complete/${requestId}`, {
                recycledBy: user?.officialEmail || user?.email,
                recyclerName: user?.companyName || "Recycler Facility"
            });

            if (response.status === 200) {
                alert("✅ Successfully marked as Recycled! Circular loop completed.");
                fetchRecycleRequests(); 
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("❌ Failed to update status.");
        } finally {
            setActionLoading(null);
        }
    };

    // 📊 සංඛ්‍යාලේඛන ගණනය කිරීම (Stats Calculation)
    const totalRequests = requests.length;
    const pendingCount = requests.filter(r => r.status !== 'Recycled').length;
    const completedCount = requests.filter(r => r.status === 'Recycled').length;

    return (
        <div style={styles.container}>
            <video autoPlay loop muted playsInline style={styles.videoBg}>
                <source src={earthVideo} type="video/mp4" />
            </video>
            <div style={styles.overlay}></div>

            <div style={styles.dashboardCard}>
                <div style={styles.headerArea}>
                    <div style={styles.logoFrame}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                    <h2 style={styles.title}>RECYCLER FACILITY DASHBOARD</h2>
                    <p style={styles.subText}>Welcome, {user?.companyName || user?.officialEmail || "Recycler Partner"}</p>
                </div>

                <div style={styles.actionsBar}>
                    <button onClick={fetchRecycleRequests} style={styles.refreshBtn}>🔄 Refresh Requests</button>
                    <button onClick={() => { logout(); navigate('/'); }} style={styles.logoutBtn}>🚪 Secure Logout</button>
                </div>

                {/* 📊 Summary Cards Grid */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <h4 style={styles.statTitle}>Total Queue</h4>
                        <p style={styles.statValue}>{totalRequests}</p>
                    </div>
                    <div style={styles.statCard}>
                        <h4 style={{ ...styles.statTitle, color: '#f39c12' }}>Pending Recycling</h4>
                        <p style={{ ...styles.statValue, color: '#f39c12' }}>{pendingCount}</p>
                    </div>
                    <div style={styles.statCard}>
                        <h4 style={{ ...styles.statTitle, color: '#2ecc71' }}>Completed Loop</h4>
                        <p style={{ ...styles.statValue, color: '#2ecc71' }}>{completedCount}</p>
                    </div>
                </div>

                <div style={styles.contentSection}>
                    <h3 style={styles.sectionTitle}>📦 Incoming Waste / QR Recycling Queue</h3>

                    {loading ? (
                        <p style={styles.infoText}>Loading pending recycling requests...</p>
                    ) : requests.length === 0 ? (
                        <p style={styles.infoText}>No pending recycling requests found in the queue.</p>
                    ) : (
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>QR ID</th>
                                        <th style={styles.th}>Product / Brand</th>
                                        <th style={styles.th}>Customer</th>
                                        <th style={styles.th}>Collected By</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((req) => (
                                        <tr key={req._id} style={styles.tr}>
                                            <td style={styles.td}><b>{req.qrId}</b></td>
                                            <td style={styles.td}>{req.cuProduct} ({req.cuBrand})</td>
                                            <td style={styles.td}>{req.cuCompany || req.cuName}</td>
                                            <td style={styles.td}>{req.collectedBy || "Collector Node"}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: req.status === 'Recycled' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(243, 156, 18, 0.2)',
                                                    color: req.status === 'Recycled' ? '#2ecc71' : '#f39c12'
                                                }}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {req.status !== 'Recycled' ? (
                                                    <button 
                                                        onClick={() => handleMarkAsRecycled(req._id)}
                                                        disabled={actionLoading === req._id}
                                                        style={styles.processBtn}
                                                    >
                                                        {actionLoading === req._id ? "PROCESSING..." : "♻️ Mark Recycled"}
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '13px' }}>✔ Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflowY: 'auto', backgroundColor: '#000', padding: '40px 20px', fontFamily: "'Inter', sans-serif" },
    videoBg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, filter: 'brightness(0.3)' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 2 },
    dashboardCard: { position: 'relative', zIndex: 3, width: '100%', maxWidth: '1050px', padding: '40px', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(35px)', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', color: '#fff' },
    headerArea: { textAlign: 'center', marginBottom: '25px' },
    logoFrame: { width: '80px', height: '80px', background: '#fff', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #2ecc71', boxShadow: '0 0 25px rgba(46, 204, 113, 0.4)' },
    logoImg: { width: '80%' },
    title: { fontSize: '22px', fontWeight: '900', letterSpacing: '2px', color: '#fff', margin: '0' },
    subText: { fontSize: '13px', color: '#2ecc71', marginTop: '8px', fontWeight: 'bold' },
    actionsBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    refreshBtn: { padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
    logoutBtn: { padding: '10px 20px', borderRadius: '10px', background: 'rgba(231, 76, 60, 0.2)', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' },
    statCard: { background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', borderRadius: '15px', textAlign: 'center' },
    statTitle: { fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
    statValue: { fontSize: '24px', fontWeight: '900', color: '#fff', margin: 0 },
    contentSection: { background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' },
    sectionTitle: { color: '#2ecc71', fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' },
    infoText: { color: '#aaa', textAlign: 'center', padding: '30px', fontSize: '14px' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    th: { padding: '12px', borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#aaa', fontSize: '12px', letterSpacing: '1px' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
    td: { padding: '15px 12px', color: '#ddd' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' },
    processBtn: { padding: '8px 14px', borderRadius: '8px', background: '#2ecc71', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxShadow: '0 0 15px rgba(46, 204, 113, 0.3)' }
};

export default RecyclerDashboard;