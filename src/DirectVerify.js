import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DirectVerify = () => { 
    // URL එකෙන් QR ID එක ගන්නවා (උදා: ?id=DIR-261023-0001-ABCD)
    const [qrId, setQrId] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const idFromUrl = queryParams.get('id');
        if (idFromUrl) {
            setQrId(idFromUrl);
            setFormData(prev => ({ ...prev, qrId: idFromUrl }));
        }
    }, []);

    // ෆෝම් එකේ ඩේටා තියාගන්න State එක
    const [formData, setFormData] = useState({
        qrId: '', 
        companyName: '',
        personName: '',
        contactNumber: '',
        item: '',
        weight: '',
        quantity: '',
        vehicleNumber: '',
        gsnGrnNumber: '',
        date: new Date().toISOString().split('T')[0] // අද දවස default වැටෙන්න
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // 🚀 මෙතන තමයි වෙනස! ලෝකල්හොස්ට් අයින් කරලා ලයිව් URL එකම දුන්නා.
            const response = await axios.post('https://www.epr-srilanka.com/api/qr/submit-direct-collection', formData);
            
            if (response.data.success) {
                setMessage('✅ Collection Details Submitted Successfully!');
                // ෆෝම් එක සබ්මිට් වුණාට පස්සේ හිස් කරන්න ඕන නම් මේක තියාගන්න
                setFormData({
                    ...formData,
                    companyName: '',
                    personName: '',
                    contactNumber: '',
                    item: '',
                    weight: '',
                    quantity: '',
                    vehicleNumber: '',
                    gsnGrnNumber: ''
                });
            }
        } catch (error) {
            setMessage('❌ Failed to submit details. Please try again.');
            console.error("Submit Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            background: '#121212', 
            color: '#fff',
            padding: '40px 20px'
        }}>
            <h2 style={{ color: '#2ecc71', marginBottom: '10px' }}>✔ Direct Collection Verified</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>
                QR ID: <strong style={{ color: '#fff' }}>{qrId || 'Scanning...'}</strong><br/>
                Please fill the collection details below.
            </p>

            {message && (
                <div style={{ 
                    padding: '12px', 
                    marginBottom: '20px', 
                    width: '100%', 
                    maxWidth: '400px',
                    textAlign: 'center',
                    backgroundColor: message.includes('✅') ? '#1e4620' : '#4a1515', 
                    border: message.includes('✅') ? '1px solid #2ecc71' : '1px solid #e74c3c',
                    borderRadius: '8px' 
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px', gap: '15px' }}>
                
                <input type="text" name="companyName" placeholder="Company Name *" required
                    value={formData.companyName} onChange={handleChange} 
                    style={inputStyle} />

                <input type="text" name="personName" placeholder="Person Name *" required
                    value={formData.personName} onChange={handleChange} 
                    style={inputStyle} />

                <input type="text" name="contactNumber" placeholder="Contact Number *" required
                    value={formData.contactNumber} onChange={handleChange} 
                    style={inputStyle} />

                <input type="text" name="item" placeholder="Item Type *" required
                    value={formData.item} onChange={handleChange} 
                    style={inputStyle} />

                <input type="text" name="weight" placeholder="Weight (e.g., 50kg) *" required
                    value={formData.weight} onChange={handleChange} 
                    style={inputStyle} />

                <input type="number" name="quantity" placeholder="Quantity *" required
                    value={formData.quantity} onChange={handleChange} 
                    style={inputStyle} />

                <input type="text" name="vehicleNumber" placeholder="Vehicle Number *" required
                    value={formData.vehicleNumber} onChange={handleChange} 
                    style={inputStyle} />

                <input type="date" name="date" required
                    value={formData.date} onChange={handleChange} 
                    style={inputStyle} />

                {/* GSN/GRN Number - Optional (required දාලා නෑ) */}
                <input type="text" name="gsnGrnNumber" placeholder="GSN/GRN Number (Optional)"
                    value={formData.gsnGrnNumber} onChange={handleChange} 
                    style={inputStyle} />

                <button type="submit" disabled={loading} style={{
                    padding: '15px',
                    backgroundColor: loading ? '#444' : '#2ecc71',
                    color: loading ? '#aaa' : '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '10px',
                    transition: '0.3s'
                }}>
                    {loading ? 'Submitting...' : 'Submit Collection Data'}
                </button>
            </form>
        </div>
    );
};

// Input fields වලට පොදු Style එකක්
const inputStyle = {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    fontSize: '15px',
    outline: 'none'
};

export default DirectVerify;