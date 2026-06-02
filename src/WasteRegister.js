import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import API from './api';

const WasteRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // --- 100%ක්ම Required & Multi-select වලට සකස් කළ State එක ---
    const [formData, setFormData] = useState({
        regType: 'Company', // Company or Individual
        orgRole: 'RECYCLER', // Base identifier mapped to customer collection
        officialEmail: '',
        password: '',
        confirmPassword: '',
        phone: '',
        whatsapp: '',

        // Selected Entities (Step 2 Checkboxes)
        isCollector: false,
        isRecycler: false,
        isTransporter: false,
        isTotalSolutionProvider: false,

        // Organization Details (Step 3)
        companyName: '',
        companyWebsite: '',
        regNumber: '',
        dob: '',
        address1: '',
        operationalAddress: '',
        orgDistrict: '',
        orgProvince: '',
        country: 'Sri Lanka',

        // Contact Person (Step 4)
        contactPersonName: '',
        contactDesignation: '',
        contactPersonMobile: '',

        // Operational Role Details (Step 5 - Conditional Arrays)
        collectionSystemTypes: [], 
        collectionAreaCoverage: '', 
        facilityRecyclingType: [], 
        installedProcessingCapacity: '',
        facilityLocation: '',
        transportVehicleTypes: [], 
        transportCoverageScope: '', 
        transportPradeshiyaSabhas: [], 
        hasWasteHandlingLicense: 'No',

        // Waste Categories Handled (Step 6 Arrays)
        generalWasteStreams: [],
        eeWasteStreams: [],
        chemicalHazardousWasteStreams: [],
        oilLiquidWasteStreams: [],
        metalIndustrialWasteStreams: [],
        additionalNotes: '',

        // Capacity & Infrastructure (Step 7 & 8)
        estimatedMonthlyCollectionVolume: '',
        estimatedMonthlyProcessingVolume: '',
        storageCapacityAvailable: '',
        employeeCount: '',
        infrastructureEquipmentTypes: [],
        equipmentDetailsReport: '',

        // Network & Compliance Toggles (Step 9 & 10)
        hasEnvironmentalLicense: 'No',
        worksWithPro: 'No',
        linkedProName: '',
        receivesWasteFromPibos: 'No',

        // Declarations (Step 11)
        digitalSignatureName: '',
        declarationDate: new Date().toLocaleDateString(),
        wasteDeclarationConfirmed: false,
        wasteDeclarationPlatformAgreed: false,
        wasteDeclarationReportingAgreed: false,
        wasteDeclarationVerificationAgreed: false
    });

    // File Strings Store (Base64)
    const [fileStrings, setFileStrings] = useState({ 
        brc: "", vat: "", billing: "", nic: "",
        envLicense: "", wasteLicense: "", boiApproval: ""
    });

    // Static Dropdown Data Lists
    const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];
    const provinces = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];
    const pradeshiyaSabhas = ["All Pradeshiya Sabhas", "Colombo MC", "Dehiwala-Mount Lavinia MC", "Sri Jayawardenepura Kotte MC", "Moratuwa MC", "Kaduwela MC", "Maharagama UC", "Boralesgamuwa UC", "Kolonnawa UC", "Kotikawatta-Mulleriyawa PS", "Seethawakapura UC", "Homagama PS", "Gampaha MC", "Negombo MC", "Kandy MC", "Galle MC", "Jaffna MC", "Kurunegala MC", "Anuradhapura MC"];

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

        if (!formData.wasteDeclarationConfirmed || !formData.wasteDeclarationPlatformAgreed || !formData.wasteDeclarationReportingAgreed || !formData.wasteDeclarationVerificationAgreed) {
            alert("❌ You must agree to all declaration and legal terms before submitting!");
            return;
        }

        // Combining multi-select streams into single array for customer schema mapping
        const totalWasteCategories = [
            ...formData.generalWasteStreams,
            ...formData.eeWasteStreams,
            ...formData.chemicalHazardousWasteStreams,
            ...formData.oilLiquidWasteStreams,
            ...formData.metalIndustrialWasteStreams
        ];

        const finalPayload = {
            ...formData,
            managedWasteCategories: totalWasteCategories,
            
            // Core Base64 Documents
            brcDocument: formData.regType === 'Company' ? fileStrings.brc : "",
            vatDocument: formData.regType === 'Company' ? fileStrings.vat : "",
            billingDocument: formData.regType === 'Company' ? fileStrings.billing : "",
            nic: formData.regType === 'Individual' ? fileStrings.nic : "",

            // Waste Management Specific Uploads
            environmentalLicenseFile: fileStrings.envLicense,
            wasteHandlingLicenseFile: fileStrings.wasteLicense,
            boiLocalAuthorityApprovalFile: fileStrings.boiApproval
        };

        try {
            const response = await API.post('/customers/register', finalPayload);
            if (response.status === 201 || response.status === 200) {
                alert("✅ Waste Management Registration Request Submitted Successfully!");
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
                    <h2 style={styles.title}>WASTE MANAGEMENT PORTAL</h2>
                    <p style={styles.subText}>Collector, Recycler, Transporter & Total Solution Provider Unified Form</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={{ color: '#f39c12', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '25px', background: 'rgba(243,156,18,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(243,156,18,0.2)' }}>
                        PROGRESS STEP: {step} OF 11 — {
                            step === 1 ? "ACCOUNT CREATION" :
                            step === 2 ? "ENTITY TYPE SELECTION" :
                            step === 3 ? "ORGANIZATION DETAILS" :
                            step === 4 ? "CONTACT PERSON DETAILS" :
                            step === 5 ? "OPERATIONAL ROLE SPECS" :
                            step === 6 ? "WASTE CATEGORIES HANDLED" :
                            step === 7 ? "OPERATIONAL CAPACITY" :
                            step === 8 ? "EQUIPMENT & INFRASTRUCTURE" :
                            step === 9 ? "COMPLIANCE & LICENSES" :
                            step === 10 ? "PRO / PIBO NETWORK CONNECTIVITY" : "DIGITAL DECLARATION"
                        }
                    </div>

                    {/* Step 1: Account Creation */}
                    {step === 1 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 1: Account Creation</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>EMAIL ADDRESS (LOGIN ID) *</label>
                                <input name="officialEmail" value={formData.officialEmail} type="email" placeholder="partner-login@domain.com" style={styles.input} onChange={handleChange} required />
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
                                <label style={styles.label}>MOBILE NUMBER (FOR OTP VERIFICATION) *</label>
                                <input name="phone" value={formData.phone} maxLength="10" placeholder="07XXXXXXXX" type="text" style={styles.input} onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Entity Type Selection */}
                    {step === 2 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 2: Entity Type Selection (Select One or Multiple)</h3>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                                {['Company', 'Individual'].map((t) => (
                                    <button key={t} type="button" onClick={() => setFormData({ ...formData, regType: t })} style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', background: formData.regType === t ? 'rgba(243,156,18,0.15)' : 'rgba(255,255,255,0.03)', border: formData.regType === t ? '2px solid #f39c12' : '1px solid rgba(255,255,255,0.1)', color: formData.regType === t ? '#f39c12' : '#aaa', transition: '0.3s' }}>
                                        {t === 'Company' ? '🏢 Company Registration' : '👤 Individual Registration'}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                                {[
                                    { id: 'isCollector', label: '🚛 Collector' },
                                    { id: 'isRecycler', label: '♻️ Recycler' },
                                    { id: 'isTransporter', label: '🚚 Transporter' },
                                    { id: 'isTotalSolutionProvider', label: '🌐 Total Solution Provider' }
                                ].map((item) => (
                                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '16px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <input type="checkbox" name={item.id} checked={formData[item.id]} onChange={handleChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                        {item.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Organization Details */}
                    {step === 3 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 3: Organization Details</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>LEGAL NAME OF BUSINESS / INDIVIDUAL *</label>
                                <input name="companyName" value={formData.companyName} type="text" placeholder="Entity Legal Name" style={styles.input} onChange={handleChange} required />
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>COMPANY WEBSITE (OPTIONAL)</label>
                                <input name="companyWebsite" value={formData.companyWebsite} type="text" placeholder="https://example.com" style={styles.input} onChange={handleChange} />
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>BUSINESS REGISTRATION / NIC NUMBER *</label>
                                    <input name="regNumber" value={formData.regNumber} type="text" placeholder="PV-XXXXXX / NIC" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DATE OF INCORPORATION / BIRTH *</label>
                                    <input name="dob" value={formData.dob} type="date" style={styles.input} onChange={handleChange} required />
                                </div>
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
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>REGISTERED ADDRESS (MULTILINE) *</label>
                                <input name="address1" value={formData.address1} type="text" placeholder="Headquarters Physical Address" style={styles.input} onChange={handleChange} required />
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>OPERATIONAL ADDRESS (IF DIFFERENT)</label>
                                <input name="operationalAddress" value={formData.operationalAddress} type="text" placeholder="Warehouse / Processing Center Location" style={styles.input} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Contact Person Details */}
                    {step === 4 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 4: Contact Person Details</h3>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>FULL NAME *</label>
                                    <input name="contactPersonName" value={formData.contactPersonName} type="text" placeholder="Focal Point Representative" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DESIGNATION *</label>
                                    <input name="contactDesignation" value={formData.contactDesignation} type="text" placeholder="e.g. Operations Manager" style={styles.input} onChange={handleChange} required />
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

                    {/* Step 5: Operational Role Details (Conditional Render Magic) */}
                    {step === 5 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 5: Operational Role Details (Configuration Specifications)</h3>
                            
                            {/* Collector Sub-form */}
                            {(formData.isCollector || formData.isTotalSolutionProvider) && (
                                <div style={styles.conditionalBox}>
                                    <h4 style={{ color: '#f39c12', margin: '0 0 12px 0', fontSize: '15px' }}>📦 Collector Infrastructure Configurations</h4>
                                    <label style={styles.label}>TYPE OF COLLECTION SYSTEM *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        {["Door-to-door", "Industrial collection", "Scrap yard / aggregation center", "Municipal contractor", "Informal network"].map(t => (
                                            <label key={t} style={{ fontSize: '13px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" checked={formData.collectionSystemTypes.includes(t)} onChange={(e) => handleCheckboxGroup(e, 'collectionSystemTypes', t)} />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                    <label style={styles.label}>COLLECTION AREA COVERAGE *</label>
                                    <select name="collectionAreaCoverage" value={formData.collectionAreaCoverage} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Select Coverage --</option>
                                        <option value="Local">Local</option>
                                        <option value="District">District</option>
                                        <option value="National">National</option>
                                    </select>
                                </div>
                            )}

                            {/* Recycler Sub-form */}
                            {(formData.isRecycler || formData.isTotalSolutionProvider) && (
                                <div style={{ ...styles.conditionalBox, marginTop: '20px' }}>
                                    <h4 style={{ color: '#f39c12', margin: '0 0 12px 0', fontSize: '15px' }}>♻️ Recycler Facility Configurations</h4>
                                    <label style={styles.label}>TYPE OF FACILITY *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        {["Mechanical recycling", "Chemical recycling", "Material recovery facility (MRF)", "Refining / metal recovery", "Hazardous waste treatment", "Incineration", "Other"].map(t => (
                                            <label key={t} style={{ fontSize: '13px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" checked={formData.facilityRecyclingType.includes(t)} onChange={(e) => handleCheckboxGroup(e, 'facilityRecyclingType', t)} />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                    <div style={styles.row}>
                                        <div style={styles.rowItem}>
                                            <label style={styles.label}>INSTALLED PROCESSING CAPACITY (PER MONTH) *</label>
                                            <input name="installedProcessingCapacity" value={formData.installedProcessingCapacity} type="text" placeholder="e.g. 50 Tons" style={styles.input} onChange={handleChange} required />
                                        </div>
                                        <div style={styles.rowItem}>
                                            <label style={styles.label}>FACILITY PHYSICAL LOCATION *</label>
                                            <input name="facilityLocation" value={formData.facilityLocation} type="text" placeholder="City / Zone" style={styles.input} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Transporter Sub-form */}
                            {(formData.isTransporter || formData.isTotalSolutionProvider) && (
                                <div style={{ ...styles.conditionalBox, marginTop: '20px' }}>
                                    <h4 style={{ color: '#f39c12', margin: '0 0 12px 0', fontSize: '15px' }}>🚚 Transporter Logistics Fleet Configurations</h4>
                                    <label style={styles.label}>VEHICLE FLEET TYPE *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        {["Lorries", "Containers", "Specialized hazardous waste vehicles", "Mixed fleet"].map(t => (
                                            <label key={t} style={{ fontSize: '13px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" checked={formData.transportVehicleTypes.includes(t)} onChange={(e) => handleCheckboxGroup(e, 'transportVehicleTypes', t)} />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                    <label style={styles.label}>TRANSPORT SCOPE COVERAGE *</label>
                                    <select name="transportCoverageScope" value={formData.transportCoverageScope} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Select Coverage --</option>
                                        <option value="District">District</option>
                                        <option value="Pradeshiya Sabha">Pradeshiya Sabha Level (Multi-select below)</option>
                                        <option value="National">National Level</option>
                                    </select>

                                    {formData.transportCoverageScope === 'Pradeshiya Sabha' && (
                                        <div style={{ marginTop: '15px' }}>
                                            <label style={styles.label}>SELECT AUTHORIZED PRADESHIYA SABHAS (MULTI-SELECT) *</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px' }}>
                                                {pradeshiyaSabhas.map(ps => (
                                                    <label key={ps} style={{ fontSize: '12px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <input type="checkbox" checked={formData.transportPradeshiyaSabhas.includes(ps)} onChange={(e) => handleCheckboxGroup(e, 'transportPradeshiyaSabhas', ps)} />
                                                        {ps}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 6: Waste Categories Handled */}
                    {step === 6 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 6: Waste Categories Handled (Multi-Select Enabled)</h3>
                            
                            <h4 style={styles.streamTitle}>General Waste Streams</h4>
                            <div style={styles.streamGrid}>
                                {["Plastic", "Paper & Cardboard", "Glass", "Chemical and Hazardous waste"].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.generalWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'generalWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <h4 style={styles.streamTitle}>Electrical / Electronic Waste</h4>
                            <div style={styles.streamGrid}>
                                {["E-waste", "CFL Bulbs & Mercury contaminated", "LED Bulbs & Heavy Metal contaminated", "Solar Panels & EV/Hybrid Batteries", "Solar & Renewable products"].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.eeWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'eeWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <h4 style={styles.streamTitle}>Chemical & Hazardous Waste</h4>
                            <div style={styles.streamGrid}>
                                {["Batteries", "Chemical contaminated materials", "Oil contaminated packings", "Agro Chemical Packings"].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.chemicalHazardousWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'chemicalHazardousWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <h4 style={styles.streamTitle}>Oil & Liquid Waste Streams</h4>
                            <div style={styles.streamGrid}>
                                {["Waste Cooking Oil", "Waste Engine Oil"].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.oilLiquidWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'oilLiquidWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <h4 style={styles.streamTitle}>Metal & Industrial Recovery Streams</h4>
                            <div style={styles.streamGrid}>
                                {["Used Copper Grit", "Metal contaminated sludges"].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.metalIndustrialWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'metalIndustrialWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <label style={styles.label}>ADDITIONAL TREATMENT STRATEGY OR NOTES</label>
                                <textarea name="additionalNotes" value={formData.additionalNotes} placeholder="Describe specific treatment or processing systems..." style={{ ...styles.input, height: '80px', resize: 'none' }} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* Step 7: Operational Capacity */}
                    {step === 7 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 7: Operational Capacity Measures</h3>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>ESTIMATED MONTHLY COLLECTION (KG/TONS) *</label>
                                    <input name="estimatedMonthlyCollectionVolume" value={formData.estimatedMonthlyCollectionVolume} type="text" placeholder="e.g. 200 Tons" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>ESTIMATED MONTHLY PROCESSING (IF RECYCLER) *</label>
                                    <input name="estimatedMonthlyProcessingVolume" value={formData.estimatedMonthlyProcessingVolume} type="text" placeholder="e.g. 150 Tons" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>STORAGE CAPACITY AVAILABLE *</label>
                                    <input name="storageCapacityAvailable" value={formData.storageCapacityAvailable} type="text" placeholder="sq.ft / Metric Volumes" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>TOTAL NUMBER OF EMPLOYEES *</label>
                                    <input name="employeeCount" value={formData.employeeCount} type="number" placeholder="Active Staff Count" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 8: Equipment & Infrastructure */}
                    {step === 8 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 8: Equipment & Infrastructure Configurations</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                {["Collection vehicles", "Sorting facility", "Recycling machinery", "Hazardous handling equipment", "Laboratory / testing facility", "Storage warehouse"].map(eq => (
                                    <label key={eq} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', fontSize: '14px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={formData.infrastructureEquipmentTypes.includes(eq)} onChange={(e) => handleCheckboxGroup(e, 'infrastructureEquipmentTypes', eq)} />
                                        {eq}
                                    </label>
                                ))}
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>SPECIFIC EQUIPMENT DETAILS / SERIAL ALLOCATIONS *</label>
                                <textarea name="equipmentDetailsReport" value={formData.equipmentDetailsReport} placeholder="Please add lot of data regarding operational model machinery parameters, throughput levels, and automation assets..." style={{ ...styles.input, height: '140px' }} onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    {/* Step 9: Compliance & Licenses */}
                    {step === 9 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 9: Compliance & Statutory Licenses</h3>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DO YOU HAVE ENVIRONMENTAL PROTECTION LICENSE (EPL)? *</label>
                                    <select name="hasEnvironmentalLicense" value={formData.hasEnvironmentalLicense} style={styles.selectInput} onChange={handleChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DO YOU HAVE SCHEDULED WASTE HANDLING LICENSE? *</label>
                                    <select name="hasWasteHandlingLicense" value={formData.hasWasteHandlingLicense} style={styles.selectInput} onChange={handleChange}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '25px' }}>
                                <label style={styles.label}>UPLOAD EPL CERTIFICATE (PDF/JPG) *</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'envLicense')} accept=".pdf,.jpg,.jpeg,.png" required={formData.hasEnvironmentalLicense === 'Yes' && !fileStrings.envLicense} />
                                {fileStrings.envLicense && <p style={{ color: '#2ecc71', fontSize: '13px' }}>✅ EPL Uploaded</p>}
                            </div>
                            <div style={{ marginTop: '15px' }}>
                                <label style={styles.label}>UPLOAD WASTE HANDLING CERTIFICATE (PDF/JPG) *</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'wasteLicense')} accept=".pdf,.jpg,.jpeg,.png" required={formData.hasWasteHandlingLicense === 'Yes' && !fileStrings.wasteLicense} />
                                {fileStrings.wasteLicense && <p style={{ color: '#2ecc71', fontSize: '13px' }}>✅ Waste Handling License Uploaded</p>}
                            </div>
                            <div style={{ marginTop: '15px' }}>
                                <label style={styles.label}>UPLOAD BOI / LOCAL AUTHORITY REGULATORY APPROVAL (OPTIONAL)</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'boiApproval')} accept=".pdf,.jpg,.jpeg,.png" />
                                {fileStrings.boiApproval && <p style={{ color: '#2ecc71', fontSize: '13px' }}>✅ BOI / Local Authority Approval Uploaded</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 10: PRO / PIBO Network Connectivity */}
                    {step === 10 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 10: PRO / PIBO Network System Integration</h3>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DO YOU CURRENTLY CONTRACT WORK WITH ANY PRO? *</label>
                                    <select name="worksWithPro" value={formData.worksWithPro} style={styles.selectInput} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DO YOU CURRENTLY DIRECTLY RECEIVE WASTE FROM PIBOS? *</label>
                                    <select name="receivesWasteFromPibos" value={formData.receivesWasteFromPibos} style={styles.selectInput} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </div>
                            
                            {formData.worksWithPro === 'Yes' && (
                                <div style={{ marginTop: '20px' }}>
                                    <label style={styles.label}>NAME OF ASSOCIATED PRO *</label>
                                    <input name="linkedProName" value={formData.linkedProName} type="text" placeholder="Specify Registered PRO Corporate Identity" style={styles.input} onChange={handleChange} required />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 11: Digital Declaration */}
                    {step === 11 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 11: Statutory Digital Declaration</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                                <label style={styles.declarationCheck}>
                                    <input type="checkbox" name="wasteDeclarationConfirmed" checked={formData.wasteDeclarationConfirmed} onChange={handleChange} required />
                                    I confirm that all structural and data-driven parameters provided are authentic and non-fabricated.
                                </label>
                                <label style={styles.declarationCheck}>
                                    <input type="checkbox" name="wasteDeclarationPlatformAgreed" checked={formData.wasteDeclarationPlatformAgreed} onChange={handleChange} required />
                                    I agree to strictly comply with the governance rules outlined under the national EPR Digital Platform protocols.
                                </label>
                                <label style={styles.declarationCheck}>
                                    <input type="checkbox" name="wasteDeclarationReportingAgreed" checked={formData.wasteDeclarationReportingAgreed} onChange={handleChange} required />
                                    I pledge to provide audited, verifiable ledger tracking information regarding volumes metrics.
                                </label>
                                <label style={styles.declarationCheck}>
                                    <input type="checkbox" name="wasteDeclarationVerificationAgreed" checked={formData.wasteDeclarationVerificationAgreed} onChange={handleChange} required />
                                    I understand my structural ecosystem parameters will be deployed for national aggregate reporting.
                                </label>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>DIGITAL SIGNATURE / RECOGNIZED AUTHORIZED NAME *</label>
                                    <input name="digitalSignatureName" type="text" placeholder="Type Representative Official Full Name" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>SYSTEM AUTOMATED GENERATION DATE</label>
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
                        {step < 11 ? (
                            <button type="button" onClick={() => setStep(prev => prev + 1)} style={{ ...styles.registerBtn, marginTop: 0 }}>
                                NEXT PHASE →
                            </button>
                        ) : (
                            <button type="submit" style={{ ...styles.registerBtn, background: '#f39c12', boxShadow: '0 10px 30px rgba(243, 156, 18, 0.3)', marginTop: 0 }}>
                                EXECUTE UNIFIED COMPLIANCE DEPLOYMENT
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

// Premium Stylesheet Definition for UI Consistency Match
const styles = {
    container: { minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflowY: 'auto', backgroundColor: '#000', padding: '60px 20px', fontFamily: "'Inter', sans-serif" },
    videoBg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, filter: 'brightness(0.35)' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)', zIndex: 2 },
    glassCard: { position: 'relative', zIndex: 3, width: '100%', maxWidth: '650px', padding: '50px 40px', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(35px)', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', textAlign: 'center' },
    headerArea: { marginBottom: '35px' },
    logoFrame: { width: '90px', height: '90px', background: '#fff', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #f39c12', boxShadow: '0 0 30px rgba(243, 156, 18, 0.4)' },
    logoImg: { width: '80%' },
    title: { fontSize: '24px', fontWeight: '900', letterSpacing: '3px', color: '#fff', margin: '0' },
    subText: { fontSize: '13px', color: '#3498db', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px' },
    sectionHeader: { color: '#f39c12', fontSize: '16px', textAlign: 'left', marginTop: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(243,156,18,0.2)', paddingBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' },
    form: { textAlign: 'left' },
    inputWrapper: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '8px', letterSpacing: '1px', fontWeight: 'bold' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255, 255, 255, 0.04)', color: '#fff', fontSize: '16px', boxSizing: 'border-box', transition: '0.3s', outline: 'none' },
    selectInput: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#121212', color: '#fff', fontSize: '16px', boxSizing: 'border-box', transition: '0.3s', cursor: 'pointer', outline: 'none' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '18px' },
    rowItem: { flex: '1 1 200px' },
    conditionalBox: { background: 'rgba(243,156,18,0.03)', padding: '20px', borderRadius: '15px', border: '1px dashed rgba(243,156,18,0.2)' },
    streamTitle: { color: '#3498db', fontSize: '14px', margin: '15px 0 10px 0', fontWeight: 'bold', letterSpacing: '0.5px' },
    streamGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' },
    checkboxLabel: { fontSize: '13px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    declarationCheck: { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', color: '#ccc', fontSize: '13px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' },
    registerBtn: { width: '100%', padding: '18px', borderRadius: '12px', border: 'none', background: '#f39c12', color: '#fff', fontWeight: '900', fontSize: '16px', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(243, 156, 18, 0.3)', marginTop: '25px', transition: '0.3s' },
    footer: { marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px', textAlign: 'center' },
    backLink: { color: '#888', cursor: 'pointer', fontSize: '14px', marginBottom: '15px', transition: '0.3s' },
    footerText: { color: '#aaa', fontSize: '15px' },
    loginLink: { color: '#f39c12', fontWeight: 'bold', cursor: 'pointer' }
};

export default WasteRegister;