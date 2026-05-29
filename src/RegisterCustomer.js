import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import API from './api';

const RegisterCustomer = () => {
    const location = useLocation(); 
    const navigate = useNavigate();
    
    const initialRole = location.state?.selectedRole || '';

    // --- PRO පෝරමය සඳහා පියවර (Step) ට්‍රැක් කරන ස්ටේට් එක ---
    const [proStep, setProStep] = useState(1);

    const [formData, setFormData] = useState({
        regType: 'Company', 
        orgRole: initialRole === 'RECYCLER' ? 'Collector' : (initialRole === 'pro' ? 'PRO' : 'Producer'), 
        companyName: '', 
        companyWebsite: '', 
        phone: '', whatsapp: '', officialEmail: '',
        address1: '', address2: '', postalCode: '', country: 'Sri Lanka',
        contactPersonName: '', contactPersonMobile: '',
        dob: '', 
        password: '', confirmPassword: '',

        isCoPartner: false,
        coPartnerFullName: '',
        coPartnerAnotherEmail: '',
        coPartnerPhone: '',
        coPartnerNic: '',
        coPartnerDistrict: '',
        coPartnerPradeshiyaSabha: '',

        // 💎 PRO සඳහා වන නව Fields
        operationalAddress: '',
        orgDistrict: '',
        orgProvince: '',
        contactDesignation: '',
        organizationTypes: [],
        organizationTypesOther: '',
        serviceCapabilities: [],
        operationalCoverageAreas: [],
        managedPibosCount: 0,
        networkCollectorsCount: 0,
        managedWasteCategories: [],
        managedWasteCategoriesOther: '',
        digitalSignatureName: '',
        declarationDate: new Date().toLocaleDateString(),
        isDeclarationAgreed: false
    });

    const [fileStrings, setFileStrings] = useState({ 
        brc: "", vat: "", billing: "", nic: "",
        taxCert: "", compProfile: "", expProof: "", authLetter: "" 
    });

    const roleOptions = initialRole === 'RECYCLER' 
        ? [
            { label: 'COLLECTOR', value: 'Collector', icon: '🚛' },
            { label: 'TRANSPORTER', value: 'Transporter', icon: '🚚' },
            { label: 'RECYCLER', value: 'Recycler', icon: '♻️' },
            { label: 'TOTAL SOLUTION PROVIDER', value: 'Total Solution Provider', icon: '🌐' }
        ]
        : (initialRole === 'pro' ? [{ label: 'PRODUCER RESPONSIBILITY ORG', value: 'PRO', icon: '💎' }] : [
            { label: 'PRODUCER', value: 'Producer', icon: '🏭' },
            { label: 'IMPORTER', value: 'Importer', icon: '🚢' },
            { label: 'BRAND OWNER', value: 'Brand Owner', icon: '🏷️' }
        ]);

    const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];
    const provinces = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Checkbox ලිස්ට් හැන්ඩ්ල් කරන පොදු ෆන්ක්ෂන් එක
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

        if (formData.isCoPartner && formData.officialEmail === formData.coPartnerAnotherEmail) {
            alert("❌ Official Email and Co-Partner Email cannot be the same!");
            return;
        }

        if (!validatePhone(formData.phone)) {
            alert("❌ Please enter a valid 10-digit Phone Number.");
            return;
        }

        if (initialRole === 'pro' && !formData.isDeclarationAgreed) {
            alert("❌ You must agree to the declaration and consent before submitting!");
            return;
        }

        // Payload එක සකස් කිරීම
        const finalPayload = {
            ...formData,
            brcDocument: (initialRole === 'RECYCLER' && formData.regType === 'Individual') ? "" : fileStrings.brc, 
            vatDocument: (initialRole === 'RECYCLER' && formData.regType === 'Individual') ? "" : fileStrings.vat,
            billingDocument: (initialRole === 'RECYCLER' && formData.regType === 'Individual') ? "" : fileStrings.billing,
            verificationDocs: (initialRole === 'RECYCLER' && formData.regType === 'Individual' && fileStrings.nic) ? [fileStrings.nic] : [],

            // PRO අමතර ලේඛන
            taxCertificateDocument: fileStrings.taxCert,
            companyProfileDocument: fileStrings.compProfile,
            operationalExperienceProofDocument: fileStrings.expProof,
            authorizationLetterDocument: fileStrings.authLetter
        };

        try {
            const response = await API.post('/customers/register', finalPayload);
            if (response.status === 201 || response.status === 200) {
                alert("✅ PRO Registration Request Submitted Successfully!");
                navigate('/'); 
            }
        } catch (error) {
            console.error("Registration Error:", error);
            alert("❌ Error: " + (error.response?.data?.error || "Registration failed."));
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
                    <h2 style={styles.title}>
                        {initialRole === 'pro' ? 'PRO REGISTRATION PORTAL' : (initialRole === 'RECYCLER' ? 'PRO REGISTRATION' : 'PIBO REGISTRATION')}
                    </h2>
                    <p style={styles.subText}>
                        {initialRole === 'pro' 
                            ? 'Producer Responsibility Organization: Corporate Enterprise Authorization Form'
                            : (initialRole === 'RECYCLER' ? 'COLLECTOR / TRANSPORTER / RECYCLER / TOTAL SOLUTION PROVIDER' : 'Producers, Importers & Brand Owners')}
                    </p>
                </div>

                {/* ========================================================================= */}
                {/* 💎 🟢 ඔන්න බෝසා, PRO ආවොත් විතරක් වැඩ කරන පියවර 9ක පෝරමය මෙතනින් පටන් ගන්නවා */}
                {/* ========================================================================= */}
                {initialRole === 'pro' ? (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Step Indicator Wrapper */}
                        <div style={{ color: '#2ecc71', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', background: 'rgba(46,204,113,0.1)', padding: '10px', borderRadius: '10px' }}>
                            PROGRESS STEP: {proStep} OF 9 — {
                                proStep === 1 ? "ACCOUNT CREATION" :
                                proStep === 2 ? "ORGANIZATION INFORMATION" :
                                proStep === 3 ? "CONTACT PERSON DETAILS" :
                                proStep === 4 ? "ORGANIZATION TYPE" :
                                proStep === 5 ? "PRO SERVICE CAPABILITY" :
                                proStep === 6 ? "OPERATIONAL COVERAGE" :
                                proStep === 7 ? "WASTE CATEGORIES MANAGED" :
                                proStep === 8 ? "DOCUMENT UPLOADS" : "DECLARATION & CONSENT"
                            }
                        </div>

                        {/* Step 1: Account Creation */}
                        {proStep === 1 && (
                            <div>
                                <h3 style={styles.sectionHeader}>Step 1: Account Creation</h3>
                                <div style={styles.inputWrapper}>
                                    <label style={styles.label}>EMAIL ADDRESS (USED AS LOGIN ID)</label>
                                    <input name="officialEmail" value={formData.officialEmail} type="email" placeholder="pro-login@domain.com" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>PASSWORD</label>
                                        <input name="password" value={formData.password} type="password" placeholder="••••••••" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>CONFIRM PASSWORD</label>
                                        <input name="confirmPassword" value={formData.confirmPassword} type="password" placeholder="••••••••" style={styles.input} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Organization Information */}
                        {proStep === 2 && (
                            <div>
                                <h3 style={styles.sectionHeader}>Step 2: Organization Information</h3>
                                <div style={styles.inputWrapper}>
                                    <label style={styles.label}>ORGANIZATION LEGAL NAME</label>
                                    <input name="companyName" value={formData.companyName} type="text" placeholder="Legal Entity Name" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>BUSINESS REGISTRATION NUMBER</label>
                                        <input name="regNumber" value={formData.regNumber} type="text" placeholder="PV-XXXXXX" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>DATE OF INCORPORATION</label>
                                        <input name="dob" value={formData.dob} type="date" style={styles.input} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>COUNTRY OF REGISTRATION</label>
                                        <select name="country" value={formData.country} style={styles.selectInput} onChange={handleChange}>
                                            <option value="Sri Lanka">Sri Lanka</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>DISTRICT</label>
                                        <select name="orgDistrict" value={formData.orgDistrict} style={styles.selectInput} onChange={handleChange} required>
                                            <option value="">-- Select District --</option>
                                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={styles.inputWrapper}>
                                    <label style={styles.label}>PROVINCE</label>
                                    <select name="orgProvince" value={formData.orgProvince} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Select Province --</option>
                                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div style={styles.inputWrapper}>
                                    <label style={styles.label}>REGISTERED STREET ADDRESS (LINE 1)</label>
                                    <input name="address1" value={formData.address1} type="text" placeholder="Headquarters Street Address" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.inputWrapper}>
                                    <label style={styles.label}>OPERATIONAL ADDRESS (OPTIONAL)</label>
                                    <input name="operationalAddress" value={formData.operationalAddress} type="text" placeholder="Warehouse or Main Branch Center Address" style={styles.input} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact Person Details */}
                        {proStep === 3 && (
                            <div>
                                <h3 style={styles.sectionHeader}>Step 3: Contact Person Details</h3>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>FULL NAME</label>
                                        <input name="contactPersonName" value={formData.contactPersonName} type="text" placeholder="Authorized Representative Name" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>DESIGNATION / ROLE</label>
                                        <input name="contactDesignation" value={formData.contactDesignation} type="text" placeholder="e.g. Compliance Officer / Director" style={styles.input} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>MOBILE NUMBER</label>
                                        <input name="contactPersonMobile" value={formData.contactPersonMobile} maxLength="10" type="text" placeholder="07XXXXXXXX" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>PHONE NUMBER</label>
                                        <input name="phone" value={formData.phone} maxLength="10" type="text" placeholder="011XXXXXXX" style={styles.input} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div style={styles.inputWrapper}>
                                    <label style={styles.label}>WHATSAPP NUMBER (OPTIONAL)</label>
                                    <input name="whatsapp" value={formData.whatsapp} maxLength="10" type="text" placeholder="07XXXXXXXX" style={styles.input} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Organization Type */}
                        {proStep === 4 && (
                            <div>
                                <h3 style={styles.sectionHeader}>Step 4: Organization Type (Select One or Multiple)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        "Waste Management Company",
                                        "Environmental Service Provider",
                                        "Industry Association",
                                        "Sustainability / Compliance Firm",
                                        "NGO / Cooperative / Consortium"
                                    ].map((type) => (
                                        <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '15px' }}>
                                            <input type="checkbox" checked={formData.organizationTypes.includes(type)} onChange={(e) => handleCheckboxGroup(e, 'organizationTypes', type)} style={{ width: '18px', height: '18px' }} />
                                            {type}
                                        </label>
                                    ))}
                                    <div style={{ marginTop: '10px' }}>
                                        <label style={styles.label}>OTHER TYPE (SPECIFY)</label>
                                        <input name="organizationTypesOther" value={formData.organizationTypesOther} type="text" placeholder="If other, please mention here..." style={styles.input} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: PRO Service Capability */}
                        {proStep === 5 && (
                            <div>
                                <h3 style={styles.sectionHeader}>Step 5: PRO Service Capability (Select All Applicable)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        "EPR compliance management for PIBOs",
                                        "Waste collection system coordination",
                                        "Recycler network management",
                                        "Data reporting & digital submissions",
                                        "Environmental compliance monitoring",
                                        "National or regional operations capability"
                                    ].map((cap) => (
                                        <label key={cap} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '15px' }}>
                                            <input type="checkbox" checked={formData.serviceCapabilities.includes(cap)} onChange={(e) => handleCheckboxGroup(e, 'serviceCapabilities', cap)} style={{ width: '18px', height: '18px' }} />
                                            {cap}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 6: Operational Coverage */}
                        {proStep === 6 && (
                            <div>
                                <h3 style={styles.sectionHeader}>Step 6: Operational Coverage Area</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                                    {["Local", "District Level", "Provincial Level", "National Level"].map((area) => (
                                        <label key={area} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '15px' }}>
                                            <input type="checkbox" checked={formData.operationalCoverageAreas.includes(area)} onChange={(e) => handleCheckboxGroup(e, 'operationalCoverageAreas', area)} style={{ width: '18px', height: '18px' }} />
                                            {area}
                                        </label>
                                    ))}
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>NUMBER OF PIBOS CURRENTLY MANAGED</label>
                                        <input name="managedPibosCount" value={formData.managedPibosCount} type="number" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>NUMBER OF COLLECTORS IN NETWORK</label>
                                        <input name="networkCollectorsCount" value={formData.networkCollectorsCount} type="number" style={styles.input} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 7: Waste Categories Managed */}
                        {proStep === 7 && (
                            <div>
                                <h3 style={styles.sectionHeader}>Step 7: Waste Categories Managed</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flexWrap: 'wrap' }}>
                                    {[
                                        "Plastic", "Paper & Cardboard", "E-waste", "CFL Bulbs & Mercury contaminated", 
                                        "LED Bulbs & Heavy Metal contaminated", "Batteries", "Oil contaminated packings", 
                                        "Chemical contaminated", "Waste Cooking Oil", "Waste Engine Oil", 
                                        "Used Copper Grit", "Metal contaminated sludges", "Solar Panels & EV/ Hybrid Batteries", 
                                        "Solar & Renewable products", "Glass", "Industrial Waste"
                                    ].map((cat) => (
                                        <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#ccc', fontSize: '13px' }}>
                                            <input type="checkbox" checked={formData.managedWasteCategories.includes(cat)} onChange={(e) => handleCheckboxGroup(e, 'managedWasteCategories', cat)} style={{ width: '16px', height: '16px' }} />
                                            {cat}
                                        </label>
                                    ))}
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <label style={styles.label}>OTHER WASTE TYPES SPECIFY</label>
                                    <input name="managedWasteCategoriesOther" value={formData.managedWasteCategoriesOther} type="text" placeholder="Please specify if any other categories exist..." style={styles.input} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {/* Step 8: Document Uploads */}
                        {proStep === 8 && (
                            <div>
                                <h3 style={styles.sectionHeader}>Step 8: Document Uploads</h3>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={styles.label}>BUSINESS REGISTRATION CERTIFICATE (BRC) *</label>
                                    <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'brc')} accept=".pdf,.jpg,.jpeg,.png" required={!fileStrings.brc} />
                                    {fileStrings.brc && <p style={{ color: '#2ecc71', fontSize: '13px' }}>✅ BRC Uploaded</p>}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={styles.label}>TAX REGISTRATION CERTIFICATE (TIN) (OPTIONAL)</label>
                                    <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'taxCert')} accept=".pdf,.jpg,.jpeg,.png" />
                                    {fileStrings.taxCert && <p style={{ color: '#2ecc71', fontSize: '13px' }}>✅ Tax Certificate Uploaded</p>}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={styles.label}>COMPANY PROFILE / BROCHURE (PDF) *</label>
                                    <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'compProfile')} accept=".pdf" required={!fileStrings.compProfile} />
                                    {fileStrings.compProfile && <p style={{ color: '#2ecc71', fontSize: '13px' }}>✅ Profile Uploaded</p>}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={styles.label}>PROOF OF OPERATIONAL EXPERIENCE (OPTIONAL)</label>
                                    <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'expProof')} accept=".pdf,.jpg,.jpeg,.png" />
                                    {fileStrings.expProof && <p style={{ color: '#2ecc71', fontSize: '13px' }}>✅ Proof of Experience Uploaded</p>}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={styles.label}>AUTHORIZATION LETTER (IF APPLICABLE)</label>
                                    <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'authLetter')} accept=".pdf,.jpg,.jpeg,.png" />
                                    {fileStrings.authLetter && <p style={{ color: '#2ecc71', fontSize: '13px' }}>✅ Authorization Letter Uploaded</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 9: Declaration & Consent */}
                        {proStep === 9 && (
                            <div>
                                <h3 style={styles.sectionHeader}>Step 9: Declaration & Consent</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '14px' }}>
                                        <input type="checkbox" required onChange={(e) => setFormData({ ...formData, isDeclarationAgreed: e.target.checked })} style={{ width: '18px', height: '18px', marginTop: '3px' }} />
                                        I confirm that all information provided is accurate and authentic.
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '14px' }}>
                                        <input type="checkbox" required style={{ width: '18px', height: '18px', marginTop: '3px' }} />
                                        I agree to comply with EPR Digital Platform rules and national statutory environmental regulations.
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '14px' }}>
                                        <input type="checkbox" required style={{ width: '18px', height: '18px', marginTop: '3px' }} />
                                        I understand my organization registration is strictly subject to government verification and final board approval.
                                    </label>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>DIGITAL SIGNATURE / REPRESENTATIVE NAME</label>
                                        <input name="digitalSignatureName" type="text" placeholder="Type Your Full Name" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>DECLARATION DATE</label>
                                        <input type="text" value={formData.declarationDate} style={{ ...styles.input, opacity: 0.6, cursor: 'not-allowed' }} readOnly />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Multi-step Form Navigation Buttons */}
                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            {proStep > 1 && (
                                <button type="button" onClick={() => setProStep(prev => prev - 1)} style={{ ...styles.registerBtn, background: '#555', marginTop: 0 }}>
                                    PREVIOUS
                                </button>
                            )}
                            {proStep < 9 ? (
                                <button type="button" onClick={() => setProStep(prev => prev + 1)} style={{ ...styles.registerBtn, marginTop: 0 }}>
                                    NEXT STEP
                                </button>
                            ) : (
                                <button type="submit" style={{ ...styles.registerBtn, background: '#2ecc71', boxShadow: '0 10px 30px rgba(46, 204, 113, 0.3)', marginTop: 0 }}>
                                    SUBMIT CORPORATE PRO REQUEST
                                </button>
                            )}
                        </div>
                    </form>
                ) : (
                    /* ========================================================================= */
                    /* 🛡️ 🚢 🏭 ඔන්න බෝසා, ඔයාගේ පරණ මුල් කෝඩ් එක (PIBO & RECYCLER) 100%ක් ඒ විදිහටම මෙතන තියෙනවා */
                    /* ========================================================================= */
                    <form onSubmit={handleSubmit} style={styles.form}>
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
                                            flex: '1 1 120px', padding: '15px 10px', borderRadius: '15px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            background: formData.orgRole === r.value ? 'rgba(52, 152, 219, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                            border: formData.orgRole === r.value ? '2px solid #3498db' : '1px solid rgba(255, 255, 255, 0.1)',
                                            transform: formData.orgRole === r.value ? 'scale(1.03)' : 'scale(1)',
                                            boxShadow: formData.orgRole === r.value ? '0 10px 25px rgba(52, 152, 219, 0.2)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: '8px', filter: formData.orgRole === r.value ? 'none' : 'grayscale(100%) opacity(0.5)' }}>
                                            {r.icon}
                                        </div>
                                        <div style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '1px', color: formData.orgRole === r.value ? '#3498db' : '#888' }}>
                                            {r.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

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

                        {(formData.orgRole === 'Collector' || formData.orgRole === 'Total Solution Provider') && (
                            <div style={{ marginBottom: '20px', background: 'rgba(52, 152, 219, 0.05)', padding: '18px', borderRadius: '15px', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
                                <label style={{ color: '#3498db', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input type="checkbox" checked={formData.isCoPartner} onChange={(e) => setFormData({ ...formData, isCoPartner: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
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
                )}

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