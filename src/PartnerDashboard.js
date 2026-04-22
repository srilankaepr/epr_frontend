import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import bgImage from './assets/copartner.jpg';
import API from './api';

const CoPartnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalQR: 0, pending: 0, collected: 0, myCollected: 0 });
  const [recentCollected, setRecentCollected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // ✅ Screen එකේ පළල අනුව Styles වෙනස් කිරීමට
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userName = localStorage.getItem('userName') || 'Partner';
  const partnerId = localStorage.getItem('coPartnerId') || 'N/A';

  const fetchDashboardData = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const res = await API.get('/qr/dashboard'); 
      const data = res.data; 
      setStats({
        totalQR: data.totalQR || 0,
        pending: data.pending || 0,
        collected: data.collected || 0,
        myCollected: data.myCollected || 0
      });
      const allRequests = data.recentCollected || [];
      setRecentCollected(allRequests);
      const pendingRequests = allRequests.filter(req => req.status && req.status.toString().toLowerCase() === 'pending');

      pendingRequests.forEach(req => {
        const isAlreadyInList = notifications.some(n => n.requestId === req._id);
        if (!isAlreadyInList) {
          setNotifications(prev => {
            if (prev.some(p => p.requestId === req._id)) return prev;
            return [{
              id: Date.now() + Math.random(),
              requestId: req._id,
              message: {
                name: req.cuName,
                address: req.cuAddress || 'No Address Provided',
                phone: req.cuPhone || 'No Phone',
                product: req.cuProduct,
                date: new Date(req.requestedAt).toLocaleDateString(),
                time: new Date(req.requestedAt).toLocaleTimeString()
              }
            }, ...prev];
          });
        }
      });

      setNotifications(prev => prev.filter(n => pendingRequests.some(r => r._id === n.requestId)));
      setRecentCollected(allRequests);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      if (!isAuto) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 120000); 
    return () => clearInterval(interval);
  }, []);

  const formatCollectedTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = () => {
    if (window.confirm("Do you want to logout?")) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner}></div>
        <p style={{ letterSpacing: '2px', fontSize: '14px', fontWeight: 'bold' }}>ESTABLISHING SECURE CONNECTION...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const myRecords = recentCollected.filter(req => req.cpId === partnerId);
  const lifetimeCount = myRecords.length;
  const todayCount = myRecords.filter(req => new Date(req.collectedAt).toDateString() === new Date().toDateString()).length;

  return (
    <div style={styles.container}>
      {/* Header Section - Responsive */}
      <div style={{...styles.header, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0'}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '15px' : '25px', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={styles.logoContainer}>
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{...styles.headerTitle, fontSize: isMobile ? '20px' : '28px', textAlign: isMobile ? 'center' : 'left'}}>
            EPR Co-Partner Dashboard
          </h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Welcome Section - Responsive */}
      <div style={{...styles.welcomeCard, flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left'}}>
        <div style={styles.welcomeLeft}>
          <h2 style={{...styles.welcomeTitle, fontSize: isMobile ? '24px' : '32px'}}>
            Hello, <span style={styles.highlightText}>{userName}</span> 
          </h2>
          <p style={styles.welcomeSub}>Ready to make a difference by collecting more recyclables today?</p>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: isMobile ? '20px' : '0' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <div onClick={() => setShowNotifications(!showNotifications)} style={styles.bellIcon}>
              <span style={{ filter: 'grayscale(1) brightness(1.8)' }}>🔔</span>
              {notifications.length > 0 && <span style={styles.notifBadge}>{notifications.length}</span>}
            </div>
            {showNotifications && (
              <div style={{...styles.notifDropdown, width: isMobile ? '300px' : '380px', right: isMobile ? '-50px' : '0'}}>
                <h4 style={{ color: '#fff', marginBottom: '15px' }}>Alert Center</h4>
                {notifications.length === 0 ? <p style={{ color: '#555' }}>No pending requests.</p> : 
                  notifications.map(n => (
                    <div key={n.id} style={styles.notifItem}>
                      <div style={{ color: '#2ecc71', fontWeight: 'bold' }}>{n.message.name}</div>
                      <div style={{ fontSize: '11px', color: '#bbb' }}>{n.message.product} - {n.message.phone}</div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <div style={styles.idBadge}>
            <span style={styles.idLabel}>PARTNER ID</span>
            <span style={styles.idValue}>{partnerId}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div style={{ ...styles.statsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div style={styles.statCard}><h3 style={{ color: '#3498db' }}>Total QR</h3><p style={styles.statNum}>{stats.totalQR}</p></div>
        <div style={styles.statCard}><h3 style={{ color: '#f1c40f' }}>Pending</h3><p style={styles.statNum}>{stats.pending}</p></div>
        <div style={styles.statCard}><h3 style={{ color: '#2ecc71' }}>Collected</h3><p style={styles.statNum}>{stats.collected}</p></div>
        <div style={{...styles.statCard, border: '1px solid #9b59b6'}}>
          <h3 style={{ color: '#aaa', fontSize: '14px' }}>My Collections</h3>
          <p style={styles.statNum}>{lifetimeCount}</p>
          <span style={{color: '#2ecc71', fontSize: '12px'}}>Today: {todayCount}</span>
        </div>
      </div>

      {/* Quick Collect Button */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button onClick={() => navigate('/co-partner/scan')} style={{...styles.mainCollectBtn, width: isMobile ? '100%' : 'auto'}}>
          Collect New (Scan QR)
        </button>
      </div>

      {/* Tabs - Responsive */}
      <div style={{ ...styles.tabContainer, flexDirection: isMobile ? 'column' : 'row' }}>
        <button onClick={() => setActiveTab('summary')} style={activeTab === 'summary' ? styles.activeTab : styles.inactiveTab}>Pending Requests</button>
        <button onClick={() => setActiveTab('my_details')} style={activeTab === 'my_details' ? styles.activeTab : styles.inactiveTab}>My Collection List</button>
      </div>

      {/* Table Section - Responsive Scroll */}
      <div style={styles.tableWrapper}>
        {activeTab === 'summary' ? (
          <table style={styles.table}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1c40f' }}>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Product</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>{n.message.name}</td>
                  <td style={{...styles.td, color: '#f1c40f'}}>{n.message.phone}</td>
                  <td style={styles.td}>{n.message.product}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={{ borderBottom: '2px solid #2ecc71' }}>
                <th style={styles.th}>QR ID</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {myRecords.map((r, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>{r.qrId}</td>
                  <td style={styles.td}>{r.cuProduct}</td>
                  <td style={styles.td}>{formatCollectedTime(r.collectedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', width: '100%', backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${bgImage})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', color: '#fff', padding: '20px', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #222', position: 'sticky', top: 0, zIndex: 100, borderRadius: '0 0 15px 15px' },
  logoContainer: { width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #2ecc71', background: '#fff' },
  headerTitle: { margin: 0, background: 'linear-gradient(90deg, #2ecc71, #27ae60)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' },
  logoutBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #e74c3c, #c0392b)', border: 'none', borderRadius: '50px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  welcomeCard: { background: 'rgba(255, 255, 255, 0.05)', padding: '25px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', border: '1px solid rgba(46, 204, 113, 0.2)', backdropFilter: 'blur(15px)' },
  welcomeTitle: { fontWeight: 'bold', color: '#fff', margin: '0 0 5px 0' },
  highlightText: { color: '#2ecc71', textTransform: 'capitalize' },
  welcomeSub: { color: '#aaa', fontSize: '14px', margin: 0 },
  bellIcon: { fontSize: '28px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex' },
  notifBadge: { position: 'absolute', top: '-5px', right: '-5px', background: '#cc1010', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notifDropdown: { position: 'absolute', top: '50px', background: '#111', border: '1px solid #2ecc71', borderRadius: '15px', padding: '15px', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  notifItem: { padding: '10px', borderBottom: '1px solid #222' },
  idBadge: { background: '#1a1a1a', padding: '10px 20px', borderRadius: '12px', border: '1px solid #2ecc71', textAlign: 'center' },
  idLabel: { color: '#2ecc71', fontSize: '9px', letterSpacing: '1px' },
  idValue: { color: '#fff', fontSize: '14px', fontWeight: 'bold' },
  statsGrid: { display: 'grid', gap: '20px', marginBottom: '40px' },
  statCard: { background: 'rgba(255, 255, 255, 0.05)', borderRadius: '15px', padding: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' },
  statNum: { fontSize: '36px', fontWeight: 'bold', margin: '10px 0' },
  mainCollectBtn: { padding: '15px 40px', background: 'linear-gradient(135deg, #2ecc71, #27ae60)', border: 'none', borderRadius: '12px', color: '#000', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 15px rgba(46,204,113,0.3)' },
  tabContainer: { display: 'flex', gap: '15px', marginBottom: '20px' },
  activeTab: { padding: '10px 20px', background: '#2ecc71', color: '#000', borderRadius: '8px', border: 'none', fontWeight: 'bold', flex: 1 },
  inactiveTab: { padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', border: '1px solid #444', flex: 1 },
  tableWrapper: { overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', padding: '10px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '500px' },
  th: { padding: '12px', textAlign: 'left', color: '#888', fontSize: '13px' },
  td: { padding: '12px', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  loadingScreen: { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: '#2ecc71' },
  spinner: { width: '40px', height: '40px', border: '4px solid rgba(46, 204, 113, 0.1)', borderTop: '4px solid #2ecc71', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }
};

export default CoPartnerDashboard;