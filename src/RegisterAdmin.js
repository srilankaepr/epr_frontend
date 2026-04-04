import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import API from './api';

const AdminRegister = () => {
    const navigate = useNavigate();
    
    // --- මුල් Logic එක ඒ විදිහටම තියෙනවා ---
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        adminSecretCode: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        try {
            const response = await API.post('/auth/admin/register', {
                fullName: formData.fullName,
                email: formData.email,
                adminSecretCode: formData.adminSecretCode,
                password: formData.password
            });

       if (response.status === 200 || response.status === 201) {
            alert("✅ Admin Registered Successfully!");
            navigate('/'); 
        }
    } catch (error) {
        console.error("Registration Error:", error);
        
        const errorMsg = error.response?.data?.error || "Registration failed!";
        alert(`❌ ${errorMsg}`);
    }
};

    return (
        <div style={styles.container}>
            {/* Background Video */}
            <video autoPlay loop muted playsInline style={styles.videoBg}>
                <source src={earthVideo} type="video/mp4" />
            </video>

            <div style={styles.overlay}></div>
            
            <div style={styles.glassCard}>
                <div style={styles.headerArea}>
                    <div style={styles.logoFrame}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                    <h2 style={styles.title}>ADMIN REGISTRATION</h2>
                    <p style={styles.subText}>Establish secure system governance</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>FULL NAME</label>
                        <input 
                            name="fullName" 
                            type="text" 
                            placeholder="e.g. John Doe" 
                            style={styles.input} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>CORPORATE EMAIL</label>
                        <input 
                            name="email" 
                            type="email" 
                            placeholder="admin@epr.com" 
                            style={styles.input} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>ADMIN SECRET CODE</label>
                        <input 
                            name="adminSecretCode" 
                            type="password" // Secret නිසා password type එකට දැම්මා
                            placeholder="Enter Authorization Key" 
                            style={styles.input} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>CREATE PASSWORD</label>
                        <input 
                            name="password" 
                            type="password" 
                            placeholder="••••••••" 
                            style={styles.input} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>CONFIRM PASSWORD</label>
                        <input 
                            name="confirmPassword" 
                            type="password" 
                            placeholder="••••••••" 
                            style={styles.input} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <button type="submit" style={styles.registerBtn}>AUTHORIZE REGISTRATION</button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.backLink} onClick={() => navigate('/select-role')}>
                        ← Back to Selection
                    </p>
                    <p style={styles.footerText}>
                        Already have access? 
                        <span style={styles.loginLink} onClick={() => navigate('/')}> Secure Login</span>
                    </p>
                </div>
            </div>

            <style>
                {`
                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                input:focus {
                    border-color: #2ecc71 !important;
                    background: rgba(255, 255, 255, 0.05) !important;
                    outline: none;
                }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh', width: '100vw',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflowY: 'auto', backgroundColor: '#000',
        padding: '40px 20px'
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
        width: '100%', maxWidth: '420px',
        padding: '40px 35px',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(35px)',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        animation: 'cardFadeIn 0.8s ease-out forwards',
        textAlign: 'center'
    },
    headerArea: { marginBottom: '30px' },
    logoFrame: {
        width: '90px', height: '90px',
        background: '#fff', borderRadius: '50%',
        margin: '0 auto 15px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        border: '3px solid #2ecc71',
        boxShadow: '0 0 30px rgba(46, 204, 113, 0.3)'
    },
    logoImg: { width: '80%' },
    title: { fontSize: '22px', fontWeight: '900', letterSpacing: '3px', color: '#fff', margin: '0' },
    subText: { fontSize: '11px', color: '#2ecc71', marginTop: '8px', fontWeight: 'bold', letterSpacing: '1px' },
    form: { textAlign: 'left' },
    inputWrapper: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '12px', color: '#ccc', marginBottom: '8px', letterSpacing: '1.5px', fontWeight: 'bold' },
    input: {
        width: '100%', padding: '14px',
        borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255, 255, 255, 0.03)', color: '#fff', fontSize: '15px'
    },
    registerBtn: {
        width: '100%', padding: '16px',
        borderRadius: '10px', border: 'none',
        background: '#2ecc71', color: '#fff',
        fontWeight: '900', fontSize: '14px', letterSpacing: '1.5px',
        cursor: 'pointer', boxShadow: '0 10px 25px rgba(46, 204, 113, 0.3)',
        marginTop: '10px'
    },
    footer: { marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' },
    backLink: { color: '#888', cursor: 'pointer', fontSize: '13px', marginBottom: '15px', transition: '0.3s' },
    footerText: { color: '#777', fontSize: '13px' },
    loginLink: { color: '#2ecc71', fontWeight: 'bold', cursor: 'pointer' }
};

export default AdminRegister;