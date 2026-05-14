import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import API from './api';

const RegisterCustomer = () => {
    const location = useLocation(); 
    const navigate = useNavigate();
    
    const initialRole = location.state?.selectedRole || '';

    const [formData, setFormData] = useState({
        regType: 'Company', // 🆕 Company හෝ Individual තත්ත්වය සේව් කර ගැනීමට
        orgRole: initialRole === 'RECYCLER' ? 'Collector' : 'Producer', 
        companyName: '', 
        companyWebsite: '', 
        phone: '', whatsapp: '', officialEmail: '',
        address1: '', address2: '', postalCode: '', country: '',
        contactPersonName: '', contactPersonMobile: '',
        dob: '', 
        password: '', confirmPassword: '',
        
        // 🆕 CO-PARTNER / COLLECTOR සඳහා අලුතින් එක් කළ ෆීල්ඩ්ස්
        isCoPartner: false,
        coPartnerFullName: '',
        coPartnerAnotherEmail: '',
        coPartnerPhone: '',
        coPartnerNic: '',
        coPartnerDistrict: '',
        coPartnerPradeshiyaSabha: ''
    });

    // 🆕 NIC සඳහා 'nic' ස්ට්‍රින්ග් එක ඇතුළත් කළා
    const [fileStrings, setFileStrings] = useState({ brc: "", vat: "", billing: "" , nic: "" });

    const roleOptions = initialRole === 'RECYCLER' 
        ? [
            { label: 'COLLECTOR', value: 'Collector', icon: '🚛' },
            { label: 'TRANSPORTER', value: 'Transporter', icon: '🚚' },
            { label: 'RECYCLER', value: 'Recycler', icon: '♻️' }
        ]
        : [
            { label: 'PRODUCER', value: 'Producer', icon: '🏭' },
            { label: 'IMPORTER', value: 'Importer', icon: '🚢' },
            { label: 'BRAND OWNER', value: 'Brand Owner', icon: '🏷️' }
        ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePhone = (number) => {
        const regex = /^[0-9]{10}$/; 
        return regex.test(number);
    };

    const handleFileBase64 = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileStrings(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        if (!validatePhone(formData.phone)) {
            alert("❌ Please enter a valid 10-digit Phone Number.");
            return;
        }
        if (formData.whatsapp && !validatePhone(formData.whatsapp)) {
            alert("❌ Please enter a valid 10-digit WhatsApp Number.");
            return;
        }
        if (!validatePhone(formData.contactPersonMobile)) {
            alert("❌ Please enter a valid 10-digit Mobile Number for the Contact Person.");
            return;
        }

        // 🆕 Payload එක සාකච්ඡා කරගත් පරිදි සකස් කිරීම
       const finalPayload = {
            ...formData,
            brcFile: (initialRole === 'RECYCLER' && formData.regType === 'Individual') ? "" : fileStrings.brc, 
            vatFile: (initialRole === 'RECYCLER' && formData.regType === 'Individual') ? "" : fileStrings.vat,
            billingFile: (initialRole === 'RECYCLER' && formData.regType === 'Individual') ? "" : fileStrings.billing,
            
            verificationDocs: (initialRole === 'RECYCLER' && formData.regType === 'Individual' && fileStrings.nic) ? [fileStrings.nic] : []
        };

        try {
            const response = await API.post('/customers/register', finalPayload);

            if (response.status === 201) {
                alert("✅ Customer Registration Successful!");
                navigate('/'); 
            }
        } catch (error) {
            console.error("Registration Error:", error);
            const errorMessage = error.response?.data?.error || "Registration failed. Please try again.";
            alert("❌ Error: " + errorMessage);
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
                    <h2 style={styles.title}>  {initialRole === 'RECYCLER' ? 'RECYCLER REGISTRATION' : 'PIBO REGISTRATION'}  </h2>
                    <p style={styles.subText}>
                        {initialRole === 'RECYCLER' 
                            ? 'COLLECTOR / TRANSPORTER / RECYCLER: Join the circular ecosystem' 
                            : 'Producers, Importers & Brand Owners: Join the circular ecosystem'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* 🆕 පියවර 1: Company / Individual ලියාපදිංචි වර්ගය තේරීමේ බොත්තම් */}
                  {initialRole === 'RECYCLER' && (
    <>
        <h3 style={styles.sectionHeader}>Registration Type</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' }}>
            {['Company', 'Individual'].map((type) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, regType: type })}
                    style={{
                        flex: '1 1 150px', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                        background: formData.regType === type ? 'rgba(46, 204, 113, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: formData.regType === type ? '2px solid #2ecc71' : '1px solid rgba(255,255,255,0.1)',
                        color: formData.regType === type ? '#2ecc71' : '#aaa', transition: '0.3s'
                    }}
                >
                    {type === 'Company' ? '🏢 Company Registration' : '👤 Individual Registration'}
                </button>
            ))}
        </div>
    </>
)}

                    <h3 style={styles.sectionHeader}>1. Organization Details</h3>
                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>ORGANIZATION ROLE</label>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {roleOptions.map((r) => (
                                <div 
                                    key={r.value}
                                    onClick={() => setFormData({ ...formData, orgRole: r.value })}
                                    style={{
                                        flex: '1 1 120px', 
                                        padding: '15px 10px', 
                                        borderRadius: '15px', 
                                        textAlign: 'center', 
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        background: formData.orgRole === r.value ? 'rgba(52, 152, 219, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                        border: formData.orgRole === r.value ? '2px solid #3498db' : '1px solid rgba(255, 255, 255, 0.1)',
                                        transform: formData.orgRole === r.value ? 'scale(1.03)' : 'scale(1)',
                                        boxShadow: formData.orgRole === r.value ? '0 10px 25px rgba(52, 152, 219, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ 
                                        fontSize: '24px', 
                                        marginBottom: '8px',
                                        filter: formData.orgRole === r.value ? 'none' : 'grayscale(100%) opacity(0.5)'
                                    }}>
                                        {r.icon}
                                    </div>
                                    <div style={{ 
                                        fontSize: '10px', 
                                        fontWeight: '900', 
                                        letterSpacing: '1px',
                                        color: formData.orgRole === r.value ? '#3498db' : '#888'
                                    }}>
                                        {r.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🆕 Company Type එකට පමණක් Company Name & Website පෙන්වීම */}
                   {(initialRole !== 'RECYCLER' || formData.regType === 'Company') && (
    <>
        <div style={styles.inputWrapper}>
            <label style={styles.label}>COMPANY NAME</label>
            <input name="companyName" type="text" placeholder="Legal Entity Name" style={styles.input} onChange={handleChange} required />
        </div>

        <div style={styles.inputWrapper}>
            <label style={styles.label}>COMPANY WEBSITE (OPTIONAL)</label>
            <input name="companyWebsite" type="text" placeholder="https://www.company.com" style={styles.input} onChange={handleChange} />
        </div>
    </>
)}

                    <h3 style={styles.sectionHeader}>2. Contact & Address</h3>
                    <div style={styles.row}>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>PHONE</label>
                            <input name="phone" type="text" maxLength="10" placeholder="0112345678" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>WHATSAPP</label>
                            <input name="whatsapp" type="text" maxLength="10" placeholder="0712345678" style={styles.input} onChange={handleChange} />
                        </div>
                    </div>
                    
                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>OFFICIAL EMAIL</label>
                        <input name="officialEmail" type="email" placeholder="info@company.com" style={styles.input} onChange={handleChange} required />
                    </div>

                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>STREET ADDRESS</label>
                        <input name="address1" type="text" placeholder="Street & Number" style={styles.input} onChange={handleChange} required />
                        <input name="address2" type="text" placeholder="Suite, Unit, Floor (Optional)" style={{...styles.input, marginTop: '10px'}} onChange={handleChange} />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>POSTAL CODE</label>
                            <input name="postalCode" type="text" placeholder="10100" style={styles.input} onChange={handleChange} />
                        </div>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>COUNTRY</label>
                            <input name="country" type="text" placeholder="Sri Lanka" style={styles.input} onChange={handleChange} required />
                        </div>
                    </div>

                    <h3 style={styles.sectionHeader}>3. Focal Point & Security</h3>
                    <div style={styles.row}>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>CONTACT PERSON</label>
                            <input name="contactPersonName" type="text" placeholder="Full Name" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>MOBILE</label>
                            <input name="contactPersonMobile" type="text" maxLength="10" placeholder="0771234567" style={styles.input} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={styles.inputWrapper}>
                        <label style={styles.label}>ESTABLISHED DATE</label>
                        <input name="dob" type="date" style={styles.input} onChange={handleChange} required />
                    </div>

                    {/* 🆕 ඡේදය 3: Collector කෙනෙක් වුණොත් පමණක් Co-Partner ලොජික් එක ක්‍රියාත්මක කිරීම */}
                    {formData.orgRole === 'Collector' && (
                        <div style={{ marginBottom: '20px', background: 'rgba(52, 152, 219, 0.05)', padding: '18px', borderRadius: '15px', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
                            <label style={{ color: '#3498db', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={formData.isCoPartner} 
                                    onChange={(e) => setFormData({ ...formData, isCoPartner: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                IF YOU WANT TO REGISTER AS A CO-PARTNER PLEASE CHECK THIS BOX AND FILL THE BELOW DETAILS
                            </label>

                            {formData.isCoPartner && (
                                <div style={{ marginTop: '18px' }}>
                                    <div style={styles.inputWrapper}>
                                        <label style={styles.label}>CO-PARTNER FULL NAME</label>
                                        <input name="coPartnerFullName" type="text" placeholder="Your Full Name" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.inputWrapper}>
                                        <label style={styles.label}>ANOTHER EMAIL</label>
                                        <input name="coPartnerAnotherEmail" type="email" placeholder="alternative@email.com" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.inputWrapper}>
                                        <label style={styles.label}>PHONE NUMBER</label>
                                        <input name="coPartnerPhone" type="text" maxLength="10" placeholder="07XXXXXXXX" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.inputWrapper}>
                                        <label style={styles.label}>NATIONAL ID (NIC)</label>
                                        <input name="coPartnerNic" type="text" placeholder="19XXXXXXXXXX or XXXXXXXXXV" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.row}>
                                        <div style={styles.rowItem}>
                                            <label style={styles.label}>DISTRICT</label>
                                            <input name="coPartnerDistrict" type="text" placeholder="Gampaha" style={styles.input} onChange={handleChange} required />
                                        </div>
                                        <div style={styles.rowItem}>
                                            <label style={styles.label}>PRADESHIYA SABHA</label>
                                            <input name="coPartnerPradeshiyaSabha" type="text" placeholder="Pradeshiya Sabha Name" style={styles.input} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={styles.row}>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>PASSWORD</label>
                            <input name="password" type="password" placeholder="••••••••" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.rowItem}>
                            <label style={styles.label}>CONFIRM</label>
                            <input name="confirmPassword" type="password" placeholder="••••••••" style={styles.input} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* 🆕 පියවර 4: ලියාපදිංචි වර්ගය අනුව වෙනස් වන File Upload Component එක */}
                    {(initialRole !== 'RECYCLER' || formData.regType === 'Company') ? (
                        <>
                            <div style={{ marginBottom: '18px' }}>
                                <label style={styles.label}>UPLOAD BRC (Business Registration)</label>
                                <input type="file" onChange={(e) => handleFileBase64(e, 'brc')} style={styles.input} accept=".pdf,.jpg,.jpeg,.png" />
                                {fileStrings.brc && <p style={{ color: '#2ecc71', fontSize: '14px', marginTop: '5px' }}>✅ BRC Document selected</p>}
                            </div>

                            <div style={{ marginBottom: '18px' }}>
                                <label style={styles.label}>UPLOAD VAT DOCUMENT(include TIN)</label>
                                <input type="file" onChange={(e) => handleFileBase64(e, 'vat')} style={styles.input} accept=".pdf,.jpg,.jpeg,.png" />
                                {fileStrings.vat && <p style={{ color: '#2ecc71', fontSize: '14px', marginTop: '5px' }}>✅ VAT Document selected</p>}
                            </div>

                            <div style={{ marginBottom: '18px' }}>
                                <label style={styles.label}>UPLOAD BILLING PROOF (Electricity / Water)</label>
                                <input type="file" onChange={(e) => handleFileBase64(e, 'billing')} style={styles.input} accept=".pdf,.jpg,.jpeg,.png" />
                                {fileStrings.billing && <p style={{ color: '#2ecc71', fontSize: '14px', marginTop: '5px' }}>✅ Billing Proof selected</p>}
                            </div>
                        </>
                    ) : (
                        <div style={{ marginBottom: '18px' }}>
                            <label style={styles.label}>UPLOAD NIC / DRIVING LICENSE (FRONT & BACK)</label>
                            <input type="file" onChange={(e) => handleFileBase64(e, 'nic')} style={styles.input} accept=".pdf,.jpg,.jpeg,.png" />
                            {fileStrings.nic && <p style={{ color: '#2ecc71', fontSize: '14px', marginTop: '5px' }}>✅ NIC / License Document selected</p>}
                        </div>
                    )}

                    <button type="submit" style={styles.registerBtn}>SUBMIT FOR THE APPROVAL</button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.backLink} onClick={() => navigate('/select-role')}>← Back to Selection</p>
                    <p style={styles.footerText}>Already registered? <span style={styles.loginLink} onClick={() => navigate('/')}> Secure Login</span></p>
                </div>
            </div>

            <style>
                {`
                ::-webkit-calendar-picker-indicator { filter: invert(1); }
                input:focus, select:focus { border-color: #2ecc71 !important; outline: none; background: rgba(0,0,0,0.5) !important; }
                option { background-color: #121212 !important; color: white !important; }
                `}
            </style>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflowY: 'auto', backgroundColor: '#000', padding: '60px 20px' },
    videoBg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, filter: 'brightness(0.35)' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 2 },
    glassCard: { position: 'relative', zIndex: 3, width: '100%', maxWidth: '650px', padding: '50px 40px', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(35px)', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', textAlign: 'center' },
    headerArea: { marginBottom: '35px' },
    logoFrame: { width: '90px', height: '90px', background: '#fff', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #2ecc71', boxShadow: '0 0 30px rgba(46, 204, 113, 0.4)' },
    logoImg: { width: '80%' },
    title: { fontSize: '26px', fontWeight: '900', letterSpacing: '3px', color: '#fff', margin: '0' },
    subText: { fontSize: '15px', color: '#3498db', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px' },
    sectionHeader: { color: '#2ecc71', fontSize: '16px', textAlign: 'left', marginTop: '30px', marginBottom: '20px', borderBottom: '1px solid rgba(46, 204, 113, 0.2)', paddingBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' },
    form: { textAlign: 'left' },
    inputWrapper: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '14px', color: '#aaa', marginBottom: '8px', letterSpacing: '1px', fontWeight: 'bold' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255, 255, 255, 0.04)', color: '#fff', fontSize: '17px', boxSizing: 'border-box', transition: '0.3s' },
    selectInput: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#121212', color: '#fff', fontSize: '17px', boxSizing: 'border-box', transition: '0.3s', cursor: 'pointer' },
    selectOption: { background: '#121212', color: '#fff', padding: '10px' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '18px' },
    rowItem: { flex: '1 1 200px' },
    registerBtn: { width: '100%', padding: '18px', borderRadius: '12px', border: 'none', background: '#3498db', color: '#fff', fontWeight: '900', fontSize: '17px', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(52, 152, 219, 0.3)', marginTop: '25px', transition: '0.3s' },
    footer: { marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px' },
    backLink: { color: '#888', cursor: 'pointer', fontSize: '15px', marginBottom: '15px', transition: '0.3s' },
    footerText: { color: '#aaa', fontSize: '16px' },
    loginLink: { color: '#2ecc71', fontWeight: 'bold', cursor: 'pointer' }
};

export default RegisterCustomer;