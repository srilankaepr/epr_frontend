import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from './api';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 1: Request OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/customers/forgot-password', { email });
            alert(res.data.message);
            setStep(2);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "User not found!";
            alert(`❌ ${errorMsg}`);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/customers/verify-otp', { email, otp });
            alert(res.data.message);
            setStep(3);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Invalid OTP!";
            alert(`❌ ${errorMsg}`);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return alert("Passwords don't match!");
        try {
            const res = await API.post('/auth/customers/reset-password', { email, newPassword });
            alert(res.data.message);
            navigate('/'); 
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Failed to reset password!";
            alert(`❌ ${errorMsg}`);
        }
    };

    return (
        <div style={styles.container}>
            <video autoPlay loop muted playsInline style={styles.videoBg}>
                <source src={earthVideo} type="video/mp4" />
            </video>
            <div style={styles.overlay}></div>

            <div style={styles.glassCard}>
                <div style={styles.logoFrame}>
                    <img src={logo} alt="Logo" style={styles.logoImg} />
                </div>
                <h2 style={styles.title}>PASSWORD RECOVERY</h2>
                
                {step === 1 && (
                    <form onSubmit={handleSendOTP} style={styles.form}>
                        <p style={styles.infoText}>Enter your registered email to receive an OTP.</p>
                        <label style={styles.label}>OFFICIAL EMAIL</label>
                        <input type="email" placeholder="email@company.com" style={styles.input} onChange={(e) => setEmail(e.target.value)} required />
                        <button type="submit" style={styles.btn}>SEND OTP</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} style={styles.form}>
                        <p style={styles.infoText}>Enter the 6-digit code sent to <b>{email}</b></p>
                        <label style={styles.label}>ENTER OTP</label>
                        <input type="text" maxLength="6" placeholder="000000" style={styles.input} onChange={(e) => setOtp(e.target.value)} required />
                        <button type="submit" style={styles.btn}>VERIFY OTP</button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} style={styles.form}>
                        <label style={styles.label}>NEW PASSWORD</label>
                        <input type="password" placeholder="••••••••" style={styles.input} onChange={(e) => setNewPassword(e.target.value)} required />
                        <label style={styles.label}>CONFIRM PASSWORD</label>
                        <input type="password" placeholder="••••••••" style={styles.input} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <button type="submit" style={styles.btn}>UPDATE PASSWORD</button>
                    </form>
                )}

                <p style={styles.backLink} onClick={() => navigate('/')}>Back to Login</p>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', background: '#000' },
    videoBg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, filter: 'brightness(0.3)' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)', zIndex: 2 },
    glassCard: { position: 'relative', zIndex: 3, width: '100%', maxWidth: '450px', padding: '40px', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(30px)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' },
    logoFrame: { width: '80px', height: '80px', background: '#fff', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #2ecc71' },
    logoImg: { width: '80%' },
    title: { color: '#fff', fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '20px' },
    infoText: { color: '#bbb', fontSize: '14px', marginBottom: '20px' },
    form: { textAlign: 'left' },
    label: { color: '#2ecc71', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', marginBottom: '20px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#3498db', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
    backLink: { color: '#aaa', marginTop: '20px', cursor: 'pointer', fontSize: '14px' }
};

export default ForgotPassword;