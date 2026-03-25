import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png'; 
import FeedbackPage from './FeedbackPage';

const Dashboard = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const [adminInfo, setAdminInfo] = useState({
        name: localStorage.getItem('adminName') || "Admin", 
        email: localStorage.getItem('adminEmail') || "admin@system.com",
        profilePic: localStorage.getItem('adminPhoto') || null 
    });
    const [counts, setCounts] = useState({
        pibo: 0,
        producer: 0,
        importer: 0,
        brandOwner: 0,
        recyclers: 0,
        pending: 0,
        active: 0
    });
    const [topCompanies, setTopCompanies] = useState([]); 

    useEffect(() => {
        const handleClickOutside = (event) => {
            const profileWrapper = document.getElementById('profile-wrapper');
            if (showMenu && profileWrapper && !profileWrapper.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const [activeTab, setActiveTab] = useState('dashboard'); // 👈 Default එක dashboard විදිහට තියන්න

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await fetch(`https://eprbackend-production.up.railway.app/api/users/all`);
                const data = await response.json();
                if (response.ok) {
                    const currentAdmin = data.admins.find(a => a.email === adminInfo.email);
                    if (currentAdmin && currentAdmin.profilePic) {
                        setAdminInfo(prev => ({ ...prev, profilePic: currentAdmin.profilePic }));
                        localStorage.setItem('adminPhoto', currentAdmin.profilePic);
                    }
                    const allCustomers = data.customers || [];

                setCounts({
                    pibo: allCustomers.filter(c => c.orgRole !== 'Recycler').length,
                    producer: allCustomers.filter(c => c.orgRole === 'Producer').length,
                    importer: allCustomers.filter(c => c.orgRole === 'Importer').length,
                    brandOwner: allCustomers.filter(c => c.orgRole === 'Brand Owner').length,
                    recyclers: allCustomers.filter(c => c.orgRole === 'Recycler').length,
                    pending: allCustomers.filter(c => !c.isApproved).length,
                    active: 5 
                });
            }  
        } catch (error) {
            console.error("Error updating dashboard data:", error);
        }
        try {
        const topRes = await fetch(`https://eprbackend-production.up.railway.app/api/dashboard/top-companies`);
        if (topRes.ok) {
            const topData = await topRes.json();
            setTopCompanies(topData); 
        }
    } catch (err) {
        console.error("Top companies fetch error:", err);
    }
    };


        fetchAdminData();
    }, [adminInfo.email]);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('email', adminInfo.email);
        formData.append('role', 'admin'); 

        try {
            const response = await fetch('https://eprbackend-production.up.railway.app/api/upload-photo', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.imageUrl) {
                setAdminInfo(prev => ({ ...prev, profilePic: data.imageUrl }));
                localStorage.setItem('adminPhoto', data.imageUrl);
            }
        } catch (error) { console.error(error); }
    };

    const handleDeletePhoto = async () => {
        try {
            const response = await fetch('https://eprbackend-production.up.railway.app/api/delete-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: adminInfo.email, role: 'admin' }),
            });
            if (response.ok) {
                setAdminInfo(prev => ({ ...prev, profilePic: null }));
                localStorage.removeItem('adminPhoto');
            }
        } catch (error) { console.error(error); }
    };

   const handleLogout = () => {
    if (window.confirm("Do you want to logout?")) {
      localStorage.clear();
      sessionStorage.clear(); 
      navigate('/');
      window.location.reload();
    }
  };

    const handleProfileClick = () => {
        if (adminInfo.profilePic) {
            setShowMenu(!showMenu);
        } else {
            document.getElementById('photoInput').click();
        }
    };

    // Animation Keyframes & Dynamic Hover Styles
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes fadeInDown {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideInLeft {
                from { opacity: 0; transform: translateX(-50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes pulseGlow {
                0% { box-shadow: 0 0 5px rgba(231, 76, 60, 0.2); }
                50% { box-shadow: 0 0 20px rgba(231, 76, 60, 0.6); }
                100% { box-shadow: 0 0 5px rgba(231, 76, 60, 0.2); }
            }
            .nav-item:hover {
                background: rgba(46, 204, 113, 0.15) !important;
                color: #2ecc71 !important;
                padding-left: 28px !important;
                box-shadow: inset 4px 0 0 #2ecc71;
            }
            .stat-card:hover {
                transform: translateY(-10px) scale(1.02);
                border-color: rgba(46, 204, 113, 0.4) !important;
                background: rgba(255, 255, 255, 0.05) !important;
            }
            .logout-glow:hover {
                background: rgba(231, 76, 60, 0.2) !important;
                transform: scale(1.02);
                animation: pulseGlow 1.5s infinite;
            }
        `;
        document.head.appendChild(styleSheet);
    }, []);

    return (
        <div style={styles.container}>
            <div style={{...styles.sidebar, animation: 'slideInLeft 0.8s ease-out'}}>
                <div style={styles.logoWrapper}>
                    <div style={styles.logoCircle}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                </div>
                <h2 style={styles.logoTitle}>EPR SYSTEM</h2>
                <nav style={styles.nav}>
                    <button style={styles.navBtnActive}>Summary</button>
                    {['User Management', 'Co-Partner', 'Orders', 'QR Management'].map((item) => (
                        <button 
                            key={item} 
                            className="nav-item"
                            style={styles.navBtn}
                            onClick={() => { 
                                if (item === 'User Management') navigate('/user-management');
                               else if (item === 'Co-Partner') navigate('/co-partner');
                                else if (item === 'Orders') navigate('/admin-orders');
                                else if (item === 'QR Management') navigate('/qr-management');
                            }}
                        >{item}</button>
                    ))}

                    <button 
        className="nav-item"
        style={activeTab === 'feedback' ? styles.navBtnActive : styles.navBtn}
        onClick={() => setActiveTab('feedback')}
    >
        User Feedback
    </button>
                </nav>



                <button 
                    onClick={handleLogout} 
                    className="logout-glow"
                    style={styles.logoutBtn}
                >Logout System</button>
            </div>

            <div style={styles.mainContent}>
                <header style={{...styles.header, animation: 'fadeInDown 0.8s ease-out'}}>
                    <div style={styles.headerText}>
                        <h1 style={styles.adminTitle}>ADMINISTRATIVE OVERVIEW</h1>
                        <div style={styles.divider}></div>
                    </div>

                    <div style={styles.profileSection}>
                        <div style={styles.adminDetails}>
                            <span style={styles.adminName}>{adminInfo.name}</span>
                            <span style={styles.adminEmail}>{adminInfo.email}</span>
                        </div>
                        <div id="profile-wrapper" style={{ position: 'relative', zIndex: 10001 }}>
                            <div style={styles.profilePicWrapper} onClick={handleProfileClick}>
                                {adminInfo.profilePic ? (
                                    <img src={adminInfo.profilePic} alt="Profile" style={styles.profilePic} />
                                ) : (
                                    <div style={styles.profilePlaceholder}>{adminInfo.name.charAt(0).toUpperCase()}</div>
                                )}
                            </div>
                            {showMenu && adminInfo.profilePic && (
                                <div style={styles.dropdownMenu}>
                                    <div style={styles.menuItem} onClick={(e) => { e.stopPropagation(); window.open(adminInfo.profilePic, '_blank'); setShowMenu(false); }}>👁️ View Profile</div>
                                    <div style={styles.menuItem} onClick={(e) => { e.stopPropagation(); document.getElementById('photoInput').click(); setShowMenu(false); }}>🔄 Update Photo</div>
                                    <div style={{...styles.menuItem, color: '#e74c3c', border: 'none'}} onClick={(e) => { e.stopPropagation(); if(window.confirm("Delete?")) handleDeletePhoto(); setShowMenu(false); }}>🗑️ Remove</div>
                                </div>
                            )}
                        </div>
                        <input type="file" id="photoInput" style={{ display: 'none' }} accept="image/*" onChange={handlePhotoUpload} />
                    </div>
                </header>

                <div style={{...styles.contentArea, animation: 'fadeInUp 1s ease-out'}}>

                    <div style={{...styles.contentArea, animation: 'fadeInUp 1s ease-out'}}>

    {/* 1. Feedback Page එක පෙන්වන කොටස 👇 */}
    {activeTab === 'feedback' && (
        <FeedbackPage currentUser={{ contactPersonName: adminInfo.name, officialEmail: adminInfo.email }} />
    )}

    {/* 2. Dashboard Summary එක පෙන්වන කොටස 👇 */}
    {activeTab === 'dashboard' && (
        <div style={styles.placeholderGrid}>
            {/* ⚠️ දැනට තිබ්බ StatsGrid එක සහ පරණ Cards ඔක්කොම මේ ඇතුළේ තියෙන්න ඕනේ */}
        </div>
    )}

</div>
{/*.......................................................................................................................... */}
<div style={styles.placeholderGrid}>
    {/* කාඩ් 1: Total PIBO */}
    <div style={styles.miniCard}>
        <div style={{...styles.cardIcon, color: '#3498db'}}>👤</div>
        <h3 style={styles.cardVal}>{counts.pibo}</h3>
        <p style={styles.cardLab}>Total PIBO</p>
        <div style={styles.breakdownContainer}>
            <div style={styles.breakdownItem}>
                <span style={styles.breakdownLabel}>Producers</span>
                <div style={styles.breakdownValue}>{counts.producer}</div>
            </div>
            <div style={styles.breakdownItem}>
                <span style={styles.breakdownLabel}>Importers</span>
                <div style={styles.breakdownValue}>{counts.importer}</div>
            </div>
            <div style={styles.breakdownItem}>
                <span style={styles.breakdownLabel}>Brands</span>
                <div style={styles.breakdownValue}>{counts.brandOwner}</div>
            </div>
        </div>
    </div>

    {/* කාඩ් 2: Total Recyclers */}
    <div style={styles.miniCard}>
        <div style={{...styles.cardIcon, color: '#f39c12'}}>🚚</div>
        <h3 style={styles.cardVal}>{counts.recyclers}</h3>
        <p style={styles.cardLab}>Total Recyclers</p>
    </div>

    {/* කාඩ් 3: Top 5 QR Companies */}
<div style={styles.miniCard}>
    <p style={{...styles.cardLab, marginBottom: '15px'}}>Top 5 QR Leaders</p>
    <div style={styles.topFiveList}>
       <div style={styles.topFiveList}>
    {topCompanies.length > 0 ? topCompanies.map((company, index) => (
        <div key={index} style={styles.summaryRow}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={styles.companyNameStyle}>{company.name}</span>
                <span style={styles.roleLabelStyle}>Registered Company</span>
            </div>
            <div style={styles.qrCountStyle}>
                {company.qrCount || 0}
            </div>
        </div>
    )) : (
        <p style={{color: '#666', fontSize: '12px', textAlign: 'center', marginTop: '20px'}}>
            No QR Data Available
        </p>
    )}
</div>
    </div>
   </div>
</div> 
{/*.......................................................................................................................... */}

                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        display: 'flex', 
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row', 
        minHeight: '100vh', 
        background: `linear-gradient(rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.48)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#fff', 
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden'
    },
    sidebar: { 
    width: '320px', 
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    background: 'rgba(10, 10, 10, 0.6)',
    backdropFilter: 'blur(25px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
    display: 'flex',
    flexDirection: 'column',
    padding: '50px 25px',
    zIndex: 100 
},

    logoCircle: { 
        width: '100px', 
        height: '100px', 
        background: '#fff', 
        borderRadius: '24px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
        overflow: 'hidden' 
    },
    logoImg: { width: '85%' },
    logoTitle: { 
        color: '#2ecc71', 
        textAlign: 'center', 
        margin: '20px 0 50px', 
        fontSize: '16px', 
        fontWeight: '900', 
        letterSpacing: '4px',
        textTransform: 'uppercase'
    },
    nav: { display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
    navBtn: { 
        padding: '16px 20px', 
        background: 'transparent', 
        border: 'none', 
        color: '#bbb', 
        textAlign: 'left', 
        cursor: 'pointer', 
        borderRadius: '15px', 
        transition: 'all 0.4s ease',
        fontSize: '15px',
        fontWeight: '500'
    },
    navBtnActive: { 
        padding: '16px 20px', 
        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', 
        border: 'none', 
        color: '#fff', 
        textAlign: 'left', 
        borderRadius: '15px', 
        fontWeight: '700',
        boxShadow: '0 10px 25px rgba(46, 204, 113, 0.3)',
    },
    logoutBtn: { 
        padding: '15px', 
        border: '1px solid rgba(231, 76, 60, 0.4)', 
        color: '#e74c3c', 
        background: 'rgba(231, 76, 60, 0.05)', 
        borderRadius: '15px', 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        textTransform: 'uppercase',
        letterSpacing: '1px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(231, 76, 60, 0.1)',
    },
mainContent: { 
    flex: 1, 
    padding: '60px', 
    overflowY: 'auto',
    marginLeft: '320px', 
    width: 'calc(100% - 320px)', 
    minHeight: '100vh'
},    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '80px',
        position: 'relative', 
        zIndex: 10000      
    },
    adminTitle: { fontSize: '38px', fontWeight: '900', letterSpacing: '-1.5px' },
    divider: { height: '5px', width: '70px', background: '#2ecc71', marginTop: '12px', borderRadius: '10px' },
    profileSection: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        background: 'rgba(255,255,255,0.05)', 
        padding: '12px 15px 12px 30px', 
        borderRadius: '25px', 
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
    },
    adminDetails: { 
        display: 'flex', 
        flexDirection: 'column', 
        textAlign: 'right',
        gap: '2px'
    },
    adminName: { fontSize: '17px', fontWeight: '800', color: '#fff' },
    adminEmail: { fontSize: '12px', color: '#888' },
    profilePicWrapper: { 
        width: '55px', height: '55px', borderRadius: '18px', border: '2px solid rgba(46, 204, 113, 0.5)', 
        overflow: 'hidden', cursor: 'pointer', background: '#000', transition: '0.3s'
    },
    profilePic: { width: '100%', height: '100%', objectFit: 'cover' },
    profilePlaceholder: { fontSize: '22px', color: '#2ecc71', fontWeight: '900' },
    dropdownMenu: { 
        position: 'absolute', 
        top: '75px', 
        right: '0', 
        background: '#111', 
        border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '20px', 
        width: '200px', 
        zIndex: 10005, 
        boxShadow: '0 25px 50px rgba(0,0,0,0.8)', 
        padding: '10px'
    },
    menuItem: { padding: '14px 18px', 
                cursor: 'pointer', 
                fontSize: '14px', 
                color: '#ccc', 
                borderRadius: '12px', 
                transition: '0.2s' },

    // --- Grid එක කාඩ් 3ටම හරියන්න ---
    placeholderGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px', 
        alignItems: 'stretch',
        width: '100%',
        maxWidth: '1250px' 
    },

    // --- පොදු කාඩ් Style එක (කාඩ් 3ටම) ---
    miniCard: { 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '30px 20px', 
        borderRadius: '35px', 
        border: '1px solid rgba(255, 255, 255, 0.12)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '15px', 
        transition: 'all 0.5s ease',
        backdropFilter: 'blur(10px)',
        minHeight: '260px' // කාඩ් 3ම එකම උසින් තියෙන්න
    },

    cardVal: { 
        color: '#2ecc71', 
        fontSize: '52px', // අගය තවත් ලොකු කළා
        fontWeight: '900',
        margin: '0',
        textShadow: '0 0 20px rgba(46, 204, 113, 0.3)' // පේන ගතිය වැඩි කරන්න
    },

    cardLab: { 
        color: '#FFFFFF', // අකුරු තද සුදු කළා (Brighter White)
        fontSize: '15px', 
        fontWeight: '700', 
        textTransform: 'uppercase', 
        letterSpacing: '2px',
        opacity: '1' // අඳුරු ගතිය අයින් කළා
    },

    cardIcon: {
        fontSize: '42px',
        marginBottom: '5px'
    },

    // --- PIBO Breakdown Styles ---
    breakdownContainer: {
        display: 'flex', 
        justifyContent: 'space-around', 
        width: '100%',
        borderTop: '1px solid rgba(255,255,255,0.15)', 
        paddingTop: '20px',
        marginTop: '10px'
    },

    breakdownItem: {
        textAlign: 'center'
    },

    breakdownLabel: {
        fontSize: '10px', 
        color: '#BBBBBB', 
        display: 'block',
        marginBottom: '4px',
        fontWeight: '600',
        textTransform: 'uppercase'
    },

    breakdownValue: {
        fontSize: '20px', 
        fontWeight: '800', 
        color: '#3498db'
    },

    // --- Top 5 Section (දැන් මේකත් කාඩ් එකක් ඇතුළේ) ---
    topFiveList: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '5px'
    },

    summaryRow: {
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px', 
        background: 'rgba(255, 255, 255, 0.03)', 
        borderRadius: '15px',
        width: '100%'
    },

    companyNameStyle: { 
        color: '#FFFFFF', 
        fontSize: '14px', 
        fontWeight: '600',
        display: 'block'
    },

    roleLabelStyle: {
        fontSize: '9px', 
        color: '#AAAAAA', 
        textTransform: 'uppercase',
        fontWeight: '500'
    },

    qrCountStyle: {
        fontSize: '16px', 
        fontWeight: '800', 
        color: '#2ecc71',
    }
};         

export default Dashboard;