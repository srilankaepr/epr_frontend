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
    const [currentPage, setCurrentPage] = useState(1); 
    const customersPerPage = 5; 

    // 🆕 ඇඩ්මින් ක්ලික් කරන යූසර්ගේ දත්ත මතක තියාගන්නා ස්ටේට් එක
    const [selectedUser, setSelectedUser] = useState(null);

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
                if(selectedUser && selectedUser._id === id) {
                    setSelectedUser(prev => ({ ...prev, status: 'Approved' }));
                }
            }
        } catch (err) {
            console.error("Error approving customer:", err);
            const errorMsg = err.response?.data?.error || "Failed to approve customer.";
            alert(`❌ ${errorMsg}`);
        }
    };

    useEffect(() => {
        Promise.all([fetchUsers(), fetchStats()])
            .catch(err => console.error("Error loading initial data:", err));
    }, []);

    // --- DELETE LOGIC ---
    const deleteUser = async (id, type) => {
        if (localStorage.getItem('adminRole') !== 'SuperAdmin') {
            alert(`🚨 Unauthorized Access! Only SuperAdmin is allowed to delete an ${type}.`);
            return;
        }

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
                    if(selectedUser && selectedUser._id === id) setSelectedUser(null);
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
                             {localStorage.getItem('adminRole') === 'SuperAdmin' && (
                <button onClick={() => deleteUser(admin._id, 'Admin')} style={styles.deleteBtn}>Remove</button>
            )}

            {localStorage.getItem('adminRole') !== 'SuperAdmin' && (
                <span style={{ color: '#bdc3c7', fontSize: '12px', fontStyle: 'italic' }}>No Actions</span>
            )}
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
                            onClick={() => { setFilterStatus('All'); setCurrentPage(1); }}
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
                            onClick={() => { setFilterStatus('Pending'); setCurrentPage(1); }}
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
                            onClick={() => { setFilterStatus('Approved'); setCurrentPage(1); }}
                        >
                            <span style={styles.statLabel}>APPROVED CUSTOMERS</span>
                            <h2 style={{...styles.statValue, color: '#2ecc71'}}>{stats.approved}</h2>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
                    <label style={{ color: '#2ecc71', fontSize: '14px', fontWeight: 'bold' }}>FILTER BY ROLE:</label>
                       <select 
                                value={filterRole} 
                                onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
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
                          <option value="PRO" style={{ background: '#111', color: '#fff' }}>PRO</option>
                       </select>
                    </div>

                    <div className="glass-table-wrapper" style={styles.tableWrapper}>
                        <table style={{...styles.table, minWidth: '2200px'}}>
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
    {(() => {
        const filteredCustomers = data.customers
            .filter(c => filterStatus === 'All' ? true : (c.status === filterStatus))
            .filter(c => filterRole === 'All' ? true : (c.orgRole === filterRole));

        const indexOfLastCustomer = currentPage * customersPerPage;
        const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
        
        const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

        return currentCustomers.map((c, i) => (
            <tr key={i} className="table-row" style={styles.row}>
                <td style={styles.tdFirst}>{indexOfFirstCustomer + i + 1}</td>
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
                    <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                        {/* 🆕 අලුතෙන්ම එකතු කළ View Profile බොත්තම */}
                        <button 
                            onClick={() => setSelectedUser(c)}
                            style={{ background: 'transparent', color: '#3498db', border: '1px solid #3498db', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                            View Profile
                        </button>
                        
                        {c.status === 'Pending' && (
                            <button onClick={() => approveCustomer(c._id)} style={styles.approveBtn}>Approve</button>
                        )}
                        {localStorage.getItem('adminRole') === 'SuperAdmin' && (
                            <button onClick={() => deleteUser(c._id, 'Customer')} style={styles.deleteBtn}>Delete</button>
                        )}
                    </div>
                </td>
            </tr>
        ));
    })()}
                           </tbody>
                        </table>
                    </div>

                    {(() => {
                        const filteredCustomersCount = data.customers
                            .filter(c => filterStatus === 'All' ? true : (c.status === filterStatus))
                            .filter(c => filterRole === 'All' ? true : (c.orgRole === filterRole)).length;

                        const totalPages = Math.ceil(filteredCustomersCount / customersPerPage);

                        if (totalPages <= 1) return null;

                        return (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '30px', animation: 'fadeIn 1s ease-in' }}>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '10px 18px',
                                        background: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(46, 204, 113, 0.1)',
                                        border: '1px solid rgba(46, 204, 113, 0.3)',
                                        color: currentPage === 1 ? '#666' : '#2ecc71',
                                        borderRadius: '10px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold',
                                        transition: '0.3s'
                                    }}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => setCurrentPage(index + 1)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: currentPage === index + 1 ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' : 'rgba(255,255,255,0.05)',
                                            border: 'none',
                                            color: '#fff',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            boxShadow: currentPage === index + 1 ? '0 5px 15px rgba(46, 204, 113, 0.3)' : 'none',
                                            transition: '0.3s'
                                        }}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '10px 18px',
                                        background: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(46, 204, 113, 0.1)',
                                        border: '1px solid rgba(46, 204, 113, 0.3)',
                                        color: currentPage === totalPages ? '#666' : '#2ecc71',
                                        borderRadius: '10px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold',
                                        transition: '0.3s'
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        );
                    })()}

                </div>
            </div>

            {/* ========================================================================= */}
            {/* 🆕 💎 🟢 ඇඩ්මින්ට PRO පියවර 9 ඇතුළු සියලු කස්ටමර් දත්ත බැලීමට අලුතෙන්ම එක් කළ MODAL එක */}
            {/* ========================================================================= */}
            {selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifycontent: 'center', zIndex: 10000, padding: '20px', overflowY: 'auto' }}>
                    <div style={{ background: '#0a0a0a', borderRadius: '28px', maxWidth: '750px', width: '100%', margin: 'auto', border: selectedUser.orgRole === 'PRO' ? '1px solid rgba(241, 196, 15, 0.3)' : '1px solid rgba(46,204,113,0.2)', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
                        
                        {/* Modal Header Area */}
                        <div style={{ background: '#fff', padding: '30px 20px', textAlign: 'center', borderBottom: selectedUser.orgRole === 'PRO' ? '4px solid #f1c40f' : '4px solid #2ecc71' }}>
                            <div style={{ fontSize: '50px', marginBottom: '10px' }}>{selectedUser.orgRole === 'PRO' ? '💎' : '👤'}</div>
                            <div style={{ color: '#000', fontWeight: '900', fontSize: '26px', letterSpacing: '1px' }}>
                                {selectedUser.orgRole === 'PRO' ? 'PRO FULL PROFILE AUDIT' : 'CUSTOMER PROFILE DETAILS'}
                            </div>
                            <span style={{ padding: '4px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: selectedUser.status === 'Pending' ? 'rgba(241,196,15,0.15)' : 'rgba(46,204,113,0.15)', color: selectedUser.status === 'Pending' ? '#f1c40f' : '#2ecc71', border: `1px solid ${selectedUser.status === 'Pending' ? '#f1c40f33' : '#2ecc7133'}` }}>
                                Status: {selectedUser.status}
                            </span>
                        </div>

                        {/* Modal Body Area */}
                        <div style={{ padding: '35px', maxHeight: '60vh', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            
                            {/* Company Name Block */}
                            <div style={{ gridColumn: 'span 2', background: selectedUser.orgRole === 'PRO' ? 'linear-gradient(135deg, rgba(241,196,15,0.12) 0%, rgba(0,0,0,0) 100%)' : 'linear-gradient(135deg, rgba(46,204,113,0.12) 0%, rgba(0,0,0,0) 100%)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: selectedUser.orgRole === 'PRO' ? '#f1c40f' : '#2ecc71', textTransform: 'uppercase', fontWeight: 'bold' }}>Organization Legal Entity Name</div>
                                <div style={{ color: '#fff', fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>{selectedUser.companyName}</div>
                                {selectedUser.companyWebsite && <div style={{ fontSize: '13px', marginTop: '5px' }}><a href={selectedUser.companyWebsite} target="_blank" rel="noreferrer" style={{ color: '#3498db' }}>🌐 {selectedUser.companyWebsite}</a></div>}
                            </div>

                            {/* Contact Person Card */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>Focal Point Representative</div>
                                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{selectedUser.contactPersonName}</div>
                                {selectedUser.contactDesignation && <div style={{ color: '#aaa', fontSize: '13px' }}>💼 {selectedUser.contactDesignation}</div>}
                                <div style={{ color: '#ccc', fontSize: '13px', marginTop: '6px' }}>📞 Mobile: {selectedUser.contactPersonMobile}</div>
                                <div style={{ color: '#ccc', fontSize: '13px' }}>☎️ Office: {selectedUser.phone}</div>
                                {selectedUser.whatsapp && <div style={{ color: '#2ecc71', fontSize: '13px' }}>💬 WhatsApp: {selectedUser.whatsapp}</div>}
                            </div>

                            {/* Core Address Card */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>Official Registrations</div>
                                <div style={{ fontSize: '13px', color: '#ccc' }}>Email: <span style={{ color: '#fff' }}>{selectedUser.officialEmail}</span></div>
                                <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>Address: <span style={{ color: '#fff' }}>{selectedUser.address1}, {selectedUser.address2 || ''}</span></div>
                                <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>Country: <span style={{ color: '#fff' }}>{selectedUser.country || 'Sri Lanka'}</span></div>
                                <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>Postal Code: <span style={{ color: '#fff' }}>{selectedUser.postalCode || '-'}</span></div>
                            </div>

                            {/* ========================================== */}
                            {/* 💎 PRO ලියාපදිංචියේ පමණක් ඇති විශේෂ දත්ත */}
                            {/* ========================================== */}
                            {selectedUser.orgRole === 'PRO' && (
                                <>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '5px' }}>Registry ID & Date</div>
                                        <div style={{ fontSize: '13px', color: '#ccc' }}>BRN: <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedUser.regNumber || 'N/A'}</span></div>
                                        <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>Incorporated: <span style={{ color: '#fff' }}>{selectedUser.dob}</span></div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '5px' }}>Regional Boundaries</div>
                                        <div style={{ fontSize: '13px', color: '#ccc' }}>District: <span style={{ color: '#fff' }}>{selectedUser.orgDistrict || 'N/A'}</span></div>
                                        <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>Province: <span style={{ color: '#fff' }}>{selectedUser.orgProvince || 'N/A'}</span></div>
                                    </div>

                                    {selectedUser.operationalAddress && (
                                        <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px' }}>
                                            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Operational Address Location</div>
                                            <div style={{ fontSize: '13px', color: '#fff' }}>📍 {selectedUser.operationalAddress}</div>
                                        </div>
                                    )}

                                    {/* Step 4: Organization Types */}
                                    <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Organization Type Categorization (Step 4)</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {selectedUser.organizationTypes && selectedUser.organizationTypes.length > 0 ? (
                                                selectedUser.organizationTypes.map((t, idx) => (
                                                    <span key={idx} style={{ background: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(155, 89, 182, 0.3)' }}>🔹 {t}</span>
                                                ))
                                            ) : <span style={{ color: '#555', fontSize: '12px' }}>None</span>}
                                            {selectedUser.organizationTypesOther && <span style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>Other: {selectedUser.organizationTypesOther}</span>}
                                        </div>
                                    </div>

                                    {/* Step 5: Service Capabilities */}
                                    <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>PRO Service Capabilities (Step 5)</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {selectedUser.serviceCapabilities && selectedUser.serviceCapabilities.length > 0 ? (
                                                selectedUser.serviceCapabilities.map((c, idx) => (
                                                    <div key={idx} style={{ fontSize: '13px', color: '#ccc' }}>✅ <span style={{ color: '#fff' }}>{c}</span></div>
                                                ))
                                            ) : <div style={{ color: '#555', fontSize: '12px' }}>No Capabilities Outlined</div>}
                                        </div>
                                    </div>

                                    {/* Step 6: Operational Coverage & Numbers */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '15px' }}>
                                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Coverage Footprint (Step 6)</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            {selectedUser.operationalCoverageAreas && selectedUser.operationalCoverageAreas.length > 0 ? (
                                                selectedUser.operationalCoverageAreas.map((a, idx) => (
                                                    <span key={idx} style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', padding: '3px 8px', borderRadius: '5px', fontSize: '11px' }}>📍 {a}</span>
                                                ))
                                            ) : <span style={{ color: '#555' }}>N/A</span>}
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '15px' }}>
                                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '6px' }}>EPR Active Metrics</div>
                                        <div style={{ fontSize: '12px', color: '#aaa' }}>Managed PIBOs: <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{selectedUser.managedPibosCount || 0}</span></div>
                                        <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>Network Collectors: <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{selectedUser.networkCollectorsCount || 0}</span></div>
                                    </div>

                                    {/* Step 7: Waste Categories Managed */}
                                    <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Waste Materials Stream Authority (Step 7)</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {selectedUser.managedWasteCategories && selectedUser.managedWasteCategories.length > 0 ? (
                                                selectedUser.managedWasteCategories.map((w, idx) => (
                                                    <span key={idx} style={{ background: 'rgba(243, 156, 18, 0.15)', color: '#f39c12', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(243, 156, 18, 0.3)' }}>♻️ {w}</span>
                                                ))
                                            ) : <span style={{ color: '#555' }}>None Listed</span>}
                                            {selectedUser.managedWasteCategoriesOther && <span style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>Other: {selectedUser.managedWasteCategoriesOther}</span>}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Co-Partner Collector Fields Breakdown */}
                            {selectedUser.isCoPartner && (
                                <div style={{ gridColumn: 'span 2', background: 'rgba(52,152,219,0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(52,152,219,0.2)' }}>
                                    <div style={{ fontSize: '12px', color: '#3498db', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Co-Partner Independent Verification Logs</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                                        <div>Full Name: <span style={{ color: '#fff' }}>{selectedUser.coPartnerFullName}</span></div>
                                        <div>Alt Email: <span style={{ color: '#fff' }}>{selectedUser.coPartnerAnotherEmail}</span></div>
                                        <div>Direct Phone: <span style={{ color: '#fff' }}>{selectedUser.coPartnerPhone}</span></div>
                                        <div>NIC Identity: <span style={{ color: '#fff' }}>{selectedUser.coPartnerNic}</span></div>
                                        <div>Bound District: <span style={{ color: '#fff' }}>{selectedUser.coPartnerDistrict}</span></div>
                                        <div>Pradeshiya Sabha: <span style={{ color: '#fff' }}>{selectedUser.coPartnerPradeshiyaSabha}</span></div>
                                    </div>
                                </div>
                            )}

                            {/* Step 8 Documents List inside Modal View */}
                            <div style={{ gridColumn: 'span 2', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>All Uploaded Corporate Certifications</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {(() => {
                                        const openDoc = (base64) => {
                                            if (!base64) return;
                                            const w = window.open();
                                            w.document.write(`<iframe src="${base64}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                                        };
                                        return (
                                            <>
                                                {selectedUser.brcDocument && <button onClick={() => openDoc(selectedUser.brcDocument)} style={{ background: '#111', color: '#3498db', border: '1px solid #3498db', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📄 BRC File</button>}
                                                {selectedUser.vatDocument && <button onClick={() => openDoc(selectedUser.vatDocument)} style={{ background: '#111', color: '#3498db', border: '1px solid #3498db', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📄 VAT Cert</button>}
                                                {selectedUser.billingDocument && <button onClick={() => openDoc(selectedUser.billingDocument)} style={{ background: '#111', color: '#3498db', border: '1px solid #3498db', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📄 Billing Proof</button>}
                                                
                                                {/* PRO Specific Documents */}
                                                {selectedUser.taxCertificateDocument && <button onClick={() => openDoc(selectedUser.taxCertificateDocument)} style={{ background: '#111', color: '#f1c40f', border: '1px solid #f1c40f', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📄 TIN Certificate</button>}
                                                {selectedUser.companyProfileDocument && <button onClick={() => openDoc(selectedUser.companyProfileDocument)} style={{ background: '#111', color: '#f1c40f', border: '1px solid #f1c40f', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📄 Company Profile PDF</button>}
                                                {selectedUser.operationalExperienceProofDocument && <button onClick={() => openDoc(selectedUser.operationalExperienceProofDocument)} style={{ background: '#111', color: '#f1c40f', border: '1px solid #f1c40f', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📄 Ops Experience Proof</button>}
                                                {selectedUser.authorizationLetterDocument && <button onClick={() => openDoc(selectedUser.authorizationLetterDocument)} style={{ background: '#111', color: '#f1c40f', border: '1px solid #f1c40f', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📄 Authorization Letter</button>}

                                                {selectedUser.verificationDocs && selectedUser.verificationDocs.length > 0 && selectedUser.verificationDocs.map((doc, idx) => (
                                                    <button key={idx} onClick={() => openDoc(doc)} style={{ background: '#111', color: '#e67e22', border: '1px solid #e67e22', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📄 Verification Doc {idx+1}</button>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Footer Panel */}
                        <div style={{ background: '#111', padding: '20px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                Registered: {new Date(selectedUser.registeredAt).toLocaleString()}
                                {selectedUser.isDeclarationAgreed && <div style={{ color: '#2ecc71', marginTop: '2px' }}>✍️ Signed by: {selectedUser.digitalSignatureName}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {selectedUser.status === 'Pending' && (
                                    <button onClick={() => approveCustomer(selectedUser._id)} style={{ ...styles.approveBtn, marginRight: 0, padding: '10px 20px' }}>Approve User</button>
                                )}
                                <button onClick={() => setSelectedUser(null)} style={{ background: selectedUser.orgRole === 'PRO' ? '#f1c40f' : '#2ecc71', color: '#000', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Close Profile</button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

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