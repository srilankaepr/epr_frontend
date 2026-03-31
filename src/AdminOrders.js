import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from './logo.png'; 
import axios from 'axios';

const AdminOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDivision, setFilterDivision] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL'); // 👈 අලුත් State එක
    const [searchTerm, setSearchTerm] = useState(''); 
    const [uploadingId, setUploadingId] = useState(null); 

    const API_BASE = "https://eprbackend-production.up.railway.app/api";

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_BASE}/orders/all`);
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const divisionMatch = filterDivision === 'ALL' || 
            (order.division && order.division.toLowerCase().includes(filterDivision.toLowerCase()));
        const typeMatch = filterType === 'ALL' || order.orderType === filterType;
const statusMatch = filterStatus === 'ALL' || order.status === filterStatus;

    const searchMatch = order.invNum.toLowerCase().includes(searchTerm.toLowerCase());

    return divisionMatch && typeMatch && statusMatch && searchMatch; // 👈 statusMatch මෙතනටත් දාන්න
});
     

    // ✅ පරණ handleStatus එක එහෙම්මම තියෙනවා (අනිත් status සඳහා)
    const handleStatus = async (id, newStatus) => {
        try {
            await axios.put(`${API_BASE}/orders/update-status/${id}`, {
                status: newStatus
            });
            setOrders(orders.map(order => order._id === id ? { ...order, status: newStatus } : order));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status!");
        }
    };

    // ✅ අලුතින් එකතු කළ ZIP Upload Logic එක
  const handleZipUpload = async (e, orderId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    // 🚨 මෙන්න මෙතන 'qrZip' වෙනුවට 'zipFile' කියලා දාපන් (Backend එකේ තියෙන නම)
    formData.append('zipFile', file); 

    setUploadingId(orderId);
    try {
        // 🚨 URL එකයි Route එකයි (upload-zip) හරියටම තියෙන්න ඕනේ
        await axios.post(`${API_BASE}/orders/upload-zip/${orderId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        alert("✅ QR ZIP Uploaded Successfully!");
        setUploadingId(null);
        fetchOrders(); 
    } catch (error) {
        console.error(error);
        alert("❌ ZIP Upload Failed!");
        setUploadingId(null);
    }
};
 /*   const downloadInvoice = (fileName) => {
        if (!fileName) {
            alert("No invoice file uploaded!");
            return;
        }
        window.open(`https://eprbackend-production.up.railway.app/invoices/${fileName}`, '_blank');
    };   */

