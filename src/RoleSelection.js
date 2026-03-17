import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
// Login එකේ පාවිච්චි කරපු වීඩියෝ එකම මෙතනටත් ගන්න
import earthVideo from './assets/earth.mp4'; 

const RoleSelection = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            {/* --- Background Video --- */}
            <video autoPlay loop muted playsInline style={styles.videoBg}>
                <source src={earthVideo} type="video/mp4" />
            </video>

            {/* Premium Overlay Layer */}
            <div style={styles.overlay}></div>

            <div style={styles.glassCard}>
                <div style={styles.headerArea}>
                    <div style={styles.logoFrame}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                    <h1 style={styles.title}>EPR PORTAL</h1>
                    <p style={styles.subText}>SELECT AUTHORIZATION LEVEL</p>
                </div>

                <div style={styles.buttonContainer}>
                    {/* Admin Role Card */}
                    <div 
                        style={styles.roleCard} 
                        onClick={() => navigate('/register-admin')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.background = 'rgba(46, 204, 113, 0.15)';
                            e.currentTarget.style.borderColor = '#2ecc71';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                    >
                        <div style={styles.iconWrapper}>🛡️</div>
                        <h3 style={styles.roleNameAdmin}>ADMIN</h3>
                        <p style={styles.roleDesc}>System Governance & Oversight</p>
                    </div>

                    {/* Customer Role Card */}
                    <div 
                        style={styles.roleCard} 
                        onClick={() => navigate('/register-customer')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.background = 'rgba(52, 152, 219, 0.15)';
                            e.currentTarget.style.borderColor = '#3498db';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                    >
                        <div style={styles.iconWrapper}>👤</div>
                        <h3 style={styles.roleNameCustomer}>PIBO</h3>
                        <p style={styles.roleDesc}>Operational Access & Services</p>
                    </div>
                </div>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Already registered with us? 
                        <span style={styles.loginLink} onClick={() => navigate('/')}> Secure Login</span>
                    </p>
                </div>
            </div>

            <style>
                {`
                @keyframes cardFadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh', width: '100vw',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden', backgroundColor: '#000',
        fontFamily: "'Inter', sans-serif"
    },
    videoBg: {
        position: 'absolute', top: '50%', left: '50%',
        width: '100%', height: '100%', objectFit: 'cover',
        transform: 'translate(-50%, -50%)', zIndex: 1, filter: 'brightness(0.4)'
    },
    overlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
        zIndex: 2
    },
    glassCard: {
        position: 'relative', zIndex: 3,
        width: '90%', maxWidth: '650px',
        padding: '50px 30px',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(35px)',
        borderRadius: '40px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        textAlign: 'center',
        animation: 'cardFadeIn 0.8s ease-out forwards'
    },
    headerArea: { marginBottom: '45px' },
    logoFrame: {
        width: '100px', height: '100px',
        background: '#fff', borderRadius: '50%',
        margin: '0 auto 20px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        border: '4px solid #2ecc71',
        boxShadow: '0 0 30px rgba(46, 204, 113, 0.4)'
    },
    logoImg: { width: '80%' },
    title: { fontSize: '28px', fontWeight: '900', letterSpacing: '5px', color: '#fff', margin: '0' },
    subText: { fontSize: '12px', color: '#2ecc71', marginTop: '10px', fontWeight: 'bold', letterSpacing: '2px' },
    buttonContainer: { 
        display: 'flex', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' 
    },
    roleCard: { 
        flex: '1 1 240px', maxWidth: '280px',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '40px 20px', borderRadius: '30px',
        cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
    },
    iconWrapper: { fontSize: '50px', marginBottom: '20px' },
    roleNameAdmin: { color: '#2ecc71', fontSize: '20px', fontWeight: '900', letterSpacing: '2px' },
    roleNameCustomer: { color: '#3498db', fontSize: '20px', fontWeight: '900', letterSpacing: '2px' },
    roleDesc: { color: '#aaa', fontSize: '13px', marginTop: '10px', lineHeight: '1.4' },
    footer: { marginTop: '50px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '25px' },
    footerText: { color: '#777', fontSize: '14px' },
    loginLink: { 
        color: '#2ecc71', fontWeight: 'bold', cursor: 'pointer', 
        textDecoration: 'none', transition: '0.3s'
    }
};

export default RoleSelection;