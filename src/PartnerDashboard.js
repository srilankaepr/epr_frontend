import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import bgImage from './assets/copartner.jpg';
import API from './api';

  const CoPartnerDashboard = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [stats, setStats] = useState({
    totalQR: 0,
    pending: 0,
    collected: 0,
    myCollected: 0
  });
  const [recentCollected, setRecentCollected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [activeTab, setActiveTab] = useState('summary');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);


  const userName = localStorage.getItem('userName') || 'Partner';
  const partnerId = localStorage.getItem('coPartnerId') || 'N/A';
  
useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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
        const pendingRequests = allRequests.filter(req => 
          req.status && req.status.toString().toLowerCase() === 'pending'
        );

        console.log("Pending Requests Found:", pendingRequests.length);

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


        setNotifications(prev => prev.filter(n => 
          pendingRequests.some(r => r._id === n.requestId)
        ));

        setRecentCollected(allRequests);
      
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      if (!isAuto) setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData(); 

    const interval = setInterval(() => {
      fetchDashboardData(true); 
    }, 120000); 

    return () => clearInterval(interval); 
  }, []); 


 const formatCollectedTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleString('en-US', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};
  const handleCollect = () => {
    navigate('/co-partner/scan');
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
    <div style={{height: '100vh',display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: '#2ecc71',  fontFamily: "'Poppins', sans-serif"
    }}>
    <div style={{ width: '50px', height: '50px',border: '5px solid rgba(46, 204, 113, 0.1)',borderTop: '5px solid #2ecc71',borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px'
    }}></div>
      
      <p style={{ letterSpacing: '2px', fontSize: '14px', fontWeight: 'bold' }}>
        ESTABLISHING SECURE CONNECTION...
      </p>

      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}

  // --- Tab Styles ---
  const tabStyle = {
    padding: '12px 30px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(46,204,113,0.3)',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    transition: '0.3s',
    fontSize: '16px',
    fontWeight: '500'
  };

  const activeTabStyle = {
    ...tabStyle,
    background: '#2ecc71',
    color: '#000',
    fontWeight: 'bold',
    boxShadow: '0 0 15px rgba(46,204,113,0.4)'
  };
  const myRecords = recentCollected.filter(req => req.cpId === partnerId);
  const lifetimeCount = myRecords.length;
  const today = new Date().toDateString();
  const todayCount = myRecords.filter(req => 
    new Date(req.collectedAt).toDateString() === today
  ).length;

const mySpecificCollected = myRecords.filter(req => {
  if (!searchTerm) return true;
  
  const search = searchTerm.toLowerCase();
  
  return (
    (req.qrId?.toLowerCase().includes(search)) || 
    (req.cuName?.toLowerCase().includes(search)) ||
    (req.cuProduct?.toLowerCase().includes(search))
  );
});

  // --- Collection Detailed Report  download
const downloadPDFReport = () => {
  const doc = new jsPDF();

  // 1. Header Background Banner (කොළ පාට තීරුවක්)
  doc.setFillColor(46, 204, 113);
  doc.rect(0, 0, 210, 40, 'F'); 

  // 2. Main Title (සුදු පාටින්)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('EPR SYSTEM', 14, 18);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Collection Detailed Report', 14, 28);

  // 3. Partner & Date Details (Header එක ඇතුළේ දකුණු පැත්තේ)
  doc.setFontSize(10);
  doc.text(`Partner ID: ${partnerId}`, 140, 18);
  doc.text(`Partner Name: ${userName}`, 140, 24);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 30);

  // 4. Data සකස් කිරීම
  const tableColumn = ["QR ID", "Product", "Brand", "Customer", "Phone", "Collected Date/Time"];
  const tableRows = myRecords.map(record => [
    record.qrId,
    record.cuProduct || 'N/A',
    record.cuBrand || 'N/A',
    record.cuName,
    record.cuPhone || 'N/A',
    formatCollectedTime(record.collectedAt)
  ]);

  // 5. Table එක ඇඳීම
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45, // Banner එකට පස්සේ පටන් ගන්න
    theme: 'grid',
    headStyles: { 
      fillColor: [39, 174, 96], // තද කොළ පැහැය
      fontSize: 10,
      halign: 'center',
      textColor: [255, 255, 255]
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 25 }, // QR ID
      1: { cellWidth: 30 }, // Product
      2: { cellWidth: 30 }, // Brand
      3: { cellWidth: 35 }, // Customer
      4: { cellWidth: 30 }, // Phone
      5: { cellWidth: 40 }  // Date/Time
    },
    margin: { top: 45 }
  });

  // 6. Footer (පිටු අංකය)
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, "center");
    doc.text('Confidential Collection Report - EPR System', 14, 290);
  }

  doc.save(`Collection_Report_${partnerId}.pdf`);
};
  
    // ---  New Pending Collection Requests report download

