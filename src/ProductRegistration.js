import React, { useState } from 'react';

const ProductRegistration = () => {
    const [productData, setProductData] = useState({
        productType: '',
        brandName: '',
        productModel: '',
        originCountry: '',
        annualQuantity: '',
        packagingCategory: '',
        packagingMaterial: '',
        unitWeight: '',
        usageType: 'Single-use'
    });

    // Material Composition සඳහා dynamic array එකක්
    const [materials, setMaterials] = useState([{ materialName: '', percentage: '' }]);

    const countries = ["Sri Lanka", "India", "China", "USA", "UK", "Japan", "Germany", "Vietnam"]; // අවශ්‍ය රටවල් මෙතනට දාන්න

    const handleAddMaterial = () => {
        setMaterials([...materials, { materialName: '', percentage: '' }]);
    };

    const handleMaterialChange = (index, field, value) => {
        const updatedMaterials = [...materials];
        updatedMaterials[index][field] = value;
        setMaterials(updatedMaterials);
    };

    const styles = {
        formContainer: {
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '900px',
            margin: '0 auto',
            color: '#fff',
            fontFamily: 'Segoe UI, sans-serif'
        },
        sectionTitle: { fontSize: '24px', color: '#2ecc71', marginBottom: '30px', fontWeight: 'bold', textAlign: 'center' },
        grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
        inputGroup: { display: 'flex', flexDirection: 'column', marginBottom: '15px' },
        label: { fontSize: '14px', marginBottom: '8px', color: '#aaa' },
        input: {
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid #444',
            padding: '12px',
            borderRadius: '10px',
            color: '#fff',
            outline: 'none'
        },
        materialRow: { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' },
        addBtn: {
            background: '#3498db', color: '#fff', border: 'none', padding: '8px 15px', 
            borderRadius: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '10px'
        },
        submitBtn: {
            background: '#2ecc71', color: '#000', border: 'none', padding: '15px 40px',
            borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', width: '100%', marginTop: '30px',
            fontSize: '16px', transition: '0.3s'
        }
    };

    return (
        <div style={styles.formContainer}>
            <h2 style={styles.sectionTitle}>PRODUCT REGISTRATION FORM</h2>
            
            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Product Type</label>
                    <input style={styles.input} type="text" placeholder="e.g. Electronics" />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Brand Name</label>
                    <input style={styles.input} type="text" placeholder="e.g. Sony" />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Product Model</label>
                    <input style={styles.input} type="text" placeholder="e.g. WH-1000XM4" />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Country of Origin</label>
                    <select style={styles.input}>
                        <option value="">Select Country</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div style={styles.grid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Estimated Annual Quantity (Weight/Units)</label>
                    <input style={styles.input} type="number" placeholder="0.00" />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Packaging Category</label>
                    <input style={styles.input} type="text" placeholder="Primary/Secondary" />
                </div>
            </div>

            {/* Material Composition Section */}
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                <label style={styles.label}>Material Composition (% by weight)</label>
                {materials.map((m, index) => (
                    <div key={index} style={styles.materialRow}>
                        <input 
                            style={{ ...styles.input, flex: 2 }} 
                            placeholder="Material Name (e.g. Plastic)" 
                            onChange={(e) => handleMaterialChange(index, 'materialName', e.target.value)}
                        />
                        <input 
                            style={{ ...styles.input, flex: 1 }} 
                            type="number" 
                            placeholder="Percentage %" 
                            onChange={(e) => handleMaterialChange(index, 'percentage', e.target.value)}
                        />
                    </div>
                ))}
                <button style={styles.addBtn} onClick={handleAddMaterial}>+ Add More Material</button>
            </div>

            <div style={{ ...styles.grid, marginTop: '20px' }}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Unit Weight (kg/g)</label>
                    <input style={styles.input} type="text" placeholder="e.g. 250g" />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Usage Type</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                        <label><input type="radio" name="usage" value="Reusable" /> Reusable</label>
                        <label><input type="radio" name="usage" value="Single-use" defaultChecked /> Single-use</label>
                    </div>
                </div>
            </div>

            <button style={styles.submitBtn}>REGISTER PRODUCT</button>
        </div>
    );
};

export default ProductRegistration;