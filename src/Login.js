import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import { useAuth } from './AuthContext';
import API from './api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); 

const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const loginEmail = formData.get('email');
    const loginPassword = formData.get('password');

    try {
        const response = await API.post('/auth/login', {
            email: loginEmail,
            password: loginPassword
        });
          
        const data = response.data;

        if (response.status === 200) {
            console.log("Logged in User Role:", data.user.adminRole || data.user.orgRole || data.role);
            login(data.user, data.role, data.token, data.user.adminRole); 

            if (data.user && data.user.profilePic) {
                localStorage.setItem('userPhoto', data.user.profilePic);
            } else {
                localStorage.removeItem('userPhoto'); 
            }
            
   let targetPath = '/';
            const userRole = data.role.toUpperCase();

            if (userRole === 'ADMIN') {
                targetPath = '/dashboard';
            } else if (userRole === 'PARTNER') {
                targetPath = '/partner-dashboard';
            } else if (userRole === 'CUSTOMER') {
                const orgRole = data.user.orgRole ? data.user.orgRole.toLowerCase() : '';
                
                // 🔍 ඩේටාබේස් එකේ ඊමේල් එකෙන් හෝ වෙනත් ෆීල්ඩ්ස් වලින් Recycler කෙනෙක්ද බැලීම
                const userEmail = (data.user.email || '').toLowerCase();
                
                if (orgRole === 'authority') {
                    targetPath = '/authority-dashboard'; 
                } else if (
                    orgRole.includes('recycler') || 
                    orgRole.includes('collector') || 
                    orgRole.includes('transporter') || 
                    data.user.isRecycler || 
                    data.user.isTotalSolutionProvider ||
                    userEmail.includes('recycler') || // අවශ්‍ය නම් ඊමේල් එකෙන් චෙක් කිරීමට
                    window.location.href.includes('recycler')
                ) {
                    targetPath = '/recycler-dashboard'; 
                } else {
                    targetPath = '/user-dashboard'; 
                }
            }
            navigate(targetPath);

        } else {
            alert(`❌ ${data.error || "Login Failed"}`);
        }

    } catch (error) {
        console.error("Login error:", error);

        const errorMsg = error.response?.data?.error || "⚠️ Login Failed! Please check your connection.";
        
        alert(`❌ ${errorMsg}`);
    } finally {
        setLoading(false); 
    }
}, [navigate, login]); 

//......................................................................................................................
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
                    <h1 style={styles.title}>SRI LANKA EPR PORTAL</h1> 
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
                        style={{
                            ...styles.loginBtn, 
                            opacity: loading ? 0.7 : 1,                 
                            cursor: loading ? 'not-allowed' : 'pointer'  
                        }} 
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
                            © {new Date().getFullYear()} <span style={styles.brand}>SRI LANKA EPR PORTAL</span>
                        </p>
                        <p style={styles.rights}>SECURED GOVERNANCE INTERFACE</p>
                    </div>
                </div>
            </div>

<style>
    {`
        /* 1. මුළු Page එකේම Scroll හිරවීම වැළැක්වීම */
        html, body {
            height: auto !important;
            min-height: 100vh !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            margin: 0;
            padding: 0;
            background-color: #000 !important;
        }

        /* 2.Animations */
        @keyframes cardFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        /* 3. PC එකේ පෙනුම (Desktop) */
        @media screen and (min-width: 1025px) {
            div[style*="loginContainer"] {
                height: 100vh !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            div[style*="loginCard"] {
                transform: scale(1) !important;
                width: 400px !important;
                padding: 50px 40px !important;
            }
        }

        /* 4. ෆෝන් එකේ පෙනුම (Mobile Portrait) */
        @media screen and (max-width: 480px) {
            div[style*="loginContainer"] {
                height: auto !important;
                min-height: 100vh !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important;
                padding: 30px 0 !important;
                overflow-y: auto !important;
            }

            div[style*="loginCard"] { 
                transform: scale(0.8) !important;
                transform-origin: top center !important;
                margin: 20px auto !important;
                width: 85% !important; 
                padding: 25px 20px !important;
                
                background-color: rgba(255, 255, 255, 0.02) !important;
                -webkit-backdrop-filter: blur(35px) !important;
                backdrop-filter: blur(35px) !important;
                border: 1px solid rgba(255, 255, 255, 0.12) !important;
            }

            div[style*="logoFrame"] { width: 70px !important; height: 70px !important; }
            h1[style*="title"] { font-size: 18px !important; letter-spacing: 2px !important; }
            p[style*="subText"] { font-size: 11px !important; }
            
            video[style*="videoBg"] {
                position: fixed !important;
                top: 0;
                left: 0;
                height: 100vh !important;
                width: auto !important;
                z-index: -1;
            }

            input {
                background-color: rgba(255, 255, 255, 0.05) !important;
                color: white !important;
                -webkit-text-fill-color: white !important;
            }
        }

        /* 5. Landscape Fix */
        @media screen and (max-height: 500px) and (orientation: landscape) {
            div[style*="loginContainer"] {
                height: auto !important;
                min-height: 100vh !important;
                display: block !important;
                padding: 20px 0 !important;
                overflow-y: auto !important;
            }

            div[style*="loginCard"] {
                margin: 10px auto !important;
                transform: scale(0.7) !important;
                transform-origin: top center !important;
            }

            video[style*="videoBg"] {
                position: fixed !important;
                height: 100% !important;
                width: 150% !important;
            }
        }

        /* 6. Dark Mode Force Fix */
        :root {
            color-scheme: light only !important;
        }

        input:focus {
            border-color: #2ecc71 !important;
            background: rgba(255, 255, 255, 0.05) !important;
            outline: none;
            box-shadow: 0 0 15px rgba(46, 204, 113, 0.2);
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
        position: 'relative', overflow: 'auto', backgroundColor: '#000'
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
        boxShadow: '0 10px 30px rgba(46, 204, 113, 0.4)', 
    transition: '0.3s'
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