import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import API from './api';

const PiboRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // --- PIBO Form State (Mapped exactly to provided MongoDB Schema fields) ---
    const [formData, setFormData] = useState({
        regType: 'Company',
        orgRole: 'Producer', 
        officialEmail: '',
        password: '',
        confirmPassword: '',
        phone: '',
        whatsapp: '',

        // Organization Profile (Step 2)
        piboBusinessType: [], 
        companyName: '',
        contactPersonName: '',
        contactPersonMobile: '',
        dob: '', 
        regNumber: '',
        piboTinVatNumber: '',
        address1: '', 
        orgDistrict: '',
        orgProvince: '',
        country: 'Sri Lanka',

        // Product Category Selection (Step 3 Array)
        piboSelectedProductCategories: [],
        otherProductCategory: '',

        // Auto-Generated Liability (Step 4 System Profile Array - පැරණි Step 5)
        generatedWasteLiabilityCategories: [],

        // Market Activity Profile (Step 5 Queries - පැරණි Step 6)
        marketIsImporter: 'No',
        marketIsLocalManufacturer: 'No',
        marketIsOwnBrandDistributor: 'No',
        // Estimated Annual Turnover ඉවත් කරන ලදී

        // PRO Engagement (Step 6 mapping - පැරණි Step 7)
        piboHasAssignedPro: 'No',
        piboSelectedProId: '', // මෙහි දැන් PRO Registration Number එක ගබඩා වේ

        // Compliance Declarations (Step 7 Checkbox Toggles - පැරණි Step 8)
        // පළමු checkbox එක (piboDeclAllVolumesAccurate) ඉවත් කරන ලදී
        piboDeclAcceptEprResponsibility: false,
        piboDeclAgreePeriodicAudits: false,
        piboDeclConnectWithPro: false,
        declarationDate: new Date().toLocaleDateString()
    });

    const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];
    const provinces = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];

    // 🧠 Automatic Waste Liability Mapping Engine (Step 4 Logic Matrix)
    useEffect(() => {
        const mapping = [];
        const cats = formData.piboSelectedProductCategories;

        if (cats.includes("Plastic Base Products")) mapping.push("Plastic Waste");
        if (cats.includes("Paper & Cardboard Packaging")) mapping.push("Paper & Cardboard Waste");
        if (cats.includes("Glass Base Products")) mapping.push("Glass Waste");
        if (cats.includes("Metal Base Products")) mapping.push("Metal Sludge / Residues");
        if (cats.includes("Electronic & Electrical Products (EEE)")) mapping.push("E-Waste");
        if (cats.includes("Lighting Products (LED / CFL)")) mapping.push("Mercury / LED Hazardous Waste");
        if (cats.includes("Batteries / Energy Storage Products")) mapping.push("Battery Waste (Hazardous)");
        if (cats.includes("Solar / Renewable Energy Equipment") || cats.includes("Automotive / EV Components")) mapping.push("Solar / EV Waste");
        if (cats.includes("Chemical Products")) mapping.push("Chemical Waste");
        if (cats.includes("Lubricants / Oils / Fuel Products")) mapping.push("Oil Contaminated Waste");
        if (cats.includes("Industrial Raw Materials / Machinery")) mapping.push("Industrial Waste");
        if (cats.includes("Rubber Products")) mapping.push("Rubber Waste");

        setFormData(prev => ({ ...prev, generatedWasteLiabilityCategories: mapping }));
    }, [formData.piboSelectedProductCategories]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
        }));
    };

    const handleCheckboxGroup = (e, fieldName, value) => {
        const isChecked = e.target.checked;
        setFormData(prev => {
            const currentList = prev[fieldName] || [];
            if (isChecked) {
                return { ...prev, [fieldName]: [...currentList, value] };
            } else {
                return { ...prev, [fieldName]: currentList.filter(item => item !== value) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        if (!formData.piboDeclAcceptEprResponsibility || !formData.piboDeclAgreePeriodicAudits || !formData.piboDeclConnectWithPro) {
            alert("❌ You must agree to all operational compliance declaration points before database deployment!");
            return;
        }

        const finalPayload = {
            ...formData,
            phone: formData.contactPersonMobile
        };

        setIsLoading(true);

        try {
            const response = await API.post('/customers/register', finalPayload);
            if (response.status === 201 || response.status === 200) {
                alert("✅ PIBO Smart Registration Protocol Transmitted and Executed Successfully!");
                navigate('/');
            }
        } catch (error) {
            console.error("PIBO Registration Error:", error);
            alert("❌ Database Insertion Failed: " + (error.response?.data?.error || "Fatal runtime error."));
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
                    <h2 style={styles.title}>PIBO SMART COMPLIANCE HUB</h2>
                    <p style={styles.subText}>Unified EPR Lifecycle Automated Mapping Engine</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={{ color: '#3498db', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '25px', background: 'rgba(52,152,219,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(52,152,219,0.2)' }}>
                        PROGRESS STEP: {step} OF 7 — {
                            step === 1 ? "ACCOUNT CREATION" :
                            step === 2 ? "ORGANIZATION PROFILE" :
                            step === 3 ? "PRODUCT CATEGORY SELECTION" :
                            step === 4 ? "AUTOMATED WASTE LIABILITY MAPPING" :
                            step === 5 ? "MARKET ACTIVITY MODEL" :
                            step === 6 ? "PRO ALLOCATIONS" : "LEGAL COMPLIANCE DECLARATION"
                        }
                    </div>

                    {/* Step 1: Account Creation */}
                    {step === 1 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 1: Account Creation</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>EMAIL ADDRESS (LOGIN ID) *</label>
                                <input name="officialEmail" value={formData.officialEmail} type="email" placeholder="corporate-compliance@domain.lk" style={styles.input} onChange={handleChange} required />
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
                        </div>
                    )}

                    {/* Step 2: Organization Profile */}
                    {step === 2 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 2: Organization Profile</h3>
                            <label style={styles.label}>TYPE OF BUSINESS (SELECT APPLICABLE MATRIX) *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                                {["Producer/Manufacturer", "Importer", "Brand Owner", "Seller/Agent"].map(bType => (
                                    <label key={bType} style={styles.checkboxLabelNode}>
                                        <input type="checkbox" checked={formData.piboBusinessType.includes(bType)} onChange={(e) => handleCheckboxGroup(e, 'piboBusinessType', bType)} />
                                        {bType}
                                    </label>
                                ))}
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>LEGAL COMPANY NAME *</label>
                                <input name="companyName" value={formData.companyName} type="text" placeholder="Entity Corporate Name" style={styles.input} onChange={handleChange} required />
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>CONTACT PERSON FULL NAME *</label>
                                    <input name="contactPersonName" value={formData.contactPersonName} type="text" placeholder="Authorized Focal Representative" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>CONTACT PERSON MOBILE *</label>
                                    <input name="contactPersonMobile" value={formData.contactPersonMobile} maxLength="10" placeholder="07XXXXXXXX" type="text" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>COMPANY ESTABLISHED DATE *</label>
                                    <input name="dob" value={formData.dob} type="date" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>BUSINESS REGISTRATION NUMBER *</label>
                                    <input name="regNumber" value={formData.regNumber} type="text" placeholder="PV-XXXXXX / BR" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>TAX TIN / VAT NUMBER *</label>
                                <input name="piboTinVatNumber" value={formData.piboTinVatNumber} type="text" placeholder="TIN-XXXXXXXXX" style={styles.input} onChange={handleChange} required />
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>REGISTERED ADDRESS *</label>
                                <input name="address1" value={formData.address1} type="text" placeholder="Headquarters Physical Corporate Address" style={styles.input} onChange={handleChange} required />
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DISTRICT *</label>
                                    <select name="orgDistrict" value={formData.orgDistrict} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Select District --</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>PROVINCE *</label>
                                    <select name="orgProvince" value={formData.orgProvince} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Select Province --</option>
                                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Product Category Selection */}
                    {step === 3 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 3: Product Category Selection (Multi-Select Array)</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '15px' }}>
                                {[
                                    "Plastic Base Products", "Paper & Cardboard Packaging", "Glass Base Products",
                                    "Metal Base Products", "Electronic & Electrical Products (EEE)", "Lighting Products (LED / CFL)",
                                    "Batteries / Energy Storage Products", "Solar / Renewable Energy Equipment", "Automotive / EV Components",
                                    "Chemical Products", "Lubricants / Oils / Fuel Products", "Industrial Raw Materials / Machinery",
                                    "Rubber Products"
                                ].map(pCat => (
                                    <label key={pCat} style={styles.checkboxLabelNode}>
                                        <input type="checkbox" checked={formData.piboSelectedProductCategories.includes(pCat)} onChange={(e) => handleCheckboxGroup(e, 'piboSelectedProductCategories', pCat)} />
                                        {pCat}
                                    </label>
                                ))}
                                <label style={styles.checkboxLabelNode}>
                                    <input type="checkbox" checked={formData.piboSelectedProductCategories.includes('Other')} onChange={(e) => handleCheckboxGroup(e, 'piboSelectedProductCategories', 'Other')} />
                                    Other
                                </label>

                                {formData.piboSelectedProductCategories.includes('Other') && (
                                    <input 
                                        type="text" 
                                        placeholder="Type your category here..." 
                                        value={formData.otherProductCategory || ''}
                                        onChange={(e) => setFormData({...formData, otherProductCategory: e.target.value})}
                                        style={{ ...styles.input, marginTop: '10px', border: '1px solid #3498db' }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Automatic Waste Liability Mapping (ਪැරණි Step 5) */}
                    {step === 4 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 4: Automatic Waste Liability Mapping (System Generated)</h3>
                            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '20px' }}>Based on your dynamic product array mapping profile, your organizational EPR tracking liabilities are allocated below:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(46,204,113,0.05)', border: '1px dashed rgba(46,204,113,0.3)', padding: '20px', borderRadius: '15px' }}>
                                {formData.generatedWasteLiabilityCategories.length > 0 ? (
                                    formData.generatedWasteLiabilityCategories.map((liability, index) => (
                                        <div key={index} style={{ color: '#2ecc71', fontSize: '14px', fontWeight: 'bold' }}>
                                            ☑️ {liability}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#e74c3c', fontSize: '14px', gridColumn: '1 / -1', textAlign: 'center', fontWeight: 'bold' }}>
                                        ⚠️ No active structural liabilities found. Please re-check product streams in Step 3.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Market Activity Profile (ਪැරණි Step 6 - Estimated Annual Turnover ඉවත් කරන ලදී) */}
                    {step === 5 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 5: Market Activity Profile</h3>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DO YOU IMPORT PRODUCTS? *</label>
                                    <select name="marketIsImporter" value={formData.marketIsImporter} style={styles.selectInput} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DO YOU MANUFACTURE LOCALLY? *</label>
                                    <select name="marketIsLocalManufacturer" value={formData.marketIsLocalManufacturer} style={styles.selectInput} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>DO YOU DISTRIBUTE UNDER OWN BRAND NAME? *</label>
                                <select name="marketIsOwnBrandDistributor" value={formData.marketIsOwnBrandDistributor} style={styles.selectInput} onChange={handleChange}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 6: PRO Engagement (ਪැරණි Step 7 - PRO Registration Number ඇතුළත් කිරීමට වෙනස් කර ඇත) */}
                    {step === 6 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 6: PRO Operational Engagement</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>DO YOU HAVE AN ASSIGNED PRO COMPLIANCE PARTNER? *</label>
                                <select name="piboHasAssignedPro" value={formData.piboHasAssignedPro} style={styles.selectInput} onChange={handleChange}>
                                    <option value="No">No (Request System Automated Allocation)</option>
                                    <option value="Yes">Yes (Map Existing Framework Reference)</option>
                                </select>
                            </div>

                            {formData.piboHasAssignedPro === 'Yes' && (
                                <div style={{ marginTop: '20px' }}>
                                    <label style={styles.label}>ENTER PRO REGISTRATION NUMBER *</label>
                                    <input 
                                        name="piboSelectedProId" 
                                        value={formData.piboSelectedProId} 
                                        type="text" 
                                        placeholder="Type PRO Registration Number..." 
                                        style={styles.input} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 7: Compliance Declaration (ਪැරණි Step 8 - Authorized Representative Person Name සහ පළමු Checkbox එක ඉවත් කර ඇත) */}
                    {step === 7 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 7: Statutory Regulatory Declarations</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                                <label style={styles.declarationCheckNode}>
                                    <input type="checkbox" name="piboDeclAcceptEprResponsibility" checked={formData.piboDeclAcceptEprResponsibility} onChange={handleChange} required />
                                    I accept responsibility under Sri Lanka EPR regulations framework.
                                </label>
                                <label style={styles.declarationCheckNode}>
                                    <input type="checkbox" name="piboDeclAgreePeriodicAudits" checked={formData.piboDeclAgreePeriodicAudits} onChange={handleChange} required />
                                    I agree to periodic structural data reporting and independent audits.
                                </label>
                                <label style={styles.declarationCheckNode}>
                                    <input type="checkbox" name="piboDeclConnectWithPro" checked={formData.piboDeclConnectWithPro} onChange={handleChange} required />
                                    I agree to connect with authorized PROs for target compliance fulfillment tracking.
                                </label>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>SYSTEM LOGICAL STAMP DATE</label>
                                    <input type="text" value={formData.declarationDate} style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed' }} readOnly />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Control Center System Panel */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '35px' }}>
                        {step > 1 && (
                            <button type="button" onClick={() => setStep(prev => prev - 1)} style={{ ...styles.registerBtn, background: '#444', marginTop: 0 }}>
                                PREVIOUS PHASE
                            </button>
                        )}
                        {step < 7 ? (
                            <button type="button" onClick={() => setStep(prev => prev + 1)} style={{ ...styles.registerBtn, marginTop: 0 }}>
                                NEXT PHASE →
                            </button>
                        ) : (
                            <button type="submit" disabled={isLoading} style={{ ...styles.registerBtn, background: '#3498db', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, marginTop: 0 }}>
                                {isLoading ? "TRANSMITTING TO LEDGER PROTOCOL..." : "REGISTER"}
                            </button>
                        )}
                    </div>
                </form>

                <div style={styles.footer}>
                    <p style={styles.backLink} onClick={() => navigate('/select-role')}>← Back to Selection</p>
                    <p style={styles.footerText}>Already registered? <span style={styles.loginLink} onClick={() => navigate('/')}> Secure Login</span></p>
                </div>
            </div>
        </div>
    );
};

// Unified Core Layout Definitions Matrix Mapping
const styles = {
    container: { minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflowY: 'auto', backgroundColor: '#000', padding: '60px 20px', fontFamily: "'Inter', sans-serif" },
    videoBg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, filter: 'brightness(0.35)' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 2 },
    glassCard: { position: 'relative', zIndex: 3, width: '100%', maxWidth: '650px', padding: '50px 40px', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(35px)', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', textAlign: 'center' },
    headerArea: { marginBottom: '35px' },
    logoFrame: { width: '90px', height: '90px', background: '#fff', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #3498db', boxShadow: '0 0 30px rgba(52, 152, 219, 0.4)' },
    logoImg: { width: '80%' },
    title: { fontSize: '24px', fontWeight: '900', letterSpacing: '3px', color: '#fff', margin: '0' },
    subText: { fontSize: '13px', color: '#2ecc71', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px' },
    sectionHeader: { color: '#3498db', fontSize: '16px', textAlign: 'left', marginTop: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(52,152,219,0.2)', paddingBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' },
    form: { textAlign: 'left' },
    inputWrapper: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '8px', letterSpacing: '1px', fontWeight: 'bold' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255, 255, 255, 0.04)', color: '#fff', fontSize: '16px', boxSizing: 'border-box', transition: '0.3s', outline: 'none' },
    selectInput: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#121212', color: '#fff', fontSize: '16px', boxSizing: 'border-box', transition: '0.3s', cursor: 'pointer', outline: 'none' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '18px' },
    rowItem: { flex: '1 1 200px' },
    conditionalBox: { background: 'rgba(52,152,219,0.03)', padding: '20px', borderRadius: '15px', border: '1px dashed rgba(52,152,219,0.2)' },
    streamTitle: { color: '#2ecc71', fontSize: '14px', margin: '20px 0 10px 0', fontWeight: 'bold', letterSpacing: '0.5px', borderLeft: '3px solid #2ecc71', paddingLeft: '8px' },
    checkboxLabelNode: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
    declarationCheckNode: { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '13px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' },
    registerBtn: { width: '100%', padding: '18px', borderRadius: '12px', border: 'none', background: '#3498db', color: '#fff', fontWeight: '900', fontSize: '16px', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(52, 152, 219, 0.2)', marginTop: '25px', transition: '0.3s' },
    footer: { marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px', textAlign: 'center' },
    backLink: { color: '#888', cursor: 'pointer', fontSize: '14px', marginBottom: '15px', transition: '0.3s' },
    footerText: { color: '#aaa', fontSize: '15px' },
    loginLink: { color: '#3498db', fontWeight: 'bold', cursor: 'pointer' }
};

export default PiboRegister;