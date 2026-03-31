import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png'; 
import UserDashboardNavbar from './UserDashboardNavbar';
import axios from 'axios';
import backgroundImage from './assets/customerdashboard.jpg'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const ElectronicOrder = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ fullName: '', email: '', profilePic: '', role: '', companyName: '' });
    const [activeTab, setActiveTab] = useState('ORDER QR'); 
    const [invoice, setInvoice] = useState(null);
    const [invoiceBase64, setInvoiceBase64] = useState("");
    const [orders, setOrders] = useState([]);
    const API_BASE = "https://eprbackend-production.up.railway.app/api";

 const generateReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Electronic Order History Report", 14, 20);
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

    // 🔥 මෙන්න මෙතන වෙනස බලන්න: doc.autoTable වෙනුවට autoTable(doc, ...)
    autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 55,
    theme: 'striped',
    headStyles: { fillColor: [46, 204, 113] },
    // Status එක අනුව column එකේ පාට වෙනස් කරන්න මේක දාන්න (Optional)
    didParseCell: function(data) {
        if (data.column.index === 4 && data.cell.section === 'body') {
            if (data.cell.raw === 'Approved') {
                data.cell.styles.textColor = [46, 204, 113]; // Green
            }
        }
    }
});

    doc.save(`Electronic_Order_Report_${user.companyName}.pdf`);
};

