import React, { useState } from 'react';
import API from './api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';

const DirectCollections = () => {
    const [cpId, setCpId] = useState('');
    const [qty, setQty] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    const generateDirectQRs = async () => {
        const finalCpId = cpId.trim().toUpperCase();
        const finalQty = parseInt(qty);

        if (!finalCpId || isNaN(finalQty) || finalQty <= 0 || finalQty > 1000) {
            alert("Please enter a valid Co-Partner ID and Quantity (1-1000)!");
            return;
        }

        setIsGenerating(true);
        setProgress(0);

        const zip = new JSZip();
        const now = new Date();
        // Date code: YYMMDD
        const dateCode = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
        
        try {
            for (let i = 1; i <= finalQty; i++) {
                // 1. Generate Unique ID
                const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
                const fullID = `${finalCpId}-${dateCode}-${i.toString().padStart(4, '0')}-${randomStr}`;
                
                // 2. Create QR Code Image
                const qrValue = `https://www.epr-srilanka.com/verify-product?id=${fullID}`;
                const qrDataURL = await QRCode.toDataURL(qrValue, { width: 500, margin: 2 });
                const base64Data = qrDataURL.split(',')[1];

                // 3. Save to MongoDB (Backend Call)
                await API.post('/qr/save-qr-direct', {
                    qrId: fullID,
                    coPartnerId: finalCpId,
                    batchDate: dateCode,
                    status: 'Generated' // පසුව මේක logic එක අනුව වෙනස් කරමු
                });

                // 4. Add to Zip
                zip.file(`${fullID}.png`, base64Data, { base64: true });

                // Update Progress
                if (i % 10 === 0 || i === finalQty) {
                    setProgress(Math.round((i / finalQty) * 100));
                }
            }

            // 5. Download Zip
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `Direct_QR_${finalCpId}_${dateCode}.zip`);
            alert(`✅ Successfully generated ${finalQty} QRs and saved to Database!`);

        } catch (err) {
            console.error("Generation Error:", err);
            alert("Error: " + (err.response?.data?.message || err.message));
        } finally {
            setIsGenerating(false);
            setProgress(0);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={{ color: '#2ecc71', marginBottom: '25px' }}>Direct QR Generation (Bulk)</h3>
            
            <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Co-Partner ID (Auto-Capitalized)</label>
                    <input 
                        type="text" 
                        value={cpId} 
                        onChange={(e) => setCpId(e.target.value)} 
                        placeholder="e.g. CP001"
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Quantity (Max 1000)</label>
                    <input 
                        type="number" 
                        value={qty} 
                        onChange={(e) => setQty(e.target.value)} 
                        placeholder="100"
                        style={styles.input}
                    />
                </div>
            </div>

            <button 
                onClick={generateDirectQRs} 
                disabled={isGenerating}
                style={{
                    ...styles.btn,
                    background: isGenerating ? '#444' : 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
                }}
            >
                {isGenerating ? `Processing... ${progress}%` : 'Generate & Save to DB'}
            </button>
        </div>
    );
};

const styles = {
    card: { background: 'rgba(255, 255, 255, 0.03)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { color: '#fbf9f9', fontSize: '14px' },
    input: { padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', color: '#fff', fontSize: '16px' },
    btn: { width: '100%', padding: '18px', borderRadius: '15px', color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '16px', transition: '0.3s' }
};

export default DirectCollections;