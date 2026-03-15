import React, { useState } from 'react';

const AddPartnerForm = ({ partnerData, handleChange, handleSubmit, onCancel, isEditing }) => {
    const [showPassword, setShowPassword] = useState(false);

    const districts = [
        "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", 
        "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", 
        "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", 
        "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", 
        "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
    ];

    return (
        <div style={styles.card}>
            <div style={styles.formHeader}>
                <h3 style={styles.cardTitle}>
                    {isEditing ? 'Update Co-Partner Details' : 'Register New Co-Partner'}
                </h3>
                <span style={styles.entryId}>
                    {isEditing ? `EDITING: ${partnerData.coPartnerId}` : 'ENTRY: #NEW'}
                </span>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                    
                    {isEditing && (
                        <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                            <label style={styles.label}>Partner ID (System Generated)</label>
                            <input 
                                type="text" 
                                value={partnerData.coPartnerId} 
                                style={{ 
                                    ...styles.input, 
                                    backgroundColor: 'rgba(46, 204, 113, 0.05)', 
                                    color: '#2ecc71', 
                                    cursor: 'not-allowed',
                                    border: '1px solid rgba(46, 204, 113, 0.3)',
                                    fontWeight: 'bold'
                                }} 
                                readOnly 
                            />
                        </div>
                    )}

                    {/* 1. මෙතන name එක "name" ලෙසම තැබුවා (ඔයාගේ පරණ handleSubmit එකට ගැලපෙන්න) */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input 
                            name="name" 
                            value={partnerData.name} 
                            onChange={handleChange} 
                            type="text" 
                            placeholder="Enter full name" 
                            style={styles.input} 
                            required 
                        />
                    </div>

                    {/* 2. Phone Number එකට "phone" ලෙස නම දුන්නා */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone Number</label>
                        <input 
                            name="phone" 
                            value={partnerData.phone} 
                            onChange={handleChange} 
                            type="tel" 
                            placeholder="e.g. 0771234567" 
                            style={styles.input} 
                            required 
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>National ID (NIC)</label>
                        <input 
                            name="nic" 
                            value={partnerData.nic} 
                            onChange={handleChange} 
                            type="text" 
                            placeholder="NIC Number" 
                            style={{...styles.input, opacity: isEditing ? 0.6 : 1}} 
                            disabled={isEditing} 
                            required 
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email (Username)</label>
                        <input 
                            name="email" 
                            autoComplete="new-user-email" 
                            value={partnerData.email} 
                            onChange={handleChange} 
                            type="email" 
                            placeholder="Enter Username/Email" 
                            style={{...styles.input, opacity: isEditing ? 0.6 : 1}} 
                            disabled={isEditing} 
                            required 
                        />
                    </div>

                    {/* Password Field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.passwordWrapper}>
                            <input 
                                name="password" 
                                autoComplete="new-password" 
                                value={partnerData.password} 
                                onChange={handleChange} 
                                type={showPassword ? "text" : "password"} 
                                placeholder={isEditing ? "Leave blank to keep current" : "Enter Password"} 
                                style={{...styles.input, width: '100%', boxSizing: 'border-box'}} 
                                required={!isEditing} 
                            />
                            <span 
                                onClick={() => setShowPassword(!showPassword)} 
                                style={{ ...styles.eyeIcon, color: showPassword ? '#2ecc71' : '#aaa' }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </span>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>District</label>
                        <input 
                            name="district" 
                            list="district-list" 
                            value={partnerData.district} 
                            onChange={handleChange} 
                            type="text" 
                            placeholder="Select District" 
                            style={styles.input} 
                            required 
                        />
                        <datalist id="district-list">
                            {districts.map((dist, index) => (
                                <option key={index} value={dist} />
                            ))}
                        </datalist>
                    </div>

                    <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                        <label style={styles.label}>Pradeshiya Sabha</label>
                        <input 
                            name="pradeshiyaSabha" 
                            value={partnerData.pradeshiyaSabha} 
                            onChange={handleChange} 
                            type="text" 
                            placeholder="Enter Pradeshiya Sabha" 
                            style={styles.input} 
                            required 
                        />
                    </div>
                </div>

                <div style={styles.btnGroup}>
                    <button type="submit" style={styles.saveBtn}>
                        {isEditing ? 'Update Partner Info' : 'Register New Partner'}
                    </button>
                    <button type="button" onClick={onCancel} style={styles.cancelBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

// ... styles ටික කලින් විදිහමයි ...
const styles = {
    card: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(15px)', padding: '40px', borderRadius: '25px', border: '1px solid rgba(255, 255, 255, 0.1)', animation: 'fadeIn 0.5s ease-out' },
    formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    cardTitle: { fontSize: '20px', color: '#2ecc71', margin: 0, fontWeight: '700' },
    entryId: { color: '#2ecc71', fontWeight: 'bold', fontSize: '12px', background: 'rgba(46, 204, 113, 0.1)', padding: '5px 12px', borderRadius: '8px', letterSpacing: '1px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { color: '#aaa', fontSize: '13px', paddingLeft: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', transition: '0.3s' },
    passwordWrapper: { position: 'relative', width: '100%', display: 'flex', flexDirection: 'column' },
    eyeIcon: { position: 'absolute', right: '15px', top: '13px', cursor: 'pointer', fontSize: '18px', zIndex: 10 },
    btnGroup: { display: 'flex', gap: '15px', marginTop: '30px' },
    saveBtn: { flex: 2, padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', transition: '0.3s' },
    cancelBtn: { flex: 1, padding: '16px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', transition: '0.3s' }
};

export default AddPartnerForm;