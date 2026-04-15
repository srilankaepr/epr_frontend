import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png'; 
import AddPartnerForm from './AddPartnerForm'; 
import API from './api';

const CoPartner = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('list'); 
    const [partners, setPartners] = useState([]); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filterDistrict, setFilterDistrict] = useState(''); 
    const [showPassword, setShowPassword] = useState(false); 
    const [isEditing, setIsEditing] = useState(false);
    const [partnerData, setPartnerData] = useState({
        _id: '', coPartnerId: '', name: '', nic: '', email: '', password: '', district: '', pradeshiyaSabha: ''
    });

    
    const fetchPartners = async () => {
        try {
            const res = await API.get('/partners/all');
            setPartners(res.data);
        } catch (err) {
            console.error("Error fetching data");
        }
    };

    const resetForm = () => {
        setPartnerData({ _id: '', coPartnerId: '', name: '', phone: '', nic: '', email: '', password: '', district: '', pradeshiyaSabha: '' });
        setIsEditing(false);
        setView('list');
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partnerData.name || !partnerData.nic || !partnerData.phone) {
        alert("Please fill in the required fields (Name, Phone and NIC).");
        return;
    }
        try {
            if (isEditing) {
                await API.put(`/partners/update/${partnerData._id}`, partnerData);
                alert("Partner Details Updated Successfully! ✅");
            } else {
                const { _id, coPartnerId, ...submitData } = partnerData; 
                const response = await API.post('/partners/register', submitData);
                const newID = response.data?.partner?.coPartnerId || "Generated";
                alert(`New Partner Registered Successfully! \nAssigned ID: ${newID} 🚀`);
            }
            await fetchPartners(); 
            resetForm();
            setView('list');
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Action failed. Please try again.";
            alert(`Error: ${errorMessage}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === "coPartnerId" ? value.toUpperCase() : value;
        setPartnerData({ ...partnerData, [name]: finalValue });
    };

    const handleEdit = (partner) => {
        setPartnerData(partner);
        setIsEditing(true);
        setView('add');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this partner?")) {
            try {
                await API.delete(`/partners/delete/${id}`);
                fetchPartners();
            } catch (err) {
                alert("Delete failed.");
            }
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            navigate('/');
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    // --- Search & Filter Logic (අලුතින් එක් කළ කොටස) ---
    const filteredPartners = partners.filter(p => {
        const matchesSearch = 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.coPartnerId && p.coPartnerId.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesDistrict = filterDistrict === '' || p.district === filterDistrict;
        return matchesSearch && matchesDistrict;
    });

    const districtsList = [...new Set(partners.map(p => p.district))].filter(Boolean);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
            .nav-item:hover { background: rgba(46, 204, 113, 0.15) !important; color: #2ecc71 !important; padding-left: 28px !important; }
            .logout-glow:hover { background: rgba(231, 76, 60, 0.2) !important; transform: scale(1.02); box-shadow: 0 0 20px rgba(231, 76, 60, 0.4); }
            .search-input:focus { border-color: #2ecc71 !important; box-shadow: 0 0 10px rgba(46, 204, 113, 0.2); }
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
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/user-management')}>User Management</button>
                    <button style={styles.navBtnActive}>Co-Partner</button>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/admin-orders')}>Orders</button>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/qr-management')}>QR Management</button>
                </nav>
                <button onClick={handleLogout} className="logout-glow" style={styles.logoutBtn}>Logout System</button>
            </div>

            <div style={styles.mainContent}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.pageTitle}>CO-PARTNER MANAGEMENT</h1>
                        <p style={styles.subTitle}>Manage and monitor your business co-partners</p>
                        <div style={styles.statsBadge}>
                            <span style={{ color: '#aaa', fontSize: '14px' }}>Found Partners: </span>
                            <span style={{ color: '#2ecc71', fontSize: '20px', fontWeight: 'bold', marginLeft: '10px' }}>
                                {filteredPartners.length}
                            </span>
                        </div>
                    </div>
                    <button 
                        style={view === 'list' ? styles.addBtn : styles.backBtn} 
                        onClick={() => { if(view === 'add') resetForm(); else setView('add'); }}
                    >
                        {view === 'list' ? '+ Add New Partner' : '← Back to List'}
                    </button>
                </header>

                <div style={{animation: 'fadeIn 1s ease-in'}}>
                    {view === 'list' ? (
                        <>
                            {/* --- අලුතින් එක් කළ Search & Filter Bar --- */}
                            <div style={styles.searchContainer}>
                                <input 
                                    type="text" 
                                    className="search-input"
                                    placeholder="Search by Name, NIC or ID..." 
                                    style={styles.searchInput}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <select 
                                    style={styles.filterSelect}
                                    value={filterDistrict}
                                    onChange={(e) => setFilterDistrict(e.target.value)}
                                >
                                    <option value="">All Districts</option>
                                    {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>Created Co-Partners</h3>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={styles.th}>Partner ID</th>
                                            <th style={styles.th}>Name</th>
                                            <th style={styles.th}>Phone</th>
                                            <th style={styles.th}>NIC</th>
                                            <th style={styles.th}>Email</th>
                                            <th style={styles.th}>District</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPartners.length > 0 ? filteredPartners.map((p) => (
                                            <tr key={p._id} style={styles.tableRow}>
                                                <td style={styles.td}>{p.coPartnerId}</td>
                                                <td style={styles.td}>{p.name}</td>
                                                <td style={styles.td}>{p.phone || 'N/A'}</td>
                                                <td style={styles.td}>{p.nic}</td>
                                                <td style={styles.td}>{p.email}</td>
                                                <td style={styles.td}>{p.district}</td>
                                                <td style={styles.td}>
                                                    <button style={styles.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                                                    <button style={styles.deleteBtn} onClick={() => handleDelete(p._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" style={{textAlign:'center', padding:'20px', color:'#999'}}>No Partners Found matching your search.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <AddPartnerForm 
                            partnerData={partnerData} 
                            handleChange={handleChange} 
                            handleSubmit={handleSubmit} 
                            onCancel={resetForm} 
                            showPassword={showPassword}     
                            setShowPassword={setShowPassword}
                            isEditing={isEditing}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', background: `linear-gradient(rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.48)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', color: '#fff', fontFamily: "'Inter', sans-serif", overflow: 'hidden' },
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
    logoCircle: { width: '100px', height: '100px', background: '#fff', borderRadius: '24px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', overflow: 'hidden' },
    logoImg: { width: '85%' },
    logoTitle: { color: '#2ecc71', textAlign: 'center', margin: '20px 0 50px', fontSize: '16px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' },
    nav: { display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
    navBtn: { padding: '16px 20px', background: 'transparent', border: 'none', color: '#bbb', textAlign: 'left', cursor: 'pointer', borderRadius: '15px', transition: 'all 0.4s ease', fontSize: '15px', fontWeight: '500' },
    navBtnActive: { padding: '16px 20px', background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', border: 'none', color: '#fff', textAlign: 'left', borderRadius: '15px', fontWeight: '700', boxShadow: '0 10px 25px rgba(46, 204, 113, 0.3)' },
    logoutBtn: { padding: '15px', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#e74c3c', background: 'rgba(231, 76, 60, 0.05)', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s', marginTop: 'auto' },
    mainContent: { flex: 1, padding: '60px', overflowY: 'auto', marginLeft: '320px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    pageTitle: { fontSize: '38px', fontWeight: '900', letterSpacing: '-1.5px' },
    subTitle: { color: '#2ecc71', margin: '5px 0 0', fontSize: '14px', letterSpacing: '1px' },
    statsBadge: { marginTop: '15px', background: 'rgba(46, 204, 113, 0.1)', padding: '10px 20px', borderRadius: '12px', display: 'inline-block', border: '1px solid rgba(46, 204, 113, 0.3)' },
    searchContainer: { display: 'flex', gap: '15px', marginBottom: '30px', animation: 'fadeIn 1.2s' },
    searchInput: { flex: 2, padding: '14px 20px', borderRadius: '15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', outline: 'none', transition: '0.3s' },
    filterSelect: { flex: 1, padding: '14px', borderRadius: '15px', background: 'rgba(30, 30, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', cursor: 'pointer', outline: 'none' },
    backBtn: { padding: '12px 25px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s'},
    addBtn: { padding: '12px 25px', background: 'rgba(46, 204, 113, 0.2)', border: '1px solid #2ecc71', borderRadius: '12px', color: '#2ecc71', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(46, 204, 113, 0.2)' },
    card: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', borderRadius: '25px', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '20px', overflow: 'hidden' },
    cardTitle: { color: '#2ecc71', marginBottom: '20px', fontSize: '18px', fontWeight: '700' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { borderBottom: '2px solid rgba(46, 204, 113, 0.3)', textAlign: 'left' },
    th: { padding: '20px 15px', color: '#2ecc71', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', fontWeight: 'bold' },
    tableRow: { borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' },
    td: { padding: '20px 15px', fontSize: '15px', color: '#ddd' },
    editBtn: { background: 'transparent', border: '1px solid #2ecc71', color: '#2ecc71', padding: '5px 15px', borderRadius: '8px', marginRight: '10px', cursor: 'pointer' },
    deleteBtn: { background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer' }
};

export default CoPartner;