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
        orgRole: 'Producer', // Overwritten dynamically if multiple picked, baseline role format
        officialEmail: '',
        password: '',
        confirmPassword: '',
        phone: '',
        whatsapp: '',

        // Organization Profile (Step 2)
        piboBusinessType: [], // Producer, Importer, Brand Owner, Vendor
        companyName: '',
        contactPersonName: '',
        contactPersonMobile: '',
        dob: '', // Company Established Date
        regNumber: '',
        piboTinVatNumber: '',
        address1: '', // Registered Address
        orgDistrict: '',
        orgProvince: '',
        country: 'Sri Lanka',

        // Product Category Selection (Step 3 Array)
        piboSelectedProductCategories: [],

        // Product Volume Declaration (Step 4 Metrics)
        volumePackagingPlastic: 0,
        volumePackagingPaperCardboard: 0,
        volumePackagingGlass: 0,
        volumePackagingMetal: 0,
        volumeEeeUnits: 0,
        volumeLedCflLightingUnits: 0,
        volumeSolarRenewableUnits: 0,
        volumeBatteriesKg: 0,
        volumeEvHybridBatteries: 0,
        volumeEnergyStorageSystems: 0,
        volumeChemicalsLiters: 0,
        volumeLubricantsOilsLiters: 0,
        volumeFuelIndustrialOilsLiters: 0,
        volumeIndustrialMaterialsKg: 0,
        volumeMachineryEquipmentUnits: 0,

        // Auto-Generated Liability (Step 5 System Profile Array)
        generatedWasteLiabilityCategories: [],

        // Market Activity Profile (Step 6 Queries)
        marketIsImporter: 'No',
        marketIsLocalManufacturer: 'No',
        marketIsOwnBrandDistributor: 'No',
        marketEstimatedAnnualTurnover: '',

        // PRO Engagement (Step 7 mapping)
        piboHasAssignedPro: 'No',
        piboSelectedProId: '', // Dropdown reference

        // Compliance Declarations (Step 8 Checkbox Toggles)
        piboDeclAllVolumesAccurate: false,
        piboDeclAcceptEprResponsibility: false,
        piboDeclAgreePeriodicAudits: false,
        piboDeclConnectWithPro: false,
        digitalSignatureName: '',
        declarationDate: new Date().toLocaleDateString()
    });

    // Step 9 Base64 File Buffers Store
    const [fileStrings, setFileStrings] = useState({ 
        brc: "", importLicense: "", productCatalog: "", brandDoc: "" 
    });

    // Mock PRO Dropdown list for Step 7 (Can be fetched from DB later)
    const proList = [
        { id: "PRO-001", name: "Sri Lanka Clean Ocean PRO" },
        { id: "PRO-002", name: "Unified E-Waste Compliance Consortium" },
        { id: "PRO-003", name: "Green Ceylon Industrial Association" }
    ];

    const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];
    const provinces = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];

    // 🧠 Automatic Waste Liability Mapping Engine (Step 5 Logic Matrix)
    useEffect(() => {
        const mapping = [];
        const cats = formData.piboSelectedProductCategories;

        if (cats.includes("Plastic Packaging Products")) mapping.push("Plastic Waste");
        if (cats.includes("Paper & Cardboard Packaging")) mapping.push("Paper & Cardboard Waste");
        if (cats.includes("Glass Packaging / Products")) mapping.push("Glass Waste");
        if (cats.includes("Metal Packaging Products")) mapping.push("Metal Sludge / Residues");
        if (cats.includes("Electronic & Electrical Products (EEE)")) mapping.push("E-Waste");
        if (cats.includes("Lighting Products (LED / CFL)")) mapping.push("Mercury / LED Hazardous Waste");
        if (cats.includes("Batteries / Energy Storage Products")) mapping.push("Battery Waste (Hazardous)");
        if (cats.includes("Solar / Renewable Energy Equipment") || cats.includes("Automotive / EV Components")) mapping.push("Solar / EV Waste");
        if (cats.includes("Chemical Products")) mapping.push("Chemical Waste");
        if (cats.includes("Lubricants / Oils / Fuel Products")) mapping.push("Oil Contaminated Waste");
        if (cats.includes("Industrial Raw Materials / Machinery")) mapping.push("Industrial Waste");

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

        if (!formData.piboDeclAllVolumesAccurate || !formData.piboDeclAcceptEprResponsibility || !formData.piboDeclAgreePeriodicAudits || !formData.piboDeclConnectWithPro) {
            alert("❌ You must agree to all operational compliance declaration points before database deployment!");
            return;
        }

        const finalPayload = {
            ...formData,
            phone: formData.contactPersonMobile, // Cross references base mapping schema required options
            brcDocument: fileStrings.brc,
            piboImportLicenseFile: fileStrings.importLicense,
            piboProductCatalogFile: fileStrings.productCatalog,
            piboBrandOwnershipFile: fileStrings.brandDoc
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
            setIsLoading(false); // 👈 බැක්එන්ඩ් එකෙන් එරර් එකක් ආවොත් බටන් එක ආයෙත් වැඩ කරන්න මෙන්න මේ පේළිය නූලටම සෙට් කළා බෝසා!
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
                        PROGRESS STEP: {step} OF 9 — {
                            step === 1 ? "ACCOUNT CREATION" :
                            step === 2 ? "ORGANIZATION PROFILE" :
                            step === 3 ? "PRODUCT CATEGORY SELECTION" :
                            step === 4 ? "ANNUAL QUANTITY DECLARATION" :
                            step === 5 ? "AUTOMATED WASTE LIABILITY MAPPING" :
                            step === 6 ? "MARKET ACTIVITY MODEL" :
                            step === 7 ? "PRO ALLOCATIONS" :
                            step === 8 ? "LEGAL COMPLIANCE DECLARATION" : "SUPPORTING ARCHIVE UPLOADS"
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
                                {["Producer", "Importer", "Brand Owner", "Vendor"].map(bType => (
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
                                    "Plastic Packaging Products", "Paper & Cardboard Packaging", "Glass Packaging / Products",
                                    "Metal Packaging Products", "Electronic & Electrical Products (EEE)", "Lighting Products (LED / CFL)",
                                    "Batteries / Energy Storage Products", "Solar / Renewable Energy Equipment", "Automotive / EV Components",
                                    "Chemical Products", "Lubricants / Oils / Fuel Products", "Industrial Raw Materials / Machinery"
                                ].map(pCat => (
                                    <label key={pCat} style={styles.checkboxLabelNode}>
                                        <input type="checkbox" checked={formData.piboSelectedProductCategories.includes(pCat)} onChange={(e) => handleCheckboxGroup(e, 'piboSelectedProductCategories', pCat)} />
                                        {pCat}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Product Volume Declaration */}
                    {step === 4 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 4: Product Volume Declaration (Estimated Annual Metric)</h3>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                                
                                <h4 style={styles.streamTitle}>A. Packaging Materials (kg / year)</h4>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}><label style={styles.label}>Plastic Packaging</label><input name="volumePackagingPlastic" value={formData.volumePackagingPlastic} type="number" style={styles.input} onChange={handleChange} required /></div>
                                    <div style={styles.rowItem}><label style={styles.label}>Paper & Cardboard</label><input name="volumePackagingPaperCardboard" value={formData.volumePackagingPaperCardboard} type="number" style={styles.input} onChange={handleChange} required /></div>
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}><label style={styles.label}>Glass Packaging</label><input name="volumePackagingGlass" value={formData.volumePackagingGlass} type="number" style={styles.input} onChange={handleChange} required /></div>
                                    <div style={styles.rowItem}><label style={styles.label}>Metal Packaging</label><input name="volumePackagingMetal" value={formData.volumePackagingMetal} type="number" style={styles.input} onChange={handleChange} required /></div>
                                </div>

                                <h4 style={styles.streamTitle}>B. Electronics & Electrical Products (units / year)</h4>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}><label style={styles.label}>EEE Units</label><input name="volumeEeeUnits" value={formData.volumeEeeUnits} type="number" style={styles.input} onChange={handleChange} required /></div>
                                    <div style={styles.rowItem}><label style={styles.label}>LED / CFL Units</label><input name="volumeLedCflLightingUnits" value={formData.volumeLedCflLightingUnits} type="number" style={styles.input} onChange={handleChange} required /></div>
                                </div>
                                <div style={styles.inputWrapper}><label style={styles.label}>Solar / Renewable Power Assets</label><input name="volumeSolarRenewableUnits" value={formData.volumeSolarRenewableUnits} type="number" style={styles.input} onChange={handleChange} required /></div>

                                <h4 style={styles.streamTitle}>C. Energy & Battery Products (kg)</h4>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}><label style={styles.label}>Batteries </label><input name="volumeBatteriesKg" value={formData.volumeBatteriesKg} type="number" style={styles.input} onChange={handleChange} required /></div>
                                    <div style={styles.rowItem}><label style={styles.label}>EV / Hybrid Batteries</label><input name="volumeEvHybridBatteries" value={formData.volumeEvHybridBatteries} type="number" style={styles.input} onChange={handleChange} required /></div>
                                </div>
                                <div style={styles.inputWrapper}><label style={styles.label}>Energy Storage Systems (ESS)</label><input name="volumeEnergyStorageSystems" value={formData.volumeEnergyStorageSystems} type="number" style={styles.input} onChange={handleChange} required /></div>

                                <h4 style={styles.streamTitle}>D. Chemical / Oil-Based Products (liters or kg)</h4>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}><label style={styles.label}>Chemicals</label><input name="volumeChemicalsLiters" value={formData.volumeChemicalsLiters} type="number" style={styles.input} onChange={handleChange} required /></div>
                                    <div style={styles.rowItem}><label style={styles.label}>Lubricants / Oils</label><input name="volumeLubricantsOilsLiters" value={formData.volumeLubricantsOilsLiters} type="number" style={styles.input} onChange={handleChange} required /></div>
                                </div>
                                <div style={styles.inputWrapper}><label style={styles.label}>Fuel / Industrial Liquids</label><input name="volumeFuelIndustrialOilsLiters" value={formData.volumeFuelIndustrialOilsLiters} type="number" style={styles.input} onChange={handleChange} required /></div>

                                <h4 style={styles.streamTitle}>E. Industrial Equipment Assets</h4>
                                <div style={styles.row}>
                                    <div style={styles.rowItem}><label style={styles.label}>Industrial Raw Materials (kg)</label><input name="volumeIndustrialMaterialsKg" value={formData.volumeIndustrialMaterialsKg} type="number" style={styles.input} onChange={handleChange} required /></div>
                                    <div style={styles.rowItem}><label style={styles.label}>Heavy Machinery (units)</label><input name="volumeMachineryEquipmentUnits" value={formData.volumeMachineryEquipmentUnits} type="number" style={styles.input} onChange={handleChange} required /></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Automatic Waste Liability Mapping */}
                    {step === 5 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 5: Automatic Waste Liability Mapping (System Generated)</h3>
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

                    {/* Step 6: Market Activity Profile */}
                    {step === 6 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 6: Market Activity Profile</h3>
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
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>ESTIMATED ANNUAL TURNOVER (LKR - OPTIONAL)</label>
                                <input name="marketEstimatedAnnualTurnover" value={formData.marketEstimatedAnnualTurnover} type="text" placeholder="e.g. 50 Million" style={styles.input} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* Step 7: PRO Engagement */}
                    {step === 7 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 7: PRO Operational Engagement</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>DO YOU HAVE AN ASSIGNED PRO COMPLIANCE PARTNER? *</label>
                                <select name="piboHasAssignedPro" value={formData.piboHasAssignedPro} style={styles.selectInput} onChange={handleChange}>
                                    <option value="No">No (Request System Automated Allocation)</option>
                                    <option value="Yes">Yes (Map Existing Framework Reference)</option>
                                </select>
                            </div>
                            {formData.piboHasAssignedPro === 'Yes' && (
                                <div style={{ marginTop: '20px' }}>
                                    <label style={styles.label}>SELECT AUTHORIZED PRO CONSORTIUM *</label>
                                    <select name="piboSelectedProId" value={formData.piboSelectedProId} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Choose Operator --</option>
                                        {proList.map(pro => <option key={pro.id} value={pro.id}>{pro.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 8: Compliance Declaration */}
                    {step === 8 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 8: Statutory Regulatory Declarations</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                                <label style={styles.declarationCheckNode}>
                                    <input type="checkbox" name="piboDeclAllVolumesAccurate" checked={formData.piboDeclAllVolumesAccurate} onChange={handleChange} required />
                                    I confirm that all declared product volumes are estimated accurately.
                                </label>
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
                                    <label style={styles.label}>AUTHORIZED REPRESENTATIVE PERSON NAME *</label>
                                    <input name="digitalSignatureName" value={formData.digitalSignatureName} type="text" placeholder="Legal Full Name" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>SYSTEM LOGICAL STAMP DATE</label>
                                    <input type="text" value={formData.declarationDate} style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed' }} readOnly />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 9: Supporting Documents */}
                    {step === 9 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 9: Supporting Compliance Document Archive Uploads</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>BUSINESS REGISTRATION CERTIFICATE (BRC) *</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'brc')} accept=".pdf,.jpg,.jpeg,.png" required={!fileStrings.brc} />
                                {fileStrings.brc && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ BRC Document Buffered</p>}
                            </div>
                            
                            {formData.marketIsImporter === 'Yes' && (
                                <div style={styles.inputWrapper}>
                                    <label style={styles.label}>IMPORT LICENSE FROM CONTROLLER GENERAL *</label>
                                    <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'importLicense')} accept=".pdf,.jpg,.jpeg,.png" required={!fileStrings.importLicense} />
                                    {fileStrings.importLicense && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ Operational Import License Buffered</p>}
                                </div>
                            )}

                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>PRODUCT MODEL CATALOG REPORT (OPTIONAL)</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'productCatalog')} accept=".pdf,.jpg,.jpeg,.png" />
                                {fileStrings.productCatalog && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ Specification Catalog Bound</p>}
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>BRAND OWNERSHIP TRADEMARK COPIES (OPTIONAL)</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'brandDoc')} accept=".pdf,.jpg,.jpeg,.png" />
                                {fileStrings.brandDoc && <p style={{ color: '#2ecc71', fontSize: '13px', marginTop: '5px' }}>✅ Intellectual Brand Ownership Document Bound</p>}
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
                        {step < 9 ? (
                            <button type="button" onClick={() => setStep(prev => prev + 1)} style={{ ...styles.registerBtn, marginTop: 0 }}>
                                NEXT PHASE →
                            </button>
                        ) : (
                           <button  type="submit"   disabled={isLoading}   style={{ ...styles.registerBtn, background: '#3498db', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, marginTop: 0 }}
                          >
                                    {isLoading ? "TRANSMITTING TO LEDGER PROTOCOL..." : "DEPLOY COMPLIANCE LEDGER PIPELINE"}
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