import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png'; 

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
                    <div style={styles.placeholderGrid}>
    {/* --- කාඩ් 1: Total PIBO (With Breakdown) --- */}
    <div style={{...styles.miniCard, minWidth: '300px'}}>
        <div style={{...styles.cardIcon, color: '#3498db'}}>👤</div>
        <h3 style={styles.cardVal}>{counts.pibo}</h3>
        <p style={{...styles.cardLab, marginBottom: '15px'}}>Total PIBO</p>
        
        {/* පීබෝලා ඇතුළේ ඉන්න 3 දෙනාගේ count එක මෙන්න මෙතන */}
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            paddingTop: '15px',
            fontSize: '12px'
        }}>
            <div>
                <span style={{color: '#ccc'}}>Producers</span>
                <div style={{fontWeight: 'bold', color: '#3498db'}}>{counts.producer}</div>
            </div>
            <div>
                <span style={{color: '#ccc'}}>Importers</span>
                <div style={{fontWeight: 'bold', color: '#3498db'}}>{counts.importer}</div>
            </div>
            <div>
                <span style={{color: '#ccc'}}>Brands</span>
                <div style={{fontWeight: 'bold', color: '#3498db'}}>{counts.brandOwner}</div>
            </div>
        </div>
    </div>

    {/* --- කාඩ් 2: Total Recyclers --- */}
    <div style={styles.miniCard}>
        <div style={{...styles.cardIcon, color: '#f39c12'}}>🚚</div>
        <h3 style={styles.cardVal}>{counts.recyclers}</h3>
        <p style={styles.cardLab}>Total Recyclers</p>
    </div>
    
    {/* අනිත් Pending සහ Active කාඩ් දෙකත් මෙතනින් පල්ලෙහාට තිබ්බම හරි */}
</div>
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
    position: 'fixed', // 👈 මේක තමයි ප්‍රධානම දේ
    top: 0,
    left: 0,
    bottom: 0,
    background: 'rgba(10, 10, 10, 0.6)',
    backdropFilter: 'blur(25px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
    display: 'flex',
    flexDirection: 'column',
    padding: '50px 25px',
    zIndex: 100 // 👈 අනිත් දේවල් වලට වඩා උඩින් තියෙන්න
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
    marginLeft: '320px', // 👈 Sidebar එකේ පළලට සමාන ඉඩක් වමෙන් තබන්න
    width: 'calc(100% - 320px)', // 👈 ඉතිරි පළල නිවැරදිව ගණනය කිරීමට
    minHeight: '100vh'
},    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '80px',
        position: 'relative', // Added to ensure header layering
        zIndex: 10000        // Ensure header is above main content
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
        zIndex: 10005, // Fixed: High priority z-index to stay above cards
        boxShadow: '0 25px 50px rgba(0,0,0,0.8)', 
        padding: '10px'
    },
    menuItem: { padding: '14px 18px', cursor: 'pointer', fontSize: '14px', color: '#ccc', borderRadius: '12px', transition: '0.2s' },
    placeholderGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '35px' },
    miniCard: { 
        background: 'rgba(255, 255, 255, 0.03)', 
        padding: '50px 30px', 
        borderRadius: '35px', 
        border: '1px solid rgba(255,255,255,0.08)', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', 
        transition: 'all 0.5s ease',
        backdropFilter: 'blur(5px)',
        position: 'relative',
        zIndex: 1 // Lower priority compared to dropdown
    },
    cardLabel: { color: '#888', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' },
    cardValue: { color: '#2ecc71', fontSize: '42px', fontWeight: '900' }
};

export default Dashboard;