const downloadRecentTablePDF = () => {
    const doc = new jsPDF();
    
    // 1. Header Background Banner (කොළ පාට තීරුවක්)
    doc.setFillColor(46, 204, 113);
    doc.rect(0, 0, 210, 40, 'F'); 

    // 2. Logo එක ඇතුළත් කිරීම (ඔයාගේ logo එක image format එකක් නම්)
    // Logo එක පාවිච්චි කරනවා නම් පහත පේළිය පාවිච්චි කරන්න, නැත්නම් නම විතරක් දාමු
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('EPR SYSTEM', 14, 20); // මෙතනට ඔයාගේ ආයතනයේ නම දාන්න

    // 3. වාර්තාවේ නම සහ විස්තර
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Pending Requests Detailed Report', 14, 30);

    // 4. දකුණු පැත්තේ දිනය සහ වෙලාව
    doc.setFontSize(10);
    const dateStr = new Date().toLocaleString();
    doc.text(`Generated on: ${dateStr}`, 140, 30);

    // 5. දත්ත සකස් කිරීම
    const tableRows = notifications.map(n => [
        n.message.name,      // Customer Name
        n.message.phone,     // Phone Number
        n.message.address,   // Address
        n.message.product,   // Product
        n.message.date       // Requested Date
    ]);

    // 6. Table එක (startY එක 45 කළා banner එකට ඉඩ තියන්න)
    autoTable(doc, {
        head: [["Customer Name", "Phone Number", "Address", "Product", "Requested Date"]],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { 
            fillColor: [39, 174, 96], 
            fontSize: 10,
            halign: 'center',
            textColor: [255, 255, 255]
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 30 },
            2: { cellWidth: 50 },
            3: { cellWidth: 35 },
            4: { cellWidth: 30 }
        },
        styles: {
            fontSize: 9,
            overflow: 'linebreak'
        },
        margin: { top: 45 }
    });

    // 7. Footer (පිටු අංකය)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, "center");
    }

    doc.save(`Pending_Requests_${new Date().toLocaleDateString()}.pdf`);
};


