import React, { useEffect, useState } from 'react';
import API from './api';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const UserManagement = () => {
    const [data, setData] = useState({ admins: [], customers: [] });
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterRole, setFilterRole] = useState('All'); 

    const fetchStats = async () => {
        try {
            const res = await API.get('/admin/customer-stats');
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats", err);
        }
    };

    const navigate = useNavigate();
    console.log("Current Admin Role from LocalStorage:", localStorage.getItem('adminRole'));

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users/all');
            setData(res.data);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    const approveCustomer = async (id) => {
        if (!window.confirm("Are you sure you want to approve this customer?")) return;

        try {
            const response = await API.put(`/admin/approve-customer/${id}`);
            
            if (response.status === 200) {
                alert("✅ Customer Approved Successfully!");
                fetchUsers(); 
                fetchStats(); 
            }
        } catch (err) {
            console.error("Error approving customer:", err);
            const errorMsg = err.response?.data?.error || "Failed to approve customer.";
            alert(`❌ ${errorMsg}`);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);

    // --- DELETE LOGIC ---
    const deleteUser = async (id, type) => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            try {
                const endpoint = type === 'Admin' 
                    ? `/admin/admin/${id}` 
                    : `/admin/customer/${id}`;
                
                const response = await API.delete(endpoint);
                
                if (response.status === 200) {
                    alert(`✅ ${type} deleted successfully!`);
                    fetchUsers(); 
                    fetchStats(); 
                }
            } catch (err) {
                console.error("Delete Error:", err);
                const errorMsg = err.response?.data?.error || `Error deleting ${type}`;
                alert(`❌ ${errorMsg}`);
            }
        }
    };

    // --- LOGOUT LOGIC ---
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            navigate('/'); 
        }
    };

    // --- PDF EXPORT LOGIC ---
    const downloadPDF = () => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.setFontSize(20);
        doc.setTextColor(46, 204, 113); 
        doc.text("User Management Full Report", 40, 40);
        
        const adminRows = data.admins.map((admin, i) => [i + 1, admin.fullName, admin.email]);
        autoTable(doc, {
            startY: 90,
            head: [['#', 'Full Name', 'Email Address']],
            body: adminRows,
            theme: 'grid',
            headStyles: { fillColor: [46, 204, 113] }
        });

        let finalY = doc.lastAutoTable.finalY;
        const customerRows = data.customers.map((c, i) => [
            i + 1,c.regNumber || '-', c.companyName, c.orgRole, c.companyWebsite || '-', c.officialEmail, 
            c.phone, c.whatsapp || '-', c.dob || '-', c.contactPersonName, 
            c.contactPersonMobile, `${c.address1}, ${c.address2}`, c.country
        ]);

        autoTable(doc, {
            startY: finalY + 50,
            head: [['#', 'Reg Number','Company', 'Role', 'Website', 'Email', 'Phone', 'WhatsApp', 'DOB', 'Contact Person', 'CP Mobile', 'Address', 'Country']],
            body: customerRows,
            theme: 'striped',
            headStyles: { fillColor: [52, 152, 219] },
            styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: { 
                0: { cellWidth: 20 }, 
                1: { cellWidth: 80 }, 
                11: { cellWidth: 100 }  
            }
        });

        doc.save("Full_User_Management_Report.pdf");
    };

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes pulseGlow {
                0% { box-shadow: 0 0 5px rgba(231, 76, 60, 0.2); }
                50% { box-shadow: 0 0 20px rgba(231, 76, 60, 0.6); }
                100% { box-shadow: 0 0 5px rgba(231, 76, 60, 0.2); }
            }
            .nav-item:hover { background: rgba(46, 204, 113, 0.15) !important; color: #2ecc71 !important; padding-left: 28px !important; }
            .logout-glow:hover {
                background: rgba(231, 76, 60, 0.2) !important;
                transform: scale(1.02);
                animation: pulseGlow 1.5s infinite;
            }
            .glass-table-wrapper::-webkit-scrollbar { height: 8px; }
            .glass-table-wrapper::-webkit-scrollbar-thumb { background: #2ecc71; border-radius: 10px; }
            .table-row:hover { background: rgba(46, 204, 113, 0.1) !important; transition: 0.3s; }
        `;
        document.head.appendChild(styleSheet);
    }, []);

    return (
        <div style={styles.container}>
            <div style={{...styles.sidebar, animation: 'slideInLeft 0.8s ease-out'}}>
                <div style={styles.logoWrapper}>
                    <div style={styles.logoCircle}><img src={logo} alt="Logo" style={styles.logoImg} /></div>
                </div>
                <h2 style={styles.logoTitle}>EPR SYSTEM</h2>
                <nav style={styles.nav}>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/dashboard')}>Summary</button>
                    <button style={styles.navBtnActive}>User Management</button>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/co-partner')}>Co-Partner</button>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/admin-orders')}>Orders</button>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/qr-management')}>QR Management</button>
                </nav>
                <button className="logout-glow" style={styles.logoutBtn} onClick={handleLogout}>Logout System</button>
            </div>

            <div style={styles.mainContent}>
                <header style={styles.header}>
                    <div style={{animation: 'fadeIn 1s ease-in'}}>
                        <h1 style={styles.pageTitle}>USER MANAGEMENT SYSTEM</h1>
                        <p style={styles.subTitle}>Manage and monitor all system administrators and customers</p>
                    </div>
                    <button onClick={downloadPDF} style={styles.savePdfBtn}>Export PDF Report</button>
                </header>

                <div style={{animation: 'fadeIn 1.2s ease-in'}}>
                    <h3 style={styles.sectionTitle}>REGISTERED ADMINISTRATORS</h3>
                    <div className="glass-table-wrapper" style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.headerRow}>
                                    <th style={styles.thFirst}>#</th>
                                    <th style={styles.th}>Full Name</th>
                                    <th style={styles.th}>Email Address</th>
                                    <th style={styles.thLast}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.admins.map((admin, i) => (
                                    <tr key={i} className="table-row" style={styles.row}>
                                        <td style={styles.tdFirst}>{i + 1}</td>
                                        <td style={styles.td}>{admin.fullName}</td>
                                        <td style={styles.td}>{admin.email}</td>
                                        <td style={styles.tdLast}>
                                            <button onClick={() => deleteUser(admin._id, 'Admin')} style={styles.deleteBtn}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 style={{...styles.sectionTitle, marginTop: '50px'}}>REGISTERED CUSTOMERS</h3>

                    <div style={styles.statsGrid}>
                        <div 
                            style={{
                                ...styles.statCard, 
                                cursor: 'pointer', 
                                border: filterStatus === 'All' ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                                transform: filterStatus === 'All' ? 'scale(1.05)' : 'scale(1)',
                                transition: '0.3s'
                            }} 
                            onClick={() => setFilterStatus('All')}
                        >
                            <span style={styles.statLabel}>TOTAL CUSTOMERS</span>
                            <h2 style={styles.statValue}>{stats.total}</h2>
                        </div>

                        <div 
                            style={{
                                ...styles.statCard, 
                                cursor: 'pointer', 
                                borderLeft: '4px solid #f1c40f',
                                border: filterStatus === 'Pending' ? '2px solid #f1c40f' : '1px solid rgba(255,255,255,0.1)',
                                transform: filterStatus === 'Pending' ? 'scale(1.05)' : 'scale(1)',
                                transition: '0.3s'
                            }} 
                            onClick={() => setFilterStatus('Pending')}
                        >
                            <span style={styles.statLabel}>PENDING APPROVALS</span>
                            <h2 style={{...styles.statValue, color: '#f1c40f'}}>{stats.pending}</h2>
                        </div>

                        <div 
                            style={{
                                ...styles.statCard, 
                                cursor: 'pointer', 
                                borderLeft: '4px solid #2ecc71',
                                border: filterStatus === 'Approved' ? '2px solid #2ecc71' : '1px solid rgba(255,255,255,0.1)',
                                transform: filterStatus === 'Approved' ? 'scale(1.05)' : 'scale(1)',
                                transition: '0.3s'
                            }} 
                            onClick={() => setFilterStatus('Approved')}
                        >
                            <span style={styles.statLabel}>APPROVED CUSTOMERS</span>
                            <h2 style={{...styles.statValue, color: '#2ecc71'}}>{stats.approved}</h2>
                        </div>
                    </div>

                    {/* 🆕 පාරිභෝගික භූමිකාව (Role) අනුව පෙරීමට එක් කළ Dropdown එක */}
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
                        <label style={{ color: '#2ecc71', fontSize: '14px', fontWeight: 'bold' }}>FILTER BY ROLE:</label>
                       <select 
                                value={filterRole} 
                                onChange={(e) => setFilterRole(e.target.value)}
                                style={{
                                     background: 'rgba(255, 255, 255, 0.05)',
                                     color: '#fff',
                                     border: '1px solid rgba(46, 204, 113, 0.4)',
                                     padding: '10px 15px',
                                     borderRadius: '10px',
                                     outline: 'none',
                                     cursor: 'pointer',
                                     fontSize: '14px'
                                     }}
                                  >
                          <option value="All" style={{ background: '#111', color: '#fff' }}>All Roles</option>
                          <option value="Producer" style={{ background: '#111', color: '#fff' }}>Producer</option>
                          <option value="Importer" style={{ background: '#111', color: '#fff' }}>Importer</option>
                          <option value="Brand Owner" style={{ background: '#111', color: '#fff' }}>Brand Owner</option>
                          <option value="Collector" style={{ background: '#111', color: '#fff' }}>Collector</option>
                          <option value="Transporter" style={{ background: '#111', color: '#fff' }}>Transporter</option>
                          <option value="Recycler" style={{ background: '#111', color: '#fff' }}>Recycler</option>
                       </select>
                    </div>

                    <div className="glass-table-wrapper" style={styles.tableWrapper}>
                        <table style={{...styles.table, minWidth: '2000px'}}>
                            <thead>
                                <tr style={styles.headerRow}>
                                    <th style={styles.thFirst}>#</th>
                                    <th style={styles.th}>Reg Number</th>
                                    <th style={styles.th}>Company Name</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Website</th>
                                    <th style={styles.th}>Official Email</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>WhatsApp</th>
                                    <th style={styles.th}>DOB</th>
                                    <th style={styles.th}>Contact Person</th>
                                    <th style={styles.th}>CP Mobile</th>
                                    <th style={styles.th}>Address</th>
                                    <th style={styles.th}>Country</th>
                                    <th style={styles.th}>Documents</th>
                                    <th style={styles.thLast}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.customers
                                       .filter(c => filterStatus === 'All' ? true : (c.status === filterStatus))
                                       .filter(c => filterRole === 'All' ? true : (c.orgRole === filterRole)) // 🆕 Role එක අනුව Filter කිරීම
                                       .map((c, i) => (
                                    <tr key={i} className="table-row" style={styles.row}>
                                        <td style={styles.tdFirst}>{i + 1}</td>
                                        <td style={{...styles.td, fontWeight: 'bold', color: '#2ecc71'}}> {c.regNumber || 'N/A'}</td>
                                        <td style={styles.td}>{c.companyName}</td>
                                        <td style={styles.td}>{c.orgRole}</td>
                                        <td style={styles.td}>{c.companyWebsite || '-'}</td>
                                        <td style={styles.td}>{c.officialEmail}</td>
                                        <td style={styles.td}>{c.phone}</td>
                                        <td style={styles.td}>{c.whatsapp || '-'}</td>
                                        <td style={styles.td}>{c.dob}</td>
                                        <td style={styles.td}>{c.contactPersonName}</td>
                                        <td style={styles.td}>{c.contactPersonMobile}</td>
                                        <td style={styles.td}>{`${c.address1}, ${c.address2}`}</td>
                                        <td style={styles.td}>{c.country}</td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexDirection: 'column' }}>
                                                {(() => {
                                                    const handleDownload = (docData) => {
                                                        if (!docData) return;
                                                        if (docData.startsWith('data:application/pdf') || docData.startsWith('data:image')) {
                                                            const newWindow = window.open();
                                                            newWindow.document.write(
                                                                `<iframe src="${docData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                                                            );
                                                        } else {
                                                            const cleanUrl = docData.replace('/fl_attachment/', '/');
                                                            window.open(cleanUrl, '_blank');
                                                        }
                                                    };

                                                    return (
                                                        <>
                                                            {c.brcDocument && (
                                                                <button 
                                                                    onClick={() => handleDownload(c.brcDocument)}
                                                                    style={{...styles.docLink, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#3498db'}}
                                                                >
                                                                    <span role="img" aria-label="doc">📄</span> BRC
                                                                </button>
                                                            )}
                                                            {c.vatDocument && (
                                                                <button 
                                                                    onClick={() => handleDownload(c.vatDocument)}
                                                                    style={{...styles.docLink, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#3498db'}}
                                                                >
                                                                    <span role="img" aria-label="doc">📄</span> VAT
                                                                </button>
                                                            )}
                                                            {c.billingDocument && (
                                                                <button 
                                                                    onClick={() => handleDownload(c.billingDocument)}
                                                                    style={{...styles.docLink, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#3498db'}}
                                                                >
                                                                    <span role="img" aria-label="doc">📄</span> Billing
                                                                </button>
                                                            )}
                                                            {c.verificationDocs && c.verificationDocs.length > 0 && c.verificationDocs.map((doc, index) => (
                                                                <button 
                                                                    key={index}
                                                                    onClick={() => handleDownload(doc)}
                                                                    style={{...styles.docLink, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#3498db'}}
                                                                >
                                                                    <span role="img" aria-label="doc">📄</span> Old Doc {index + 1}
                                                                </button>
                                                            ))}
                                                        </>
                                                    );
                                                })()}
                                                {!(c.brcDocument || c.vatDocument || c.billingDocument || (c.verificationDocs && c.verificationDocs.length > 0)) && (
                                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>No Docs</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={styles.tdLast}>
                                            {c.status === 'Pending' && (
                                                <button onClick={() => approveCustomer(c._id)} style={styles.approveBtn}>Approve</button>
                                            )}
                                            {localStorage.getItem('adminRole') === 'SuperAdmin' && (
                                                <button onClick={() => deleteUser(c._id, 'Customer')} style={styles.deleteBtn}>Delete</button>
                                            )}
                                            {c.status !== 'Pending' && localStorage.getItem('adminRole') !== 'SuperAdmin' && (
                                                <span style={{ color: '#bdc3c7', fontSize: '12px', fontStyle: 'italic' }}>No Actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        display: 'flex', minHeight: '100vh', 
        background: `linear-gradient(rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.48)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        color: '#fff', fontFamily: "'Inter', sans-serif" 
    },
    sidebar: { 
        width: '320px', position: 'fixed', top: 0, left: 0, bottom: 0,
        background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(25px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex',
        flexDirection: 'column', padding: '50px 25px', zIndex: 100 
    },
    logoCircle: { 
        width: '100px', height: '100px', background: '#fff', borderRadius: '24px', 
        margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 15px 35px rgba(0,0,0,0.5)', overflow: 'hidden'
    },
    logoImg: { width: '85%' },
    logoTitle: { color: '#2ecc71', textAlign: 'center', margin: '20px 0 50px', fontSize: '16px', fontWeight: '900', letterSpacing: '4px' },
    nav: { display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
    navBtn: { padding: '16px 20px', background: 'transparent', border: 'none', color: '#bbb', textAlign: 'left', cursor: 'pointer', borderRadius: '15px', transition: 'all 0.4s', fontSize: '15px' },
    navBtnActive: { padding: '16px 20px', background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', border: 'none', color: '#fff', textAlign: 'left', borderRadius: '15px', fontWeight: '700' },
    logoutBtn: { 
        padding: '15px', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#e74c3c', 
        background: 'rgba(231, 76, 60, 0.05)', borderRadius: '15px', cursor: 'pointer', 
        fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease'
    },
    mainContent: { flex: 1, padding: '60px', overflowY: 'auto', marginLeft: '320px', width: 'calc(100% - 320px)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' },
    pageTitle: { fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1px' },
    subTitle: { color: '#2ecc71', margin: '5px 0 0', fontSize: '14px', letterSpacing: '1px' },
    savePdfBtn: { padding: '12px 25px', background: 'transparent', border: '1px solid #2ecc71', color: '#2ecc71', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
    sectionTitle: { color: '#2ecc71', fontSize: '14px', fontWeight: '800', letterSpacing: '2px', marginBottom: '20px' },
    tableWrapper: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(15px)', borderRadius: '25px', padding: '20px', overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    headerRow: { borderBottom: '2px solid rgba(46, 204, 113, 0.3)' },
    th: { padding: '15px', color: '#2ecc71', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid rgba(255, 255, 255, 0.1)' },
    thFirst: { padding: '15px', color: '#2ecc71', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid rgba(255, 255, 255, 0.1)', width: '50px' },
    thLast: { padding: '15px', color: '#2ecc71', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold' },
    row: { borderBottom: '1px solid rgba(255, 255, 255, 0.05)' },
    td: { padding: '15px', fontSize: '14px', color: '#ddd', borderRight: '1px solid rgba(255, 255, 255, 0.1)' },
    tdFirst: { padding: '15px', fontSize: '14px', color: '#ddd', borderRight: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' },
    tdLast: { padding: '15px', fontSize: '14px', color: '#ddd' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' },
    statCard: {
        background: 'rgba(255, 255, 255, 0.05)', padding: '25px', borderRadius: '15px',
        backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center', transition: '0.3s'
    },
    approveBtn: {
        background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.4)',
        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
        fontWeight: '600', marginRight: '8px', transition: 'all 0.3s ease',
        backdropFilter: 'blur(5px)', textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    statLabel: { fontSize: '12px', color: '#2ecc71', letterSpacing: '1px', fontWeight: 'bold', textTransform: 'uppercase' },
    statValue: { fontSize: '35px', margin: '10px 0 0', fontWeight: '900', color: '#fff' },
    deleteBtn: { background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid #e74c3c', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    docLink: {
        background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.4)',
        padding: '5px 10px', borderRadius: '6px', textDecoration: 'none', fontSize: '11px',
        fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: '0.3s'
    },
};

export default UserManagement;