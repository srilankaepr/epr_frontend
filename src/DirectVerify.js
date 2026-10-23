import React, { useState } from 'react';
import axios from 'axios';

const DirectVerify = ({ qrId }) => { // qrId එක prop එකක් විදිහට හරි, useParams() හරහා හරි ගන්න පුළුවන්
    // ෆෝම් එකේ ඩේටා තියාගන්න State එක
    const [formData, setFormData] = useState({
        qrId: qrId || 'TEST-QR-001', // මෙතනට ස්කෑන් වුණ QR ID එක එන්න ඕනේ
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
            // ඔයාගේ Backend URL එකට හරියටම Path එක දෙන්න (උදා: /api/qr/submit-direct-collection)
            const response = await axios.post('http://localhost:5000/api/qr/submit-direct-collection', formData);
            
            if (response.data.success) {
                setMessage('✅ Collection Details Submitted Successfully!');
                // ඕන නම් submit වුණාට පස්සේ form එක clear කරන්න පුළුවන්
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
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Please fill the collection details below.</p>

            {message && (
                <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: message.includes('✅') ? '#1e4620' : '#4a1515', borderRadius: '5px' }}>
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
                    padding: '12px',
                    backgroundColor: '#2ecc71',
                    color: '#000',
                    border: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '10px'
                }}>
                    {loading ? 'Submitting...' : 'Submit Collection Data'}
                </button>
            </form>
        </div>
    );
};

// Input fields වලට පොදු Style එකක්
const inputStyle = {
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #333',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    outline: 'none'
};

export default DirectVerify;