import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png'; 
import UserDashboardNavbar from './UserDashboardNavbar';
import axios from 'axios';
import backgroundImage from './assets/customerdashboard.jpg'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OilOrder = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ fullName: '', email: '', profilePic: '', role: '', companyName: '' });
    const [activeTab, setActiveTab] = useState('ORDER QR'); 
    const [invoice, setInvoice] = useState(null);
    const [orders, setOrders] = useState([]);

    const API_BASE = "https://eprbackend-production.up.railway.app/api";

    // 📄 PDF Report Generator (Same as other files)
    const generateReport = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Oil Order History Report", 14, 20);
        doc.setFontSize(11);
        doc.text(`Company: ${user.companyName}`, 14, 30);
        doc.text(`User: ${user.fullName} (${user.email})`, 14, 38);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46);

        const tableColumn = ["Date", "Time", "Invoice No", "Order Type", "Status"];
        const tableRows = orders.map(order => [
            order.date || 'N/A',
            order.time || '',
            order.invNum,
            order.orderType,
            order.status || 'Pending'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'striped',
            headStyles: { fillColor: [149, 165, 166] } // Oil Theme Color
        });

        doc.save(`Oil_Order_History_${user.companyName}.pdf`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                let userEmail = localStorage.getItem('userEmail');
                if (userEmail) {
                    userEmail = userEmail.trim().toLowerCase();
                    const [profileRes, ordersRes] = await Promise.all([
                        axios.get(`${API_BASE}/users/profile/${userEmail}`),
                        axios.get(`${API_BASE}/orders/user/${userEmail}/Oil-User`)
                    ]);

                    if (profileRes.data) {
                        setUser({
                            fullName: localStorage.getItem('userName') || "User",
                            email: userEmail,
                            profilePic: localStorage.getItem('userPhoto'),
                            role: profileRes.data.orgRole || "Not Assigned",
                            companyName: profileRes.data.companyName || "N/A"
                        });
                    }
                    if (ordersRes.data) setOrders(ordersRes.data);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };
        fetchData();
    }, []);

    const handleInvoiceUpload = (e) => {
        const file = e.target.files[0];
        if (file) setInvoice(file);
    };

    const removeInvoice = (e) => {
        e.preventDefault(); 
        setInvoice(null);
    };

    const handleSubmit = async () => {
        if (!invoice) {
            alert("Please select an invoice to upload!");
            return;
        }

        const formData = new FormData();
        formData.append('invNum', 'INV-' + Date.now().toString().slice(-6)); 
        formData.append('company', user.companyName);
        formData.append('officialEmail', user.email);
        formData.append('role', user.role);
        formData.append('invoice', invoice); 
        formData.append('orderType', activeTab);
        formData.append('division', 'Oil-User');

        try {
            const response = await axios.post(`${API_BASE}/orders/create`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 201) {
                alert("✅ Your Oil Invoice successfully saved!");
                setInvoice(null);
                const updatedOrders = await axios.get(`${API_BASE}/orders/user/${user.email}/Oil-User`);
                setOrders(updatedOrders.data);
                setActiveTab('VIEW ORDER DETAILS');
            }
        } catch (error) {
            alert("❌ Failed to save! Please check if the Backend is running.");
        }
    };

    const tabs = ["ORDER QR", "ORDER PRODUCTS", "VIEW ORDER DETAILS"];

    return (
        <div style={styles.container}>
            <UserDashboardNavbar />
            
            <style>
                {`
                @media (max-width: 600px) {
                    .top-bar { flex-direction: column; gap: 20px; text-align: center; }
                    .tab-grid { grid-template-columns: 1fr !important; }
                    .qr-card { width: 100% !important; }
                }
                .upload-area:hover { border-color: #95a5a6 !important; background: rgba(149, 165, 166, 0.1) !important; }
                .tab-button:hover { transform: translateY(-5px); border-color: #95a5a6 !important; }
                `}
            </style>

            {/* 1. Header Section */}
            <div style={styles.topBar} className="top-bar">
                <div style={styles.logoArea}>
                    <div style={{...styles.logoCircle, border: '3px solid #95a5a6'}}>
                        <img src={logo} alt="Logo" style={styles.logoImg} />
                    </div>
                    <div>
                        <h2 style={styles.brandName}>EPR SYSTEM</h2>
                        <div style={{...styles.subTitle, color: '#95a5a6', fontWeight: 'bold'}}>Oil Division</div>
                    </div>
                </div>

                <div style={styles.profileArea}>
                    <div style={styles.userInfo}>
                        <span style={styles.userName}>{user.fullName}</span>
                        <span style={styles.userEmail}>{user.email}</span>
                    </div>
                    <div style={{...styles.profileCircle, border: '2px solid #95a5a6'}}>
                        {user.profilePic ? (
                            <img src={user.profilePic} alt="Profile" style={styles.profileImg} />
                        ) : (
                            <span style={{...styles.profileLetter, color: '#95a5a6'}}>{user.fullName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                </div>
            </div>

            <hr style={styles.divider} />

            {/* 2. Navigation Tab Grid */}
            <div style={styles.tabGrid} className="tab-grid">
                {tabs.map((tab) => (
                    <div 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            ...styles.tabBtn,
                            borderColor: activeTab === tab ? '#95a5a6' : 'rgba(255, 255, 255, 0.1)',
                            background: activeTab === tab ? 'rgba(149, 165, 166, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        }}
                        className="tab-button"
                    >
                        <span style={{ fontSize: '24px', marginBottom: '10px' }}>
                            {tab === "ORDER QR" ? "📱" : tab === "ORDER PRODUCTS" ? "🛢️" : "📋"}
                        </span>
                        <span style={{
                            color: activeTab === tab ? '#95a5a6' : '#fff',
                            fontWeight: 'bold',
                            fontSize: '13px'
                        }}>
                            {tab}
                        </span>
                    </div>
                ))}
            </div>

            {/* 3. Content Area */}
            <div style={styles.content}>
                {activeTab !== 'VIEW ORDER DETAILS' ? (
                    <>
                        <div style={styles.qrGrid}>
                            <div style={styles.qrCard} className="qr-card">
                                <h3 style={styles.cardTitle}>User Information</h3>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Company:</span>
                                    <span style={styles.infoValue}>{user.companyName}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Role:</span>
                                    <span style={{...styles.infoValue, color: '#95a5a6'}}>{user.role.toUpperCase()}</span>
                                </div>
                            </div>

                            <div style={styles.qrCard} className="qr-card">
                                <h3 style={styles.cardTitle}>Upload Oil Invoice</h3>
                                <label style={styles.uploadArea} className="upload-area">
                                    <input type="file" style={{display: 'none'}} onChange={handleInvoiceUpload} accept=".pdf,image/*" />
                                    <span style={{fontSize: '30px'}}>📂</span>
                                    <span style={{marginTop: '10px', fontSize: '14px'}}>
                                        {invoice ? invoice.name : `Select ${activeTab.toLowerCase()} invoice`}
                                    </span>
                                    {invoice && (
                                        <div onClick={removeInvoice} style={{ marginTop: '10px', color: '#e74c3c', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                                            Remove Invoice
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div style={{textAlign: 'center', marginTop: '30px'}}>
                            <div style={styles.qrPlaceholder}>
                                <div style={{...styles.qrBox, color: '#95a5a6'}}>
                                    {activeTab === 'ORDER QR' ? "🔳 Oil QR" : "🛢️ Oil Products"}
                                </div>
                                <p style={{fontSize: '14px', color: '#ccc', marginTop: '10px'}}>
                                    Requesting {activeTab} for Oil Division
                                </p>
                            </div>
                            {invoice && (
                                <button style={{...styles.submitBtn, background: '#95a5a6'}} onClick={handleSubmit}>
                                    Submit {activeTab}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{padding: '10px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h3 style={styles.cardTitle}>Oil Order History</h3>
                            {orders.length > 0 && (
                                <button onClick={generateReport} style={styles.reportBtn}>
                                    📄 Download Report
                                </button>
                            )}
                        </div>
                         <div style={styles.countBadge}>
                            Total Orders: <span style={{color: '#f1c40f'}}>{orders.length}</span>
                        </div>
                        
                        {orders.length > 0 ? (
                            <div style={{overflowX: 'auto'}}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={styles.th}>Date & Time</th>
                                            <th style={styles.th}>Invoice No</th>
                                            <th style={styles.th}>Order Type</th>
                                            <th style={styles.th}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, index) => (
                                            <tr key={index} style={styles.tableRow}>
                                                <td style={styles.td}>
                                                    {order.date} <br/>
                                                    <small style={{color: '#95a5a6'}}>{order.time}</small>
                                                </td>
                                                <td style={styles.td}>{order.invNum}</td>
                                                <td style={styles.td}>
                                                    <span style={order.orderType === 'ORDER QR' ? styles.typeQR : styles.typeProduct}>
                                                        {order.orderType}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Status එක පෙන්වන කොටස (Status එක අනුව පාට වෙනස් වේ) */}
        <span style={{ 
            color: order.status === 'Approved' ? '#00f2fe' : 
                   order.status === 'QR Sent' ? '#3498db' : '#f1c40f', 
            fontWeight: 'bold' 
        }}>
            {order.status || 'Pending'}
        </span>

        {/* ✅ Admin විසින් QR එක එවා ඇත්නම් පමණක් Download Button එක පෙන්වයි */}
        {order.status === 'QR Sent' && order.qrZipFile && (
            <button 
                onClick={() => window.open(`https://eprbackend-production.up.railway.app/${order.qrZipFile.replace(/\\/g, '/')}`, '_blank')}
                style={{
                    padding: '5px 12px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
            >
                Download QR
            </button>
        )}
    </div>
</td>
     </tr>
           ))}
              </tbody>
                   </table>
                            </div>
                        ) : (
                            <p style={{textAlign: 'center', color: '#777', padding: '20px'}}>No order history found.</p>
                        )}
                    </div>
                )}
            </div>

            <div style={styles.footer}>
                <button onClick={() => navigate('/user-dashboard')} style={styles.backBtn}>
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        padding: window.innerWidth <= 600 ? '20px 15px' : '30px 50px', 
        minHeight: '100vh', 
        color: '#fff', 
        fontFamily: "'Inter', sans-serif",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.48)), url(${backgroundImage})`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    logoArea: { display: 'flex', alignItems: 'center', gap: '20px' },
    logoCircle: { width: '120px', height: '120px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    logoImg: { width: '80%' },
    brandName: { color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: 0 },
    subTitle: { fontSize: '13px' },
    profileArea: { display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255, 255, 255, 0.05)', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(5px)' },
    userInfo: { display: 'flex', flexDirection: 'column', textAlign: 'right' },
    userName: { fontWeight: 'bold', fontSize: '14px' },
    userEmail: { fontSize: '11px', color: '#ccc' },
    profileCircle: { width: '45px', height: '45px', background: '#222', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    profileImg: { width: '100%', height: '100%', objectFit: 'cover' },
    profileLetter: { fontSize: '20px', fontWeight: 'bold' },
    divider: { border: '0', borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '20px 0' },
    tabGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
    tabBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer', transition: '0.3s ease', backdropFilter: 'blur(5px)' },
    content: { background: 'rgba(20, 20, 20, 0.8)', padding: '30px', borderRadius: '25px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' },
    qrGrid: { display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' },
    qrCard: { background: 'rgba(255, 255, 255, 0.03)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', width: '400px', textAlign: 'center', backdropFilter: 'blur(5px)' },
    cardTitle: { fontSize: '18px', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' },
    infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '15px' },
    infoLabel: { color: '#bbb' },
    infoValue: { fontWeight: 'bold', color: '#fff' },
    qrPlaceholder: { maxWidth: '400px', margin: '20px auto', padding: '30px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' },
    qrBox: { fontSize: '32px', fontWeight: 'bold' },
    uploadArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255, 255, 255, 0.2)', borderRadius: '15px', padding: '30px', cursor: 'pointer', transition: '0.3s' },
    submitBtn: { width: '100%', maxWidth: '400px', padding: '12px', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 'extrabold', cursor: 'pointer' },
    footer: { marginTop: '40px', textAlign: 'center' },
    backBtn: { padding: '12px 25px', background: 'transparent', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    tableHeader: { borderBottom: '2px solid #95a5a6', textAlign: 'left' },
    th: { padding: '12px', color: '#95a5a6', fontSize: '14px' },
    td: { padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '13px' },
    tableRow: { transition: '0.3s' },
            countBadge: { background: 'rgba(255, 255, 255, 0.05)', padding: '8px 15px', borderRadius: '8px', display: 'inline-block', marginBottom: '15px', fontSize: '14px' },

    reportBtn: { background: '#95a5a6', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    typeQR: { background: 'rgba(241, 196, 15, 0.2)', color: '#f1c40f', padding: '3px 8px', borderRadius: '5px', fontSize: '11px' },
    typeProduct: { background: 'rgba(52, 152, 219, 0.2)', color: '#3498db', padding: '3px 8px', borderRadius: '5px', fontSize: '11px' }
};

export default OilOrder;