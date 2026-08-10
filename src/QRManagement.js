import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import logo from './logo.png';
import QRReportView from './QRReportView';
import API from './api'; 
import DirectCollections from './DirectCollections';

function QRManagement() {
    const [counts, setCounts] = useState({
  companies: 0,
  products: 0,
  recycleRequests: 0,
  registeredQRs: 0,
  qrCustomers: 0   
});
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();
    const stopGenerationRef = React.useRef(false);

    const [activeTab, setActiveTab] = useState('company');
    const [activeSubTab, setActiveSubTab] = useState('created_companies');
    const [searchTerm, setSearchTerm] = useState('');

const [filterComp, setFilterComp] = useState('');
const [filterBrand, setFilterBrand] = useState('');
const [filterProd, setFilterProd] = useState('');

    const [qrcompanyName, setQrCompanyName] = useState('');
    const [qrcompanyEmail, setQrCompanyEmail] = useState('');
    const [companiesList, setCompaniesList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [qrBatches, setQrBatches] = useState([]);

    const [productList, setProductList] = useState([]);
    const [registeredQRs, setRegisteredQRs] = useState([]);
    const [recycleRequests, setRecycleRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All'); 
    // --- Notification States ---
const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);

    const [prodCategory, setProdCategory] = useState('');
    const [prodBrand, setProdBrand] = useState('');
    const [qrDetails, setQrDetails] = useState({
        comp: '',
        brand: '',
        prod: '',
        qty: ''
    });



// Add Company registration function
const handleRegisterCompany = async () => {
    const nameUpper = qrcompanyName.trim().toUpperCase();
    const emailLower = qrcompanyEmail.trim().toLowerCase();

    if (!nameUpper || !emailLower) {
        alert("Please fill all fields!");
        return;
    }

    const isDuplicate = companiesList.some(c => c.name.toUpperCase() === nameUpper);
    if (isDuplicate) {
        alert("This company name is already registered!");
        return;
    }
    // --- 📍 Sequential ID Logic (4 Digits) ---
    const now = new Date();
    const year = now.getFullYear();
    let nextNumber = 1;

    if (companiesList && companiesList.length > 0) {
        const lastNumbers = companiesList
            .map(c => {
                const regId = c.registrationId || "";
                const parts = regId.split('-');
                return parts.length === 3 ? parseInt(parts[2]) : 0;
            })
            .filter(num => !isNaN(num));

        if (lastNumbers.length > 0) {
            nextNumber = Math.max(...lastNumbers) + 1;
        }
    }

    // අංකය ඉලක්කම් 4ක් වන සේ (0001) සැකසීම
    const formattedNumber = String(nextNumber).padStart(4, '0');
    const registrationID = `REG-${year}-${formattedNumber}`;

    try {
        const response = await API.post('/qr/add-company', {
            name: nameUpper,
            email: emailLower,
            registrationId: registrationID
        });

      if (response.status === 200 || response.status === 201) {
            alert(`✅ Company Registered Successfully!\nAssigned ID: ${registrationID}`);
            setQrCompanyName('');
            setQrCompanyEmail('');
            fetchCompanies(); 
        }
    } catch (err) {
        console.error("Company registration failed:", err);
        const errorMsg = err.response?.data?.error || "Failed to register company.";
        alert(`❌ Error: ${errorMsg}`);
    }
};


const deleteCompany = async (companyId) => {
  if (!window.confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
    return;
  }

  try {
    const response = await API.delete(`/qr/delete-company/${companyId}`);

    if (response.status === 200) {
      alert("Company deleted successfully!");
      fetchCompanies(); 
    } else {
      const errorData = await response.json();
      alert("Failed to delete company: " + (errorData.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Delete company error:", err);
    alert("Connection error with server. Please try again.");
  }
};



const handleSaveProduct = async () => {
  if (!prodCategory || !prodBrand) {
    alert("Please fill Product Category and Brand!");
    return;
  }

  try {
    const response = await API.post('/qr/add-product', {
        category: prodCategory.trim().toUpperCase(),
        brand: prodBrand.trim().toUpperCase()
    });

   if (response.status === 200 || response.status === 201) {
      alert("✅ Product Added Successfully!");
      setProdCategory('');
      setProdBrand('');
      fetchProducts(); 
 }
  } catch (err) {
    console.error("Product save error:", err);
    const errorMsg = err.response?.data?.error || "Failed to add product.";
    alert(`❌ Error: ${errorMsg}`);
  }
};


    // Logout
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            navigate('/');
        }
    };

    // Data Fetching
    const fetchCompanies = async () => {
        try {
          const response = await API.get('/qr/get-companies');
        setCompaniesList(response.data); 
    } catch (err) {
        console.error("Error fetching companies:", err);
    }
};

    const fetchProducts = async () => {
        try {
            const response = await API.get('/qr/get-products');
        setProductList(response.data);
    } catch (err) {
        console.error("Error fetching products:", err);
        }
    };

    const fetchRegisteredQRs = async () => {
        try {
          const response = await API.get('/qr/qr-registrations/all');
        if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
        setRegisteredQRs(response.data);
    } catch (err) {
        console.error("Error fetching registered QRs:", err);
    }
};
   const fetchRecycleRequests = async () => {
        try {
            const response = await API.get('/qr/recycle-requests/all');
        if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = response.data;
            
            console.log("Recycle Requests:", data);
            setRecycleRequests(data);

                        const pendingRequests = data.filter(req => req.status === 'Pending');

            pendingRequests.forEach(req => {
                const isAlreadyInList = notifications.some(n => n.requestId === req._id);
                if (!isAlreadyInList) {
                    setNotifications(prev => {
                        if (prev.some(p => p.requestId === req._id)) return prev;

                        return [{
                            id: Date.now() + Math.random(),
                            requestId: req._id,
                            message: {
                              name: req.cuName,
                  address: req.cuAddress || 'No Address Provided',
                  phone: req.cuPhone || 'No Phone',
                  product: req.cuProduct,
                  date: new Date(req.requestedAt).toLocaleDateString(),
                  time: new Date(req.requestedAt).toLocaleTimeString()
                            }
                        }, ...prev];
                    });
                }
            });

            setNotifications(prev => prev.filter(n => 
                pendingRequests.some(r => r._id === n.requestId)
            ));

        } catch (err) {
            console.error("Error fetching recycle requests:", err);
        }
    };

const deleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await API.delete(`/qr/delete-product/${productId}`);
             if (response.status === 200) {
            alert("Product deleted successfully!");
            
            setProductList(productList.filter(p => p._id !== productId));
        } else {
            alert("Failed to delete product.");
        }
    } catch (error) {
        console.error("Delete error:", error);
        const errorMsg = error.response?.data?.error || "An error occurred during deletion.";
        alert("Error: " + errorMsg);
    }
};

const fetchDashboardCounts = async () => {
  try {
    const [compRes, prodRes, recycleRes, regQRRes] = await Promise.all([
      API.get('/qr/get-companies'),
      API.get('/qr/get-products'),
      API.get('/qr/recycle-requests/all'),
      API.get('/qr/qr-registrations/all')
    ]);

    const compData = compRes.data;
    const prodData = prodRes.data;
    const recycleData = recycleRes.data;
    const regQRData = regQRRes.data;
   
    setCounts({
      companies: Array.isArray(compData) ? compData.length : 0,
      products: Array.isArray(prodData) ? prodData.length : 0,
      recycleRequests: Array.isArray(recycleData) ? recycleData.length : 0,
      registeredQRs: Array.isArray(regQRData) ? regQRData.length : 0,
      qrCustomers: Array.isArray(regQRData) ? regQRData.length : 0
    });
  } catch (err) {
    console.error("Dashboard counts fetch failed:", err);
  }
};
    useEffect(() => {
        fetchCompanies();
        fetchProducts();
        fetchRegisteredQRs();
        fetchCompanies();
        fetchDashboardCounts();
        fetchRecycleRequests();

  //  තත්පර 20න් 20ට බැක්ග්‍රවුන්ඩ් එකේ දත්ත අප්ඩේට් කිරීම
        const interval = setInterval(() => {
            fetchRecycleRequests();
        }, 1200000); //

        // Tab change වෙනකොට recycle requests fetch කරන්න
        if (activeTab === 'user_management' && activeSubTab === 'recycling_requests') {
            fetchRecycleRequests();
        }

        // CSS Animations (ඔයාගේ original එක තියෙනවා)
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

            .glass-card { transition: all 0.3s ease; }
            .glass-card:hover { transform: translateY(-5px); border-color: #2ecc71 !important; background: rgba(255, 255, 255, 0.05) !important; }
            .nav-item:hover { background: rgba(46, 204, 113, 0.1) !important; color: #2ecc71 !important; padding-left: 25px !important; }
            
            .actionBtnPrimary:hover {
                background: #2ecc71 !important;
                color: #000 !important;
                border-color: #2ecc71 !important;
                transform: scale(1.02);
                transition: all 0.3s ease;
            }

            .logout-glow:hover {
                box-shadow: 0 0 15px rgba(231, 76, 60, 0.4);
                background: rgba(231, 76, 60, 0.2) !important;
                transition: all 0.3s ease;
            }

            .loading-spinner {
                animation: pulse 1.5s infinite;
                font-weight: bold;
                letter-spacing: 1px;
                color: #2ecc71;
            }
        `;
        document.head.appendChild(styleSheet);
   return () => {
            clearInterval(interval); // <--- අලුත්
            document.head.removeChild(styleSheet);
        };

    }, [activeTab, activeSubTab]);

    // Generate QR Batch (ඔයාගේ original logic එක එහෙමම තියෙනවා)
    const generateQRZip = async () => {
        stopGenerationRef.current = false;
        
        const { comp, brand, prod, qty } = qrDetails;
        const finalQty = parseInt(qty);
        const MAX_PER_ZIP = 1000; 

        
        if (!comp || !brand || !prod || isNaN(finalQty) || finalQty <= 0) {
            alert("Please select Company, Product, Brand and a valid Quantity!");
            return;
        }

        setIsGenerating(true);
        setProgress(0);

        const now = new Date();
        const idDateCode = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
        const displayMFD = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1000;
        canvas.height = 1100;
        const qrImage = new Image();

        try {
            let currentBatch = [];
            let zip = new JSZip();
            let zipCount = 1;
            let processedInCurrentZip = 0;
            let isStoppedManually = false;

            for (let i = 1; i <= finalQty; i++) {
                if (stopGenerationRef.current === true) {
                    isStoppedManually = true;
                    if (processedInCurrentZip > 0) {
                        const partialContent = await zip.generateAsync({ type: "blob" });
                        saveAs(partialContent, `EPR_Stopped_Batch_${idDateCode}_Part${zipCount}.zip`);
                    }
                    break;
                }

                const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
                const fullID = `EPR-${idDateCode}-${i.toString().padStart(4, '0')}-${uniqueSuffix}`;
                const qrValue = `https://www.epr-srilanka.com/verify-product?id=${fullID}`;
                const qrDataURL = await QRCode.toDataURL(qrValue, { width: 800, margin: 4, errorCorrectionLevel: 'H' });
                await new Promise((resolve, reject) => {
                    qrImage.onload = resolve;
                    qrImage.onerror = () => reject(new Error(`Failed to load QR image for ID: ${fullID}`));
                    qrImage.src = qrDataURL;
                });

                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(qrImage, 50, 20);
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.font = "bold 44px Arial";
                ctx.fillText(`ID: ${fullID}`, canvas.width / 2, 940);
                ctx.font = "36px Arial";
                ctx.fillStyle = "#444";
                ctx.fillText(`MFD: ${displayMFD}`, canvas.width / 2, 1000);

          /*  const finalImageBase64 = canvas.toDataURL("image/png");
            const finalImageRaw = finalImageBase64.split(',')[1];

       //   try {
   // await API.post('/qr/save-qr', {
     //   qrId: fullID,
      //  qrData: finalImageBase64
  //  });  

  //          } catch (saveErr) {
        //        console.error(`Backend Save Error for ${fullID}:`, saveErr);
 //           }
                currentBatch.push({
                    qrId: fullID, company: comp, brand: brand,
                    product: prod, serialNumber: fullID, mfd: displayMFD,
                    tempImageData: finalImageRaw
                });

                if (currentBatch.length === 100 || i === finalQty) {
                    try {
                       const dbData = currentBatch.map(({ tempImageData, ...rest }) => ({
    ...rest,
    qrImage: "" 
}));

                        const dbResponse = await API.post('/qr/save-qr-batch', { batch: dbData});

if (dbResponse.status !== 200 && dbResponse.status !== 201) {
            throw new Error("Database saving failed!");
        }
                        currentBatch.forEach(item => {
                            zip.file(`QR_${item.qrId}.png`, item.tempImageData, { base64: true });
                            processedInCurrentZip++;
                        });

                        currentBatch = [];
                    } catch (dbErr) {
                        throw new Error(`DB Error at item ${i}: ${dbErr.message}`);
                    }
                }

                */


     // ... උඩින් QR එක Canvas එකට අඳින ටික එහෙමම තියෙන්න ...

const finalImageBase64 = canvas.toDataURL("image/png");
const finalImageRaw = finalImageBase64.split(',')[1];

// 1. පින්තූරේ Backend එකට යවලා S3 URL එක ලබා ගැනීම
let s3ImageUrl = "";
try {
    const saveRes = await API.post('/qr/save-qr', {
        qrId: fullID,
        qrData: finalImageBase64
    });
    s3ImageUrl = saveRes.data.url; // Backend එකෙන් එන අලුත් S3 ලින්ක් එක
} catch (saveErr) {
    console.error(`Backend Save Error for ${fullID}:`, saveErr);
}

// 2. Batch එකට දත්ත එකතු කිරීම
currentBatch.push({
    qrId: fullID, 
    company: comp, 
    brand: brand,
    product: prod, 
    serialNumber: fullID, 
    mfd: displayMFD,
    qrImage: s3ImageUrl, // දැන් මෙතන S3 ලින්ක් එක තියෙනවා
    tempImageData: finalImageRaw // Zip එක හදන්න මේකත් ඕනේ
});

// 3. 100ක් පිරුණම Database එකට යැවීම
if (currentBatch.length === 100 || i === finalQty) {
    try {
        // Database එකට යවන දත්ත ටික (S3 URL එකත් එක්ක)
        const dbData = currentBatch.map(({ tempImageData, ...rest }) => ({
            ...rest,
            qrImage: rest.qrImage 
        }));

        const dbResponse = await API.post('/qr/save-qr-batch', { batch: dbData});

        if (dbResponse.status !== 200 && dbResponse.status !== 201) {
            throw new Error("Database saving failed!");
        }

        // Zip එකට පින්තූර එකතු කිරීම
        currentBatch.forEach(item => {
            zip.file(`QR_${item.qrId}.png`, item.tempImageData, { base64: true });
            processedInCurrentZip++;
        });

        currentBatch = [];
    } catch (dbErr) {
        throw new Error(`DB Error at item ${i}: ${dbErr.message}`);
    }
}           

                if (processedInCurrentZip === MAX_PER_ZIP || (i === finalQty && processedInCurrentZip > 0)) {
                    const content = await zip.generateAsync({ type: "blob" });
                    saveAs(content, `EPR_Batch_${idDateCode}_${comp}_Part${zipCount}.zip`);

                    zip = new JSZip();
                    zipCount++;
                    processedInCurrentZip = 0;
                }

                if (i % 50 === 0 || i === finalQty) {
                    setProgress(Math.round((i / finalQty) * 100));
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }

            if (isStoppedManually) {
                alert("Generation was manually stopped!");
            } else {
                alert(`Successfully generated ${finalQty} QR codes!`);
            }

        } catch (err) {
            console.error("QR Error:", err);
            alert("Error: " + err.message);
        } finally {
            qrImage.onload = null;
            qrImage.onerror = null;
            setIsGenerating(false);
            setProgress(0);
            stopGenerationRef.current = false;
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={{ ...styles.sidebar, animation: 'slideInLeft 0.8s ease-out' }}>
                <div style={styles.logoWrapper}>
                    <div style={styles.logoCircle}>
                        <img src={logo} alt="Logo" style={styles.logoImg} />
                    </div>
                </div>
                <h2 style={styles.logoTitle}>EPR SYSTEM</h2>
                <nav style={styles.nav}>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/dashboard')}>Summary</button>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/user-management')}>User Management</button>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/co-partner')}>Co-Partner</button>
                    <button className="nav-item" style={styles.navBtn} onClick={() => navigate('/admin-orders')}>Orders</button>
                    <button style={styles.navBtnActive}>QR Management</button>
                </nav>
                <button onClick={handleLogout} className="logout-glow" style={styles.logoutBtn}>Logout System</button>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                <div style={{ ...styles.contentWrapper, animation: 'fadeIn 1.2s ease-out' }}>
                    <h1 style={styles.pageTitle}>QR Production Management</h1>



{/* --- Admin Notification Bell (Final Corrected Version) ---..................................................................... */}

<div style={{ position: 'absolute', right: '40px', top: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', zIndex: 10000 }}>
  <div onClick={() => setShowNotifications(!showNotifications)} style={{ fontSize: '28px', position: 'relative' }}>
    🔔
    {notifications.length > 0 && (
      <span style={{
        position: 'absolute', top: '-5px', right: '-5px',
        background: '#e74c3c', color: 'white', borderRadius: '50%',
        padding: '2px 7px', fontSize: '12px', fontWeight: 'bold',
        border: '2px solid #1a1a1a'
      }}>
        {notifications.length}
      </span>
    )}
  </div>

  {showNotifications && (
    <div style={{
      position: 'absolute', top: '50px', right: '0', width: '310px',
      background: '#1a1a1a', border: '1px solid #2ecc71', borderRadius: '15px',
      padding: '15px', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
      maxHeight: '450px', overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h4 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>Pending Requests</h4>
        <span style={{ color: '#888', cursor: 'pointer', fontSize: '18px' }} onClick={() => setShowNotifications(false)}>✖</span>
      </div>
      
      {notifications.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', padding: '20px' }}>No new requests</p>
      ) : (
        notifications.map((n, index) => {
          const data = n.message || n; 
          
          return (
            <div key={index} style={{ 
              marginBottom: '15px', padding: '12px', background: 'rgba(46, 204, 113, 0.05)', 
              borderRadius: '12px', borderLeft: '4px solid #2ecc71', border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {/* නම - cuName හෝ name */}
              <div style={{ color: '#2ecc71', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
                👤 {data.cuName || data.name || 'Customer'}
              </div>

              {/* ලිපිනය - cuAddress හෝ address */}
              <div style={{ color: '#ccc', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ marginRight: '5px' }}>📍</span>
                <span>{data.cuAddress || data.address || 'Address Not Provided'}</span>
              </div>

              {/* දුරකථනය - cuPhone හෝ phone */}
              <div style={{ color: '#ccc', fontSize: '12px', marginBottom: '4px' }}>
                📞 {data.cuPhone || data.phone || 'No Contact Info'}
              </div>

              {/* භාණ්ඩය - cuProduct හෝ product */}
              <div style={{ color: '#fff', fontSize: '13px', marginTop: '8px', padding: '5px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}>
                📦 Item: <span style={{ color: '#2ecc71' }}>{data.cuProduct || data.product || 'N/A'}</span>
              </div>

              {/* වෙලාව සහ දිනය */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: '#555', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px' }}>
                <span>📅 {data.requestedAt ? new Date(data.requestedAt).toLocaleDateString() : (data.date || 'Today')}</span>
                <span>⏰ {data.requestedAt ? new Date(data.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (data.time || 'Now')}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  )}
</div>
{/* --- Admin Notification Bell (Final Corrected Version) ---..................................................................... */}

<p style={styles.subTitle}>Configure entities and generate secure batch QR identification</p>

            <div style={styles.navBar}>
                        <button onClick={() => setActiveTab('company')} style={activeTab === 'company' ? styles.activeNavBtn : styles.navBtn}>Add Company</button>
                        <button onClick={() => setActiveTab('product')} style={activeTab === 'product' ? styles.activeNavBtn : styles.navBtn}>Add Product</button>
                        <button onClick={() => setActiveTab('batch')} style={activeTab === 'batch' ? styles.activeNavBtn : styles.navBtn}>Batch QR Generation</button>
                        <button onClick={() => setActiveTab('summary')} style={activeTab === 'summary' ? styles.activeNavBtn : styles.navBtn}>Direct Collections</button>
                        <button onClick={() => setActiveTab('user_management')} style={activeTab === 'user_management' ? styles.activeNavBtn : styles.navBtn}>QR User Management</button>
                    </div>

                    <div style={{ ...styles.cardHolder, animation: 'slideInUp 0.8s ease-out' }}>
                        {activeTab === 'company' && (
                            <div className="glass-card" style={styles.card}>
                                <h3 style={styles.cardTitle}>Add Company</h3>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Full Company Name</label>
                                    <input type="text" value={qrcompanyName} onChange={(e) => setQrCompanyName(e.target.value)} placeholder="e.g. ECO PLANT SOLUTIONS" style={{ ...styles.input, textTransform: 'uppercase' }} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Email Address</label>
                                    <input type="email" value={qrcompanyEmail} onChange={(e) => setQrCompanyEmail(e.target.value)} placeholder="company@gmail.com" style={styles.input} />
                                </div>
                                <button onClick={handleRegisterCompany} style={styles.actionBtnPrimary}>Register Company</button>
                            </div>
                        )}

                        {activeTab === 'product' && (
                            <div className="glass-card" style={styles.card}>
                                <h3 style={styles.cardTitle}>Add Product</h3>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Product Category</label>
                                    <input type="text" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} placeholder="e.g. PHONE" style={{ ...styles.input, textTransform: 'uppercase' }} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Brand Identity</label>
                                    <input type="text" value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} placeholder="e.g. APPLE" style={{ ...styles.input, textTransform: 'uppercase' }} />
                                </div>
                                <button onClick={handleSaveProduct} style={styles.actionBtnPrimary}>Save Product</button>
                            </div>
                        )}

                        {activeTab === 'batch' && (
                            <div className="glass-card" style={{ ...styles.card, border: '1px solid rgba(46, 204, 113, 0.3)' }}>
                                <h3 style={styles.cardTitle}>Batch QR Generation</h3>
                                <div style={styles.formGrid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Select Company</label>
                                        <input list="companies-list-options" type="text" placeholder="Type or select company" style={styles.input} onChange={(e) => setQrDetails({ ...qrDetails, comp: e.target.value.toUpperCase() })} />
                                        <datalist id="companies-list-options">
                                            {[...new Set(companiesList.map(c => c.name.toUpperCase()))].map((name, idx) => (<option key={idx} value={name} />))}
                                        </datalist>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Select Product</label>
                                        <input list="products-list-options" autoComplete="off" type="text" placeholder="Type or select product" style={styles.input} onChange={(e) => { const selectedProd = e.target.value.toUpperCase(); setQrDetails({ ...qrDetails, prod: selectedProd, brand: '' }); } } />
                                        <datalist id="products-list-options">
                                            {[...new Set(productList.map(p => p.category.toUpperCase()))].map((category, idx) => (<option key={idx} value={category} />))}
                                        </datalist>
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Select Brand</label>
                                        <input
                                            list="brands-list-options"
                                            type="text"
                                            value={qrDetails.brand}
                                            placeholder={qrDetails.prod ? "Type or Select Brand" : "⚠️ Select Product First"}
                                            style={{
                                                ...styles.input,
                                                cursor: !qrDetails.prod ? 'not-allowed' : 'text',
                                                opacity: !qrDetails.prod ? 0.6 : 1,
                                                border: !qrDetails.prod ? '1px solid rgba(255, 0, 0, 0.3)' : styles.input.border
                                            }}
                                            onClick={() => {
                                                if (!qrDetails.prod) {
                                                    alert("Please select a Product Category first! 🛑");
                                                }
                                            }}
                                            disabled={!qrDetails.prod}
                                            autoComplete="off"
                                            onChange={(e) => setQrDetails({ ...qrDetails, brand: e.target.value.toUpperCase() })}
                                        />
                                        <datalist id="brands-list-options">
                                            {productList
                                                .filter(p => p.category.toUpperCase() === (qrDetails.prod || "").toUpperCase())
                                                .map((p, idx) => (
                                                    <option key={idx} value={p.brand.toUpperCase()} />
                                                ))}
                                        </datalist>
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Quantity</label>
                                        <input type="number" style={styles.input} onChange={(e) => setQrDetails({ ...qrDetails, qty: parseInt(e.target.value) })} />
                                    </div>
                                </div>

                                {isGenerating ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm("Stop generating?")) {
                                                stopGenerationRef.current = true;
                                            }
                                        }}
                                        style={{
                                            ...styles.generateBtn,
                                            background: 'linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%)',
                                            boxShadow: '0 8px 20px rgba(255, 75, 43, 0.3)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🛑 Stop Generating ({progress}%)
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={generateQRZip}
                                        style={styles.generateBtn}
                                    >
                                        Generate & Download Batch ({qrDetails.qty || 0})
                                    </button>
                                )}
                            </div>
                        )}

            {activeTab === 'summary' && (
    <DirectCollections />
)}

                        {activeTab === 'user_management' && (
                            <div className="glass-card" style={styles.card}>
                                <h3 style={styles.cardTitle}>QR User Management</h3>
                                  <div style={styles.subNavBar}>
  <button 
    onClick={() => setActiveSubTab('created_companies')} 
    style={activeSubTab === 'created_companies' ? styles.activeSubNavBtn : styles.subNavBtn}
  >
    Created Companies ({counts.companies})
  </button>

  <button 
    onClick={() => setActiveSubTab('created_products')} 
    style={activeSubTab === 'created_products' ? styles.activeSubNavBtn : styles.subNavBtn}
  >
    Created Products ({counts.products})
  </button>

  <button 
    onClick={() => setActiveSubTab('recycling_requests')} 
    style={activeSubTab === 'recycling_requests' ? styles.activeSubNavBtn : styles.subNavBtn}
  >
    Recycling Requests ({counts.recycleRequests})
  </button>

  <button 
    onClick={() => setActiveSubTab('registered_qr')} 
    style={activeSubTab === 'registered_qr' ? styles.activeSubNavBtn : styles.subNavBtn}
  >
    Registered QR ({counts.registeredQRs})
  </button> 

  <button 
    onClick={() => setActiveSubTab('qr_customers')} 
    style={activeSubTab === 'qr_customers' ? styles.activeSubNavBtn : styles.subNavBtn}
>
    QR Master Audit Log
</button>
      </div>
           <div style={{ marginTop: '30px' }}>


 {/*....................... Created Companies Tab.......................................................................... */}
                   {activeSubTab === 'created_companies' && (
    <>
        {/* --- Search Bar Section --- */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <input
                    type="text"
                    placeholder="🔍 Search by company name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 15px 12px 40px',
                        borderRadius: '12px',
                        border: '1px solid rgba(46, 204, 113, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: '0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2ecc71'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(46, 204, 113, 0.2)'}
                />
                <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                </span>
            </div>
        </div>

        {/* --- Table Section --- */}
        <table style={styles.table}>
            <thead>
                <tr style={styles.tableHead}>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left', width: '60px' }}>ID</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left', width: '130px' }}>Reg ID</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Company Name</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {companiesList.length > 0 ? (
                    (() => {
                        // මෙතනදී තමයි සර්ච් එකට අනුව ලිස්ට් එක ෆිල්ටර් කරන්නේ
                        const filtered = companiesList.filter(comp => 
                            comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            comp.email.toLowerCase().includes(searchTerm.toLowerCase())
                        );

                        if (filtered.length === 0) {
                            return <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No matches found for "{searchTerm}"</td></tr>;
                        }

                        return filtered.map((comp, index) => (
                            <tr key={comp._id || comp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '15px', color: '#666', fontWeight: 'bold' }}>{String(index + 1).padStart(2, '0')}</td>
                                <td style={{ padding: '15px', color: '#2ecc71', fontSize: '13px', fontWeight: '600' }}> {comp.registrationId || "N/A"}</td>
                                <td style={{ padding: '15px', color: '#ccc' }}>{comp.name}</td>
                                <td style={{ padding: '15px', color: '#ccc' }}>{comp.email}</td>
                                <td style={{ padding: '15px' }}>
                                    <button 
                                        onClick={() => deleteCompany(comp._id || comp.id)} 
                                        style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}
                                        onMouseOver={(e) => e.target.style.background = '#ff3333'}
                                        onMouseOut={(e) => e.target.style.background = '#ff4d4d'}
                                    >Delete</button>
                                </td>
                            </tr>
                        ));
                    })()
                ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#555' }}>No companies registered yet.</td></tr>
                )}
            </tbody>
        </table>
    </>
)}

                                   
 {/* ...................Created Products Tab ..........................................................................*/}
                                  {activeSubTab === 'created_products' && (
    <>
        {/* --- Product Search Bar --- */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <input
                    type="text"
                    placeholder="🔍 Search by product name or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 15px 12px 40px',
                        borderRadius: '12px',
                        border: '1px solid rgba(46, 204, 113, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: '0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2ecc71'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(46, 204, 113, 0.2)'}
                />
            </div>
        </div>

        {/* --- Products Table --- */}
        <table style={styles.table}>
            <thead>
                <tr style={styles.tableHead}>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left', width: '60px' }}>ID</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Brand</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {productList.length > 0 ? (
                    (() => {
                        // Product සහ Brand දෙකෙන්ම ෆිල්ටර් කරන ලොජික් එක
                        const filteredProducts = productList.filter(prod => 
                            (prod.category && prod.category.toLowerCase().includes(searchTerm.toLowerCase())) || 
                            (prod.brand && prod.brand.toLowerCase().includes(searchTerm.toLowerCase()))
                        );

                        if (filteredProducts.length === 0) {
                            return <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No products match "{searchTerm}"</td></tr>;
                        }

                        return filteredProducts.map((prod, index) => (
                            <tr key={prod._id || prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '15px', color: '#666', fontWeight: 'bold' }}>{String(index + 1).padStart(2, '0')}</td>
                                <td style={{ padding: '15px', color: '#ccc' }}>{prod.category}</td>
                                <td style={{ padding: '15px', color: '#ccc' }}>{prod.brand}</td>
                                <td style={{ padding: '15px' }}>
                                    <button 
                                        onClick={() => deleteProduct(prod._id || prod.id)} 
                                        style={{ 
                                            background: '#ff4d4d', 
                                            color: '#fff', 
                                            border: 'none', 
                                            padding: '8px 15px', 
                                            borderRadius: '8px', 
                                            cursor: 'pointer',
                                            transition: '0.2s' 
                                        }}
                                        onMouseOver={(e) => e.target.style.background = '#ff3333'}
                                        onMouseOut={(e) => e.target.style.background = '#ff4d4d'}
                                    >Delete</button>
                                </td>
                            </tr>
                        ));
                    })()
                ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#555' }}>No products found.</td></tr>
                )}
            </tbody>
        </table>
    </>
)}
 {/* ............Registered QR Tab ...........................................................................................*/}
  {activeSubTab === 'registered_qr' && (
    <>
        {/* --- 🔍 Search Bar Section --- */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <input
                    type="text"
                    placeholder="🔍 Search by Customer Name or QR ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 15px 12px 40px',
                        borderRadius: '12px',
                        border: '1px solid rgba(46, 204, 113, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: '0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2ecc71'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(46, 204, 113, 0.2)'}
                />
            </div>
        </div>

{/* ---අලුත් Advanced Filter Bar එක  --- */}
<div style={{ marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
    <input 
        type="text" placeholder="🔍 Filter by Company..." 
        onChange={(e) => setFilterComp(e.target.value)} 
        style={{...styles.input, width: '200px', padding: '10px'}} 
    />
    <input 
        type="text" placeholder="🔍 Filter by Brand..." 
        onChange={(e) => setFilterBrand(e.target.value)} 
        style={{...styles.input, width: '200px', padding: '10px'}} 
    />
    <input 
        type="text" placeholder="🔍 Filter by Product..." 
        onChange={(e) => setFilterProd(e.target.value)} 
        style={{...styles.input, width: '200px', padding: '10px'}} 
    />
</div>


        {/* --- 📊 Table Section --- */}
        <table style={styles.table}>
            <thead>
                <tr style={styles.tableHead}>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>QR ID</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Date And Time</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Customer Name</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Address</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Company</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '15px', color: '#2ecc71', textAlign: 'left' }}>Brand</th>
                </tr>
            </thead>
         <tbody>
            {registeredQRs.length > 0 ? (
                (() => {
                    // 1. මේ ලොජික් එක තමයි දැන් අලුතින්ම දාන්නේ
                    const filteredData = registeredQRs.filter(reg => {
                        const matchComp = (reg.cuCompany || "").toLowerCase().includes(filterComp.toLowerCase());
                        const matchBrand = (reg.cuBrand || "").toLowerCase().includes(filterBrand.toLowerCase());
                        const matchProd = (reg.cuProduct || "").toLowerCase().includes(filterProd.toLowerCase());
                        const matchSearch = (reg.cuName || "").toLowerCase().includes(searchTerm.toLowerCase());

                        return matchComp && matchBrand && matchProd && matchSearch;
                    });

                    // 2. මෙතන colSpan="8" කරගන්න (Column 8ක් තියෙන නිසා)
                    if (filteredData.length === 0) {
                        return <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No results found!</td></tr>;
                    }

                    // 3. දැන් මේ filteredData එක පාවිච්චි කරන්න
                    return filteredData.map((reg) => (
                        <tr key={reg._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '15px', color: '#2ecc71', fontWeight: 'bold' }}>{reg.cuSerial || reg.qrId || "N/A"}</td>
                            <td style={{ padding: '15px', color: '#ccc' }}>
                                {reg.cuDate ? (
                                    <>
                                        {new Date(reg.cuDate).toLocaleDateString()}
                                        <br />
                                        <span style={{ fontSize: '11px', color: '#2ecc71', opacity: 0.8 }}>
                                            {new Date(reg.cuDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </>
                                ) : "No Date"}
                            </td>
                            <td style={{ padding: '15px', color: '#fff' }}>{reg.cuName || "N/A"}</td>
                            <td style={{ padding: '15px', color: '#ccc' }}>{reg.cuPhone || "N/A"}</td>
                            <td style={{ padding: '15px', color: '#ccc', fontSize: '12px' }}>{reg.cuAddress || "N/A"}</td>
                            <td style={{ padding: '15px', color: '#fff' }}>{reg.cuCompany || "N/A"}</td>
                            <td style={{ padding: '15px', color: '#ccc' }}>{reg.cuProduct || 'N/A'}</td>
                            <td style={{ padding: '15px', color: '#ccc' }}>{reg.cuBrand || 'N/A'}</td>
                        </tr>
                    ));
                })()
            ) : (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No registered customers found.</td></tr>
            )}
           </tbody>
        </table>
    </>
)}

 {/* ..................................................... recycling_requests...............................................*/}

{activeSubTab === 'recycling_requests' && (
    <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease-in' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
           <h3 
    onClick={() => setFilterStatus('All')}
    style={{ 
        color: filterStatus === 'All' ? '#2ecc71' : '#fff', 
        margin: 0, 
        fontSize: '22px', 
        fontWeight: '600',
        cursor: 'pointer', 
        transition: '0.3s'
    }}
>
    Recycle Requests Management {filterStatus !== 'All' && <span style={{fontSize: '14px', color: '#888', marginLeft: '10px'}}>({filterStatus} View)</span>}
</h3>
            <span style={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', border: '1px solid rgba(46,204,113,0.2)' }}>
                Total: {recycleRequests.length}
            </span>
        </div>
{/* --- 🔍 Search Bar Section --- */}
        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <input
                    type="text"
                    placeholder="🔍 Search by QR ID or Collector Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 15px 12px 40px',
                        borderRadius: '12px',
                        border: '1px solid rgba(46, 204, 113, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: '0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2ecc71'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(46, 204, 113, 0.2)'}
                />
            </div>
        </div>


        {/* Status Statistics Breakdown */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
            {/* Pending Card */}
            <div 
                onClick={() => setFilterStatus(filterStatus === 'Pending' ? 'All' : 'Pending')} 
                style={{ 
                    background: filterStatus === 'Pending' ? 'rgba(241,196,15,0.2)' : 'rgba(241,196,15,0.1)', 
                    padding: '15px 25px', borderRadius: '15px', border: filterStatus === 'Pending' ? '2px solid #f1c40f' : '1px solid rgba(241,196,15,0.3)', 
                    minWidth: '140px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', cursor: 'pointer', transition: '0.3s'
                }}
            >
                <div style={{ fontSize: '12px', color: '#f1c40f', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f1c40f' }}>
                    {recycleRequests.filter(r => (r.status || 'Pending') === 'Pending').length}
                </div>
            </div>

            {/* Collected Card */}
            <div 
                onClick={() => setFilterStatus(filterStatus === 'Collected' ? 'All' : 'Collected')} 
                style={{ 
                    background: filterStatus === 'Collected' ? 'rgba(46,204,113,0.2)' : 'rgba(46,204,113,0.1)', 
                    padding: '15px 25px', borderRadius: '15px', border: filterStatus === 'Collected' ? '2px solid #2ecc71' : '1px solid rgba(46,204,113,0.3)', 
                    minWidth: '140px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', cursor: 'pointer', transition: '0.3s'
                }}
            >
                <div style={{ fontSize: '12px', color: '#2ecc71', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Collected</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#2ecc71' }}>
                    {recycleRequests.filter(r => r.status === 'Collected').length}
                </div>
            </div>

            {/* ♻️ Recycled (Completed) Card - අලුතින් එකතු කළ කොටස */}
            <div 
                onClick={() => setFilterStatus(filterStatus === 'Recycled' ? 'All' : 'Recycled')} 
                style={{ 
                    background: filterStatus === 'Recycled' ? 'rgba(52,152,219,0.2)' : 'rgba(52,152,219,0.1)', 
                    padding: '15px 25px', borderRadius: '15px', border: filterStatus === 'Recycled' ? '2px solid #3498db' : '1px solid rgba(52,152,219,0.3)', 
                    minWidth: '140px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', cursor: 'pointer', transition: '0.3s'
                }}
            >
                <div style={{ fontSize: '12px', color: '#3498db', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recycled</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#3498db' }}>
                    {recycleRequests.filter(r => r.status === 'Recycled').length}
                </div>
            </div>
        </div>

        {/* Professional Data Table */}
        <div style={{ background: '#1a1a1a', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                <thead>
                    <tr style={{ background: 'rgba(46,204,113,0.1)', borderBottom: '2px solid #2ecc71' }}>
                        <th style={{ padding: '18px 15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>QR & Product</th>
                        <th style={{ padding: '18px 15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '18px 15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Registered</th>
                        <th style={{ padding: '18px 15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Requested</th>
                        <th style={{ padding: '18px 15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Collected</th>
                        <th style={{ padding: '18px 15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Collected By</th>
                        <th style={{ padding: '18px 15px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                  {recycleRequests.length > 0 ? (
        (() => {
            const filteredItems = recycleRequests
                .filter(req => filterStatus === 'All' ? true : (req.status || 'Pending') === filterStatus)
                .filter(req => {
                    const term = searchTerm.toLowerCase();
                    const qr = (req.qrId || "").toLowerCase();
                    const collector = (req.collectedBy || "").toLowerCase();
                    return qr.includes(term) || collector.includes(term);
                });

            // සර්ච් එකට මොකුත් නැත්නම් පෙන්වන පණිවිඩය
            if (filteredItems.length === 0) {
                return (
                    <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#666', fontSize: '15px' }}>
                            No matches found for "{searchTerm}"
                        </td>
                    </tr>
                );
            }

            // සර්ච් එකට අහුවෙන දත්ත ටික Map කරනවා
            return filteredItems.map((req) => (
                <tr key={req._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold', color: '#2ecc71', fontSize: '14px' }}>{req.qrId}</div>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>{req.cuProduct || 'General Product'}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                        <span style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
                            background: (req.status || 'Pending') === 'Pending' ? 'rgba(241,196,15,0.15)' : 'rgba(46,204,113,0.15)',
                            color: (req.status || 'Pending') === 'Pending' ? '#f1c40f' : '#2ecc71',
                            border: `1px solid ${(req.status || 'Pending') === 'Pending' ? '#f1c40f33' : '#2ecc7133'}`
                        }}>
                            {req.status || 'Pending'}
                        </span>
                    </td>
                    <td style={{ padding: '15px', fontSize: '13px', color: '#aaa' }}>
                        {req.registeredAt ? new Date(req.registeredAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '15px', fontSize: '13px', color: '#ccc' }}>
                        {new Date(req.requestedAt).toLocaleString([], { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '15px', fontSize: '13px' }}>
                        {req.collectedAt ? (
                            <span style={{ color: '#2ecc71', fontWeight: '500' }}>
                                {new Date(req.collectedAt).toLocaleString([], { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        ) : (
                            <span style={{ color: '#555', fontStyle: 'italic' }}>Waiting...</span>
                        )}
                    </td>
                  <td style={{ padding: '15px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{
            fontSize: '13px',
            color: (req.status === 'Collected' || req.status === 'Recycled') ? '#fff' : '#e74c3c',
            fontWeight: (req.status === 'Collected' || req.status === 'Recycled') ? '600' : 'normal'
        }}>
            {(req.status === 'Collected' || req.status === 'Recycled') ? (req.collectedBy || "Name Missing!") : "Not Collected Yet"}
        </span>
        {(req.status === 'Collected' || req.status === 'Recycled') && (
            <span style={{ fontSize: '11px', color: '#2ecc71', fontWeight: 'bold' }}>
                ID: {req.cpId || 'N/A'}
            </span>
        )}
    </div>
</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button 
                            onClick={() => setSelectedRequest(req)}
                            style={{ background: 'transparent', color: '#3498db', border: '1px solid #3498db', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: '0.3s' }}
                            onMouseEnter={(e) => {e.target.style.background = '#3498db'; e.target.style.color = '#fff'}}
                            onMouseLeave={(e) => {e.target.style.background = 'transparent'; e.target.style.color = '#3498db'}}
                        >
                            View Details
                        </button>
                    </td>
                </tr>
            ));
        })()
    ) : (
        <tr>
            <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#666', fontSize: '15px' }}>
                No recycle requests found at the moment.
            </td>
        </tr>
               )}
                </tbody>
            </table>
        </div>
     {/* Professional View More Modal */}
{selectedRequest && (
    <div style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.9)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000,
        padding: '20px' 
    }}>
        <div style={{ 
            background: '#0a0a0a', 
            borderRadius: '28px', 
            maxWidth: '600px', 
            width: '100%', 
            maxHeight: '92vh', 
            overflowY: 'auto', 
            border: '1px solid rgba(46,204,113,0.2)', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
            position: 'relative'
        }}>
            
            {/* Header: QR Section with More Space */}
            <div style={{ 
                background: '#fff', 
                padding: '40px 20px', 
                textAlign: 'center', 
                borderRadius: '28px 28px 0 0',
                borderBottom: '4px solid #2ecc71' 
            }}>
                <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
                    Asset Verification Identity
                </div>

                <img 
                    src={selectedRequest.qrImage || 'https://cdn-icons-png.flaticon.com/512/7141/7141731.png'}
                    alt="QR Code" 
                    style={{ 
                        width: '220px', 
                        height: '220px', 
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto',
                        padding: '15px',
                        background: '#fff',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))'
                    }}
                    onError={(e) => {
                        e.target.onerror = null; 
                       e.target.src = 'https://cdn-icons-png.flaticon.com/512/7141/7141731.png';
                    }}
                />

                <div style={{ color: '#000', fontWeight: '900', fontSize: '28px', marginTop: '20px', letterSpacing: '1.5px' }}>
                    {selectedRequest.qrId}
                </div>
            </div>

            {/* Content Area with Wide Padding */}
            <div style={{ padding: '40px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    
                    {/* Company Section */}
                    <div style={{ 
                        gridColumn: 'span 2', 
                        background: 'linear-gradient(135deg, rgba(46,204,113,0.15) 0%, rgba(46,204,113,0.05) 100%)', 
                        padding: '25px', 
                        borderRadius: '20px', 
                        border: '1px solid rgba(46,204,113,0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '13px', color: '#2ecc71', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', fontWeight: '600' }}>
                            Associated Entity 
                        </div>
                        <div style={{ color: '#fff', fontSize: '26px', fontWeight: '800' }}>
                            {selectedRequest.cuCompany || 'N/A'}
                        </div>
                    </div>

                    {/* Customer Insights - Wide Look */}
                    <div style={{ 
                        gridColumn: 'span 2', 
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '25px', 
                        borderRadius: '20px', 
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '15px', fontWeight: 'bold' }}>Customer Information</div>
                     
                            <div>
                                <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>{selectedRequest.cuName || 'N/A'}</div>
                                <div style={{ color: '#2ecc71', fontSize: '16px', marginTop: '5px' }}>📞 {selectedRequest.cuPhone || 'N/A'}</div>
                            </div>
                            <div style={{ color: '#bbb', fontSize: '14px', borderLeft: '1px solid #333', paddingLeft: '20px' }}>
                                {selectedRequest.cuAddress || 'Address not provided'}
                            </div>
                        </div>
                    </div>

                    {/* Product & Brand Cards */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Product Category</div>
                        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>{selectedRequest.cuProduct || 'N/A'}</div>
                    </div>
                    
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Brand Asset</div>
                        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>{selectedRequest.cuBrand || 'N/A'}</div>
                    </div>

                    {/* Footer Timeline */}
                    <div style={{ 
                        gridColumn: 'span 2', 
                        background: 'rgba(0,0,0,0.3)', 
                        padding: '20px', 
                        borderRadius: '16px',
                        border: '1px dashed rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ color: '#555' }}>Log Created</span>
                            <span style={{ color: '#aaa' }}>{new Date(selectedRequest.requestedAt).toLocaleString()}</span>
                        </div>
                        {selectedRequest.collectedAt && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #222', paddingTop: '10px' }}>
                                <span style={{ color: '#2ecc71' }}>Success Pickup</span>
                                <span style={{ color: '#2ecc71' }}>{new Date(selectedRequest.collectedAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => setSelectedRequest(null)}
                    style={{ 
                        width: '100%', 
                        marginTop: '40px', 
                        padding: '18px', 
                        background: 'linear-gradient(90deg, #2ecc71, #27ae60)', 
                        color: '#000', 
                        border: 'none', 
                        borderRadius: '14px', 
                        fontWeight: '800', 
                        fontSize: '16px', 
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(46,204,113,0.2)'
                    }} >  CLOSE RECORD
                    </button> 
               </div>
           </div>
         )}
    </div>
)}
          {activeSubTab === 'qr_customers' && (
             <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s ease-in' }}>
                <QRReportView allData={qrBatches} />
           </div>
          )}
               </div>
            </div> 
           )}
             </div>  
        </div>  
    </div>  
</div>
    );
}

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        background: `linear-gradient(rgba(0, 0, 0, 0.48), hsla(0, 0%, 0%, 0.48)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#fff',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden'
    },
   sidebar: { 
    width: '320px', 
    position: 'fixed', 
    top: 0,
    left: 0,
    bottom: 0,
    background: 'rgba(10, 10, 10, 0.6)',
    backdropFilter: 'blur(25px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
    display: 'flex',
    flexDirection: 'column',
    padding: '50px 25px',
    zIndex: 100 
},

    mainContent: {
        flex: 1,
        marginLeft: '320px',
        padding: '60px 40px',
        minHeight: '100vh',
        boxSizing: 'border-box'
    },
    contentWrapper: {
        maxWidth: '1200px',
        margin: '0 auto'
    },
    cardHolder: {
        width: '100%',
        display: 'block',
        animation: 'slideInUp 0.8s ease-out'
    },
    logoWrapper: { marginBottom: '20px' },
    logoCircle: {
        width: '100px',
        height: '100px',
        background: '#fff',
        borderRadius: '24px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
        overflow: 'hidden'
    },
    logoImg: { width: '85%' },
    logoTitle: {
        color: '#2ecc71',
        textAlign: 'center',
        margin: '20px 0 50px',
        fontSize: '16px',
        fontWeight: '900',
        letterSpacing: '4px'
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flex: 1
    },
    navBtn: {
        padding: '16px 20px',
        background: 'transparent',
        border: 'none',
        color: '#bbb',
        textAlign: 'left',
        cursor: 'pointer',
        borderRadius: '15px',
        transition: 'all 0.4s',
        fontSize: '15px'
    },
    navBtnActive: {
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        border: 'none',
        color: '#fff',
        textAlign: 'left',
        borderRadius: '15px',
        fontWeight: '700',
        boxShadow: '0 10px 25px rgba(46, 204, 113, 0.3)'
    },
    logoutBtn: {
        padding: '15px',
        border: '1px solid rgba(231, 76, 60, 0.4)',
        color: '#e74c3c',
        background: 'rgba(231, 76, 60, 0.05)',
        borderRadius: '15px',
        cursor: 'pointer',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        transition: 'all 0.3s',
        marginTop: 'auto'
    },
    pageTitle: { textAlign: 'center', fontSize: '45px', fontWeight: '900', background: 'linear-gradient(to right, #fff, #2ecc71)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' },
    subTitle: { textAlign: 'center', color: '#bbb', marginBottom: '40px' },
    navBar: { display: 'flex', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '10px', borderRadius: '20px', maxWidth: '1100px', margin: '0 auto 50px', border: '1px solid rgba(255,255,255,0.1)' },
    activeNavBtn: { flex: 1, background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', color: '#000', padding: '15px', borderRadius: '15px', fontWeight: '800', boxShadow: '0 10px 20px rgba(46,204,113,0.3)' },
    subNavBar: { display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '6px', borderRadius: '15px', marginTop: '10px', gap: '10px' },
    subNavBtn: { flex: 1, background: 'transparent', color: '#666', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '10px', fontSize: '13px', transition: '0.3s' },
    activeSubNavBtn: { flex: 1, background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '10px', borderRadius: '10px', border: '1px solid rgba(46, 204, 113, 0.3)', fontWeight: 'bold' },
    card: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(15px)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)' },
    cardTitle: { fontSize: '24px', color: '#2ecc71', marginBottom: '30px' },
    inputGroup: { marginBottom: '25px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' },
    label: { display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '10px', paddingLeft: '5px' },
    input: { width: '100%', padding: '16px', borderRadius: '15px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    generateBtn: { width: '100%', padding: '20px', borderRadius: '20px', background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
    actionBtnPrimary: { width: '100%', padding: '16px', borderRadius: '15px', background: '#111', color: '#fff', border: '1px solid #444', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { color: '#666', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' },

    // අලුතින් එකතු කළ styles
    popupOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    popupCard: {
        background: '#141414',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #2ecc71',
        boxShadow: '0 10px 30px rgba(0,0,0,0.7)'
    },
    confirmBtn: {
        padding: '12px 25px',
        background: '#2ecc71',
        border: 'none',
        borderRadius: '8px',
        color: '#000',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: '0.3s'
    },
    cancelBtn: {
        padding: '12px 25px',
        background: '#e74c3c',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        cursor: 'pointer',
        transition: '0.3s'
    },
    closeBtn: {
        marginTop: '30px',
        padding: '12px 30px',
        background: '#2ecc71',
        border: 'none',
        borderRadius: '8px',
        color: '#000',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    qrImage: {
        maxWidth: '250px',
        border: '2px solid #2ecc71',
        borderRadius: '8px'
    },
    bellWrapper: {
        background: 'rgba(255,255,255,0.05)',
        padding: '8px 12px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease'
    },
    badge: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        background: '#e74c3c',
        color: '#fff',
        fontSize: '10px',
        minWidth: '18px',
        height: '18px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        boxShadow: '0 0 10px rgba(231, 76, 60, 0.5)'
    },
    notifDropdown: {
        position: 'absolute',
        top: '55px',
        left: '0', 
        background: '#111',
        border: '1px solid #333',
        width: '280px',
        padding: '15px',
        borderRadius: '15px',
        zIndex: 10006,
        boxShadow: '0 15px 35px rgba(0,0,0,0.8)',
        animation: 'fadeIn 0.3s ease'
    },
    notifItem: {
        padding: '10px 0',
        borderBottom: '1px solid #222'
    },
    notifDropdown: {
    position: 'absolute',
    top: '55px',
    right: '0px',      
    left: 'auto',     
    background: '#111',
    border: '1px solid #333',
    width: '280px',
    padding: '15px',
    borderRadius: '15px',
    zIndex: 10006,
    boxShadow: '0 15px 35px rgba(0,0,0,0.8)',
    animation: 'fadeIn 0.3s ease'
},

notifCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '10px',
        borderLeft: '4px solid #2ecc71',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
    notifName: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#fff',
    },
    notifTime: {
        fontSize: '10px',
        color: '#888',
        background: 'rgba(255,255,255,0.08)',
        padding: '2px 5px',
        borderRadius: '4px'
    },
    notifDetail: {
        fontSize: '12px',
        color: '#ccc',
        marginTop: '6px',
        fontWeight: '500'
    },
    addressBox: {
        fontSize: '11px',
        color: '#aaa',
        marginTop: '4px',
        padding: '6px',
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '6px',
        lineHeight: '1.4',
        border: '1px solid rgba(255,255,255,0.02)'
    },
    
};

export default QRManagement;