return (
    <div style={styles.container}>
     {/* Header Section - Responsive Optimized */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '15px' : '15px 30px', 
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid rgba(46, 204, 113, 0.3)',
        borderRadius: '25px', 
        margin: isMobile ? '10px' : '20px 30px', 
        marginBottom: '30px',
        borderBottom: '1px solid rgba(46, 204, 113, 0.3)',
        position: 'relative', 
        top: isMobile ? '10px' : '20px',
        zIndex: 999999,
        gap: isMobile ? '15px' : '0' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '15px' : '25px',
          flexDirection: isMobile ? 'column' : 'row' 
        }}>
          <div style={{
            width: isMobile ? '70px' : '100px', 
            height: isMobile ? '70px' : '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #2ecc71',
            background: '#fff'
          }}>
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{
            margin: 0,
            fontSize: isMobile ? '20px' : '28px',
            textAlign: isMobile ? 'center' : 'left',
            background: 'linear-gradient(90deg, #2ecc71, #27ae60)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            EPR Co-Partner Dashboard
          </h1>
        </div>

        <button 
          onClick={handleLogout}
          style={{
            padding: isMobile ? '10px 20px' : '12px 30px',
            width: isMobile ? '100%' : 'auto', 
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            border: 'none',
            borderRadius: '50px',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(231,76,60,0.3)'
          }}
        >
          Logout
        </button>
      </div> 

      {/* Welcome Section */}
      <div style={styles.welcomeCard}>
        <div style={styles.welcomeLeft}>
          <h2 style={styles.welcomeTitle}>
            Hello, <span style={styles.highlightText}>{userName}</span> 

          </h2>
          <p style={styles.welcomeSub}>
            Ready to make a difference by collecting more recyclables today? Let's get started!
          </p>
        </div>

{/* --- Notification Bell Section --- */}
<div style={{ position: 'relative', marginRight: '30px', display: 'flex', alignItems: 'center', zIndex: 1000 }}>
  {/* Bell Icon */}
  <div 
    onClick={() => setShowNotifications(!showNotifications)} 
    style={{ 
        fontSize: '36px', 
        position: 'relative', 
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '10px',
        borderRadius: '12px',
        transition: '0.3s',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }}
    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(46, 204, 113, 0.15)'}
    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
  >
    <span style={{ filter: 'grayscale(1) brightness(1.8)' }}>🔔</span>
    {notifications.length > 0 && (
      <span style={{
        position: 'absolute', top: '2px', right: '2px',
        background: '#cc1010', color: '#ffffff', borderRadius: '50%',
        width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: '900',
        boxShadow: '0 0 10px rgba(46, 204, 113, 0.6)'
      }}>
        {notifications.length}
      </span>
    )}
  </div>

  {/* Dropdown Panel */}
{showNotifications && (
  <div style={{ 
      position: 'absolute', 
      top: '65px', 
      right: '0px', 
      width: '380px', 
      zIndex: 10001, 
      background: 'rgba(15, 15, 15, 0.98)', 
      border: '1px solid rgba(46, 204, 113, 0.3)', 
      borderRadius: '24px', 
      padding: '25px', 
      maxHeight: '550px', 
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.8)' 
  }}>
     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              Alert Center
          </h4>
        <div 
            onClick={() => setShowNotifications(false)}
            style={{ 
                color: '#555', cursor: 'pointer', fontSize: '12px', background: '#222', 
                width: '26px', height: '26px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', borderRadius: '50%', transition: '0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#fff'}
            onMouseOut={(e) => e.target.style.color = '#555'}
        >✕</div>
      </div>
      
      {notifications.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px', opacity: '0.3' }}>📁</div>
            <p style={{ fontSize: '14px', color: '#555' }}>All caught up! No pending requests.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(n => (
            <div key={n.id} style={{ 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: '16px', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: '0.2s ease',
              borderLeft: '4px solid #2ecc71'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#2ecc71', fontSize: '14px', fontWeight: '700' }}>{n.message.name}</span>
                <span style={{ color: '#444', fontSize: '10px', fontWeight: 'bold' }}>NEW</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ color: '#bbb', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ opacity: 0.5 }}>📍</span> {n.message.address}
                </div>
                <div style={{ color: '#bbb', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ opacity: 0.5 }}>📞</span> {n.message.phone}
                </div>
              </div>

              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                background: 'rgba(46, 204, 113, 0.1)', 
                borderRadius: '12px',
                fontSize: '13px',
                color: '#fff',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '16px' }}>📦</span> {n.message.product}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '10px', color: '#fffcfc', fontWeight: '700' }}>
                <span>📅 {n.message.date}</span>
                <span>{n.message.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>
<div style={styles.idBadgeContainer}>
  <div style={styles.idBadge}>
     <span style={styles.idLabel}>PARTNER ID</span>
        <span style={styles.idValue}>{partnerId}</span>
          </div>
        </div>
      </div>

{/* Stats Cards Section */}
  <div style={{ display: 'grid',  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: isMobile ? '15px' : '25px', marginBottom: '50px' }}>
  
  <div style={getStatCardStyle(isMobile)}>
    <h3 style={{ color: '#3498db', fontSize: isMobile ? '13px' : '16px' }}>Total QR Count</h3>
    <p style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: 'bold' }}>{stats.totalQR}</p>
  </div>
  
  <div style={getStatCardStyle(isMobile)}>
    <h3 style={{ color: '#f1c40f', fontSize: isMobile ? '13px' : '16px' }}>Pending Requests</h3>
    <p style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: 'bold' }}>{stats.pending}</p>
  </div>
  
  <div style={getStatCardStyle(isMobile)}>
    <h3 style={{ color: '#2ecc71', fontSize: isMobile ? '13px' : '16px' }}>Total Collected</h3>
    <p style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: 'bold' }}>{stats.collected}</p>
  </div>

