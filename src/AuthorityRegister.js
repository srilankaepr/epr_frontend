import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import API from './api';

const AuthorityRegister = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        orgRole: 'authority',
        username: '',
        officialEmail: '',
        password: '',
        confirmPassword: '',
        institutionName: '',
        institutionWebsite: '',
        designation: '',
        contactMobile: '',
        digitalSignatureName: '',
        declarationDate: new Date().toLocaleDateString(),
        isDeclarationAgreed: false
    });

    const [fileString, setFileString] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileBase64 = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileString(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validatePhone = (number) => {
        return /^[0-9]{10}$/.test(number);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        if (!validatePhone(formData.contactMobile)) {
            alert("❌ Please enter a valid 10-digit Mobile Number.");
            return;
        }

        if (!fileString) {
            alert("❌ Please upload the required verification document!");
            return;
        }

        if (!formData.isDeclarationAgreed) {
            alert("❌ You must agree to the statutory declaration terms!");
            return;
        }

        setIsLoading(true);

        const finalPayload = {
            ...formData,
            verificationDocument: fileString
        };

        try {
            const response = await API.post('/customers/register', finalPayload);
            if (response.status === 201 || response.status === 200) {
                alert("✅ Government Authority Registration Request Submitted Successfully!");
                navigate('/'); 
            }
        } catch (error) {
            console.error("Authority Registration Error:", error);
            alert("❌ Error: " + (error.response?.data?.error || "Registration failed."));
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <video autoPlay loop muted playsInline style={styles.videoBg}>
                <source src={earthVideo} type="video/mp4" />
            </video>
            <div style={styles.overlay}></div>
            
            <div style={styles.glassCard}>
                <div style={styles.headerArea}>
                    <div style={styles.logoFrame}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                    <h2 style={styles.title}>AUTHORITY DATA PORTAL</h2>
                    <p style={styles.subText}>Government & Regulatory Access Verification Hub</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={{ color: '#9b59b6', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '25px', background: 'rgba(155,89,182,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(155,89,182,0.2)' }}>
                        SECURE REGISTRATION NODE — GOVERNMENT REGULATORY ACCESS
                    </div>

                    <h3 style={styles.sectionHeader}>Account & Institution Credentials</h3>
                    
                    <div style={styles.row}>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>USERNAME *</label>
                            <input name="username" value={formData.username} type="text" placeholder="Official Username" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>OFFICIAL EMAIL (LOGIN ID) *</label>
                            <input name="officialEmail" value={formData.officialEmail} type="email" placeholder="authority@gov.lk" style={styles.input} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>PASSWORD *</label>
                            <input name="password" value={formData.password} type="password" placeholder="••••••••" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>CONFIRM PASSWORD *</label>
                            <input name="confirmPassword" value={formData.confirmPassword} type="password" placeholder="••••••••" style={styles.input} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>GOVERNMENT INSTITUTION / DEPARTMENT NAME *</label>
                        <input name="institutionName" value={formData.institutionName} type="text" placeholder="e.g. Central Environmental Authority (CEA)" style={styles.input} onChange={handleChange} required />
                    </div>

                    <div style={styles.inputWrapper}>
                      <label style={styles.label}>INSTITUTION WEBSITE (OPTIONAL)</label>
                      <input name="institutionWebsite" value={formData.institutionWebsite} type="text" placeholder="e.g. https://www.cea.lk" style={styles.input} onChange={handleChange} />
                    </div>

                    <h3 style={styles.sectionHeader}>Focal Representative Details</h3>

                    <div style={styles.row}>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>CONTACT PERSON FULL NAME *</label>
                            <input name="contactPersonName" value={formData.contactPersonName} type="text" placeholder="Official Full Name" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>OFFICIAL DESIGNATION *</label>
                            <input name="designation" value={formData.designation} type="text" placeholder="e.g. Director / Inspector" style={styles.input} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>OFFICIAL MOBILE NUMBER *</label>
                        <input name="contactMobile" value={formData.contactMobile} maxLength="10" placeholder="07XXXXXXXX" type="text" style={styles.input} onChange={handleChange} required />
                    </div>

                    <h3 style={styles.sectionHeader}>Verification Archive Upload</h3>
                    
                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>UPLOAD INSTITUTIONAL AUTHORIZATION LETTER / ID (PDF/JPG) *</label>
                        <input type="file" style={styles.input} onChange={handleFileBase64} accept=".pdf,.jpg,.jpeg,.png" required />
                        {fileString && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ Verification Document Buffered Securely</p>}
                    </div>

                    <h3 style={styles.sectionHeader}>Statutory Declaration</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                        <label style={styles.declarationCheckNode}>
                            <input type="checkbox" name="isDeclarationAgreed" checked={formData.isDeclarationAgreed} onChange={handleChange} required />
                            I confirm that I am an authorized representative of the stated government regulatory institution.
                        </label>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>DIGITAL SIGNATURE / OFFICIAL NAME *</label>
                            <input name="digitalSignatureName" value={formData.digitalSignatureName} type="text" placeholder="Type Official Full Name" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>SYSTEM STAMP DATE</label>
                            <input type="text" value={formData.declarationDate} style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed' }} readOnly />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        style={{ ...styles.registerBtn, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
                    >
                        {isLoading ? "TRANSMITTING CREDENTIALS..." : "REGISTER AUTHORITY ACCESS NODE"}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.backLink} onClick={() => navigate('/select-role')}>← Back to Selection</p>
                    <p style={styles.footerText}>Already registered? <span style={styles.loginLink} onClick={() => navigate('/')}> Secure Login</span></p>
                </div>
            </div>
        </div>
    );
};