const downloadInvoice = (fileUrl, invNum) => {
    if (!fileUrl) {
        alert("No invoice file!");
        return;
    }

    if (fileUrl.startsWith('http')) {
        // අපේ Backend එක හරහාම ෆයිල් එක බාගන්නවා
        const downloadApi = `https://eprbackend-production.up.railway.app/api/orders/download-invoice?url=${encodeURIComponent(fileUrl)}&fileName=Invoice_${invNum}`;
        window.location.href = downloadApi;
    } else {
        window.open(`https://eprbackend-production.up.railway.app/invoices/${fileUrl}`, '_blank');
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
        doc.setFontSize(22);
        doc.setTextColor(46, 204, 113);
        doc.text("Order Management Report", 40, 50);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated Date: ${new Date().toLocaleString()}`, 40, 70);

        const tableColumn = ["Date", "Time", "Invoice No", "Company", "Division", "Type", "Status"];
        const tableRows = filteredOrders.map(order => [
            order.date, order.time, order.invNum, order.company,
            order.division || 'N/A', order.orderType || 'N/A', order.status
        ]);

        autoTable(doc, {
            startY: 90,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [46, 204, 113] },
            styles: { fontSize: 10, cellPadding: 8 }
        });
        doc.save(`Orders_Report_${new Date().getTime()}.pdf`);
    };

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
            .nav-item:hover { background: rgba(46, 204, 113, 0.15) !important; color: #2ecc71 !important; padding-left: 28px !important; box-shadow: inset 4px 0 0 #2ecc71; }
            .logout-glow:hover { background: rgba(231, 76, 60, 0.2) !important; transform: scale(1.02); box-shadow: 0 0 20px rgba(231, 76, 60, 0.4); }
            .order-row:hover { background: rgba(255, 255, 255, 0.05) !important; }
            .search-input:focus { border-color: #2ecc71 !important; box-shadow: 0 0 10px rgba(46, 204, 113, 0.3); }
            .zip-label:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4); }
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
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/co-partner')}>Co-Partner</button>
                    <button style={styles.navBtnActive}>Orders</button>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/qr-management')}>QR Management</button>
                </nav>
                <button onClick={handleLogout} className="logout-glow" style={styles.logoutBtn}>Logout System</button>
            </div>

            <div style={styles.mainContent}>
                <header style={{...styles.header, animation: 'fadeInDown 0.8s ease-out'}}>
                    <div>
                        <h1 style={styles.adminTitle}>ORDER MANAGEMENT</h1>
                        <p style={styles.subTitle}>Manage, filter and search orders by invoice number</p>
                    </div>
                    
                    <button onClick={downloadPDF} className="pdf-btn-glow" style={styles.mainPdfBtn}>
                        Export PDF Report
                    </button>
                </header>

                <div style={{animation: 'fadeInUp 1s ease-out'}}>
                    <div style={styles.filterBar}>
                        <div style={styles.filterItem}>
                            <input 
                                type="text"
                                placeholder="Search Invoice No..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                                style={styles.searchInput}
                            />
                        </div>

                        <div style={styles.filterItem}>
                            <label>Division: </label>
                            <select value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)} style={styles.dropdown}>
                                <option value="ALL">All Divisions</option>
                                <option value="Electronic">Electronic Division</option>
                                <option value="Plastic">Plastic Division</option>
                                <option value="Solar">Solar Division</option>
                                <option value="Agro">Agro Division</option>
                                <option value="Battery">Battery Division</option>
                                <option value="Oil">Oil Division</option>
                            </select>
                        </div>

                        <div style={styles.filterItem}>
                            <label>Type: </label>
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={styles.dropdown}>
                                <option value="ALL">All Types</option>
                                <option value="ORDER QR">ORDER QR</option>
                                <option value="ORDER PRODUCTS">ORDER PRODUCTS</option>
                            </select>
                        </div>

                    <div style={styles.filterItem}>
        <label>Status: </label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.dropdown}>
            <option value="ALL">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="QR Sent">QR Sent</option>
        </select>
    </div>

    <div style={styles.statsText}>
        Orders Found: <span style={{color: '#2ecc71'}}>{filteredOrders.length}</span>
    </div>
</div>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.theadRow}>
                                    <th style={styles.th}>Date & Time</th>
                                    <th style={styles.th}>Invoice No</th>
                                    <th style={styles.th}>Company</th>
                                    <th style={styles.th}>Division</th>
                                    <th style={styles.th}>Type</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>File</th>
                                    <th style={styles.th}>Action (Process)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="order-row" style={styles.tr}>
                                        <td style={styles.td}>{order.date} | {order.time}</td>
                                        <td style={{...styles.td, color: '#2ecc71', fontWeight: 'bold'}}>{order.invNum}</td>
                                        <td style={styles.td}>{order.company}</td>
                                        <td style={styles.td}><span style={styles.divisionTag}>{order.division || 'N/A'}</span></td>
                                        <td style={styles.td}>{order.orderType || 'N/A'}</td>
                                        <td style={{...styles.td, fontWeight: 'bold', color: order.status === 'Approved' ? '#2ecc71' : order.status === 'QR Sent' ? '#3498db' : '#f1c40f'}}>
                                            {order.status}
                                        </td>
                                        <td style={styles.td}>
<button 
        style={styles.viewBtn} 
        onClick={() => downloadInvoice(order.invoiceUrl || order.invoiceFile)}
    >
        👁️ View
    </button>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                                {/* Approve Button (පරණ Apprv බටන් එකේ logic එකමයි) */}
                                                <button 
                                                    style={{
                                                        ...styles.statusBtn, 
                                                        background: order.status === 'Approve' || order.status === 'Approved' || order.status === 'QR Sent' ? '#2ecc71' : 'transparent', 
                                                        borderColor: '#2ecc71'
                                                    }} 
                                                    onClick={() => handleStatus(order._id, 'Approved')}
                                                    disabled={order.status === 'Approved' || order.status === 'QR Sent'}
                                                >
                                                    {order.status === 'Approved' || order.status === 'QR Sent' ? 'Approved' : 'Approve'}
                                                </button>

                                                {/* ZIP Upload - Approve වුණාම විතරක් පේනවා */}
                                                {(order.status === 'Approved' || order.status === 'QR Sent') && (
                                                    <label className="zip-label" style={{...styles.statusBtn, background: '#3498db', borderColor: '#3498db', cursor: 'pointer', display: 'inline-block', textAlign: 'center'}}>
                                                        {uploadingId === order._id ? "..." : order.status === 'QR Sent' ? "Update QR" : "Upload QR"}
                                                        <input 
                                                            type="file" 
                                                            accept=".zip" 
                                                            style={{display: 'none'}} 
                                                            onChange={(e) => handleZipUpload(e, order._id)}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && (
                            <div style={{textAlign: 'center', padding: '30px', color: '#888'}}>No matches found for "{searchTerm}"</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// බෝසා මෙන්න ඔයාගේ මුල්ම styles object එක අකුරක්වත් වෙනස් නොකර
const styles = {
    container: { 
        display: 'flex', minHeight: '100vh', 
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
       backgroundAttachment: 'fixed', // 👈 මේකෙන් තමයි image එක scroll නොවී fix වෙන්නේ
   backgroundRepeat: 'no-repeat',
    color: '#fff', fontFamily: "'Inter', sans-serif" 
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







    logoCircle: { width: '100px', height: '100px', background: '#fff', borderRadius: '24px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', overflow: 'hidden' },
    logoImg: { width: '85%' },
    logoTitle: { color: '#2ecc71', textAlign: 'center', margin: '20px 0 50px', fontSize: '16px', fontWeight: '900', letterSpacing: '4px' },
    nav: { display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 },
    navBtn: { padding: '16px 20px', background: 'transparent', border: 'none', color: '#bbb', textAlign: 'left', cursor: 'pointer', borderRadius: '15px', transition: 'all 0.4s', fontSize: '15px' },
    navBtnActive: { padding: '16px 20px', background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', border: 'none', color: '#fff', textAlign: 'left', borderRadius: '15px', fontWeight: '700', boxShadow: '0 10px 25px rgba(46, 204, 113, 0.3)' },
    logoutBtn: { padding: '15px', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#e74c3c', background: 'rgba(231, 76, 60, 0.05)', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s' },
    
    mainContent: { flex: 1, padding: '60px', marginLeft: '320px',overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' },
    adminTitle: { fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', margin: 0 },
    subTitle: { color: '#888', fontSize: '14px', marginTop: '10px' },
    
    mainPdfBtn: { 
        background: 'transparent', 
        border: '1.5px solid #2ecc71', 
        color: '#2ecc71', 
        padding: '12px 35px', 
        borderRadius: '25px', 
        fontWeight: 'bold', 
        cursor: 'pointer', 
        transition: 'all 0.3s ease', 
        fontSize: '15px',
        outline: 'none'
    },

    filterBar: { display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '20px 30px', borderRadius: '20px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)' },
    filterItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#ccc' },
    searchInput: { 
        background: '#111', 
        color: '#fff', 
        border: '1px solid #333', 
        padding: '10px 15px', 
        borderRadius: '12px', 
        outline: 'none', 
        width: '200px',
        transition: '0.3s'
    },
    dropdown: { background: '#111', color: '#fff', border: '1px solid #333', padding: '10px 15px', borderRadius: '12px', outline: 'none', cursor: 'pointer' },
    statsText: { marginLeft: 'auto', fontWeight: 'bold', fontSize: '14px' },

    tableContainer: { background: 'rgba(255, 255, 255, 0.02)', borderRadius: '25px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    theadRow: { borderBottom: '2px solid rgba(46, 204, 113, 0.2)' },
    th: { padding: '15px', color: '#2ecc71', fontSize: '12px', textTransform: 'uppercase', textAlign: 'left' },
    tr: { borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: '0.3s' },
    td: { padding: '15px', fontSize: '14px', color: '#ddd' },
    divisionTag: { background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
    viewBtn: { background: 'transparent', border: '1px solid #444', color: '#fff', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
    statusButtonGroup: { display: 'flex', gap: '6px' },
    statusBtn: { border: '1px solid', color: '#fff', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: '0.2s' }
};

export default AdminOrders;