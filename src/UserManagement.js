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
    const [selectedRoleCategory, setSelectedRoleCategory] = useState('All'); // 🚀 New Dynamic Role Category Filter
    const [currentPage, setCurrentPage] = useState(1); 
    const customersPerPage = 5; 

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

    const deleteUser = async (id, type) => {
        if (localStorage.getItem('adminRole') !== 'SuperAdmin') {
            alert(`🚨 Unauthorized Access! Only SuperAdmin is allowed to delete an ${type}.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            try {
                const endpoint = type === 'Admin' ? `/admin/admin/${id}` : `/admin/customer/${id}`;
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

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            navigate('/'); 
        }
    };

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
            i + 1,
            c.regNumber || '-', 
            c.companyName || c.institutionName || '-', 
            c.orgRole || 'PIBO', 
            c.officialEmail, 
            c.phone || c.contactMobile, 
            c.contactPersonName || '-', 
            c.orgDistrict || '-', 
            c.country || 'Sri Lanka'
        ]);

        autoTable(doc, {
            startY: finalY + 50,
            head: [['#', 'Reg Number', 'Company / Institution', 'Role', 'Email', 'Phone', 'Contact Person', 'District', 'Country']],
            body: customerRows,
            theme: 'striped',
            headStyles: { fillColor: [52, 152, 219] },
            styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' }
        });

        doc.save("Full_User_Management_Report.pdf");
    };

    const handleDownload = (docData) => {
        if (!docData) return;
        if (typeof docData === 'object' && docData.url) {
            const cleanUrl = docData.url.replace('/fl_attachment/', '/');
            window.open(cleanUrl, '_blank');
            return;
        }
        if (typeof docData === 'string') {
            window.open(docData, '_blank');
        }
    };

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
            .nav-item:hover { background: rgba(46, 204, 113, 0.15) !important; color: #2ecc71 !important; padding-left: 28px !important; }
            .glass-table-wrapper::-webkit-scrollbar { height: 8px; width: 6px; }
            .glass-table-wrapper::-webkit-scrollbar-thumb { background: #2ecc71; border-radius: 10px; }
            .table-row:hover { background: rgba(46, 204, 113, 0.1) !important; transition: 0.3s; }
            .role-card:hover { transform: translateY(-5px); border-color: #2ecc71 !important; background: rgba(46, 204, 113, 0.08) !important; }
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
                    <div>
                        <h1 style={styles.pageTitle}>USER MANAGEMENT SYSTEM</h1>
                        <p style={styles.subTitle}>Manage and monitor all system administrators and customers</p>
                    </div>
                    <button onClick={downloadPDF} style={styles.savePdfBtn}>Export PDF Report</button>
                </header>

                <div>
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

                    <h3 style={{...styles.sectionTitle, marginTop: '50px'}}>REGISTERED CUSTOMERS STATUS OVERVIEW</h3>

                    <div style={styles.statsGrid}>
                        <div 
                            style={{
                                ...styles.statCard, 
                                cursor: 'pointer', 
                                border: filterStatus === 'All' ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                                transform: filterStatus === 'All' ? 'scale(1.03)' : 'scale(1)',
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
                                transform: filterStatus === 'Pending' ? 'scale(1.03)' : 'scale(1)',
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
                                transform: filterStatus === 'Approved' ? 'scale(1.03)' : 'scale(1)',
                            }} 
                            onClick={() => { setFilterStatus('Approved'); setCurrentPage(1); }}
                        >
                            <span style={styles.statLabel}>APPROVED CUSTOMERS</span>
                            <h2 style={{...styles.statValue, color: '#2ecc71'}}>{stats.approved}</h2>
                        </div>
                    </div>

                    {/* 🚀 NEW LARGE BUTTON SET FOR ROLE CATEGORIES (PIBO, PRO, Waste, Authority) */}
                    <h3 style={{...styles.sectionTitle, marginTop: '30px'}}>FILTER BY SYSTEM ROLE CATEGORIES</h3>
                    <div style={styles.roleButtonsGrid}>
                        {[
                            { label: 'ALL ROLES', value: 'All', icon: '🌐', color: '#2ecc71' },
                            { label: 'PIBO HUB', value: 'PIBO', icon: '🏭', color: '#3498db' },
                            { label: 'PRO COMPLIANCE', value: 'PRO', icon: '💎', color: '#f1c40f' },
                            { label: 'WASTE MANAGEMENT', value: 'WASTE', icon: '♻️', color: '#f39c12' },
                            { label: 'GOV AUTHORITIES', value: 'AUTHORITY', icon: '🏛️', color: '#9b59b6' }
                        ].map((roleCard) => (
                            <div
                                key={roleCard.value}
                                className="role-card"
                                onClick={() => { setSelectedRoleCategory(roleCard.value); setCurrentPage(1); }}
                                style={{
                                    ...styles.roleCardBox,
                                    borderColor: selectedRoleCategory === roleCard.value ? roleCard.color : 'rgba(255,255,255,0.1)',
                                    background: selectedRoleCategory === roleCard.value ? `rgba(46, 204, 113, 0.12)` : 'rgba(255, 255, 255, 0.04)',
                                    boxShadow: selectedRoleCategory === roleCard.value ? `0 0 20px ${roleCard.color}40` : 'none'
                                }}
                            >
                                <span style={{ fontSize: '28px' }}>{roleCard.icon}</span>
                                <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '800', margin: '8px 0 0 0', letterSpacing: '1px' }}>{roleCard.label}</h4>
                            </div>
                        ))}
                    </div>

                    <div className="glass-table-wrapper" style={{...styles.tableWrapper, marginTop: '20px'}}>
                        <table style={{...styles.table, minWidth: '1600px'}}>
                            <thead>
                                <tr style={styles.headerRow}>
                                    <th style={styles.thFirst}>#</th>
                                    <th style={styles.th}>Reg Number</th>
                                    <th style={styles.th}>Company / Institution Name</th>
                                    <th style={styles.th}>Role Category</th>
                                    <th style={styles.th}>Official Email</th>
                                    <th style={styles.th}>Phone / Mobile</th>
                                    <th style={styles.th}>Contact Person</th>
                                    <th style={styles.th}>District</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.thLast}>Action</th>
                                </tr>
                            </thead>
                          <tbody>
    {(() => {
        const filteredCustomers = data.customers
            .filter(c => filterStatus === 'All' ? true : (c.status === filterStatus))
            .filter(c => {
                if (selectedRoleCategory === 'All') return true;
                const role = (c.orgRole || '').toUpperCase();
                
                if (selectedRoleCategory === 'PIBO') {
                    return role === 'PRODUCER' || role === 'IMPORTER' || role === 'BRAND OWNER' || (c.piboBusinessType && c.piboBusinessType.length > 0);
                }
                if (selectedRoleCategory === 'PRO') {
                    return role === 'PRO';
                }
                if (selectedRoleCategory === 'WASTE') {
                    return role === 'RECYCLER' || c.isCollector || c.isRecycler || c.isTransporter || c.isTotalSolutionProvider;
                }
                if (selectedRoleCategory === 'AUTHORITY') {
                    return role === 'AUTHORITY' || c.institutionName;
                }
                return true;
            });

        const indexOfLastCustomer = currentPage * customersPerPage;
        const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
        const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

        if (currentCustomers.length === 0) {
            return (
                <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#888', fontSize: '15px' }}>
                        No records found matching this category.
                    </td>
                </tr>
            );
        }

        return currentCustomers.map((c, i) => (
            <tr key={i} className="table-row" style={styles.row}>
                <td style={styles.tdFirst}>{indexOfFirstCustomer + i + 1}</td>
                <td style={{...styles.td, fontWeight: 'bold', color: '#2ecc71'}}>{c.regNumber || 'N/A'}</td>
                <td style={styles.td}>{c.companyName || c.institutionName || '-'}</td>
                <td style={styles.td}><span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', fontWeight: 'bold' }}>{c.orgRole || 'PIBO'}</span></td>
                <td style={styles.td}>{c.officialEmail || c.username}</td>
                <td style={styles.td}>{c.phone || c.contactMobile}</td>
                <td style={styles.td}>{c.contactPersonName || '-'}</td>
                <td style={styles.td}>{c.orgDistrict || '-'}</td>
                <td style={styles.td}>
                    <span style={{ color: c.status === 'Approved' ? '#2ecc71' : '#f1c40f', fontWeight: 'bold' }}>
                        {c.status || 'Pending'}
                    </span>
                </td>
                <td style={styles.tdLast}>
                    <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                        <button 
                            onClick={() => setSelectedUser(c)}
                            style={{ background: 'transparent', color: '#3498db', border: '1px solid #3498db', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                        >
                            View Audit
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

                    {/* Pagination */}
                    {(() => {
                        const filteredCustomersCount = data.customers
                            .filter(c => filterStatus === 'All' ? true : (c.status === filterStatus))
                            .filter(c => {
                                if (selectedRoleCategory === 'All') return true;
                                const role = (c.orgRole || '').toUpperCase();
                                if (selectedRoleCategory === 'PIBO') return role === 'PRODUCER' || role === 'IMPORTER' || role === 'BRAND OWNER' || (c.piboBusinessType?.length > 0);
                                if (selectedRoleCategory === 'PRO') return role === 'PRO';
                                if (selectedRoleCategory === 'WASTE') return role === 'RECYCLER' || c.isCollector || c.isRecycler || c.isTransporter || c.isTotalSolutionProvider;
                                if (selectedRoleCategory === 'AUTHORITY') return role === 'AUTHORITY' || c.institutionName;
                                return true;
                            }).length;

                        const totalPages = Math.ceil(filteredCustomersCount / customersPerPage);
                        if (totalPages <= 1) return null;

                        return (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '30px' }}>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={styles.pageBtn}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => setCurrentPage(index + 1)}
                                        style={{
                                            ...styles.pageBtn,
                                            background: currentPage === index + 1 ? '#2ecc71' : 'rgba(255,255,255,0.05)',
                                            color: '#fff'
                                        }}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={styles.pageBtn}
                                >
                                    Next
                                </button>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* AUDIT MODAL VIEWER */}
            {selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
                    <div style={{ background: '#0c0c0c', borderRadius: '32px', maxWidth: '850px', width: '100%', maxHeight: '90vh', border: '1px solid rgba(46, 204, 113, 0.3)', boxShadow: '0 50px 120px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        
                        <div style={{ padding: '30px', background: 'rgba(255,255,255,0.01)', borderBottom: '4px solid #2ecc71', textAlign: 'center' }}>
                            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                                [{selectedUser.orgRole || 'Compliance Account'}] Audit Profile Details
                            </h2>
                            <span style={{ padding: '5px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: selectedUser.status === 'Pending' ? 'rgba(241,196,15,0.12)' : 'rgba(46,204,113,0.12)', color: selectedUser.status === 'Pending' ? '#f1c40f' : '#2ecc71' }}>
                                STATUS: {selectedUser.status}
                            </span>
                        </div>

                        <div style={{ padding: '40px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', backgroundColor: '#090909' }}>
                            <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Entity Name</div>
                                <div style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{selectedUser.companyName || selectedUser.institutionName}</div>
                                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Reg Number: <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{selectedUser.regNumber || 'N/A'}</span></div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '18px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Contact Representative</div>
                                <div style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginTop: '6px' }}>{selectedUser.contactPersonName || 'N/A'}</div>
                                <div style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>Mobile: {selectedUser.phone || selectedUser.contactMobile}</div>
                                <div style={{ color: '#aaa', fontSize: '13px' }}>Email: {selectedUser.officialEmail || selectedUser.username}</div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '18px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Location Information</div>
                                <div style={{ fontSize: '13px', color: '#ccc', marginTop: '6px' }}>District: <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedUser.orgDistrict || 'N/A'}</span></div>
                                <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>Province: <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedUser.orgProvince || 'N/A'}</span></div>
                                <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>Address: {selectedUser.address1 || '-'}</div>
                            </div>

                            {/* Documents Section */}
                            <div style={{ gridColumn: 'span 2', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Available Uploaded Documents</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {selectedUser.verificationDocument && selectedUser.verificationDocument.url && (
                                        <button onClick={() => handleDownload(selectedUser.verificationDocument)} style={styles.docButton}>📄 Authority Verification Doc</button>
                                    )}
                                    {selectedUser.environmentalLicenseFile && selectedUser.environmentalLicenseFile.url && (
                                        <button onClick={() => handleDownload(selectedUser.environmentalLicenseFile)} style={styles.docButton}>📄 EPL License</button>
                                    )}
                                    {selectedUser.wasteHandlingLicenseFile && selectedUser.wasteHandlingLicenseFile.url && (
                                        <button onClick={() => handleDownload(selectedUser.wasteHandlingLicenseFile)} style={styles.docButton}>📄 Waste Handling License</button>
                                    )}
                                    {selectedUser.portfolioDocument && selectedUser.portfolioDocument.url && (
                                        <button onClick={() => handleDownload(selectedUser.portfolioDocument)} style={styles.docButton}>📄 PRO Portfolio Document</button>
                                    )}
                                    {(!selectedUser.verificationDocument?.url && !selectedUser.environmentalLicenseFile?.url && !selectedUser.portfolioDocument?.url) && (
                                        <span style={{ color: '#666', fontSize: '13px' }}>No separate verification documents attached.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#121212', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '12px', color: '#555' }}>
                                Registered Timestamp: {new Date(selectedUser.registeredAt).toLocaleString()}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {selectedUser.status === 'Pending' && (
                                    <button onClick={() => approveCustomer(selectedUser._id)} style={{ ...styles.approveBtn, padding: '10px 20px' }}>Approve Account</button>
                                )}
                                <button onClick={() => setSelectedUser(null)} style={{ background: '#2ecc71', color: '#000', border: 'none', padding: '10px 25px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px' }}>Close Audit</button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', background: `linear-gradient(rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.48)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', color: '#fff', fontFamily: "'Inter', sans-serif" },
    sidebar: { width: '320px', position: 'fixed', top: 0, left: 0, bottom: 0, background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(25px)', borderRight: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', padding: '50px 25px', zIndex: 100 },
    logoCircle: { width: '100px', height: '100px', background: '#fff', borderRadius: '24px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', overflow: 'hidden' },
    logoImg: { width: '85%' },
    logoTitle: { color: '#2ecc71', textAlign: 'center', margin: '20px 0 50px', fontSize: '16px', fontWeight: '900', letterSpacing: '4px' },
    nav: { display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
    navBtn: { padding: '16px 20px', background: 'transparent', border: 'none', color: '#bbb', textAlign: 'left', cursor: 'pointer', borderRadius: '15px', transition: 'all 0.4s', fontSize: '15px' },
    navBtnActive: { padding: '16px 20px', background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', border: 'none', color: '#fff', textAlign: 'left', borderRadius: '15px', fontWeight: '700' },
    logoutBtn: { padding: '15px', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#e74c3c', background: 'rgba(231, 76, 60, 0.05)', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease' },
    mainContent: { flex: 1, padding: '60px', overflowY: 'auto', marginLeft: '320px', width: 'calc(100% - 320px)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' },
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
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' },
    statCard: { background: 'rgba(255, 255, 255, 0.05)', padding: '25px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', transition: '0.3s' },
    statLabel: { fontSize: '12px', color: '#2ecc71', letterSpacing: '1px', fontWeight: 'bold', textTransform: 'uppercase' },
    statValue: { fontSize: '32px', margin: '8px 0 0', fontWeight: '900', color: '#fff' },
    roleButtonsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '30px' },
    roleCardBox: { background: 'rgba(255, 255, 255, 0.04)', padding: '20px 15px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', cursor: 'pointer', transition: '0.3s', backdropFilter: 'blur(10px)' },
    approveBtn: { background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.4)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' },
    deleteBtn: { background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid #e74c3c', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    pageBtn: { padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(46, 204, 113, 0.3)', color: '#2ecc71', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    docButton: { background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.3)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }
};

export default UserManagement;