import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api'; // ඔයාගේ API instance එක ඇති තැනට අදාළව මෙය වෙනස් කරගන්න

const UnifiedUserManagement = () => {
    const navigate = useNavigate();
    const [unifiedData, setUnifiedData] = useState({ admins: [], customers: [] });
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchAllUnifiedData();
    }, []);

    const fetchAllUnifiedData = async () => {
        try {
            setIsLoading(true);
            const response = await API.get('/admin/users/unified');
            setUnifiedData({
                admins: response.data.admins || [],
                customers: response.data.customers || []
            });
            setStats(response.data.stats || { total: 0, pending: 0, approved: 0 });
            setIsLoading(false);
        } catch (error) {
            console.error("❌ Failed to fetch unified users:", error);
            alert("Failed to load system users data.");
            setIsLoading(false);
        }
    };

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
    };

    // Filter Logic
    const filteredCustomers = unifiedData.customers.filter(cust => {
        const matchesRole = filterRole === 'All' || cust.accountCategory === filterRole || cust.orgRole?.toLowerCase().includes(filterRole.toLowerCase());
        const matchesSearch = cust.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              cust.officialEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              cust.regNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    return (
        <div style={styles.container}>
            <div style={styles.contentWrap}>
                <div style={styles.headerArea}>
                    <h2 style={styles.title}>UNIFIED USER MANAGEMENT SYSTEM</h2>
                    <p style={styles.subText}>Manage and monitor all system administrators, PROs, Waste operators, PIBOs, and Authorities securely.</p>
                </div>

                {/* 📊 STATS CARDS */}
                <div style={styles.statsContainer}>
                    <div style={styles.statCard}>
                        <p style={styles.statTitle}>TOTAL REGISTERED USERS</p>
                        <h3 style={styles.statValue}>{stats.total}</h3>
                    </div>
                    <div style={{ ...styles.statCard, borderColor: '#f1c40f' }}>
                        <p style={{ ...styles.statTitle, color: '#f1c40f' }}>PENDING APPROVALS</p>
                        <h3 style={{ ...styles.statValue, color: '#f1c40f' }}>{stats.pending}</h3>
                    </div>
                    <div style={{ ...styles.statCard, borderColor: '#2ecc71' }}>
                        <p style={{ ...styles.statTitle, color: '#2ecc71' }}>APPROVED USERS</p>
                        <h3 style={{ ...styles.statValue, color: '#2ecc71' }}>{stats.approved}</h3>
                    </div>
                </div>

                {/* 🔍 FILTER & SEARCH BAR */}
                <div style={styles.filterBar}>
                    <div style={styles.searchWrapper}>
                        <input 
                            type="text" 
                            placeholder="Search by Company, Email, or Reg No..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <div style={styles.filterWrapper}>
                        <label style={{ color: '#aaa', fontSize: '13px', marginRight: '10px' }}>FILTER BY CATEGORY:</label>
                        <select 
                            value={filterRole} 
                            onChange={(e) => setFilterRole(e.target.value)}
                            style={styles.selectInput}
                        >
                            <option value="All">All Categories</option>
                            <option value="PRO">PRO (Producer Responsibility Org)</option>
                            <option value="WASTE">Waste Management (Collector/Recycler)</option>
                            <option value="PIBO">PIBO (Producer/Importer/Brand)</option>
                            <option value="AUTHORITY">Government Authority</option>
                            <option value="LEGACY">Legacy Customers</option>
                        </select>
                    </div>
                </div>

                {/* 📋 ADMINS SECTION */}
                <div style={styles.sectionBlock}>
                    <h3 style={styles.sectionTitle}>REGISTERED ADMINISTRATORS</h3>
                    <div style={styles.tableResponsive}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.trHead}>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>FULL NAME</th>
                                    <th style={styles.th}>EMAIL ADDRESS</th>
                                    <th style={styles.th}>ADMIN ROLE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unifiedData.admins.map((adm, index) => (
                                    <tr key={adm._id} style={styles.trBody}>
                                        <td style={styles.td}>{index + 1}</td>
                                        <td style={styles.td}>{adm.fullName || 'N/A'}</td>
                                        <td style={styles.td}>{adm.email}</td>
                                        <td style={styles.td}><span style={styles.badgeAdmin}>ADMIN</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 🏢 MASTER CUSTOMERS TABLE */}
                <div style={styles.sectionBlock}>
                    <h3 style={styles.sectionTitle}>UNIFIED SYSTEM USERS (PRO, Waste, PIBO, Authority, Legacy)</h3>
                    {isLoading ? (
                        <p style={{ color: '#fff', textAlign: 'center', padding: '30px' }}>Loading secure database records...</p>
                    ) : (
                        <div style={styles.tableResponsive}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.trHead}>
                                        <th style={styles.th}>REG NO / ID</th>
                                        <th style={styles.th}>COMPANY / INSTITUTION</th>
                                        <th style={styles.th}>CATEGORY</th>
                                        <th style={styles.th}>OFFICIAL EMAIL</th>
                                        <th style={styles.th}>PHONE</th>
                                        <th style={styles.th}>STATUS</th>
                                        <th style={styles.th}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No records found.</td>
                                        </tr>
                                    ) : (
                                        filteredCustomers.map((cust) => (
                                            <tr key={cust._id} style={styles.trBody}>
                                                <td style={styles.td}>{cust.regNumber || cust.systemRegId || 'N/A'}</td>
                                                <td style={styles.td}><b>{cust.companyName || cust.institutionName || 'N/A'}</b></td>
                                                <td style={styles.td}>
                                                    <span style={getCategoryBadgeStyle(cust.accountCategory)}>
                                                        {cust.accountCategory || 'CUSTOMER'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>{cust.officialEmail}</td>
                                                <td style={styles.td}>{cust.phone || cust.contactMobile || 'N/A'}</td>
                                                <td style={styles.td}>
                                                    <span style={cust.status === 'Approved' ? styles.badgeApproved : styles.badgePending}>
                                                        {cust.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <button 
                                                        style={styles.viewBtn} 
                                                        onClick={() => handleOpenModal(cust)}
                                                    >
                                                        View Full Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔍 DETAILED MODAL FOR EVERY DATA FIELD & DOCUMENTS */}
            {isModalOpen && selectedUser && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, color: '#fff' }}>
                                📁 Full Profile: {selectedUser.companyName || selectedUser.institutionName}
                            </h3>
                            <span style={getCategoryBadgeStyle(selectedUser.accountCategory)}>
                                {selectedUser.accountCategory}
                            </span>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.infoGrid}>
                                <div style={styles.infoItem}><span>Registration No:</span> <b>{selectedUser.regNumber || 'N/A'}</b></div>
                                <div style={styles.infoItem}><span>Official Email:</span> <b>{selectedUser.officialEmail}</b></div>
                                <div style={styles.infoItem}><span>Contact Person:</span> <b>{selectedUser.contactPersonName || selectedUser.username || 'N/A'}</b></div>
                                <div style={styles.infoItem}><span>Mobile Phone:</span> <b>{selectedUser.phone || selectedUser.contactMobile || 'N/A'}</b></div>
                                <div style={styles.infoItem}><span>Org Role / Type:</span> <b>{selectedUser.orgRole || selectedUser.designation || 'N/A'}</b></div>
                                <div style={styles.infoItem}><span>Registered Date:</span> <b>{new Date(selectedUser.registeredAt || selectedUser.createdAt).toLocaleDateString()}</b></div>
                            </div>

                            {/* DYNAMIC EXTRA FIELDS BASED ON CATEGORY */}
                            <h4 style={{ color: '#2ecc71', marginTop: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                                Category Specific Details & Documents
                            </h4>

                            <div style={styles.docSection}>
                                {selectedUser.accountCategory === 'AUTHORITY' && (
                                    <div>
                                        <p><b>Institution Name:</b> {selectedUser.institutionName}</p>
                                        <p><b>Designation:</b> {selectedUser.designation}</p>
                                    </div>
                                )}

                                {selectedUser.accountCategory === 'PRO' && (
                                    <div>
                                        <p><b>District / Province:</b> {selectedUser.orgDistrict} / {selectedUser.orgProvince}</p>
                                        <p><b>Managed PIBOS Count:</b> {selectedUser.managedPibosCount}</p>
                                        <p><b>Service Capabilities:</b> {selectedUser.serviceCapabilities?.join(', ') || 'None'}</p>
                                    </div>
                                )}

                                {selectedUser.accountCategory === 'WASTE' && (
                                    <div>
                                        <p><b>Facility Location:</b> {selectedUser.facilityLocation || 'N/A'}</p>
                                        <p><b>Has Environmental License:</b> {selectedUser.hasEnvironmentalLicense}</p>
                                        <p><b>Has Waste Handling License:</b> {selectedUser.hasWasteHandlingLicense}</p>
                                    </div>
                                )}

                                {selectedUser.accountCategory === 'PIBO' && (
                                    <div>
                                        <p><b>Business Type:</b> {selectedUser.piboBusinessType?.join(', ') || 'N/A'}</p>
                                        <p><b>TIN / VAT Number:</b> {selectedUser.piboTinVatNumber || 'N/A'}</p>
                                    </div>
                                )}

                                {/* DOCUMENT LINKS PREVIEW */}
                                <div style={{ marginTop: '15px' }}>
                                    <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}><b>Uploaded Supporting Documents:</b></p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {selectedUser.verificationDocument?.url && (
                                            <a href={selectedUser.verificationDocument.url} target="_blank" rel="noreferrer" style={styles.docLink}>
                                                📄 Verification Document
                                            </a>
                                        )}
                                        {selectedUser.brcDocument?.url && (
                                            <a href={selectedUser.brcDocument.url} target="_blank" rel="noreferrer" style={styles.docLink}>
                                                📄 BRC Document
                                            </a>
                                        )}
                                        {selectedUser.vatDocument?.url && (
                                            <a href={selectedUser.vatDocument.url} target="_blank" rel="noreferrer" style={styles.docLink}>
                                                📄 VAT Document
                                            </a>
                                        )}
                                        {selectedUser.environmentalLicenseFile?.url && (
                                            <a href={selectedUser.environmentalLicenseFile.url} target="_blank" rel="noreferrer" style={styles.docLink}>
                                                📄 Environmental License
                                            </a>
                                        )}
                                        {selectedUser.piboImportLicenseFile?.url && (
                                            <a href={selectedUser.piboImportLicenseFile.url} target="_blank" rel="noreferrer" style={styles.docLink}>
                                                📄 Import License
                                            </a>
                                        )}
                                        {(!selectedUser.verificationDocument?.url && !selectedUser.brcDocument?.url && !selectedUser.vatDocument?.url) && (
                                            <span style={{ color: '#666', fontSize: '13px' }}>No direct documents attached or legacy record.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button style={styles.closeBtn} onClick={handleCloseModal}>Close Profile</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Category Badge Color Helpers
const getCategoryBadgeStyle = (cat) => {
    switch (cat) {
        case 'PRO': return { background: 'rgba(52, 152, 219, 0.2)', color: '#3498db', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #3498db' };
        case 'WASTE': return { background: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #2ecc71' };
        case 'PIBO': return { background: 'rgba(155, 89, 182, 0.2)', color: '#9b59b6', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #9b59b6' };
        case 'AUTHORITY': return { background: 'rgba(241, 196, 15, 0.2)', color: '#f1c40f', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #f1c40f' };
        default: return { background: 'rgba(127, 140, 141, 0.2)', color: '#bdc3c7', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #bdc3c7' };
    }
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#0b0f19', padding: '40px 20px', color: '#fff', fontFamily: "'Inter', sans-serif" },
    contentWrap: { maxWidth: '1300px', margin: '0 auto' },
    headerArea: { marginBottom: '30px', textAlign: 'center' },
    title: { fontSize: '28px', fontWeight: '900', letterSpacing: '2px', color: '#fff', margin: '0 0 10px 0' },
    subText: { color: '#888', fontSize: '14px', margin: '0' },
    
    statsContainer: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
    statCard: { flex: '1 1 250px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' },
    statTitle: { fontSize: '12px', color: '#aaa', fontWeight: 'bold', letterSpacing: '1px', margin: '0 0 10px 0' },
    statValue: { fontSize: '32px', fontWeight: '900', color: '#fff', margin: '0' },

    filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
    searchWrapper: { flex: '1 1 300px' },
    searchInput: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', fontSize: '14px' },
    filterWrapper: { display: 'flex', alignItems: 'center' },
    selectInput: { padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1f2c', color: '#fff', outline: 'none', fontSize: '14px', cursor: 'pointer' },

    sectionBlock: { marginBottom: '40px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '25px' },
    sectionTitle: { fontSize: '16px', color: '#2ecc71', marginBottom: '20px', letterSpacing: '1px', fontWeight: 'bold' },
    tableResponsive: { width: '100%', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    trHead: { borderBottom: '2px solid rgba(255,255,255,0.1)' },
    th: { padding: '14px', fontSize: '12px', color: '#aaa', letterSpacing: '1px' },
    trBody: { borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' },
    td: { padding: '14px', fontSize: '14px', color: '#ddd' },

    badgeAdmin: { background: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #e74c3c' },
    badgeApproved: { background: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
    badgePending: { background: 'rgba(241, 196, 15, 0.2)', color: '#f1c40f', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
    
    viewBtn: { background: '#2ecc71', color: '#000', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: '0.3s' },

    // Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(8px)' },
    modalCard: { background: '#121824', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' },
    modalBody: { fontSize: '14px', color: '#ccc' },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
    infoItem: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' },
    docSection: { marginTop: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
    docLink: { display: 'inline-block', background: 'rgba(52, 152, 219, 0.2)', color: '#3498db', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', border: '1px solid #3498db' },
    modalFooter: { marginTop: '25px', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' },
    closeBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }
};

export default UnifiedUserManagement;