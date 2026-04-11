import React, { useState } from 'react';
import API from './api';

const ProductRegistration = () => {
    // 1. State එකට data සම්බන්ධ කිරීම
    const [productData, setProductData] = useState({
        productType: '',
        brandName: '',
        productModel: '',
        originCountry: '',
        annualQuantityWeight: '',
        annualQuantityUnits: '',
        packagingCategory: '',
        packagingMaterial: '',
        unitWeight: '',
        usageType: 'Single-use'
    });

    const [materials, setMaterials] = useState([{ materialName: '', percentage: '' }]);

    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
        "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
        "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
        "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
        "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary",
        "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
        "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
        "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
        "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman",
        "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
        "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
        "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];

    // Functions
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddMaterial = () => {
        setMaterials([...materials, { materialName: '', percentage: '' }]);
    };

    const handleMaterialChange = (index, field, value) => {
        const updatedMaterials = [...materials];
        updatedMaterials[index][field] = value;
        setMaterials(updatedMaterials);
    };

   // 🚀 API එකට දත්ත යවන කොටස
const handleSubmit = async (e) => {
    e.preventDefault();
    const finalData = { ...productData, materials };

    try {
        const response = await API.post('/products/register', finalData);

        if (response.status === 200 || response.status === 201) {
            alert("✅ Product Registered Successfully!");
        }
    } catch (error) {
        console.error("Error:", error);
        
        const errorMsg = error.response?.data?.error || "Registration Failed!";
        alert(`❌ ${errorMsg}`);
        
        if (error.response?.status === 401) {
            console.error("Auth Error: Your session might have expired.");
        }
    }
};
    const styles = {
        formContainer: { background: 'rgba(255, 255, 255, 0.03)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', maxWidth: '900px', margin: '0 auto', color: '#fff', fontFamily: 'Segoe UI, sans-serif' },
        sectionTitle: { fontSize: '24px', color: '#2ecc71', marginBottom: '30px', fontWeight: 'bold', textAlign: 'center' },
        grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
        inputGroup: { display: 'flex', flexDirection: 'column', marginBottom: '15px' },
        label: { fontSize: '14px', marginBottom: '8px', color: '#aaa' },
        input: { background: 'rgba(0,0,0,0.5)', border: '1px solid #444', padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none' },
        selectInput: { background: '#1a1a1a', border: '1px solid #444', padding: '12px', borderRadius: '10px', color: '#fff', outline: 'none', cursor: 'pointer' },
        materialRow: { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' },
        addBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '10px' },
        submitBtn: { background: '#2ecc71', color: '#000', border: 'none', padding: '15px 40px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', width: '100%', marginTop: '30px', fontSize: '16px', transition: '0.3s' }
    };

    return (
        <div style={styles.formContainer}>
            <h2 style={styles.sectionTitle}>PRODUCT REGISTRATION FORM</h2>
            
            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Product Type</label>
                    <input name="productType" style={styles.input} type="text" placeholder="e.g. Electronics" onChange={handleChange} />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Brand Name</label>
                    <input name="brandName" style={styles.input} type="text" placeholder="e.g. Sony" onChange={handleChange} />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Product Model</label>
                    <input name="productModel" style={styles.input} type="text" placeholder="e.g. WH-1000XM4" onChange={handleChange} />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Country of Origin</label>
                    <select name="originCountry" style={styles.selectInput} onChange={handleChange}>
                        <option value="" style={{background: '#222'}}>Select Country</option>
                        {countries.map(c => <option key={c} value={c} style={{background: '#222', color: '#fff'}}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Estimated Annual Quantity (Weight - kg)</label>
                    <input name="annualQuantityWeight" style={styles.input} type="number" placeholder="0.00 kg" onChange={handleChange} />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Estimated Annual Quantity (Units)</label>
                    <input name="annualQuantityUnits" style={styles.input} type="number" placeholder="e.g. 500" onChange={handleChange} />
                </div>
            </div>

            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Packaging Category</label>
                    <input name="packagingCategory" style={styles.input} type="text" placeholder="Primary/Secondary" onChange={handleChange} />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Packaging Material</label>
                    <input name="packagingMaterial" style={styles.input} type="text" placeholder="Plastic/Cardboard" onChange={handleChange} />
                </div>
            </div>

            <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{...styles.label, color: '#2ecc71', fontWeight: 'bold'}}>Material Composition (% by weight)</label>
                <div style={{marginTop: '15px'}}>
                    {materials.map((m, index) => (
                        <div key={index} style={styles.materialRow}>
                            <input style={{ ...styles.input, flex: 2 }} placeholder="Material Name" onChange={(e) => handleMaterialChange(index, 'materialName', e.target.value)} />
                            <input style={{ ...styles.input, flex: 1 }} type="number" placeholder="%" onChange={(e) => handleMaterialChange(index, 'percentage', e.target.value)} />
                        </div>
                    ))}
                </div>
                <button style={styles.addBtn} onClick={handleAddMaterial}>+ Add More Material</button>
            </div>

            <div style={{ ...styles.grid, marginTop: '20px' }}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Unit Weight (kg/g)</label>
                    <input name="unitWeight" style={styles.input} type="text" placeholder="e.g. 250g" onChange={handleChange} />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Usage Type</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                        <label style={{cursor: 'pointer'}}><input type="radio" name="usageType" value="Reusable" onChange={handleChange} /> Reusable</label>
                        <label style={{cursor: 'pointer'}}><input type="radio" name="usageType" value="Single-use" defaultChecked onChange={handleChange} /> Single-use</label>
                    </div>
                </div>
            </div>

            <button style={styles.submitBtn} onClick={handleSubmit}>REGISTER PRODUCT</button>
        </div>
    );
};

export default ProductRegistration;