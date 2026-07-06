import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png'; 
import backgroundImage from './assets/customerdashboard.jpg';

const PDFGenerator = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.topBar}>
                <div style={styles.logoArea}>
                    <div style={styles.logoCircle}>
                        <img src={logo} alt="Logo" style={styles.logoImg} />
                    </div>
                    <div>
                        <h2 style={styles.brandName}>EPR SYSTEM</h2>
                        <div style={{...styles.subTitle, color: '#3498db'}}>PDF Generator Portal</div>
                    </div>
                </div>
            </div>

            <hr style={styles.divider} />

            {/* Main Content Area */}
            <div style={styles.content}>
                <h3 style={styles.cardTitle}>Generate Official Documents</h3>
                
                <div style={styles.placeholderBox}>
                    <p style={{ color: '#aaa', fontSize: '16px' }}>
                        PDF generation logic will be implemented here. 
                        Enter your document details below.
                    </p>
                    {/* මෙතනට තමයි උඹේ අනාගතයේදී එන Input fields සහ Logic එක දාන්නේ */}
                </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        padding: '30px 50px', minHeight: '100vh', color: '#fff', 
        fontFamily: "'Inter', sans-serif", 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.48)), url(${backgroundImage})`, 
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' 
    },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    logoArea: { display: 'flex', alignItems: 'center', gap: '20px' },
    logoCircle: { width: '100px', height: '100px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #3498db' },
    logoImg: { width: '80%' },
    brandName: { color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: 0 },
    subTitle: { fontSize: '13px' },
    divider: { border: '0', borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '20px 0' },
    content: { background: 'rgba(20, 20, 20, 0.8)', padding: '30px', borderRadius: '25px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', textAlign: 'center' },
    cardTitle: { fontSize: '20px', color: '#3498db', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' },
    placeholderBox: { padding: '50px', border: '2px dashed rgba(255, 255, 255, 0.1)', borderRadius: '20px', marginTop: '20px' },
    footer: { marginTop: '40px', textAlign: 'center' },
    backBtn: { padding: '12px 25px', background: 'transparent', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }
};

export default PDFGenerator;