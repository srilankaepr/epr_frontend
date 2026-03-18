import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import bgImage from './assets/copartner.jpg';

const CoPartnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQR: 0,
    pending: 0,
    collected: 0,
    myCollected: 0
  });
  const [recentCollected, setRecentCollected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- අලුතින් එකතු කළ Tab State එක ---
  const [activeTab, setActiveTab] = useState('summary');
// --- Notification States ---
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);


  const userName = localStorage.getItem('userName') || 'Partner';
const partnerId = localStorage.getItem('coPartnerId') || 'N/A';
  

// 1. දත්ත Fetch කරන ප්‍රධාන Function එක
 const fetchDashboardData = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const res = await fetch('https://eprbackend-production.up.railway.app/api/co-partner/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('coPartnerToken')}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setStats({
          totalQR: data.totalQR || 0,
          pending: data.pending || 0,
          collected: data.collected || 0,
          myCollected: data.myCollected || 0
        });

        const newRequestsFromBackend = data.recentCollected || [];

// 1. මුලින්ම Backend එකෙන් එන ඔක්කොම දත්ත ගන්නවා
        const allRequests = data.recentCollected || [];

        // 2. ඒවයින් 'Pending' තත්ත්වයේ තියෙන ඒවා විතරක් වෙන් කරගන්නවා
        const pendingRequests = allRequests.filter(req => 
          req.status && req.status.toString().toLowerCase() === 'pending'
        );

        console.log("Pending Requests Found:", pendingRequests.length);

        // 3. ඔයා එවපු කොටස: අලුත් ඒවා විතරක් Notifications වලට දානවා
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

        // 4. 🧹 වැදගත්ම දේ: පරණ ඒවා හෝ Collect කළ ඒවා අයින් කිරීම
        setNotifications(prev => prev.filter(n => 
          pendingRequests.some(r => r._id === n.requestId)
        ));

        setRecentCollected(allRequests);
        // --- Logic අවසානයි ---
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      if (!isAuto) setLoading(false);
    }
  };

  // තත්පර 20කට වරක් දත්ත අලුත් කරන එකම useEffect එක
  useEffect(() => {
    fetchDashboardData(); // පේජ් එක Load වෙද්දී මුලින්ම දත්ත ගනී

    const interval = setInterval(() => {
      fetchDashboardData(true); // බැක්ග්‍රවුන්ඩ් එකේ දත්ත අලුත් කරයි
    }, 20000); 

    return () => clearInterval(interval); // පේජ් එකෙන් අයින් වෙද්දී ටයිමර් එක නවත්වයි
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // මෙතන හිස්ව තියන්න, එතකොට ගැහෙන්නේ නැහැ




 const formatCollectedTime = (dateString) => {
    // 1. දත්තයක් නැතිනම් පෙන්වන පණිවිඩය
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    
    // 2. අද දින නම් "Today, 10:30 AM" ලෙස පෙන්වන්න
    if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // 3. වෙනත් දිනයක් නම් "Mar 11, 2026, 02:29 PM" ලෙස (Year එක සහිතව) පෙන්වන්න
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
      navigate('/');
    }
  };

if (loading) {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#0a0a0a', 
      color: '#2ecc71',      
      fontFamily: "'Poppins', sans-serif"
    }}>
      {/* කැරකෙන Spinner එක */}
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid rgba(46, 204, 113, 0.1)',
        borderTop: '5px solid #2ecc71',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      
      <p style={{ letterSpacing: '2px', fontSize: '14px', fontWeight: 'bold' }}>
        ESTABLISHING SECURE CONNECTION...
      </p>

      {/* Spinner එක කැරකෙන්න අවශ්‍ය Animation එක */}
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
// 1. පාට්නර්ට අදාළ සියලුම රෙකෝඩ්ස් (සර්ච් එකට කලින්)
  const myRecords = recentCollected.filter(req => req.cpId === partnerId);

  // 2. සර්ච් එක නිසා කවුන්ට් එක වෙනස් නොවෙන්න මෙතනට 'myRecords' පාවිච්චි කරන්න
  const lifetimeCount = myRecords.length;

  // 3. අද දවසේ කවුන්ට් එකත් 'myRecords' එකෙන්ම ගන්න (සර්ච් එකට අදාළ නැතිව)
  const today = new Date().toDateString();
  const todayCount = myRecords.filter(req => 
    new Date(req.collectedAt).toDateString() === today
  ).length;

  // 4. සර්ච් එකට විතරක් 'mySpecificCollected' පාවිච්චි කරන්න (මේක ටේබල් එකට විතරයි)
  const mySpecificCollected = myRecords.filter(req => 
    req.qrId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.cpName.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
      {/* Header Section - මෙතන තියෙන්නේ එකම එක Header එකයි */}
      <div style={{
       display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    background: 'rgba(10, 10, 10, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #222',
    
    // 👇 මේ පේළි 3 අනිවාර්යයෙන්ම දාන්න
    position: 'sticky', // නැත්නම් relative
    top: 0,
    zIndex: 999999,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #2ecc71',
            background: '#fff'
          }}>
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
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
            padding: '12px 30px',
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
            Hello, <span style={styles.highlightText}>{userName}</span> 👋

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '50px' }}>
        <div style={statCardStyle}>
          <h3 style={{ color: '#3498db' }}>Total QR Count</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold' }}>{stats.totalQR}</p>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ color: '#f1c40f' }}>Pending Requests</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold' }}>{stats.pending}</p>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ color: '#2ecc71' }}>Total Collected</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold' }}>{stats.collected}</p>
        </div>

        {/* My Combined Collections Card */}
        <div style={{
          ...statCardStyle,
          background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.1), rgba(41, 128, 185, 0.1))',
          border: '1px solid #9b59b6',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '160px'
        }}>
          <h3 style={{ color: '#dcdde1', fontSize: '15px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            My Collections
          </h3>
          
          <div style={{ textAlign: 'center', marginBottom: '5px' }}>
            <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0', color: '#fff', lineHeight: '1' }}>
              {lifetimeCount}
            </p>
            <span style={{ fontSize: '12px', color: '#9b59b6', fontWeight: 'bold' }}>LIFETIME</span>
          </div>

          <div style={{
            marginTop: '15px',
            padding: '5px 20px',
            background: 'rgba(46, 204, 113, 0.15)',
            borderRadius: '50px',
            border: '1px solid rgba(46, 204, 113, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ width: '8px', height: '8px', background: '#2ecc71', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '14px', color: '#2ecc71', fontWeight: 'bold' }}>
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

     {/* Tab Content 1: Summary View (දැන් මේක Pending Requests View එක) */}
{activeTab === 'summary' && (
<div style={{ 
    background: 'rgba(0,0,0,0.4)', // වීදුරුවක් වගේ පේන්න
    borderRadius: '15px', 
    padding: '25px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.05)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
      {/* මාතෘකාව වෙනස් කළා */}
      <h3 style={{ color: '#f1c40f', margin: 0 }}>⚠️ New Pending Collection Requests</h3>
      
      <button 
        onClick={downloadRecentTablePDF}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f1c40f', // Pending නිසා කහ පාටට හුරු කළා
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '13px'
        }}
      >
        Download Pending List PDF
      </button>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
)}

     {/* Tab Content 2: My Detailed Collection List */}
{activeTab === 'my_details' && (
  <div style={{ 
    background: 'rgba(0,0,0,0.4)', 
    borderRadius: '15px', 
    padding: '25px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.05)'
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
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                  transition: '0.3s'
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
                  width: '250px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(46,204,113,0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
          </div>


          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #2ecc71', color: '#aaa' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>QR ID</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Product & Brand</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Customer Details</th>
<th style={{ padding: '15px', textAlign: 'left' }}>Collected Date & Time</th>
              </tr>
            </thead>
        
<tbody>
  {recentCollected && recentCollected.filter(item => {
    // සර්ච් එක හිස් නම් ඔක්කොම පෙන්වනවා
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    
    // item එකේ දත්ත තියෙනවද කියලා check කරලා සර්ච් කරනවා
    return (
      (item.qrId?.toLowerCase().includes(search)) || 
      (item.category?.toLowerCase().includes(search)) ||
      (item.customerName?.toLowerCase().includes(search))
    );
  }).length > 0 ? (
    recentCollected
      .filter(item => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          (item.qrId?.toLowerCase().includes(search)) || 
          (item.category?.toLowerCase().includes(search))
        );
      })
      .map((item, idx) => (
        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <td style={{ padding: '15px' }}>{item.qrId}</td>
          <td style={{ padding: '15px' }}>
            <div style={{ fontWeight: 'bold', color: '#fff' }}>{item.category || 'N/A'}</div>
          </td>
          <td style={{ padding: '15px' }}>
            <div style={{ fontWeight: '500' }}>{item.collectedBy || 'N/A'}</div>
          </td>
          <td style={{ padding: '15px' }}>
            <span style={{
              background: 'rgba(46, 204, 113, 0.15)',
              color: '#2ecc71',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              {item.collectedAt ? new Date(item.collectedAt).toLocaleDateString() : 'N/A'}
            </span>
          </td>
        </tr>
      ))
  ) : (
    <tr>
      <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        No matching collections found.
      </td>
    </tr>
  )}
</tbody>    
</table>
</div> )}
    </div>
  );
};

const statCardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    padding: '25px',
    position: 'relative', // position එක තිබිය යුතුයි
    zIndex: 1, // <--- මෙය 1 වැනි කුඩා අගයක තියන්න
    backdropFilter: 'blur(12px)'
};

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
    // බැක්ග්‍රවුන්ඩ් එක මෙතනින් සෙට් කරනවා
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // ස්ක්‍රෝල් කරද්දී බැක්ග්‍රවුන්ඩ් එක හොලවන්නේ නැහැ
    backgroundRepeat: 'no-repeat',
    color: '#fff',
    padding: '20px',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box'
  },

    welcomeLeft: {
        flex: 1,
        minWidth: '280px'
    },
    welcomeTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#fff',
        margin: 0,
        marginBottom: '10px'
    },
    highlightText: {
        color: '#2ecc71',
        textTransform: 'capitalize'
    },
    welcomeSub: {
        color: '#aaa',
        fontSize: '16px',
        margin: 0,
        maxWidth: '500px',
        lineHeight: '1.5'
    },
    idBadgeContainer: {
        textAlign: 'right'
    },
    idBadge: {
        background: '#1a1a1a',
        padding: '12px 25px',
        borderRadius: '15px',
        border: '1px solid #2ecc71',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 0 20px rgba(46, 204, 113, 0.1)'
    },
    idLabel: {
        color: '#2ecc71',
        fontSize: '11px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        marginBottom: '5px'
    },
    idValue: {
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
        fontFamily: 'monospace'
    }
};

export default CoPartnerDashboard;