{/* My Combined Collections Card */}
<div style={{
  ...getStatCardStyle(isMobile), 
  background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.1), rgba(41, 128, 185, 0.1))',
  border: '1px solid #9b59b6',
  minHeight: isMobile ? '110px' : '160px', 
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}}>
  <h3 style={{ 
    color: '#dcdde1', 
    fontSize: isMobile ? '11px' : '15px', 
    marginBottom: '10px', 
    textTransform: 'uppercase', 
    letterSpacing: '1px' 
  }}>
    My Collections
  </h3>
  
  <div style={{ textAlign: 'center', marginBottom: '5px' }}>
    <p style={{ 
      fontSize: isMobile ? '32px' : '48px', 
      fontWeight: 'bold', 
      margin: '0', 
      color: '#fff', 
      lineHeight: '1' 
    }}>
      {lifetimeCount}
    </p>
    <span style={{ fontSize: isMobile ? '9px' : '12px', color: '#9b59b6', fontWeight: 'bold' }}>LIFETIME</span>
  </div>

  <div style={{
    marginTop: isMobile ? '8px' : '15px',
    padding: isMobile ? '5px 12px' : '5px 20px',
    background: 'rgba(46, 204, 113, 0.15)',
    borderRadius: '50px',
    border: '1px solid rgba(46, 204, 113, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    <div style={{ width: '6px', height: '6px', background: '#2ecc71', borderRadius: '50%' }}></div>
    <span style={{ fontSize: isMobile ? '11px' : '14px', color: '#2ecc71', fontWeight: 'bold' }}>
      Today: {todayCount}
    </span>
  </div>
 </div>
</div>

      {/* Quick Collect Button */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <button 
          onClick={handleCollect}
          style={{
            padding: '18px 60px',
            background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            border: 'none',
            borderRadius: '15px',
            color: '#000',
            fontSize: '22px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(46,204,113,0.5)'
          }}
        >
          Collect New Request (Scan QR)
        </button>
      </div>

      {/* --- අලුතින් එකතු කළ Navigation Tabs --- */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveTab('summary')}
          style={activeTab === 'summary' ? activeTabStyle : tabStyle}
        >
         Pending Requests
        </button>
        <button 
          onClick={() => setActiveTab('my_details')}
          style={activeTab === 'my_details' ? activeTabStyle : tabStyle}
        >
          My Detailed Collection List
        </button>
      </div>

     {/* Tab Content*/}
{activeTab === 'summary' && (
<div style={{ 
  background: isMobile ? 'rgba(15, 15, 15, 0.98)' : 'rgba(0,0,0,0.4)', 
    borderRadius: '15px', 
    padding: isMobile ? '15px' : '25px',
    backdropFilter: isMobile ? 'none' : 'blur(10px)', 
    WebkitBackdropFilter: isMobile ? 'none' : 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.05)',
    width: '100%',
    boxSizing: 'border-box'
  }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '15px',
      flexDirection: isMobile ? 'column' : 'row', 
      gap: isMobile ? '10px' : '0'
    }}>
      <h3 style={{ color: '#f1c40f', margin: 0 }}>⚠️ New Pending Collection Requests</h3>
      
      <button 
        onClick={downloadRecentTablePDF}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f1c40f', 
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '13px',
          width: isMobile ? '100%' : 'auto'
        }}
      >
        Download Pending List PDF
      </button>
    </div>
<div style={{ 
      overflowX: 'auto', 
      width: '100%', 
      display: 'block',
      WebkitOverflowScrolling: 'touch', 
      borderRadius: '10px'
    }}>
    <table style={{ width: '100%', borderCollapse: 'collapse',minWidth: isMobile ? '600px' : '100%' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #f1c40f', color: '#aaa' }}>
          <th style={{ padding: '15px', textAlign: 'left' }}>Customer Name</th>
          <th style={{ padding: '15px', textAlign: 'left' }}>Phone Number</th>
          <th style={{ padding: '15px', textAlign: 'left' }}>Address</th>
          <th style={{ padding: '15px', textAlign: 'left' }}>Product</th>
          <th style={{ padding: '15px', textAlign: 'left' }}>Requested Date</th>
        </tr>
      </thead>
      <tbody>
        {/* 2. මෙතනදී 'notifications' වල තියෙන දත්ත පාවිච්චි කරනවා (මොකද ඒවා Pending දේවල් නිසා) */}
        {notifications.length > 0 ? notifications.map((notif, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <td style={{ padding: '15px', fontWeight: 'bold' }}>{notif.message.name}</td>
            <td style={{ padding: '15px', color: '#f1c40f', fontWeight: '500' }}>
            {notif.message.phone || 'N/A'}
        </td>
            <td style={{ padding: '15px', fontSize: '13px', color: '#ccc' }}>{notif.message.address}</td>
            <td style={{ padding: '15px' }}>{notif.message.product}</td>
            <td style={{ padding: '15px' }}>
              <span style={{
                  background: 'rgba(241, 196, 15, 0.15)',
                  color: '#f1c40f',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px'
              }}>
                  {notif.message.date}
              </span>
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                No pending requests at the moment.
            </td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
  </div>
)}

     {/* Tab Content 2: My Detailed Collection List */}
{activeTab === 'my_details' && (
  <div style={{ 
   background: isMobile ? 'rgba(15, 15, 15, 0.98)' : 'rgba(0,0,0,0.4)', 
    borderRadius: '15px', 
    padding: isMobile ? '15px' : '25px',
    backdropFilter: isMobile ? 'none' : 'blur(10px)', 
    WebkitBackdropFilter: isMobile ? 'none' : 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.05)',
    width: '100%',
    boxSizing: 'border-box'
  }}>          
          {/* Header section with Title, PDF Button and Search Bar */}
          <div style={{ 
            marginBottom: '20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <h3 style={{ color: '#2ecc71', margin: 0 }}>My Detailed Collection Records</h3>
            <div style={{  display: 'flex',  gap: '10px',  alignItems: 'center',flexDirection: isMobile ? 'column' : 'row',  width: isMobile ? '100%' : 'auto'}}>
              
              {/* PDF Download Button */}
              <button 
                onClick={downloadPDFReport}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2ecc71',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: '0.3s',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#27ae60'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2ecc71'}
              >
                Download PDF Report
              </button>

              {/* Search Bar */}
              <input 
                type="text"
                placeholder="Find by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 15px',
                  width: isMobile ? '100%' : '250px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(46,204,113,0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
          </div>
<div style={{ 
      overflowX: 'auto', 
      width: '100%', 
      display: 'block',
      WebkitOverflowScrolling: 'touch', 
      borderRadius: '10px'
    }}>
          <table style={{ width: '100%', borderCollapse: 'collapse',minWidth: isMobile ? '700px' : '100%' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #2ecc71', color: '#aaa' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>QR ID</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Product & Brand</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Customer Details</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Collected Date & Time</th>
              </tr>
            </thead>
      <tbody>
  {myRecords.filter(req => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (req.qrId?.toLowerCase().includes(search)) || 
      (req.cuProduct?.toLowerCase().includes(search)) ||
      (req.cuName?.toLowerCase().includes(search))
    );
  }).length > 0 ? (
    myRecords
      .filter(req => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          (req.qrId?.toLowerCase().includes(search)) || 
          (req.cuProduct?.toLowerCase().includes(search)) ||
          (req.cuName?.toLowerCase().includes(search))
        );
      })
      .map((req, idx) => (
        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <td style={{ padding: '15px' }}>{req.qrId}</td>
          <td style={{ padding: '15px' }}>
            <div style={{ fontWeight: 'bold', color: '#fff' }}>{req.cuProduct || 'N/A'}</div>
            <div style={{ fontSize: '12px', color: '#2ecc71' }}>{req.cuBrand || 'N/A'}</div>
          </td>
          <td style={{ padding: '15px' }}>
            <div style={{ fontWeight: '500' }}>{req.cuName || 'N/A'}</div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>{req.cuPhone || ''}</div>
          </td>
          <td style={{ padding: '15px' }}>
            <span style={{
              background: 'rgba(46, 204, 113, 0.15)',
              color: '#2ecc71',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              border: '1px solid rgba(46, 204, 113, 0.2)',
              display: 'inline-block'
            }}>
              {formatCollectedTime(req.collectedAt)}
            </span>
          </td>
        </tr>
      ))
  ) : (
    <tr>
      <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        {searchTerm ? "No matching records found." : "You haven't collected any items yet."}
      </td>
    </tr>
  )}
     </tbody>
   </table>
  </div>
</div> 
)}
    </div>
  );
};

const getStatCardStyle = (isMobile) => ({
    background: isMobile ? 'rgba(20, 20, 20, 0.92)' : 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    padding: isMobile ? '15px' : '25px', 
    minHeight: isMobile ? '110px' : '160px', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: isMobile ? 'blur(4px)' : 'blur(12px)',
    WebkitBackdropFilter: isMobile ? 'blur(4px)' : 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'relative', 
    zIndex: 1,
    boxSizing: 'border-box',
    textAlign: 'center'
});

const styles = {
welcomeCard: {
    background: 'rgba(255, 255, 255, 0.05)', 
    padding: '30px 40px',
    borderRadius: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    border: '1px solid rgba(46, 204, 113, 0.3)', 
    backdropFilter: 'blur(15px)', 
    WebkitBackdropFilter: 'blur(15px)',
    flexWrap: 'wrap',
    gap: '20px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    position: 'relative', 
    zIndex: 10 
},

container: {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', 
    backgroundRepeat: 'no-repeat',
    color: '#fff',
    padding: '20px',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box'
  },

    welcomeLeft: { flex: 1,minWidth: '280px'},
    welcomeTitle: { fontSize: '32px',fontWeight: 'bold', color: '#fff', margin: 0, marginBottom: '10px'},
    highlightText: {color: '#2ecc71',textTransform: 'capitalize' },
    welcomeSub: {color: '#aaa', fontSize: '16px', margin: 0, maxWidth: '500px', lineHeight: '1.5'},
    idBadgeContainer: { textAlign: 'right' },
    idBadge: { background: '#1a1a1a',padding: '12px 25px', borderRadius: '15px', border: '1px solid #2ecc71',display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 0 20px rgba(46, 204, 113, 0.1)' },
    idLabel: { color: '#2ecc71', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '5px' },
    idValue: { color: '#fff',fontSize: '18px',fontWeight: 'bold',fontFamily: 'monospace'}
};
export default CoPartnerDashboard;