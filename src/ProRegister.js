import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import API from './api';

const ProRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // --- 100%ක්ම Required & Multi-select වලට සකස් කළ State එක ---
    const [formData, setFormData] = useState({
        regType: 'Company', // PRO සඳහා Default Company වේ
        orgRole: 'PRO', // Base identifier mapped to customer collection
        officialEmail: '',
        password: '',
        confirmPassword: '',
        phone: '',
        whatsapp: '',

        // Organization Details (Step 2)
        companyName: '',
        regNumber: '',
        dob: '', 
        country: '',
        address1: '', 
        address2: '', 
        operationalAddress: '',
        orgDistrict: '',
        orgProvince: '',

        // Contact Person Details (Step 3)
        contactPersonName: '',
        contactDesignation: '',
        contactPersonMobile: '',

        // Organization Types (Step 4 Array)
        organizationTypes: [],
        organizationTypesOther: '',

        // PRO Service Capabilities (Step 5 Array)
        serviceCapabilities: [],

        // Operational Coverage (Step 6)
        operationalCoverageAreas: [],
        managedPibosCount: '',
        networkCollectorsCount: '',

        // Waste Categories Managed (Step 7 Array)
        managedWasteCategories: [],
        managedWasteCategoriesOther: '',

        // Declarations & Consent (Step 9 Toggles)
        digitalSignatureName: '',
        declarationDate: new Date().toLocaleDateString(),
        isDeclarationAgreed: false, 
        proDeclarationRulesAgreed: false,
        proDeclarationVerificationAgreed: false
    });

    // File Strings Store (Base64 for Step 8)
    const [fileStrings, setFileStrings] = useState({ 
        brc: "", taxCert: "", compProfile: "", expProof: "", authLetter: "" 
    });

    // Static Dropdown Data Lists
    const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya",
         "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];
    const provinces = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];
    const countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
         "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", 
         "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
         "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
         "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", 
         "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
         "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", 
         "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
         "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
         "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
         "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", 
         "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Multi-select Checkbox Groups Handling Function
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

    const validatePhone = (number) => {
        return /^[0-9]{10}$/.test(number);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        if (!validatePhone(formData.phone) || !validatePhone(formData.contactPersonMobile)) {
            alert("❌ Please enter valid 10-digit Phone Numbers.");
            return;
        }

        if (!formData.isDeclarationAgreed || !formData.proDeclarationRulesAgreed || !formData.proDeclarationVerificationAgreed) {
            alert("❌ You must agree to all declaration and legal terms before submitting!");
            return;
        }

        // Payload එක සකස් කිරීම
        const finalPayload = {
            ...formData,
            brcDocument: fileStrings.brc, 
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
                    <h2 style={styles.title}>PRO REGISTRATION PORTAL</h2>
                    <p style={styles.subText}>Producer Responsibility Organization Compliance Hub</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={{ color: '#f1c40f', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '25px', background: 'rgba(241,196,15,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(241,196,15,0.2)' }}>
                        PROGRESS PHASE: {step} OF 9 — {
                            step === 1 ? "ACCOUNT CREATION" :
                            step === 2 ? "ORGANIZATION INFORMATION" :
                            step === 3 ? "CONTACT PERSON DETAILS" :
                            step === 4 ? "ORGANIZATION TYPE" :
                            step === 5 ? "PRO SERVICE CAPABILITY" :
                            step === 6 ? "OPERATIONAL COVERAGE" :
                            step === 7 ? "WASTE CATEGORIES MANAGED" :
                            step === 8 ? "DOCUMENT UPLOADS" : "DECLARATION & CONSENT"
                        }
                    </div>

                    {/* Step 1: Account Creation */}
                    {step === 1 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 1: Account Creation</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>EMAIL ADDRESS (LOGIN ID) *</label>
                                <input name="officialEmail" value={formData.officialEmail} type="email" placeholder="pro-login@domain.com" style={styles.input} onChange={handleChange} required />
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
                                <label style={styles.label}>OFFICIAL CONTACT NUMBER *</label>
                                <input name="phone" value={formData.phone} maxLength="10" placeholder="011XXXXXXXX" type="text" style={styles.input} onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Organization Information */}
                    {step === 2 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 2: Organization Information</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>ORGANIZATION LEGAL NAME *</label>
                                <input name="companyName" value={formData.companyName} type="text" placeholder="Legal Corporate Identity Name" style={styles.input} onChange={handleChange} required />
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>BUSINESS REGISTRATION NUMBER *</label>
                                    <input name="regNumber" value={formData.regNumber} type="text" placeholder="PV-XXXXXX" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DATE OF INCORPORATION *</label>
                                    <input name="dob" value={formData.dob} type="date" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>
                          <div style={styles.rowItem}>
    <label style={styles.label}>COUNTRY OF REGISTRATION *</label>
    <input 
        list="country_list" 
        name="country" 
        value={formData.country} 
        placeholder="Type or Search Country..." 
        style={styles.input} 
        onChange={handleChange} 
        required 
    />
    <datalist id="country_list">
    {countries && countries.map((c, idx) => (
        <option key={idx} value={c} />
    ))}
</datalist>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DISTRICT *</label>
                                    <select name="orgDistrict" value={formData.orgDistrict} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Select District --</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>PROVINCE *</label>
                                <select name="orgProvince" value={formData.orgProvince} style={styles.selectInput} onChange={handleChange} required>
                                    <option value="">-- Select Province --</option>
                                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>REGISTERED ADDRESS (LINE 01) *</label>
                                <input name="address1" value={formData.address1} type="text" placeholder="Street Address, Corporate Office" style={styles.input} onChange={handleChange} required />
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>REGISTERED ADDRESS (LINE 02)</label>
                                <input name="address2" value={formData.address2} type="text" placeholder="Suite, Unit, Floor (Optional)" style={styles.input} onChange={handleChange} />
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>OPERATIONAL ADDRESS (IF DIFFERENT)</label>
                                <input name="operationalAddress" value={formData.operationalAddress} type="text" placeholder="Primary Operations Hub Address" style={styles.input} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Contact Person Details */}
                    {step === 3 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 3: Contact Person Details</h3>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>FULL NAME *</label>
                                    <input name="contactPersonName" value={formData.contactPersonName} type="text" placeholder="Authorized Focal Representative" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DESIGNATION *</label>
                                    <input name="contactDesignation" value={formData.contactDesignation} type="text" placeholder="e.g. Compliance Director" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>MOBILE NUMBER *</label>
                                    <input name="contactPersonMobile" value={formData.contactPersonMobile} maxLength="10" placeholder="07XXXXXXXX" type="text" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>WHATSAPP NUMBER (OPTIONAL)</label>
                                    <input name="whatsapp" value={formData.whatsapp} maxLength="10" placeholder="07XXXXXXXX" type="text" style={styles.input} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Organization Type */}
                    {step === 4 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 4: Organization Type</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    "Waste Management Company",
                                    "Environmental Service Provider",
                                    "Industry Association",
                                    "Sustainability / Compliance Firm",
                                    "NGO / Cooperative / Consortium"
                                ].map((type) => (
                                    <label key={type} style={styles.checkboxLabelNode}>
                                        <input type="checkbox" checked={formData.organizationTypes.includes(type)} onChange={(e) => handleCheckboxGroup(e, 'organizationTypes', type)} style={{ width: '18px', height: '18px' }} />
                                        {type}
                                    </label>
                                ))}
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <label style={styles.label}>OTHER SPECIFICATION (IF NOT IN LIST)</label>
                                <input name="organizationTypesOther" value={formData.organizationTypesOther} type="text" placeholder="Please specify your organization structural model..." style={styles.input} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* Step 5: PRO Service Capability */}
                    {step === 5 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 5: PRO Service Capability Specs</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    "EPR compliance management for PIBOs",
                                    "Waste collection system coordination",
                                    "Recycler network management",
                                    "Data reporting & digital submissions",
                                    "Environmental compliance monitoring",
                                    "National or regional operations capability"
                                ].map((cap) => (
                                    <label key={cap} style={styles.checkboxLabelNode}>
                                        <input type="checkbox" checked={formData.serviceCapabilities.includes(cap)} onChange={(e) => handleCheckboxGroup(e, 'serviceCapabilities', cap)} style={{ width: '18px', height: '18px' }} />
                                        {cap}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 6: Operational Coverage */}
                    {step === 6 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 6: Operational Coverage</h3>
                            <label style={styles.label}>COVERAGE AREA *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px' }}>
                                {["Local", "District Level", "Provincial Level", "National Level"].map(area => (
                                    <label key={area} style={styles.checkboxLabelNode}>
                                        <input type="checkbox" checked={formData.operationalCoverageAreas.includes(area)} onChange={(e) => handleCheckboxGroup(e, 'operationalCoverageAreas', area)} />
                                        {area}
                                    </label>
                                ))}
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>NUMBER OF PIBOS CURRENTLY MANAGED *</label>
                                    <input name="managedPibosCount" value={formData.managedPibosCount} type="number" placeholder="0" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>NUMBER OF COLLECTORS/RECYCLERS IN NETWORK *</label>
                                    <input name="networkCollectorsCount" value={formData.networkCollectorsCount} type="number" placeholder="0" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 7: Waste Categories Managed */}
                    {step === 7 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 7: Waste Categories Managed</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '15px', maxHeight: '300px', overflowY: 'auto' }}>
                                {[
                                    "Plastic", "Paper & Cardboard", "E-waste", "CFL Bulbs & Mercury contaminated",
                                    "LED Bulbs & Heavy Metal contaminated", "Batteries", "Oil contaminated packings",
                                    "Chemical contaminated", "Waste Cooking Oil", "Waste Engine Oil", "Used Copper Grit",
                                    "Metal contaminated sludges", "Solar Panels & EV/ Hybrid Batteries",
                                    "Solar & Renewable products", "Glass", "Industrial Waste", "Agro chemicals", "Pesticides"
                                ].map(cat => (
                                    <label key={cat} style={{ fontSize: '13px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={formData.managedWasteCategories.includes(cat)} onChange={(e) => handleCheckboxGroup(e, 'managedWasteCategories', cat)} />
                                        {cat}
                                    </label>
                                ))}
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <label style={styles.label}>OTHER SPECIFIC MATERIALS (SPECIFY)</label>
                                <input name="managedWasteCategoriesOther" value={formData.managedWasteCategoriesOther} type="text" placeholder="Specify other corporate secondary materials..." style={styles.input} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* Step 8: Document Uploads */}
                    {step === 8 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 8: Statutory Document Uploads</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>BUSINESS REGISTRATION CERTIFICATE (BRC) *</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'brc')} accept=".pdf,.jpg,.jpeg,.png" required={!fileStrings.brc} />
                                {fileStrings.brc && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ BRC Selected</p>}
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>TAX REGISTRATION CERTIFICATE (OPTIONAL)</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'taxCert')} accept=".pdf,.jpg,.jpeg,.png" />
                                {fileStrings.taxCert && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ Tax Certificate Selected</p>}
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>COMPANY PROFILE / RECOGNIZED BROCHURE (PDF) *</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'compProfile')} accept=".pdf" required={!fileStrings.compProfile} />
                                {fileStrings.compProfile && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ Profile Report Selected</p>}
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>PROOF OF OPERATIONAL EXPERIENCE *</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'expProof')} accept=".pdf,.jpg,.jpeg,.png" required={!fileStrings.expProof} />
                                {fileStrings.expProof && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ Experience Matrix Selected</p>}
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>CONSENT LETTER / POWER OF ATTORNEY (IF APPLICABLE)</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'authLetter')} accept=".pdf,.jpg,.jpeg,.png" />
                                {fileStrings.authLetter && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ Consent Authorization Uploaded</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 9: Declaration & Consent */}
                    {step === 9 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 9: Statutory Digital Declaration</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                                <label style={styles.declarationCheckNode}>
                                    <input type="checkbox" name="isDeclarationAgreed" checked={formData.isDeclarationAgreed} onChange={handleChange} required />
                                    I confirm that all information provided is accurate
                                </label>
                                <label style={styles.declarationCheckNode}>
                                    <input type="checkbox" name="proDeclarationRulesAgreed" checked={formData.proDeclarationRulesAgreed} onChange={handleChange} required />
                                    I agree to comply with EPR Digital Platform rules and national regulations
                                </label>
                                <label style={styles.declarationCheckNode}>
                                    <input type="checkbox" name="proDeclarationVerificationAgreed" checked={formData.proDeclarationVerificationAgreed} onChange={handleChange} required />
                                    I understand my registration is subject to verification and approval
                                </label>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DIGITAL SIGNATURE / Name *</label>
                                    <input name="digitalSignatureName" type="text" placeholder="Type Representative Official Full Name" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>Date (auto-filled)</label>
                                    <input type="text" value={formData.declarationDate} style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed' }} readOnly />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons Control Center */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '35px' }}>
                        {step > 1 && (
                            <button type="button" onClick={() => setStep(prev => prev - 1)} style={{ ...styles.registerBtn, background: '#444', marginTop: 0 }}>
                                PREVIOUS PHASE
                            </button>
                        )}
                        {step < 9 ? (
                            <button type="button" onClick={() => setStep(prev => prev + 1)} style={{ ...styles.registerBtn, marginTop: 0 }}>
                                NEXT PHASE →
                            </button>
                        ) : (
                            <button type="submit" style={{ ...styles.registerBtn, background: '#f1c40f', color: '#000', boxShadow: '0 10px 30px rgba(241, 196, 15, 0.3)', marginTop: 0 }}>
                                EXECUTE SYSTEM PRO PROVISIONING
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

// Premium Stylesheet Definition for PRO Matrix
const styles = {
    container: { minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflowY: 'auto', backgroundColor: '#000', padding: '60px 20px', fontFamily: "'Inter', sans-serif" },
    videoBg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, filter: 'brightness(0.35)' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 2 },
    glassCard: { position: 'relative', zIndex: 3, width: '100%', maxWidth: '650px', padding: '50px 40px', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(35px)', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', textAlign: 'center' },
    headerArea: { marginBottom: '35px' },
    logoFrame: { width: '90px', height: '90px', background: '#fff', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #f1c40f', boxShadow: '0 0 30px rgba(241, 196, 15, 0.4)' },
    logoImg: { width: '80%' },
    title: { fontSize: '24px', fontWeight: '900', letterSpacing: '3px', color: '#fff', margin: '0' },
    subText: { fontSize: '13px', color: '#3498db', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px' },
    sectionHeader: { color: '#f1c40f', fontSize: '16px', textAlign: 'left', marginTop: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(241,196,15,0.2)', paddingBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' },
    form: { textAlign: 'left' },
    inputWrapper: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '8px', letterSpacing: '1px', fontWeight: 'bold' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255, 255, 255, 0.04)', color: '#fff', fontSize: '16px', boxSizing: 'border-box', transition: '0.3s', outline: 'none' },
    selectInput: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#121212', color: '#fff', fontSize: '16px', boxSizing: 'border-box', transition: '0.3s', cursor: 'pointer', outline: 'none' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '18px' },
    rowItem: { flex: '1 1 200px' },
    checkboxLabelNode: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
    declarationCheckNode: { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '13px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' },
    registerBtn: { width: '100%', padding: '18px', borderRadius: '12px', border: 'none', background: '#f1c40f', color: '#000', fontWeight: '900', fontSize: '16px', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(241, 196, 15, 0.2)', marginTop: '25px', transition: '0.3s' },
    footer: { marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px', textAlign: 'center' },
    backLink: { color: '#888', cursor: 'pointer', fontSize: '14px', marginBottom: '15px', transition: '0.3s' },
    footerText: { color: '#aaa', fontSize: '15px' },
    loginLink: { color: '#f1c40f', fontWeight: 'bold', cursor: 'pointer' }
};

export default ProRegister;