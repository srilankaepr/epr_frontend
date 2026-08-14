import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 
import API from './api';

const WasteRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        regType: 'Company', 
        orgRole: 'RECYCLER', 
        officialEmail: '',
        password: '',
        confirmPassword: '',
        phone: '',
        whatsapp: '',

        isCollector: false,
        isRecycler: false,
        isTransporter: false,
        isTotalSolutionProvider: false,

        companyName: '',
        companyWebsite: '',
        regNumber: '',
        dob: '',
        address1: '',
        operationalAddress: '',
        orgDistrict: '',
        orgProvince: '',
        country: 'Sri Lanka',

        contactPersonName: '',
        contactDesignation: '',
        contactPersonMobile: '',

        operatorIdNum: '',
        operatorPradeshiyaSabha: '',

        collectionSystemTypes: [], 
        collectionAreaCoverage: '', 
        facilityRecyclingType: [], 
        installedProcessingCapacity: '',
        facilityLocation: '',
        transportVehicleTypes: [], 
        transportCoverageScope: '', 
        transportPradeshiyaSabhas: [], 
        hasWasteHandlingLicense: 'No',

        generalWasteStreams: [],
        eeWasteStreams: [],
        chemicalHazardousWasteStreams: [],
        oilLiquidWasteStreams: [],
        metalIndustrialWasteStreams: [],
        additionalNotes: '',

        estimatedMonthlyCollectionVolume: '',
        estimatedMonthlyProcessingVolume: '',
        storageCapacityAvailable: '',
        employeeCount: '',
        infrastructureEquipmentTypes: [],
        equipmentDetailsReport: '',

        hasEnvironmentalLicense: 'No',
        worksWithPro: 'No',
        linkedProName: '',
        receivesWasteFromPibos: 'No',

        digitalSignatureName: '',
        declarationDate: new Date().toLocaleDateString(),
        wasteDeclarationConfirmed: false,
        wasteDeclarationPlatformAgreed: false,
        wasteDeclarationReportingAgreed: false,
        wasteDeclarationVerificationAgreed: false
    });

    const [fileStrings, setFileStrings] = useState({ 
        brc: "", vat: "", billing: "", nic: "",
        envLicense: "", wasteLicense: "", boiApproval: ""
    });

    const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];
    const provinces = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];
    
    const districtToSabhas = {
        Colombo: ["Colombo MC", "Dehiwala-Mount Lavinia MC", "Sri Jayawardenepura Kotte MC", "Moratuwa MC", "Kaduwela MC", "Maharagama UC", "Boralesgamuwa UC", "Kolonnawa UC", "Seethawakapura UC", "Homagama PS", "Kotikawatta-Mulleriyawa PS", "Hanwella PS"],
        Gampaha: ["Gampaha MC", "Negombo MC", "Wattala-Mabole UC", "Peliyagoda UC", "Minuwangoda UC", "Ja-Ela UC", "Katunayake-Seeduwa UC", "Kelaniya PS", "Mahara PS", "Biyagama PS", "Dompe PS", "Mirigama PS"],
        Kalutara: ["Kalutara UC", "Panadura UC", "Horana UC", "Beruwala UC", "Matugama PS", "Agalawatta PS", "Bandaragama PS", "Ingiriya PS"],
        Kandy: ["Kandy MC", "Gampola UC", "Nawalapitiya UC", "Kadugannawa UC", "Harispattuwa PS", "Kundasale PS", "Ududumbara PS", "Yatinuwara PS"],
        Matale: ["Matale MC", "Dambulla UC", "Galewela PS", "Naula PS", "Rattota PS", "Wilgamuwa PS"],
        "Nuwara Eliya": ["Nuwara Eliya MC", "Hatton-Dickoya UC", "Talawakele-Lindula UC", "Ambagamuwa PS", "Walapane PS", "Hanguranketha PS"],
        Galle: ["Galle MC", "Ambalangoda UC", "Hikkaduwa UC", "Karandeniya PS", "Baddegama PS", "Ahangama PS", "Elpitiya PS", "Bentota PS"],
        Matara: ["Matara MC", "Weligama UC", "Devinuwara PS", "Dikwella PS", "Hakmana PS", "Kamburupitiya PS", "Akuressa PS"],
        Hambantota: ["Hambantota MC", "Tangalle UC", "Ambalantota PS", "Tissamaharama PS", "Beliatta PS", "Angunakolapelessa PS"],
        Jaffna: ["Jaffna MC", "Chavakachcheri UC", "Point Pedro UC", "Valvettithurai UC", "Nallur PS", "Karainagar PS", "Velanai PS", "Kopay PS"],
        Kilinochchi: ["Karachchi PS", "Poonakary PS", "Pachchilaipalli PS"],
        Mannar: ["Mannar UC", "Mannar PS", "Mantai West PS", "Nanaddan PS"],
        Vavuniya: ["Vavuniya UC", "Vavuniya South PS", "Vavuniya North PS", "Vengalacheddikulam PS"],
        Mullaitivu: ["Maritimepattu PS", "Puthukudiyiruppu PS", "Oddusuddan PS", "Tunukkai PS"],
        Batticaloa: ["Batticaloa MC", "Eravur UC", "Kattankudy UC", "Koralai Pattu PS", "Manmunai PS"],
        Ampara: ["Ampara UC", "Kalmunai MC", "Sainthamaruthu PS", "Akkaraipattu PS", "Sammanthurai PS", "Uhana PS"],
        Trincomalee: ["Trincomalee UC", "Kinniya UC", "Muttur UC", "Kuchchaveli PS", "Kantale PS", "Seruwila PS"],
        Kurunegala: ["Kurunegala MC", "Kuliyapitiya UC", "Narammala PS", "Wariyapola PS", "Bingiriya PS", "Ibbagamuwa PS", "Mawathagama PS"],
        Puttalam: ["Puttalam UC", "Chilaw UC", "Kalpitiya PS", "Anamaduwa PS", "Wennappuwa PS", "Marawila PS", "Nattandiya PS"],
        Anuradhapura: ["Anuradhapura MC", "Medawachchiya PS", "Kebithigollewa PS", "Padaviya PS", "Eppawala PS", "Galenbindunuwewa PS", "Thambuttegama PS"],
        Polonnaruwa: ["Polonnaruwa UC", "Hingurakgoda PS", "Medirigiriya PS", "Welikanda PS", "Dimbulagala PS"],
        Badulla: ["Badulla MC", "Bandarawela MC", "Hali-Ela PS", "Ella PS", "Mahiyanganaya PS", "Welimada PS", "Passara PS", "Diyatalawa PS"],
        Moneragala: ["Moneragala PS", "Wellawaya PS", "Buttala PS", "Kataragama PS", "Bibile PS", "Siyambalanduwa PS"],
        Ratnapura: ["Ratnapura MC", "Balangoda UC", "Pelmadulla PS", "Kuruwita PS", "Eheliyagoda PS", "Embilipitiya PS", "Godakawela PS"],
        Kegalle: ["Kegalle UC", "Mawanella PS", "Warakapola PS", "Ruwanwella PS", "Dehiowita PS", "Galigamuwa PS", "Yatiyantota PS"]
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEntityRoleChange = (selectedRoleField) => {
        setFormData(prev => ({
            ...prev,
            isCollector: selectedRoleField === 'isCollector',
            isRecycler: selectedRoleField === 'isRecycler',
            isTransporter: selectedRoleField === 'isTransporter',
            isTotalSolutionProvider: selectedRoleField === 'isTotalSolutionProvider'
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

    const handleNextStep = () => {
        if (step === 3) {
            if (formData.regType === 'Company') {
                if (!fileStrings.brc) {
                    alert("❌ Business Registration Certificate (BRC) is required for Company registration!");
                    return;
                }
                if (!fileStrings.billing) {
                    alert("❌ Utility Billing Proof is required for Company address verification!");
                    return;
                }
            }
            if (formData.regType === 'Individual' && !fileStrings.nic) {
                alert("❌ National ID (NIC) or Passport scan is required for Individual registration!");
                return;
            }
        }

        if (step === 9) {
            if (formData.hasEnvironmentalLicense === 'Yes' && !fileStrings.envLicense) {
                alert("❌ Since you selected 'Yes', uploading the EPL Certificate is mandatory!");
                return;
            }
            if (formData.hasWasteHandlingLicense === 'Yes' && !fileStrings.wasteLicense) {
                alert("❌ Since you selected 'Yes', uploading the Scheduled Waste Handling Certificate is mandatory!");
                return;
            }
        }

        setStep(prev => prev + 1);
    };

    const validatePhone = (number) => {
        return /^[0-9]{10}$/.test(number);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const needsPassword = formData.isRecycler || formData.isTotalSolutionProvider;
        if (needsPassword && formData.password !== formData.confirmPassword) {
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

        setIsLoading(true);

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
            
            brcDocument: formData.regType === 'Company' ? fileStrings.brc : "",
            vatDocument: formData.regType === 'Company' ? fileStrings.vat : "",
            billingDocument: formData.regType === 'Company' ? fileStrings.billing : "",
            nic: formData.regType === 'Individual' ? fileStrings.nic : "",

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
        } finally {
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
                    <h2 style={styles.title}>WASTE MANAGEMENT</h2>
                    <p style={styles.subText}>Collector / Recycler / Transporter Registration Form</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={{ color: '#f39c12', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '25px', background: 'rgba(243,156,18,0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(243,156,18,0.2)' }}>
                        PROGRESS STEP: {step} OF 11 — {
                            step === 1 ? "ENTITY TYPE SELECTION" :
                            step === 2 ? "ACCOUNT CREATION" :
                            step === 3 ? "ORGANIZATION DETAILS" :
                            step === 4 ? "CONTACT PERSON DETAILS" :
                            step === 5 ? "OPERATIONAL ROLE SPECS & OPERATOR DETAILS" :
                            step === 6 ? "WASTE CATEGORIES HANDLED" :
                            step === 7 ? "OPERATIONAL CAPACITY" :
                            step === 8 ? "EQUIPMENT & INFRASTRUCTURE" :
                            step === 9 ? "COMPLIANCE & LICENSES" :
                            step === 10 ? "PRO / PIBO NETWORK CONNECTIVITY" : "DIGITAL DECLARATION"
                        }
                    </div>

                    {/* Step 1: Entity Type Selection */}
                    {step === 1 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 1: Entity Type Selection (Select Only One) / ආයතනික පැතිකඩ (ව්‍යාපාර වර්ගය)</h3>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                                {['Company', 'Individual'].map((t) => (
                                    <button key={t} type="button" onClick={() => setFormData({ ...formData, regType: t })} style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', background: formData.regType === t ? 'rgba(243,156,18,0.15)' : 'rgba(255,255,255,0.03)', border: formData.regType === t ? '2px solid #f39c12' : '1px solid rgba(255,255,255,0.1)', color: formData.regType === t ? '#f39c12' : '#aaa', transition: '0.3s' }}>
                                        {t === 'Company' ? '🏢 Company Registration' : '👤 Individual Registration'}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                                {[
                                    { field: 'isCollector', label: '🚛 Collector / එකතු කරන්නා', id: 'role_collector' },
                                    { field: 'isRecycler', label: '♻️ Recycler / ප්‍රතිචක්‍රීය කරන්නා', id: 'role_recycler' },
                                    { field: 'isTransporter', label: '🚚 Transporter / ප්‍රවාහනය කරන්නා', id: 'role_transporter' },
                                    { field: 'isTotalSolutionProvider', label: '🌐 All (Recycler, Collector, Transporter) / සියල්ල (ප්‍රතිචක්‍රීය කරන්නා, එකතු කරන්නා, ප්‍රවාහනය කරන්නා)', id: 'role_total' }
                                ].map((item) => (
                                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', color: formData[item.field] ? '#f39c12' : '#ccc', fontSize: '16px', background: formData[item.field] ? 'rgba(243,156,18,0.04)' : 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: formData[item.field] ? '1px solid #f39c12' : '1px solid rgba(255,255,255,0.05)', transition: '0.2s' }}>
                                        <input type="radio" name="entity_type_selection" checked={formData[item.field]} onChange={() => handleEntityRoleChange(item.field)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#f39c12' }} />
                                        {item.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Account Creation */}
                    {step === 2 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 2: Account Creation</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>1. Email Address (Login ID) / විද්‍යුත් තැපැල් ලිපිනය (පිවිසුම් හැඳුනුම්පත) *</label>
                                <input name="officialEmail" value={formData.officialEmail} type="email" placeholder="partner-login@domain.com" style={styles.input} onChange={handleChange} required />
                            </div>
                            
                            {(formData.isRecycler || formData.isTotalSolutionProvider) && (
                                <div style={styles.row}>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>2. Password / මුරපදය *</label>
                                        <input name="password" value={formData.password} type="password" placeholder="••••••••" style={styles.input} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.rowItem}>
                                        <label style={styles.label}>3. Confirm Password / මුරපදය තහවුරු කරන්න *</label>
                                        <input name="confirmPassword" value={formData.confirmPassword} type="password" placeholder="••••••••" style={styles.input} onChange={handleChange} required />
                                    </div>
                                </div>
                            )}

                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>14. Mobile Number / ජංගම දුරකථන අංකය *</label>
                                <input name="phone" value={formData.phone} maxLength="10" placeholder="07XXXXXXXX" type="text" style={styles.input} onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Organization Details */}
                    {step === 3 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 3: Organization Details</h3>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>5. Legal Name of Business / ව්‍යාපාරයේ නීත්‍යානුකූල නාමය *</label>
                                <input name="companyName" value={formData.companyName} type="text" placeholder="Entity Legal Name" style={styles.input} onChange={handleChange} required />
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>6. Company Website (Optional) / සමාගමේ වෙබ් අඩවිය</label>
                                <input name="companyWebsite" value={formData.companyWebsite} type="text" placeholder="https://example.com" style={styles.input} onChange={handleChange} />
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>
                                        {formData.regType === 'Company' ? '7. Business Registration Number / ව්‍යාපාරයේ ලියාපදිංචි අංකය *' : '7. Business Registration or National ID Number / ව්‍යාපාරයේ ලියාපදිංචි අංකය *'}  
                                    </label>
                                    <input name="regNumber" value={formData.regNumber} type="text" placeholder={formData.regType === 'Company' ? "PV-XXXXXX" : "19XXXXXXXXXX"} style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>
                                        {formData.regType === 'Company' ? '8. Company Established Date / සමාගම ආරම්භ කළ දිනය *' : '8. Date of Birth (Optional)'}
                                    </label>
                                    <input name="dob" value={formData.dob} type="date" style={styles.input} onChange={handleChange} required={formData.regType === 'Company'} />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>11. Province / පළාත *</label>
                                    <select name="orgProvince" value={formData.orgProvince} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Select Province --</option>
                                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>11. District / දිස්ත්‍රික්කය *</label>
                                    <select name="orgDistrict" value={formData.orgDistrict} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Select District --</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>9. Registered Address / ලියාපදිංචි ලිපිනය *</label>
                                <input name="address1" value={formData.address1} type="text" placeholder="Headquarters Physical Address" style={styles.input} onChange={handleChange} required />
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>10. Operational Address (if different) / ක්‍රියාත්මක වන ස්ථානයේ ලිපිනය (වෙනස් නම් පමණක්)</label>
                                <input name="operationalAddress" value={formData.operationalAddress} type="text" placeholder="Warehouse / Processing Center Location" style={styles.input} onChange={handleChange} />
                            </div>

                            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                {formData.regType === 'Company' ? (
                                    <>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={styles.label}>29. Business Registration Certificate (file upload PDF/JPG) / ව්‍යාපාර ලියාපදිංචි සහතිකය *</label>
                                            <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'brc')} accept=".pdf,.jpg,.jpeg,.png" />
                                            {fileStrings.brc && <p style={{ color: '#2ecc71', fontSize: '13px', margin: '5px 0 0 0', fontWeight: 'bold' }}>✅ BRC Document Loaded Securely</p>}
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={styles.label}>30. Tax Registration Certificate (Include TIN) (file upload PDF/JPG) / බදු ලියාපදිංචි සහතිකය (TIN අංකය ඇතුළත්ව)</label>
                                            <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'vat')} accept=".pdf,.jpg,.jpeg,.png" />
                                            {fileStrings.vat && <p style={{ color: '#2ecc71', fontSize: '13px', margin: '5px 0 0 0', fontWeight: 'bold' }}>✅ Tax Certificate Loaded Securely</p>}
                                        </div>
                                        <div>
                                            <label style={styles.label}>Utility Billing Proof (Address Verification) *</label>
                                            <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'billing')} accept=".pdf,.jpg,.jpeg,.png" />
                                            {fileStrings.billing && <p style={{ color: '#2ecc71', fontSize: '13px', margin: '5px 0 0 0', fontWeight: 'bold' }}>✅ Utility Bill Loaded Securely</p>}
                                        </div>
                                    </>
                                ) : (  
                                    <div>
                                        <label style={styles.label}>NIC / Passport Scan (Both Sides) *</label>
                                        <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'nic')} accept=".pdf,.jpg,.jpeg,.png" />
                                        {fileStrings.nic && <p style={{ color: '#2ecc71', fontSize: '13px', margin: '5px 0 0 0', fontWeight: 'bold' }}>✅ NIC/Passport Document Loaded Securely</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
    
                    {/* Step 4: Contact Person Details */}         
                    {step === 4 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 4: Contact Person Details</h3>  
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>12. Contact Person Full Name / සම්බන්ධ කරගත හැකි පුද්ගලයාගේ සම්පූර්ණ නම *</label>
                                    <input name="contactPersonName" value={formData.contactPersonName} type="text" placeholder="Focal Point Representative" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>13. Contact Person Designation / සම්බන්ධ කරගත හැකි පුද්ගලයාගේ තනතුර *</label>
                                    <input name="contactDesignation" value={formData.contactDesignation} type="text" placeholder="e.g. Operations Manager" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>   
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>14. Mobile Number / ජංගම දුරකථන අංකය *</label>
                                    <input name="contactPersonMobile" value={formData.contactPersonMobile} maxLength="10" placeholder="07XXXXXXXX" type="text" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>15. WhatsApp Number (optional) / WhatsApp අංකය</label>
                                    <input name="whatsapp" value={formData.whatsapp} maxLength="10" placeholder="07XXXXXXXX" type="text" style={styles.input} onChange={handleChange} />
                                </div>
                            </div>
                            <div style={styles.inputWrapper}>
                                <label style={styles.label}>16. Email Address / විද්‍යුත් තැපැල් ලිපිනය</label>
                                <input name="officialEmail" value={formData.officialEmail} type="email" placeholder="email@domain.com" style={styles.input} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* Step 5: Operational Role Details & Operator Details */}
                    {step === 5 && (
                        <div>
                            <h3 style={styles.sectionHeader}>Step 5: Operational Role Specs & Operator Details</h3>
                            
                            {/* Collector Sub-form */}
                            {(formData.isCollector || formData.isTotalSolutionProvider) && (
                                <div style={styles.conditionalBox}>
                                    <h4 style={{ color: '#f39c12', margin: '0 0 12px 0', fontSize: '15px' }}>📦 17. OPERATIONAL ROLE DETAILS (If Collector)</h4>
                                    <label style={styles.label}>I. Type of Collection System / එකතු කිරීමේ පද්ධති වර්ගය *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        {[
                                            "Door-to-door / ගෙයින් ගෙට එකතු කිරීම", 
                                            "Industrial collection / කර්මාන්තශාලා මගින් එකතු කිරීම", 
                                            "Scrap yard / aggregation center / අබලි ද්‍රව්‍ය අංගනය / ඒකරාශී කිරීමේ මධ්‍යස්ථානය", 
                                            "Municipal contractor / පළාත් පාලන කොන්ත්‍රාත්කරු", 
                                            "Informal network / අනියම් ජාලය"
                                        ].map(t => (
                                            <label key={t} style={{ fontSize: '13px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" checked={formData.collectionSystemTypes.includes(t)} onChange={(e) => handleCheckboxGroup(e, 'collectionSystemTypes', t)} />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                    <label style={styles.label}>II. Collection Area Coverage (If Collector) / එකතු කිරීමේ ප්‍රදේශ සීමාව (District - දිස්ත්‍රික්කය) *</label>
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
                                    <h4 style={{ color: '#f39c12', margin: '0 0 12px 0', fontSize: '15px' }}>♻️ 18. OPERATIONAL ROLE DETAILS (If Recycler) මෙහෙයුම් භූමිකාවේ තොරතුරු (ප්‍රතිචක්‍රීකරණය කරන්නෙකු නම්)</h4>
                                    <label style={styles.label}>I. Type of Collection System / පහසුකම් වර්ගය *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        {[
                                            "Mechanical recycling / යාන්ත්‍රික ප්‍රතිචක්‍රීකරණය", 
                                            "Chemical recycling / රසායනික ප්‍රතිචක්‍රීකරණය", 
                                            "Refining / metal recovery / පිරිපහදු කිරීම / ලෝහ නැවත ලබා ගැනීම", 
                                            "Material recovery facility (MRF) / ද්‍රව්‍ය නැවත ලබා ගැනීමේ පහසුකම් මධ්‍යස්ථානය", 
                                            "Hazardous waste treatment / හානිකර අපද්‍රව්‍ය පිරිසැකසුම් කිරීම", 
                                            "Incineration / දහනය කිරීම"
                                        ].map(t => (
                                            <label key={t} style={{ fontSize: '13px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" checked={formData.facilityRecyclingType.includes(t)} onChange={(e) => handleCheckboxGroup(e, 'facilityRecyclingType', t)} />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                    <div style={styles.row}>
                                        <div style={styles.rowItem}>
                                            <label style={styles.label}>Installed Processing Capacity (Per Month) *</label>
                                            <input name="installedProcessingCapacity" value={formData.installedProcessingCapacity} type="text" placeholder="e.g. 50 Tons" style={styles.input} onChange={handleChange} required />
                                        </div>
                                        <div style={styles.rowItem}>
                                            <label style={styles.label}>Facility Physical Location *</label>
                                            <input name="facilityLocation" value={formData.facilityLocation} type="text" placeholder="City / Zone" style={styles.input} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Transporter Sub-form */}
                            {(formData.isTransporter || formData.isTotalSolutionProvider) && (
                                <div style={{ ...styles.conditionalBox, marginTop: '20px' }}>
                                    <h4 style={{ color: '#f39c12', margin: '0 0 12px 0', fontSize: '15px' }}>🚚 19. OPERATIONAL ROLE DETAILS (If Transporter) / මෙහෙයුම් භූමිකාවේ තොරතුරු (ප්‍රවාහකයෙකු නම්)</h4>
                                    <label style={styles.label}>I. Vehicle Type / වාහන වර්ගය *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        {[
                                            "Lorries / ලොරි රථ", 
                                            "Containers / කන්ටේනර්", 
                                            "Specialized hazardous waste vehicles / විශේෂිත හානිකර අපද්‍රව්‍ය ප්‍රවාහන වාහන", 
                                            "Mixed fleet / මිශ්‍ර වාහන සමූහය"
                                        ].map(t => (
                                            <label key={t} style={{ fontSize: '13px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" checked={formData.transportVehicleTypes.includes(t)} onChange={(e) => handleCheckboxGroup(e, 'transportVehicleTypes', t)} />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                    <label style={styles.label}>II. Transport Coverage (If Transporter) / ප්‍රවාහන බලප්‍රදේශ සීමාව *</label>
                                    <select name="transportCoverageScope" value={formData.transportCoverageScope} style={styles.selectInput} onChange={handleChange} required>
                                        <option value="">-- Select Coverage --</option>
                                        <option value="District">District / දිස්ත්‍රික්ක මට්ටමින්</option>
                                        <option value="Pradeshiya Sabha">Pradeshiya Sabha / ප්‍රාදේශීය මට්ටමින්</option>
                                        <option value="National">National / ජාතික මට්ටමින්</option>
                                    </select>

                                    {formData.transportCoverageScope === 'Pradeshiya Sabha' && (
                                        <div style={{ marginTop: '15px' }}>
                                            <label style={styles.label}>Type or Select Authorized Pradeshiya Sabha *</label>
                                            <input list="transporter_sabhas" name="transportPradeshiyaSabhas" value={typeof formData.transportPradeshiyaSabhas === 'string' ? formData.transportPradeshiyaSabhas : ''} placeholder="Type Pradeshiya Sabha name (Searchable & Writable)" style={styles.input} onChange={handleChange} required />
                                            <datalist id="transporter_sabhas">
                                                {(districtToSabhas[formData.orgDistrict] || Object.values(districtToSabhas).flat()).map((ps, idx) => (
                                                    <option key={idx} value={ps} />
                                                ))}
                                            </datalist>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Operator Details Box */}
                            {(formData.isCollector || formData.isTransporter || formData.isTotalSolutionProvider) && (
                                <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(52, 152, 219, 0.08)', borderRadius: '15px', border: '1px solid rgba(52, 152, 219, 0.3)' }}>
                                    <h4 style={{ color: '#3498db', margin: '0 0 15px 0', fontSize: '15px' }}>👤 Operator / Field Agent Details</h4>
                                    <div style={styles.row}>
                                        <div style={styles.rowItem}>
                                            <label style={styles.label}>OPERATOR ID NUMBER (NIC) *</label>
                                            <input name="operatorIdNum" value={formData.operatorIdNum} type="text" placeholder="NIC Number" style={styles.input} onChange={handleChange} required />
                                        </div>
                                        <div style={styles.rowItem}>
                                            <label style={styles.label}>OPERATIONAL PRADESHIYA SABHA *</label>
                                            <input list="operator_sabhas" name="operatorPradeshiyaSabha" value={formData.operatorPradeshiyaSabha} placeholder="Type or Select Sabha" style={styles.input} onChange={handleChange} required />
                                            <datalist id="operator_sabhas">
                                                {(districtToSabhas[formData.orgDistrict] || Object.values(districtToSabhas).flat()).map((ps, idx) => (
                                                    <option key={idx} value={ps} />
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 6: Waste Categories Handled */}
                    {step === 6 && (
                        <div>
                            <h3 style={styles.sectionHeader}>20. WASTE CATEGORIES HANDLED / හසුරුවනු ලබන අපද්‍රව්‍ය වර්ග</h3>
                            
                            <h4 style={styles.streamTitle}>I. General Waste Streams / සාමාන්‍ය අපද්‍රව්‍ය</h4>
                            <div style={styles.streamGrid}>
                                {[
                                    "Plastic / ප්ලාස්ටික්", 
                                    "Paper & Cardboard / කඩදාසි සහ කාඩ්බෝඩ්", 
                                    "Glass / වීදුරු", 
                                    "Chemical and Hazardous waste / රසායනික සහ හානිකර අපද්‍රව්‍යය"
                                ].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.generalWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'generalWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <h4 style={styles.streamTitle}>II. Electrical / Electronic Waste / විදුලි සහ ඉලෙක්ට්‍රොනික අපද්‍රව්‍යය</h4>
                            <div style={styles.streamGrid}>
                                {[
                                    "E-waste / ඉලෙක්ට්‍රොනික අපද්‍රව්‍යය", 
                                    "CFL Bulbs & Mercury contaminated / CFL බල්බ සහ රසදිය දූෂිත ද්‍රව්‍යය", 
                                    "LED Bulbs & Heavy Metal contaminated / LED බල්බ සහ අධික ලෝහ දූෂිත ද්‍රව්‍යය", 
                                    "Solar Panels & EV/Hybrid Batteries / සූර්ය පැනල සහ EV/හයිබ්‍රිඩ් බැටරි", 
                                    "Solar & Renewable products / සූර්ය හා පුනර්ජනනීය නිෂ්පාදන"
                                ].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.eeWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'eeWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <h4 style={styles.streamTitle}>III. Chemical & Hazardous Waste / රසායනික සහ හානිකර අපද්‍රව්‍ය</h4>
                            <div style={styles.streamGrid}>
                                {[
                                    "Batteries / බැටරි", 
                                    "Chemical contaminated materials / රසායනික ද්‍රව්‍යය මිශ්‍ර වූ ද්‍රව්‍යය", 
                                    "Oil contaminated packings / තෙල් සහිත ඇසුරුම්", 
                                    "Metal contaminated sludges / ලෝහ මිශ්‍ර වූ මඩ (Sludges)",
                                    "Agro Chemical Packings / කෘෂිකාර්මික රසායනික ඇසුරුම්"
                                ].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.chemicalHazardousWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'chemicalHazardousWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <h4 style={styles.streamTitle}>IV. Oil & Liquid Waste Streams / තෙල් සහ දියර අපද්‍රව්‍යය</h4>
                            <div style={styles.streamGrid}>
                                {[
                                    "Waste Cooking Oil / භාවිත කළ පිසින තෙල්", 
                                    "Waste Engine Oil / භාවිත කළ එන්ජින් තෙල්"
                                ].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.oilLiquidWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'oilLiquidWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <h4 style={styles.streamTitle}>V. Metal & Industrial Recovery Streams / ලෝහ සහ කර්මාන්තශාලා ප්‍රතිසාධන අපද්‍රව්‍යය</h4>
                            <div style={styles.streamGrid}>
                                {[
                                    "Used Copper Grit / භාවිත කළ තඹ කුඩු", 
                                    "Metal contaminated sludges / ලෝහ මිශ්‍ර වූ මඩ (Sludges)"
                                ].map(w => (
                                    <label key={w} style={styles.checkboxLabel}><input type="checkbox" checked={formData.metalIndustrialWasteStreams.includes(w)} onChange={(e) => handleCheckboxGroup(e, 'metalIndustrialWasteStreams', w)} /> {w}</label>
                                ))}
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <label style={styles.label}>21. Describe specific materials handled / මෙහෙයුම් විස්තර සහ ධාරිතාව (හසුරුවනු ලබන නිශ්චිත ද්‍රව්‍යය පිළිබඳ විස්තර කරන්න)</label>
                                <textarea name="additionalNotes" value={formData.additionalNotes} placeholder="Describe specific treatment or processing systems..." style={{ ...styles.input, height: '80px', resize: 'none' }} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {/* Step 7: Operational Capacity */}
                    {step === 7 && (
                        <div>
                            <h3 style={styles.sectionHeader}>22. OPERATIONAL CAPACITY / මෙහෙයුම් ධාරිතාව</h3>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>I. Estimated Monthly Collection Volume (kg/tons) / හසුරුවනු ලබන නිශ්චිත ද්‍රව්‍යය පිළිබඳ විස්තර (කිලෝග්‍රෑම් / ටොන්) *</label>
                                    <input name="estimatedMonthlyCollectionVolume" value={formData.estimatedMonthlyCollectionVolume} type="text" placeholder="e.g. 200 Tons" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>II. Estimated Monthly Processing Volume (if recycler) / ඇස්තමේන්තුගත මාසික පිරිසැකසුම් ප්‍රමාණය (ප්‍රතිචක්‍රීයකරණය කරන්නෙකු නම්) *</label>
                                    <input name="estimatedMonthlyProcessingVolume" value={formData.estimatedMonthlyProcessingVolume} type="text" placeholder="e.g. 150 Tons" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>III. Storage Capacity Available / පවතින ගබඩා ධාරිතාව *</label>
                                    <input name="storageCapacityAvailable" value={formData.storageCapacityAvailable} type="text" placeholder="sq.ft / Metric Volumes" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>IV. Number of Employees / සේවකයින් සංඛ්‍යාව *</label>
                                    <input name="employeeCount" value={formData.employeeCount} type="number" placeholder="Active Staff Count" style={styles.input} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 8: Equipment & Infrastructure */}
                    {step === 8 && (
                        <div>
                            <h3 style={styles.sectionHeader}>23. EQUIPMENT & INFRASTRUCTURE / යටිතල පහසුකම් සහ අනුකූලතාවය</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                {[
                                    "Collection vehicles / එකතු කිරීමේ වාහන", 
                                    "Sorting facility / වෙන් කිරීමේ පහසුකම්", 
                                    "Recycling machinery / ප්‍රතිචක්‍රීයකරණය යන්ත්‍ර සූත්‍ර", 
                                    "Hazardous handling equipment / හානිකර ද්‍රව්‍යය හැසිරවීමේ උපකරණ", 
                                    "Laboratory / testing facility / පරීක්ෂණාගාර / පරීක්ෂණ පහසුකම්", 
                                    "Storage warehouse / ගබඩා ගබඩාව"
                                ].map(eq => (
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
                            <h3 style={styles.sectionHeader}>24. COMPLIANCE & LICENSES / අනුකූලතාවය සහ බලපත්‍ර</h3>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>Environmental License (If Yes / No) / පාරිසරික බලපත්‍රය *</label>
                                    <select name="hasEnvironmentalLicense" value={formData.hasEnvironmentalLicense} style={styles.selectInput} onChange={handleChange}>
                                        <option value="Yes">Yes / ඔව්</option>
                                        <option value="No">No / නැත</option>
                                    </select>
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>Waste Handling License (If Yes / No) / අපද්‍රව්‍යය හැසිරවීමේ බලපත්‍රය *</label>
                                    <select name="hasWasteHandlingLicense" value={formData.hasWasteHandlingLicense} style={styles.selectInput} onChange={handleChange}>
                                        <option value="Yes">Yes / ඔව්</option>
                                        <option value="No">No / නැත</option>
                                    </select>
                                </div>
                            </div>

                            {formData.hasEnvironmentalLicense === 'Yes' && (
                                <div style={{ marginTop: '25px' }}>
                                    <label style={styles.label}>31. Environmental License (file upload PDF/JPG) / පාරිසරික බලපත්‍රය *</label>
                                    <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'envLicense')} accept=".pdf,.jpg,.jpeg,.png" />
                                    {fileStrings.envLicense && <p style={{ color: '#2ecc71', fontSize: '13px', margin: '5px 0 0 0', fontWeight: 'bold' }}>✅ Environmental License Loaded Securely</p>}
                                </div>
                            )}

                            {formData.hasWasteHandlingLicense === 'Yes' && (
                                <div style={{ marginTop: '15px' }}>
                                    <label style={styles.label}>32. Waste Handling License (file upload PDF/JPG) / අපද්‍රව්‍යය හැසිරවීමේ බලපත්‍රය *</label>
                                    <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'wasteLicense')} accept=".pdf,.jpg,.jpeg,.png" />
                                    {fileStrings.wasteLicense && <p style={{ color: '#2ecc71', fontSize: '13px', margin: '5px 0 0 0', fontWeight: 'bold' }}>✅ Waste Handling License Loaded Securely</p>}
                                </div>
                            )}

                            <div style={{ marginTop: '15px' }}>
                                <label style={styles.label}>33. BOI / Local Authority Approval (file upload PDF/JPG) / BOI / පළාත් පාලන ආයතන අනුමැතිය</label>
                                <input type="file" style={styles.input} onChange={(e) => handleFileBase64(e, 'boiApproval')} accept=".pdf,.jpg,.jpeg,.png" />
                                {fileStrings.boiApproval && <p style={{ color: '#2ecc71', fontSize: '13px' }}>✅ BOI / Local Authority Approval Uploaded</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 10: PRO / PIBO Network Connectivity */}
                    {step === 10 && (
                        <div>
                            <h3 style={styles.sectionHeader}>PRO / PIBO Network Connectivity</h3>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>25. Do you currently work with any PRO / ඔබ දැනට යම් PRO ආයතනයක් සමග වැඩ කරන්නේද? *</label>
                                    <select name="worksWithPro" value={formData.worksWithPro} style={styles.selectInput} onChange={handleChange}>
                                        <option value="No">No / නැත</option>
                                        <option value="Yes">Yes / ඔව්</option>
                                    </select>
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>27. Do you currently receive waste from PIBOs? / ඔබ දැනට PIBOs ආයතන වලින් අපද්‍රව්‍යය ලබා ගන්නේද? *</label>
                                    <select name="receivesWasteFromPibos" value={formData.receivesWasteFromPibos} style={styles.selectInput} onChange={handleChange}>
                                        <option value="No">No / නැත</option>
                                        <option value="Yes">Yes / ඹව්</option>
                                    </select>
                                </div>
                            </div>
                            
                            {formData.worksWithPro === 'Yes' && (
                                <div style={{ marginTop: '20px' }}>
                                    <label style={styles.label}>26. If Yes, Name of PRO / ඔව් නම්, එම PRO ආයතනයේ නම *</label>
                                    <input name="linkedProName" value={formData.linkedProName} type="text" placeholder="Specify Registered PRO Corporate Identity" style={styles.input} onChange={handleChange} required />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 11: Digital Declaration */}
                    {step === 11 && (
                        <div>
                            <h3 style={styles.sectionHeader}>28. Declaration & Consent / ප්‍රකාශන සහ එකඟතාවය</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                                <label style={styles.declarationCheck}>
                                    <input type="checkbox" name="wasteDeclarationConfirmed" checked={formData.wasteDeclarationConfirmed} onChange={handleChange} required />
                                    I confirm that all information provided is accurate / සපයා ඇති සියලුම තොරතුරු නිවැරදි බව මම තහවුරු කරමි
                                </label>
                                <label style={styles.declarationCheck}>
                                    <input type="checkbox" name="wasteDeclarationPlatformAgreed" checked={formData.wasteDeclarationPlatformAgreed} onChange={handleChange} required />
                                    I agree to comply with EPR Digital Platform regulations / සපයා ඇති සියලුම තොරතුරු නිවැරදි බව මම තහවුරු කරමි
                                </label>
                                <label style={styles.declarationCheck}>
                                    <input type="checkbox" name="wasteDeclarationReportingAgreed" checked={formData.wasteDeclarationReportingAgreed} onChange={handleChange} required />
                                    I agree to provide verified data on collection / recycling / transport / එකතු කිරීම / ප්‍රතිචක්‍රීයකරණය / ප්‍රවාහනය පිළිබඳ තහවුරු කළ දත්ත ලබා දීමට මම එකඟ වෙමි
                                </label>
                                <label style={styles.declarationCheck}>
                                    <input type="checkbox" name="wasteDeclarationVerificationAgreed" checked={formData.wasteDeclarationVerificationAgreed} onChange={handleChange} required />
                                    I understand my data will be used for national EPR reporting / මගේ දත්ත ජාතික EPR වාර්තාකරණය සඳහා භාවිතා කරන බව මම වටහා ගනිමි
                                </label>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>34. Authorized Person Name / බලපත්‍රලත් පුද්ගලයාගේ නම *</label>
                                    <input name="digitalSignatureName" type="text" placeholder="Type Representative Official Full Name" style={styles.input} onChange={handleChange} required />
                                </div>
                                <div style={styles.rowItem}>
                                    <label style={styles.label}>35. Submit Date / භාරදෙන දිනය</label>
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
                            <button type="button" onClick={handleNextStep} style={{ ...styles.registerBtn, marginTop: 0 }}>
                          NEXT PHASE →
                           </button>
                        ) : (
                           <button 
                             type="submit"   disabled={isLoading}  style={{ ...styles.registerBtn, background: '#f39c12', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, marginTop: 0 }}
                                        >
                                  {isLoading ? "INITIALIZING SECURE UPLOADS..." : "INITIALIZE SECURE SYSTEM UPLOADS"}
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