// ElectronicOrder.js user data fetching with useEffect
useEffect(() => {
    const fetchUserData = async () => {
        try {
            let userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                userEmail = userEmail.trim().toLowerCase();

                const [profileResponse, ordersResponse] = await Promise.all([
                    axios.get(`${API_BASE}/users/profile/${userEmail}`),
                    axios.get(`${API_BASE}/orders/user/${userEmail}/Electronic-User`)
                ]);

                if (profileResponse.data) {
                    const photoToShow = profileResponse.data.profilePic || localStorage.getItem('userPhoto');

                    setUser({
                        fullName: localStorage.getItem('userName') || "User",
                        email: userEmail,
                        profilePic: photoToShow, 
                        role: profileResponse.data.orgRole || "Not Assigned",
                        companyName: profileResponse.data.companyName || "N/A"
                    });

                    if (profileResponse.data.profilePic) {
                        localStorage.setItem('userPhoto', profileResponse.data.profilePic);
                    }
                }

                if (ordersResponse.data) {
                    setOrders(ordersResponse.data);
                }
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };
    fetchUserData();
}, []);

    // 3. Invoice Upload and remove Functions................................................................................
  const handleInvoiceUpload = (e) => {
    const file = e.target.files[0];
    if (file) { 
        setInvoice(file); 
        
        // 💡 පීඩීඑෆ් එක අකුරු වැලක් (String) කරන මැජික් එක:
        const reader = new FileReader();
        reader.onloadend = () => {
            setInvoiceBase64(reader.result); // ✅ මේක තමයි Backend එකට යන්නේ
        };
        reader.readAsDataURL(file);
    }
};
    const removeInvoice = (e) => {
        e.preventDefault(); 
        setInvoice(null);
    };

// --- handleSubmit කොටස ---
const handleSubmit = async () => {
    if (!invoiceBase64) {
        alert("Please select an invoice!");
        return;
    }

    // ✅ සාමාන්‍ය Object එකක් විදිහට දත්ත ටික හදන්න
    const orderData = {
        invNum: 'INV-' + Date.now().toString().slice(-6),
        company: user.companyName,
        role: user.role,
        officialEmail: user.email,
        invoiceFile: invoiceBase64, // 👈 අර String එක මෙතනට දානවා
        orderType: activeTab,
        division: 'Electronic-User'
    };

    try {
        // ✅ Headers මොකුත් ඕනේ නැහැ, axios මේක JSON විදිහට අරන් යනවා
        const response = await axios.post('https://eprbackend-production.up.railway.app/api/orders/create', orderData);

        if (response.status === 201) {
            alert("✅ Your Electronic Invoice successfully saved!");
            setInvoice(null);
            setInvoiceBase64(""); 
            // ... refresh කරන කොටස ...
        }
    } catch (error) {
        console.error("Upload Error:", error);
        alert("❌ Failed to save!");
    }
};

    const tabs = ["ORDER QR", "ORDER PRODUCTS", "VIEW ORDER DETAILS"];

    console.log("Current User Photo Path:", user.profilePic);

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
                .upload-area:hover { border-color: #2ecc71 !important; background: rgba(46, 204, 113, 0.1) !important; }
                .tab-button:hover { transform: translateY(-5px); border-color: #2ecc71 !important; }
                `}
            </style>

            <div style={styles.topBar} className="top-bar">
                <div style={styles.logoArea}>
                    <div style={styles.logoCircle}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                    <div>
                        <h2 style={styles.brandName}>EPR SYSTEM</h2>
                        <div style={{...styles.subTitle, color: '#2ecc71', fontWeight: 'bold'}}>Electronic & Electrical Division</div>
                    </div>
                </div>

                <div style={styles.profileArea}>
                    <div style={styles.userInfo}>
                        <span style={styles.userName}>{user.fullName}</span>
                        <span style={styles.userEmail}>{user.email}</span>
                    </div>
                    <div style={styles.profileCircle}>
                        {user.profilePic ? (
                            <img src={user.profilePic} alt="Profile" style={styles.profileImg} />
                        ) : (
                            <span style={styles.profileLetter}>{user.fullName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                </div>
            </div>

            <hr style={styles.divider} />

            <div style={styles.tabGrid} className="tab-grid">
                {tabs.map((tab) => (
                    <div 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            ...styles.tabBtn,
                            borderColor: activeTab === tab ? '#2ecc71' : 'rgba(255, 255, 255, 0.1)',
                            background: activeTab === tab ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        }}
                        className="tab-button"
                    >
                        <span style={{ fontSize: '24px', marginBottom: '10px' }}>
                            {tab === "ORDER QR" ? "📱" : tab === "ORDER PRODUCTS" ? "🔌" : "📋"}
                            
                        </span>
                        <span style={{ color: activeTab === tab ? '#2ecc71' : '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                            {tab}
                        </span>
                    </div>
                ))}
            </div>

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
                                    <span style={{...styles.infoValue, color: '#2ecc71'}}>{user.role.toUpperCase()}</span>
                                </div>
                            </div>

                            <div style={styles.qrCard} className="qr-card">
                                <h3 style={styles.cardTitle}>Upload Electronic Invoice</h3>
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
                                <div style={styles.qrBox}>
                                    {activeTab === 'ORDER QR' ? "🔳 QR Code" : "🔌 Electronic Order"}
                                </div>
                                <p style={{fontSize: '14px', color: '#2ecc71', marginTop: '10px', fontWeight: 'bold'}}>
                                    {activeTab === 'ORDER QR' ? "Requesting ORDER QR for Electronic Division" : "Place Electronic Order"}
                                </p>
                            </div>
                            {invoice && (
                                <button style={{...styles.submitBtn, maxWidth: '400px'}} onClick={handleSubmit}>
                                    Submit The Invoice
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={styles.cardTitle}>Electronic Order History</h3>
                            {orders.length > 0 && (
                                <button onClick={generateReport} style={styles.reportBtn}>
                                    📄 Download PDF Report
                                </button>
                            )}
                        </div>

                        <div style={styles.countBadge}>
                            Total Orders: <span style={{color: '#2ecc71'}}>{orders.length}</span>
                        </div>

                        {orders.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: '500' }}>
            {order.date || 'N/A'} 
        </span>
        <span style={{ fontSize: '11px', opacity: 0.7, color: '#2ecc71' }}>
            {order.time || ''}
        </span>
    </div>
</td>


<td style={styles.td}>{order.invNum}</td>
         <td style={styles.td}>
     <span style={order.orderType === 'ORDER QR' ? styles.typeQR : styles.typeProduct}>
                 {order.orderType}
              </span>
                        </td>
                     <td style={styles.td}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Status එක පෙන්වන කොටස */}
        <span style={{ 
            color: order.status === 'Approved' ? '#2ecc71' : 
                   order.status === 'QR Sent' ? '#3498db' : '#f1c40f', 
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '5px',
            background: order.status === 'Approved' ? 'rgba(46, 204, 113, 0.1)' : 
                        order.status === 'QR Sent' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(241, 196, 15, 0.1)'
        }}>
            {order.status || 'Pending'}
        </span>

        {/* ✅ මේක තමයි මැජික් එක: Status එක 'QR Sent' නම් සහ qrZipFile එකක් තිබේ නම් බටන් එක පෙන්වයි */}
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
               <p style={{ textAlign: 'center', opacity: 0.6, marginTop: '30px' }}>No Electronic order history found.</p>
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
    logoCircle: { width: '120px', height: '120px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #2ecc71' },
    logoImg: { width: '80%' },
    brandName: { color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: 0 },
    subTitle: { fontSize: '13px' },
    profileArea: { display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255, 255, 255, 0.05)', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(5px)' },
    userInfo: { display: 'flex', flexDirection: 'column', textAlign: 'right' },
    userName: { fontWeight: 'bold', fontSize: '14px' },
    userEmail: { fontSize: '11px', color: '#ccc' },
    profileCircle: { width: '45px', height: '45px', background: '#222', borderRadius: '50%', border: '2px solid #2ecc71', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    profileImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' },
    profileLetter: { color: '#2ecc71', fontSize: '20px', fontWeight: 'bold' },
    divider: { border: '0', borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '20px 0' },
    tabGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
    tabBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer', transition: '0.3s ease', backdropFilter: 'blur(5px)' },
    content: { background: 'rgba(20, 20, 20, 0.7)', padding: '30px', borderRadius: '25px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' },
    qrGrid: { display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' },
    qrCard: { background: 'rgba(255, 255, 255, 0.03)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', width: '400px', textAlign: 'center', backdropFilter: 'blur(5px)' },
    cardTitle: { fontSize: '18px', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' },
    infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '15px' },
    infoLabel: { color: '#bbb' },
    infoValue: { fontWeight: 'bold', color: '#fff' },
    qrPlaceholder: { maxWidth: '400px', margin: '20px auto', padding: '30px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' },
    qrBox: { fontSize: '32px', color: '#2ecc71', fontWeight: 'bold' },
    uploadArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255, 255, 255, 0.2)', borderRadius: '15px', padding: '30px', cursor: 'pointer', transition: '0.3s' },
    submitBtn: { marginTop: '20px', width: '100%', padding: '12px', background: '#2ecc71', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
    footer: { marginTop: '40px', textAlign: 'center' },
    backBtn: { padding: '12px 25px', background: 'transparent', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    tableHeader: { borderBottom: '2px solid rgba(46, 204, 113, 0.5)', textAlign: 'left' },
    th: { padding: '12px', color: '#2ecc71', fontSize: '14px' },
    td: { padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '13px' },
    tableRow: { transition: '0.3s', cursor: 'default' },
    countBadge: { background: 'rgba(255, 255, 255, 0.05)', padding: '8px 15px', borderRadius: '8px', display: 'inline-block', marginBottom: '15px', fontSize: '14px' },
    typeQR: { background: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', padding: '3px 8px', borderRadius: '5px', fontSize: '11px' },
    typeProduct: { background: 'rgba(52, 152, 219, 0.2)', color: '#3498db', padding: '3px 8px', borderRadius: '5px', fontSize: '11px' },
    reportBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
};

export default ElectronicOrder;