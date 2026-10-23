import React, { useState } from 'react';
import API from './api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';

const DirectCollections = () => {
    const [companyName, setCompanyName] = useState('');
    const [itemType, setItemType] = useState('');
    const [weight, setWeight] = useState('');
    const [qty, setQty] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    const generateDirectQRs = async () => {
        const finalCompanyName = companyName.trim();
        const finalItemType = itemType.trim();
        const finalWeight = weight.trim();
        const finalQty = parseInt(qty);

        if (!finalCompanyName || !finalItemType || !finalWeight || isNaN(finalQty) || finalQty <= 0 || finalQty > 1000) {
            alert("Please fill in Company Name, Item Type, Weight, and a valid Quantity (1-1000)!");
            return;
        }

        setIsGenerating(true);
        setProgress(0);

        const zip = new JSZip();
        const now = new Date();
        const dateCode = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
        
        try {
            const canvas = document.createElement('canvas'); 
            const ctx = canvas.getContext('2d');
            canvas.width = 500;  
            canvas.height = 640; // අලුත් විස්තර පෙන්වීමට කැන්වස් උස තරමක් වැඩි කළෙමු
            const qrImg = new Image(); 

            for (let i = 1; i <= finalQty; i++) {
                const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
                const fullID = `DIR-${dateCode}-${i.toString().padStart(4, '0')}-${randomStr}`;
                const currentQrUrl = `https://www.epr-srilanka.com/direct-verify?id=${fullID}`;
                const qrOnlyDataURL = await QRCode.toDataURL(currentQrUrl, { width: 500, margin: 2 });

                await new Promise((resolve) => {
                    qrImg.onload = () => {
                        ctx.fillStyle = "white";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // QR රූපය ඉහළින් ඇඳීම
                        ctx.drawImage(qrImg, 0, 0);
                        
                        // යටින් අලුත් විස්තර මුದ್ರණය කිරීම
                        ctx.fillStyle = "black"; 
                        ctx.textAlign = "center";
                        
                        // 1. Company Name
                        ctx.font = "bold 20px Arial"; 
                        ctx.fillText(`Company: ${finalCompanyName}`, canvas.width / 2, 530); 

                        // 2. Item & Weight
                        ctx.font = "16px Arial"; 
                        ctx.fillText(`Item: ${finalItemType} | Weight: ${finalWeight}`, canvas.width / 2, 565); 

                        // 3. Unique QR ID
                        ctx.font = "bold 15px Arial"; 
                        ctx.fillText(`ID: ${fullID}`, canvas.width / 2, 605); 
                        
                        resolve();
                    };
                    qrImg.src = qrOnlyDataURL;
                });

                const base64Data = canvas.toDataURL("image/png").split(',')[1];

                await API.post('/qr/save-qr-direct', {
                    qrId: fullID,
                    companyName: finalCompanyName,
                    itemType: finalItemType,
                    weight: finalWeight,
                    batchDate: dateCode,
                    status: 'Generated' 
                });

                zip.file(`${fullID}.png`, base64Data, { base64: true });

                if (i % 10 === 0 || i === finalQty) {
                    setProgress(Math.round((i / finalQty) * 100));
                }
            }

            // ZIP ඩවුන්ලෝඩ් කිරීම
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `Direct_QR_${finalCompanyName.replace(/\s+/g, '_')}_${dateCode}.zip`);
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
                    <label style={styles.label}>Company Name</label>
                    <input 
                        type="text" 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                        placeholder="e.g. ABC Industries"
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Item Type</label>
                    <input 
                        type="text" 
                        value={itemType} 
                        onChange={(e) => setItemType(e.target.value)} 
                        placeholder="e.g. Plastic / E-Waste"
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Weight (e.g. 50kg / 2tons)</label>
                    <input 
                        type="text" 
                        value={weight} 
                        onChange={(e) => setWeight(e.target.value)} 
                        placeholder="e.g. 50 Kg"
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