// Stylesheet Mapping (Matching Purple Theme for Authority Portal)
const styles = {
    container: { minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflowY: 'auto', backgroundColor: '#000', padding: '60px 20px', fontFamily: "'Inter', sans-serif" },
    videoBg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, filter: 'brightness(0.35)' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 2 },
    glassCard: { position: 'relative', zIndex: 3, width: '100%', maxWidth: '650px', padding: '50px 40px', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(35px)', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', textAlign: 'center' },
    headerArea: { marginBottom: '35px' },
    logoFrame: { width: '90px', height: '90px', background: '#fff', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #9b59b6', boxShadow: '0 0 30px rgba(155, 89, 182, 0.4)' },
    logoImg: { width: '80%' },
    title: { fontSize: '24px', fontWeight: '900', letterSpacing: '3px', color: '#fff', margin: '0' },
    subText: { fontSize: '13px', color: '#2ecc71', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px' },
    sectionHeader: { color: '#9b59b6', fontSize: '16px', textAlign: 'left', marginTop: '15px', marginBottom: '15px', borderBottom: '1px solid rgba(155,89,182,0.2)', paddingBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' },
    form: { textAlign: 'left' },
    inputWrapper: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '8px', letterSpacing: '1px', fontWeight: 'bold' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255, 255, 255, 0.04)', color: '#fff', fontSize: '16px', boxSizing: 'border-box', transition: '0.3s', outline: 'none' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '18px' },
    rowItem: { flex: '1 1 200px' },
    declarationCheckNode: { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '13px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' },
    registerBtn: { width: '100%', padding: '18px', borderRadius: '12px', border: 'none', background: '#9b59b6', color: '#fff', fontWeight: '900', fontSize: '16px', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(155, 89, 182, 0.3)', marginTop: '25px', transition: '0.3s' },
    footer: { marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px', textAlign: 'center' },
    backLink: { color: '#888', cursor: 'pointer', fontSize: '14px', marginBottom: '15px', transition: '0.3s' },
    footerText: { color: '#aaa', fontSize: '15px' },
    loginLink: { color: '#9b59b6', fontWeight: 'bold', cursor: 'pointer' }
};

export default AuthorityRegister;  