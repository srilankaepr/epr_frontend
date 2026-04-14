import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const CoPartnerScan = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState('Scan the QR code approved by the customer.');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState(''); // 👈 අතින් ගහන ID එක තියාගන්න

  useEffect(() => {
    let scanner = null;

    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 380, height: 380 },
          aspectRatio: 1.0,
          disableFlip: false,
          showFlipBtn: false,
          showTorchBtn: false,
          defaultUiDisabled: true,
          rememberLastUsedCamera: true
        },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);

      // UI එකේ ඇති අනවශ්‍ය බටන් ඉවත් කිරීම
      const forceRemoveInternal = setInterval(() => {
        const internalStop = document.querySelector('.html5-qrcode-stop-button');
        if (internalStop) {
          internalStop.remove();
        }
      }, 100);

      return () => {
        clearInterval(forceRemoveInternal);
        if (scanner) {
          scanner.clear().catch(error => console.error("Scanner clear error:", error));
        }
      };
    }
  }, [scanning]);

  const onScanSuccess = async (decodedText) => {
    let finalId = decodedText;
    if (decodedText.includes('id=')) {
        finalId = decodedText.split('id=')[1]; 
    }

    setScanning(false);
    setLoading(true);

    try {
        const pId = localStorage.getItem('coPartnerId');
        const pName = localStorage.getItem('userName'); 
        const pPhone = localStorage.getItem('partnerPhone');

        const response = await axios.post('https://eprbackend-production-6318.up.railway.app/api/partner/confirm-collection', {
            qrId: finalId.trim(), 
            partnerId: pId,
            partnerName: pName,
            partnerPhone: pPhone
        });

        if (response.data.success) {
            alert("Success! Addition confirmed.");
            navigate('/partner-dashboard');
        }
    } catch (err) {
        console.error("Scan Error:", err);
        // Backend එකෙන් එවන Error Message එක පෙන්වයි
        alert(err.response?.data?.message || "An error occurred in the system. Please try again.");
    } finally {
        setLoading(false);
    }
  };


  const handleManualCollect = async () => {
    if (!manualId.trim()) {
        alert("Please enter a valid QR ID");
        return;
    }

    setLoading(true);
    try {
        const pId = localStorage.getItem('coPartnerId');
        const pName = localStorage.getItem('userName'); // 👈 අපි කලින් හදාගත්ත විදියට userName එක ගත්තා
        const pPhone = localStorage.getItem('partnerPhone');

        const response = await axios.post('https://eprbackend-production-6318.up.railway.app/api/partner/confirm-collection', {
            qrId: manualId.trim(), 
            partnerId: pId,
            partnerName: pName,
            partnerPhone: pPhone
        });

        if (response.data.success) {
            alert("Success! Collection confirmed manually.");
            navigate('/partner-dashboard');
        }
    } catch (err) {
        alert(err.response?.data?.message || "Invalid ID or System Error");
    } finally {
        setLoading(false);
    }
};

  const onScanFailure = (error) => {
  };

return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2ecc71', fontSize: '42px', fontWeight: '800', marginBottom: '10px', letterSpacing: '-1px' }}>
          Collection Portal
        </h1>
        <p style={{ color: '#666', fontSize: '18px' }}>{result}</p>
      </div>

      {/* --- Manual Entry Dashboard Card --- */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'linear-gradient(145deg, #141414, #0f0f0f)',
        borderRadius: '24px',
        padding: '30px',
        border: '1px solid #222',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '16px', color: '#2ecc71', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', textAlign: 'center' }}>
          Manual ID Verification
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Enter QR ID Manually (e.g. EPR-xxxxxx-xxxx-xxxxx)"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '12px',
              border: '1px solid #333',
              background: '#080808',
              color: '#fff',
              fontSize: '18px',
              textAlign: 'center',
              outline: 'none',
              transition: '0.3s',
              boxSizing: 'border-box'
            }}
          />
          <button 
            onClick={handleManualCollect}
            style={{
              width: '100%',
              padding: '18px',
              background: '#fff',
              color: '#000',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseOver={(e) => e.target.style.background = '#2ecc71'}
            onMouseOut={(e) => e.target.style.background = '#fff'}
          >
            Confirm Collection
          </button>
        </div>
      </div>

      {/* OR Divider */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '600px', margin: '10px 0 30px 0' }}>
        <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
        <span style={{ padding: '0 15px', color: '#444', fontSize: '14px', fontWeight: 'bold' }}>OR USE SCANNER</span>
        <div style={{ flex: 1, height: '1px', background: '#222' }}></div>
      </div>

      {/* --- Scanner Section --- */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: '#141414',
        borderRadius: '30px',
        padding: '20px',
        border: '1px solid #222',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div id="reader" style={{ borderRadius: '20px', overflow: 'hidden', border: '2px solid #222' }}></div>
        
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '30px',
            zIndex: 10
          }}>
            <div className="spinner" style={{ 
              width: '40px', height: '40px', border: '4px solid #2ecc71', 
              borderTop: '4px solid transparent', borderRadius: '50%', 
              animation: 'spin 1s linear infinite', marginBottom: '15px' 
            }}></div>
            <p style={{ fontSize: '18px', color: '#2ecc71', fontWeight: 'bold' }}>Processing...</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '600px' }}>
        {!scanning ? (
          <button onClick={() => setScanning(true)} style={styles.mainBtn}>
            Launch Scanner
          </button>
        ) : (
          <button onClick={() => setScanning(false)} style={styles.stopBtn}>
            Disable Scanner
          </button>
        )}

        <button
          onClick={() => navigate('/partner-dashboard')}
          style={styles.backBtn}
        >
          Return to Dashboard
        </button>
      </div>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          input:focus { border-color: #2ecc71 !important; box-shadow: 0 0 15px rgba(46,204,113,0.1); }
        `}
      </style>
    </div>
  );
};

const styles = {
  mainBtn: {
    padding: '30px 120px',
    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    border: 'none',
    borderRadius: '100px',
    color: '#fff',
    fontSize: '32px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 20px 50px rgba(46, 204, 113, 0.4)',
    transition: '0.3s'
  },
  stopBtn: {
    padding: '24px 80px',
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    border: 'none',
    borderRadius: '80px',
    color: '#fff',
    fontSize: '30px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  backBtn: {
    padding: '20px 60px',
    background: '#222',
    border: '1px solid #444',
    borderRadius: '80px',
    color: '#888',
    fontSize: '24px',
    cursor: 'pointer'
  }
};

export default CoPartnerScan;