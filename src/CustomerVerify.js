import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from './api'; 

const CustomerVerify = () => {
    const [searchParams] = useSearchParams();
    const qrId = searchParams.get('id');

    const [viewMode, setViewMode] = useState('loading'); 
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Countdown Logic
    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1000);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    // Format Time Function
    const formatTime = (ms) => {
        if (ms <= 0) return "Processing...";
        let seconds = Math.floor(ms / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

   useEffect(() => {
        const verifyQR = async () => {
            if (!qrId) {
                setViewMode('error');
                return;
            }
            try {
                const response = await API.post(`/qr/verify-product`, { cuSerial: qrId }); 
                const data = response.data;

                if (data.status === "PENDING_LIMIT") {
                    setViewMode('LIMIT_REACHED');
                    setTimeLeft(data.remainingTime);
                } else if (data.status === "SHOW_REMINDER") {
                    setViewMode('REMINDER_MODE');
                    setUserData(data.userData);
                    setFormData({
                        name: data.userData.cuName || '',
                        phone: data.userData.cuPhone || '',
                        address: data.userData.cuAddress || ''
                    });
                } else if (data.status === "EXISTING") {
                    setViewMode('EXISTING');
                    setUserData(data.userData);
                    setFormData({
                        name: data.userData.cuName || '',
                        phone: data.userData.cuPhone || '',
                        address: data.userData.cuAddress || ''
                    });
                    setShowConfirmDialog(true);
                } else if (data.status === "NEW") {
                    setViewMode('NEW');
                } else {
                    setViewMode('error');
                }
            } catch (err) {
                setViewMode('error');
            }
        };
        verifyQR();
    }, [qrId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
                    
            const response = await API.post('/qr/save-registration', {
                cuSerial: qrId,
                cuName: formData.name,
                cuPhone: formData.phone,
                cuAddress: formData.address
            });

            setSuccessMessage("Registration Successful! ✅");
            setShowSuccessPopup(true);
            setViewMode('SUCCESS_DONE'); 
            setTimeout(() => setShowSuccessPopup(false), 5000);

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.';
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

const handleRecycleSubmit = async () => {
        setLoading(true);
        try {
            // 1. fetch වෙනුවට API.post පාවිච්චි කරමු
            // 2. පාර (Path) විදිහට /qr/save-recycle-request පාවිච්චි කරනවා
            const response = await API.post('/qr/save-recycle-request', {
                qrId: qrId.trim(),
                cuName: formData.name,
                cuPhone: formData.phone,
                cuAddress: formData.address,
                cuCompany: userData?.cuCompany,
                cuProduct: userData?.cuProduct,
                cuBrand: userData?.cuBrand
            });

            // 3. Axios වලදී සාර්ථක ප්‍රතිචාරයක් ලැබුණොත් කෙලින්ම මෙතනට එනවා
            setSuccessMessage("Your recycle request was sent successfully. ✅");
            setShowSuccessPopup(true);
            setShowConfirmDialog(false);
            setTimeout(() => setShowSuccessPopup(false), 5000);

        } catch (err) {
            // 4. සර්වර් එකෙන් එන වැරදි පණිවිඩයක් තිබේ නම් එය පෙන්වනවා
            const errorMsg = err.response?.data?.error || 'Request failed to send.';
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

 const handleSendReminder = async () => {
        setLoading(true);
        try {
            // 1. fetch වෙනුවට API.post පාවිච්චි කරනවා
            // 2. පාර (Path) විදිහට /qr/send-reminder පාවිච්චි කරනවා
            const response = await API.post('/qr/send-reminder', { qrId: qrId });

            // 3. Axios වලදී සාර්ථක ප්‍රතිචාරයක් ලැබුණොත් කෙලින්ම මෙතනට එනවා
            setSuccessMessage("Follow-up reminder sent successfully! 🔔");
            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 5000);

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to send reminder.';
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>QR Verification</h2>
                <span style={styles.qrBadge}>QR ID: {qrId}</span>

                {viewMode === 'loading' && <p style={{textAlign:'center', color:'#ccc'}}>Verifying QR Code...</p>}

                {/* 1. Within 48 Hours with Live Countdown */}
                {viewMode === 'LIMIT_REACHED' && (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                        <h3 style={{ color: '#f1c40f' }}>Request Under Review</h3>
                        <p style={styles.subtitle}>
                            We have already received your recycle request. 
                            Please allow up to 48 hours for our team to respond.
                        </p>
                        <div style={styles.countdownBox}>
                            <p style={{ color: '#888', fontSize: '11px', marginBottom: '5px' }}>TIME REMAINING</p>
                            <h2 style={{ color: '#f1c40f', margin: 0, fontFamily: 'monospace' }}>
                                {formatTime(timeLeft)}
                            </h2>
                        </div>
                    </div>
                )}

                {/* 2. After 48 Hours - Reminder Mode */}
                {viewMode === 'REMINDER_MODE' && (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                        <h3 style={{ color: '#f1c40f' }}>Still Waiting for a Response?</h3>
                        <p style={styles.subtitle}>
                            It has been over 48 hours since your request. You can now send a follow-up reminder.
                        </p>
                        <button onClick={handleSendReminder} disabled={loading} style={{ ...styles.button, background: '#f1c40f', color: '#000', marginTop:'10px' }}>
                            {loading ? 'Sending...' : '🔔 Send a Follow-up Reminder'}
                        </button>
                    </div>
                )}

                {/* 3. New User Registration */}
                {viewMode === 'NEW' && (
                    <div>
                        <p style={styles.subtitle}>This product is not registered yet. Please enter your details below.</p>
                        <form onSubmit={handleRegisterSubmit} style={styles.form}>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" style={styles.input} required />
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" style={styles.input} required />
                            <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" style={styles.input} required />
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Registering...' : 'Register Now'}
                            </button>
                        </form>
                    </div>
                )}

                {/* 4. Success/Done Page after Registration */}
                {viewMode === 'SUCCESS_DONE' && (
    <div style={{ textAlign: 'center', padding: '10px' }}>
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎉</div>
        <h3 style={{ color: '#2ecc71' }}>Registration Complete!</h3>
        <p style={styles.subtitle}>
            Thank you for registering your product. Your information has been securely saved. 
        </p>
        
        {/* 🟢 Done ඔබපු ගමන් viewMode එක THANK_YOU වලට මාරු කරනවා */}
        <button 
            onClick={() => setViewMode('THANK_YOU')} 
            style={{ ...styles.button, background: '#333', color: '#fff', marginTop: '10px' }}
        >
            Done
        </button>
    </div>
)}

{viewMode === 'THANK_YOU' && (
    <div style={{ textAlign: 'center', padding: '30px 10px' }}>
        <div style={{ fontSize: '60px', marginBottom: '15px' }}>💚</div>
        <h2 style={{ color: '#2ecc71', marginBottom: '10px' }}>Thank You!</h2>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6' }}>
            You have successfully completed the verification process. You can now close this browser tab safely.
        </p>
    </div>
)}

                {/* Success Popup */}
                {showSuccessPopup && (
                    <div style={popupOverlayStyle}>
                        <div style={popupStyle}>
                            <h3 style={{ color: '#2ecc71' }}>Success!</h3>
                            <p style={{ color: '#ccc' }}>{successMessage}</p>
                            <button onClick={() => setShowSuccessPopup(false)} style={closeButtonStyle}>OK</button>
                        </div>
                    </div>
                )}

                {/* Recycle Confirm Dialog */}
                {showConfirmDialog && viewMode === 'EXISTING' && (
                    <div style={popupOverlayStyle}>
                        <div style={popupStyle}>
                            <h3 style={{ color: '#2ecc71' }}>Already Registered</h3>
                            <p style={{ color: '#ccc', margin: '20px 0' }}>
                                Do you need to submit a recycle request for this product?
                            </p>
                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                <button onClick={() => setShowConfirmDialog(false)} style={cancelButtonStyle}>Cancel</button>
                                <button onClick={handleRecycleSubmit} style={confirmButtonStyle}>Submit Request</button>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'error' && <p style={styles.subtitle}>Invalid QR code or server error. Please try again later.</p>}

                {message.text && (
                    <div style={{ ...styles.message, background: message.type === 'success' ? '#27ae60' : '#e74c3c' }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a0a', padding: '20px', fontFamily: 'sans-serif' },
    card: { background: '#141414', padding: '30px', borderRadius: '25px', width: '100%', maxWidth: '400px', border: '1px solid #222', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
    title: { color: '#2ecc71', textAlign: 'center', marginBottom: '10px' },
    qrBadge: { display: 'block', padding: '5px', background: '#222', borderRadius: '50px', color: '#aaa', fontSize: '12px', marginBottom: '20px', textAlign: 'center', border: '1px solid #333' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #333', background: '#000', color: '#fff', boxSizing: 'border-box', outline: 'none', marginBottom: '15px' },
    button: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#2ecc71', color: '#000', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
    message: { marginTop: '20px', padding: '15px', borderRadius: '12px', fontSize: '14px', textAlign: 'center', lineHeight: '1.4' },
    subtitle: { color: '#888', fontSize: '13px', marginBottom: '20px', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column' },
    countdownBox: { marginTop: '20px', padding: '15px', background: '#000', borderRadius: '15px', border: '1px dashed #f1c40f' }
};

const popupOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const popupStyle = { background: '#141414', padding: '30px', borderRadius: '20px', maxWidth: '350px', width: '90%', textAlign: 'center', border: '1px solid #2ecc71' };
const confirmButtonStyle = { padding: '12px 25px', background: '#2ecc71', border: 'none', borderRadius: '8px', color: '#000', cursor: 'pointer', fontWeight: 'bold' };
const cancelButtonStyle = { padding: '12px 25px', background: '#e74c3c', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' };
const closeButtonStyle = { marginTop: '20px', padding: '12px 30px', background: '#2ecc71', border: 'none', borderRadius: '8px', color: '#000', cursor: 'pointer', fontWeight: 'bold' };

export default CustomerVerify;