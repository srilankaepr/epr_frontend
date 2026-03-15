import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 

const API_BASE_URL = 'https://eprbackend-production.up.railway.app/api';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

 const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.user.fullName);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('coPartnerId', data.user.coPartnerId);
            
            if (data.user.profilePic) {
                localStorage.setItem('profilePic', data.user.profilePic);
            }

         const routes = {
                'ADMIN': '/dashboard',
                'CUSTOMER': '/user-dashboard',
                'PARTNER': '/partner-dashboard'
            };
            navigate(routes[data.role] || '/');
        } else {
            alert(`❌ ${data.error || "Login Failed"}`);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("⚠️ Connection Error! Please try again.");
    } finally {
        setLoading(false); 
    }
}, [email, password, navigate]);


    return (
        <div style={styles.container}>
            <video 
    autoPlay 
    loop 
    muted 
    playsInline 
    style={styles.videoBg}
    preload="none"
>
    <source src={earthVideo} type="video/mp4" />
</video>

            <div style={styles.overlay}></div>
            
            <div style={styles.loginCard}>
                <div style={styles.headerArea}>
                    <div style={styles.logoFrame}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                    <h1 style={styles.title}>EPR PORTAL</h1>
                    <p style={styles.subText}>Leading the Path to Global Circular Economy</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>CORPORATE EMAIL</label>
                        <input 
                            type="email" 
                            name="email"
                            autoComplete="email"
                            style={styles.input} 
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div style={styles.inputWrapper}>
                        <div style={styles.passwordHeader}>
                            <label style={styles.label}>PASSWORD</label>
                            <span style={styles.forgotBtn} onClick={() => navigate('/forgot-password')}>
                                Forgot Your Password?
                            </span>

                            
                        </div>
                        <input 
                            type="password" 
                            name="password"
                            autoComplete="current-password"
                            style={styles.input} 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

<button 
    type="submit" 
    style={{...styles.loginBtn, opacity: loading ? 0.7 : 1}} 
    disabled={loading}
>
    {loading ? 'AUTHENTICATING...' : 'LOGIN TO DASHBOARD'}
</button>

               </form>

                <div style={styles.footer}>
                    <p style={styles.signupText}>
                        New to the network? <span style={styles.signupLink} onClick={() => navigate('/select-role')}>Join Now</span>
                    </p>

                    <div style={styles.copyrightBox}>
                        <p style={styles.copyrightText}>
                            © {new Date().getFullYear()} <span style={styles.brand}>EPR PORTAL</span>
                        </p>
                        <p style={styles.rights}>SECURED GOVERNANCE INTERFACE</p>
                    </div>
                </div>
            </div>

<style>
    {`
        /* 1. Animations සහ පොදු Styles */
        @keyframes cardFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        input:focus {
            border-color: #2ecc71 !important;
            background: rgba(255, 255, 255, 0.05) !important;
            outline: none;
            box-shadow: 0 0 15px rgba(46, 204, 113, 0.2);
        }

        /* 2. පද්ධතියෙන් කලර්ස් වෙනස් කරන එක වළක්වනවා - FULL FORCE FIX */
        :root {
            color-scheme: light only !important;
        }

        @media (prefers-color-scheme: dark) {
            html, body {
                background-color: #000000 !important;
            }
            div[style*="loginCard"] {
                background-color: rgba(255, 255, 255, 0.02) !important;
                -webkit-backdrop-filter: blur(35px) !important;
                backdrop-filter: blur(35px) !important;
                border: 1px solid rgba(255, 255, 255, 0.12) !important;
            }
            input {
                background-color: rgba(255, 255, 255, 0.03) !important;
                color: white !important;
            }
            h1, p, span, label {
                color: inherit !important; /* Force keep original colors */
            }
        }

        /* 3. Zoom එක තවත් අඩු කිරීමට කළ වෙනස්කම් (Media Query) */
        @media (max-width: 480px) {
            div[style*="loginCard"] { 
                width: 78% !important; /* පළල තවත් පොඩ්ඩක් අඩු කළා (Zoom Out Effect) */
                padding: 20px 18px !important; /* ඇතුළේ ඉඩ තවත් අඩු කළා */
                transform: scale(0.90) !important; /* 10% කින් Zoom Out කළා */
                -webkit-backdrop-filter: blur(35px) !important;
                backdrop-filter: blur(35px) !important;
                margin-top: -20px; /* පොඩ්ඩක් උඩට ගත්තා Zoom out එකත් එක්ක ලස්සන වෙන්න */
            }
            
            div[style*="logoFrame"] {
                width: 65px !important; /* ලෝගෝ එක තවත් පොඩ්ඩක් කුඩා කළා */
                height: 65px !important;
            }

            h1[style*="title"] {
                font-size: 17px !important; /* අකුරු වල සයිස් එක තව පොඩ්ඩක් අඩු කළා */
                letter-spacing: 2px !important;
            }

            p[style*="subText"] {
                font-size: 10px !important; /* Sub-text එකත් කුඩා කළා */
            }
            
            video[style*="videoBg"] {
                height: 100vh !important;
                width: auto !important;
            }
            
            /* Button එකේ සයිස් එකත් පොඩ්ඩක් අඩු කළා Compact වෙන්න */
            button[style*="loginBtn"] {
                padding: 14px !important;
                font-size: 13px !important;
            }
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
        position: 'relative', overflow: 'hidden', backgroundColor: '#000'
    },
    videoBg: {
        position: 'absolute', top: '50%', left: '50%',
        width: '100%', height: '100%', objectFit: 'cover',
        transform: 'translate(-50%, -50%)', zIndex: 1, filter: 'brightness(0.45)'
    },
    overlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
        zIndex: 2
    },
    loginCard: {
        position: 'relative', zIndex: 3,
        width: '90%', maxWidth: '400px',
        padding: '50px 40px',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(35px)',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        animation: 'cardFadeIn 0.8s ease-out forwards'
    },
    headerArea: { marginBottom: '35px', textAlign: 'center' },
    logoFrame: {
        width: '110px', height: '110px',
        background: '#fff',
        borderRadius: '50%',
        margin: '0 auto 15px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 0 40px rgba(46, 204, 113, 0.4)',
        border: '4px solid #2ecc71'
    },
    logoImg: { width: '80%' },
    title: { fontSize: '28px', fontWeight: '900', letterSpacing: '5px', color: '#fff', margin: '0' },
    subText: { fontSize: '14px', color: '#2ecc71', marginTop: '10px', fontWeight: '600', letterSpacing: '0.5px' },
    form: { textAlign: 'left' },
    inputWrapper: { marginBottom: '25px' },
    passwordHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    label: { display: 'block', fontSize: '13px', color: '#ccc', marginBottom: '10px', letterSpacing: '1.5px', fontWeight: 'bold' },
    forgotBtn: { color: '#2b9456', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' },
    input: {
        width: '100%', padding: '16px',
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255, 255, 255, 0.03)', color: '#fff', fontSize: '15px', transition: '0.3s'
    },
    loginBtn: {
        width: '100%', padding: '18px',
        borderRadius: '12px', border: 'none',
        background: '#32c56f', color: '#fff',
        fontWeight: '900', fontSize: '15px', letterSpacing: '2px',
        cursor: 'pointer', boxShadow: '0 10px 30px rgba(46, 204, 113, 0.4)', transition: '0.3s'
    },
    footer: { marginTop: '30px', textAlign: 'center', borderTop: '1px solid rgba(248, 243, 243, 0.05)', paddingTop: '20px' },
    signupText: { fontSize: '19px', color: '#aaa', marginBottom: '15px' },
    signupLink: { color: '#2ecc71', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' },
    copyrightBox: { marginTop: '10px' },
    copyrightText: { fontSize: '12px', color: '#fef9f9', margin: 0 },
    brand: { color: '#2ecc71', fontWeight: 'bold' },
    rights: { fontSize: '9px', letterSpacing: '2px', color: '#f9f7f7', marginTop: '5px' }
};

export default Login;