import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf'; // 👈 අලුතින් එකතු කළා
import logo from './logo.png'; 
import bgImage from './assets/customerdashboard.jpg';
import API from './api'; 

const AuthorityDashboard = () => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
    const isMobile = window.innerWidth <= 768; 
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    
    const [formData, setFormData] = useState({
        orgRole: 'Authority',
        institutionName: 'Loading...',
        officialEmail: 'Loading...',
        contactPersonName: 'Loading...',
        designation: 'Loading...',
        contactMobile: 'Loading...'
    });

    const [dashboardStats, setDashboardStats] = useState({
        pibos: '...',
        pros: '...',
        wasteManagement: '...',
        totalCompanies: 0,
        totalProducts: 0,
        totalQR: 0,
        pendingCount: 0,
        completedCount: 0,
        recoveredMaterials: {
            plastic: '...',
            eWaste: '...',
            glass: '...',
            paper: '...'
        }
    });

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `;
        document.head.appendChild(styleSheet);

        const fetchUserData = async () => {
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                try {
                    const response = await API.get(`/customers/user-details/${userEmail}`);
                    if (response.data && response.data.user) {
                        setFormData(response.data.user);
                    }
                } catch (error) {
                    console.error("Error fetching authority data:", error.message);
                }
            }
        };

        const fetchSystemStats = async () => {
            try {
                const response = await API.get('/admin/authority/stats').catch(() => ({ data: {} }));
                const reportRes = await API.get('/qr/national-system-stats').catch(() => ({ data: {} }));

                setDashboardStats({
                    pibos: response.data.pibos || '0',
                    pros: response.data.pros || '0',
                    wasteManagement: response.data.wasteManagement || '0',
                    totalCompanies: reportRes.data.totalCompanies || 0,
                    totalProducts: reportRes.data.totalProducts || 0,
                    totalQR: reportRes.data.totalQR || 0,
                    pendingCount: reportRes.data.pendingCount || 0,
                    completedCount: reportRes.data.completedCount || 0,
                    recoveredMaterials: response.data.recoveredMaterials || {
                        plastic: "0 Kg", eWaste: "0 Units", glass: "0 Kg", paper: "0 Kg"
                    }
                });
            } catch (error) {
                console.error("Error fetching system stats:", error.message);
            }
        };

        fetchUserData(); 
        fetchSystemStats(); 

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const handleLogout = () => {
        if(window.confirm("Are you sure you want to securely log out from the Authority Portal?")) {
            localStorage.clear(); 
            navigate('/'); 
        }
    };

    // 📄 PDF Export Logic
    const handleExportPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(39, 174, 96);
        doc.text("National EPR Compliance Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 28);
        
        doc.setLineWidth(0.5);
        doc.line(14, 33, 196, 33);

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("1. Overall System Analytics", 14, 45);

        doc.setFontSize(11);
        doc.text(`Total PIBOs: ${dashboardStats.pibos}`, 14, 55);
        doc.text(`Active PROs: ${dashboardStats.pros}`, 14, 63);
        doc.text(`Waste Management Entities: ${dashboardStats.wasteManagement}`, 14, 71);

        doc.setFontSize(14);
        doc.text("2. QR & Recycling Loop Analytics", 14, 90);

        doc.setFontSize(11);
        doc.text(`Registered Companies: ${dashboardStats.totalCompanies}`, 14, 100);
        doc.text(`Products & Brands: ${dashboardStats.totalProducts}`, 14, 108);
        doc.text(`QR Issued Count: ${dashboardStats.totalQR}`, 14, 116);
        doc.text(`Pending Count: ${dashboardStats.pendingCount}`, 14, 124);
        doc.text(`Completed Loops: ${dashboardStats.completedCount}`, 14, 132);

        doc.setFontSize(14);
        doc.text("3. Recovered Materials", 14, 150);

        doc.setFontSize(11);
        doc.text(`Plastic: ${dashboardStats.recoveredMaterials.plastic}`, 14, 160);
        doc.text(`E-Waste: ${dashboardStats.recoveredMaterials.eWaste}`, 14, 168);
        doc.text(`Glass: ${dashboardStats.recoveredMaterials.glass}`, 14, 176);
        doc.text(`Paper: ${dashboardStats.recoveredMaterials.paper}`, 14, 184);

        doc.save(`National_EPR_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // 📊 Excel (CSV) Export Logic
    const handleExportExcel = () => {
        const csvRows = [];
        csvRows.push(["Metric", "Value"]);
        csvRows.push(["Total PIBOs", dashboardStats.pibos]);
        csvRows.push(["Active PROs", dashboardStats.pros]);
        csvRows.push(["Waste Management Entities", dashboardStats.wasteManagement]);
        csvRows.push(["Registered Companies", dashboardStats.totalCompanies]);
        csvRows.push(["Products & Brands", dashboardStats.totalProducts]);
        csvRows.push(["QR Issued Count", dashboardStats.totalQR]);
        csvRows.push(["Pending Count", dashboardStats.pendingCount]);
        csvRows.push(["Completed Loops", dashboardStats.completedCount]);
        csvRows.push(["Recovered Plastic", dashboardStats.recoveredMaterials.plastic]);
        csvRows.push(["Recovered E-Waste", dashboardStats.recoveredMaterials.eWaste]);
        csvRows.push(["Recovered Glass", dashboardStats.recoveredMaterials.glass]);
        csvRows.push(["Recovered Paper", dashboardStats.recoveredMaterials.paper]);

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `EPR_Logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
       <div style={{ ...styles.container, backgroundImage: `url(${bgImage})` }}>
       <div style={styles.overlay}></div>
       
        {isMobile && (
            <div 
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                style={{
                    position: 'fixed', top: '20px', left: '20px', zIndex: 1001,
                    background: '#9b59b6', color: '#fff', width: '45px', height: '45px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '12px', cursor: 'pointer', fontSize: '24px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'all 0.3s ease'
                }}
            >
                {isDrawerOpen ? '✕' : '☰'}
            </div>
        )}

        {isMobile && isDrawerOpen && (
            <div 
                onClick={() => setIsDrawerOpen(false)}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 99,
                }}
            />
        )}

            <aside style={getSidebarStyles(isMobile, isDrawerOpen)}>
                <div style={styles.logoWrapper}>
                    <img src={logo} alt="Logo" style={styles.glowingLogo} />
                    <p style={styles.ecoMotto}>Regulatory Control Node</p>
                </div>
                
              <nav style={styles.navMenu}>
                    {[  
                        { id: 'PROFILE', label: 'MY PROFILE' },
                        { id: 'OVERVIEW', label: 'NATIONAL OVERVIEW' },
                        { id: 'REPORTS', label: 'SYSTEM REPORTS' },
                        { id: 'WEBSITE', label: 'VISIT OUR WEBSITE', isExternal: true, url: 'https://www.eprs.lk/' }
                    ].map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <div 
                                key={item.id}
                                style={{
                                    ...styles.navLink, 
                                    ...(isActive ? styles.activeNavLink : {})
                                }} 
                                onClick={() => {
                                    if (item.isExternal) {
                                        window.open(item.url, '_blank');
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.transform = 'translateY(-2px)'; 
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </nav>
                <div 
                    style={styles.logoutBtn} 
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 77, 77, 0.6)';
                        e.currentTarget.style.background = 'rgba(255, 77, 77, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = 'rgba(255, 77, 77, 0.05)';
                    }}
                >
                    SECURE LOGOUT
                </div>
            </aside>

            <main style={getMainAreaStyles(isMobile, isDrawerOpen)}>
                
                {activeTab === 'OVERVIEW' && (
                    <div style={{ ...styles.contentPadding, animation: 'fadeInUp 0.6s ease-out forwards' }}>
                        <h1 style={styles.mainTitle}>AUTHORITY DASHBOARD</h1>
                        <p style={styles.subTitle}>National EPR Tracking & Regulatory Overview</p>
                        
                        <div style={styles.grid}>
                            <div style={styles.statCard}>
                                <h3 style={styles.statTitle}>TOTAL PIBOs</h3>
                                <h1 style={styles.statCount}>{dashboardStats.pibos}</h1>
                                <p style={styles.statDesc}>Registered Producers & Importers</p>
                            </div>

                            <div style={styles.statCard}>
                                <h3 style={styles.statTitle}>ACTIVE PROs</h3>
                                <h1 style={styles.statCount}>{dashboardStats.pros}</h1>
                                <p style={styles.statDesc}>Consortiums operating nationwide</p>
                            </div>

                            <div style={styles.statCard}>
                                <h3 style={styles.statTitle}>WASTE MANAGEMENT</h3>
                                <h1 style={styles.statCount}>{dashboardStats.wasteManagement}</h1>
                                <p style={styles.statDesc}>Collectors, Transporters & Recyclers</p>
                            </div>

                            <div style={styles.statCard}>
                                <h3 style={styles.statTitle}>RECOVERED MATERIALS</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                                    <div style={styles.materialRow}>
                                        <span style={styles.materialName}>Plastic:</span>
                                        <span style={styles.materialValue}>{dashboardStats.recoveredMaterials.plastic}</span>
                                    </div>
                                    <div style={styles.materialRow}>
                                        <span style={styles.materialName}>E-Waste:</span>
                                        <span style={styles.materialValue}>{dashboardStats.recoveredMaterials.eWaste}</span>
                                    </div>
                                    <div style={styles.materialRow}>
                                        <span style={styles.materialName}>Glass:</span>
                                        <span style={styles.materialValue}>{dashboardStats.recoveredMaterials.glass}</span>
                                    </div>
                                    <div style={styles.materialRow}>
                                        <span style={styles.materialName}>Paper:</span>
                                        <span style={styles.materialValue}>{dashboardStats.recoveredMaterials.paper}</span>
                                    </div>
                                </div>
                                <p style={{...styles.statDesc, marginTop: '15px'}}>National aggregate for 2026</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ENTITIES' && (
                    <div style={{ ...styles.contentPadding, animation: 'fadeInUp 0.6s ease-out forwards' }}>
                        <h1 style={styles.mainTitle}>REGISTERED ENTITIES</h1>
                        <p style={styles.subTitle}>Comprehensive Database of all EPR Stakeholders</p>
                        <div style={styles.glassPanel}>
                            <p style={{color: '#ccc', textAlign: 'center', padding: '40px'}}>
                                🚧 Entity Data Table Loading... <br/><span style={{fontSize: '12px'}}>(Backend API integration required to fetch and map PIBO/PRO/Recycler lists here)</span>
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'VERIFICATION' && (
                    <div style={{ ...styles.contentPadding, animation: 'fadeInUp 0.6s ease-out forwards' }}>
                        <h1 style={styles.mainTitle}>DOCUMENT VERIFICATION</h1>
                        <p style={styles.subTitle}>Review Environmental Licenses (EPL) & Statutory Audits</p>
                        <div style={styles.glassPanel}>
                            <p style={{color: '#ccc', textAlign: 'center', padding: '40px'}}>
                                🚧 Pending Verification Queue Loading... <br/><span style={{fontSize: '12px'}}>(Here you will see a list of uploaded AWS S3 PDF links pending for authority approval)</span>
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'REPORTS' && (
                    <div style={{ ...styles.contentPadding, animation: 'fadeInUp 0.6s ease-out forwards' }}>
                        <h1 style={styles.mainTitle}>SYSTEM REPORTS</h1>
                        <p style={styles.subTitle}>Generate & Export National Aggregate Compliance Data</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                            <div style={styles.statCard}>
                                <h3 style={styles.statTitle}>REGISTERED COMPANIES</h3>
                                <h1 style={styles.statCount}>{dashboardStats.totalCompanies}</h1>
                                <p style={styles.statDesc}>Active Producers & Importers</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3 style={styles.statTitle}>PRODUCTS & BRANDS</h3>
                                <h1 style={styles.statCount}>{dashboardStats.totalProducts}</h1>
                                <p style={styles.statDesc}>Registered in system</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3 style={styles.statTitle}>QR ISSUED COUNT</h3>
                                <h1 style={styles.statCount}>{dashboardStats.totalQR}</h1>
                                <p style={styles.statDesc}>Total batch assets</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3 style={{ ...styles.statTitle, color: '#f1c40f' }}>PENDING COUNT</h3>
                                <h1 style={{ ...styles.statCount, color: '#f1c40f' }}>{dashboardStats.pendingCount}</h1>
                                <p style={styles.statDesc}>Awaiting collection / recycling</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3 style={{ ...styles.statTitle, color: '#2ecc71' }}>COMPLETED LOOPS</h3>
                                <h1 style={{ ...styles.statCount, color: '#2ecc71' }}>{dashboardStats.completedCount}</h1>
                                <p style={styles.statDesc}>Successfully recycled loops</p>
                            </div>
                        </div>

                        <div style={styles.glassPanel}>
                            <h3 style={{ color: '#2ecc71', marginBottom: '15px' }}>📊 National Audit & Report Generation Engine</h3>
                            <p style={{ color: '#ccc', fontSize: '13px', marginBottom: '25px' }}>
                                Export comprehensive compliance metrics, recycling loops, and producer logs securely for governmental review.
                            </p>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={handleExportPDF} // 👈 දැන් මේකෙන් හරියටම PDF ඩවුන්ලෝඩ් වෙනවා
                                    style={{ padding: '12px 25px', borderRadius: '12px', background: 'rgba(231, 76, 60, 0.2)', border: '1px solid #e74c3c', color: '#e74c3c', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    📄 Export PDF Summary
                                </button>
                                <button 
                                    onClick={handleExportExcel} // 👈 දැන් මේකෙන් හරියටම Excel (CSV) ඩවුන්ලෝඩ් වෙනවා
                                    style={{ padding: '12px 25px', borderRadius: '12px', background: 'rgba(46, 204, 113, 0.2)', border: '1px solid #2ecc71', color: '#2ecc71', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    📊 Export Excel Logs
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'PROFILE' && (
                    <div style={{ ...styles.contentPadding, animation: 'fadeInUp 0.6s ease-out forwards' }}>
                        <h1 style={styles.mainTitle}>AUTHORITY PROFILE</h1>
                        <p style={styles.subTitle}>Your Institutional Node Details</p>

                        <div style={styles.profileCard}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <h2 style={{ margin: 0, color: '#9b59b6', fontSize: '28px' }}>{formData.institutionName}</h2>
                                <span style={styles.roleTag}>Regulatory Access Level</span>
                            </div>
                            
                            <div style={styles.profileGrid}>
                                {[
                                    { label: 'Official Login ID', value: formData.officialEmail },
                                    { label: 'Focal Representative Name', value: formData.contactPersonName },
                                    { label: 'Official Designation', value: formData.designation },
                                    { label: 'Contact Mobile', value: formData.contactMobile }
                                ].map((field, idx) => (
                                    <div key={idx} style={styles.infoBox}>
                                        <label style={styles.infoLabel}>{field.label}</label>
                                        <div style={styles.profileInput}>{field.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
       </div>
    );
};

const getSidebarStyles = (isMobile, isDrawerOpen) => ({
    width: '280px', backgroundColor: 'rgba(20, 10, 25, 0.98)', borderRight: '1px solid #333', 
    display: 'flex', flexDirection: 'column', padding: '40px 20px', zIndex: 100, position: 'fixed', 
    height: '100vh', transition: 'all 0.3s ease',
    left: isMobile ? (isDrawerOpen ? '0' : '-320px') : '0', top: 0
});

const getMainAreaStyles = (isMobile, isDrawerOpen) => ({
    flex: 1, marginLeft: isMobile ? '0' : '280px', zIndex: 2, position: 'relative', transition: 'margin-left 0.3s ease'
});

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', color: '#fff', fontFamily: 'Poppins, sans-serif' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1 },
    
    logoWrapper: { textAlign: 'center', marginBottom: '30px' },
    glowingLogo: { width: '90px', height: '90px', borderRadius: '50%', objectFit: 'contain', backgroundColor: '#fff', padding: '5px', border: '5px solid #9b59b6', marginBottom: '20px', display: 'block', marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 0 20px rgba(155, 89, 182, 0.5)' },
    ecoMotto: { fontSize: '15px', color: '#9b59b6', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px' },
    
    navMenu: { flex: 1, marginTop: '20px' },
    navLink: { padding: '18px 20px', margin: '10px 0', cursor: 'pointer', fontSize: '14px', borderRadius: '15px', transition: 'all 0.3s ease', fontWeight: 'bold', color: '#ccc', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', letterSpacing: '1px' },
    activeNavLink: { background: 'rgba(155, 89, 182, 0.15)', color: '#fff', border: '1px solid rgba(155, 89, 182, 0.5)', boxShadow: '0 0 15px rgba(155, 89, 182, 0.2)' },
    
    logoutBtn: { padding: '15px', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold', border: '1px solid rgba(255, 77, 77, 0.3)', borderRadius: '12px', textAlign: 'center', transition: 'all 0.3s ease', background: 'rgba(255, 77, 77, 0.05)', fontSize: '14px', letterSpacing: '2px', marginTop: 'auto', marginBottom: '60px' },
    
    contentPadding: { padding: '50px' },
    mainTitle: { fontSize: '35px', textAlign: 'center', letterSpacing: '3px', fontWeight: '900', color: '#fff', margin: '0 0 10px 0' },
    subTitle: { textAlign: 'center', color: '#9b59b6', marginBottom: '40px', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' },
    statCard: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', padding: '30px', border: '1px solid rgba(155, 89, 182, 0.2)', textAlign: 'center', transition: 'all 0.3s ease' },
    statTitle: { color: '#aaa', fontSize: '14px', letterSpacing: '1px', marginBottom: '15px' },
    statCount: { color: '#9b59b6', fontSize: '40px', margin: '0 0 10px 0', fontWeight: '900' },
    statDesc: { color: '#777', fontSize: '12px' },

    materialRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' },
    materialName: { color: '#ccc', fontSize: '14px', fontWeight: 'bold' },
    materialValue: { color: '#fff', fontSize: '14px', fontWeight: '900' },

    glassPanel: { background: 'rgba(255, 255, 255, 0.02)', borderRadius: '25px', padding: '40px', border: '1px dashed rgba(155, 89, 182, 0.3)' },
    
    profileCard: { background: 'rgba(255, 255, 255, 0.03)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255, 255, 255, 0.05)', maxWidth: '800px', margin: '0 auto', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' },
    roleTag: { background: 'rgba(155, 89, 182, 0.2)', color: '#fff', padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' },
    profileGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' },
    infoBox: { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
    infoLabel: { fontSize: '12px', color: '#888', marginLeft: '5px', fontWeight: 'bold' },
    profileInput: { background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '15px' }
};

export default AuthorityDashboard;