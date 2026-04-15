import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png'; 
import bgImage from './assets/customerdashboard.jpg';
import elecImg from './assets/elec.jpg';
import plasticImg from './assets/plastic.jpg';
import solarImg from './assets/solar.jpg';
import agroImg from './assets/agro.jpg';
import batteryImg from './assets/battery.jpg';
import oilImg from './assets/oil.jpg';
import FeedbackPage from './FeedbackPage';
import ProductRegistration from './ProductRegistration';
import API from './api'; 


const UserDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ORDER NOW');
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState("https://via.placeholder.com/150"); 
    const [formData, setFormData] = useState({
    orgRole: '',
    companyName: '',  
    companyWebsite: '',
    phone: '',
    whatsapp: '',
    officialEmail: '',
    address1: '',
    address2: '',    
    postalCode: '',
    country: '',
    contactPersonName: '',
    contactPersonMobile: ''

    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    
const uploadProfilePicture = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append('image', file);
    formDataObj.append('email', formData.officialEmail); 
    formDataObj.append('role', 'customer'); 

    try {
        const response = await API.post('/customers/upload-photo', formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const data = response.data;
        if (data.imageUrl) {
            setProfileImage(data.imageUrl); 
            setFormData(prev => ({ ...prev, profilePic: data.imageUrl }));
            localStorage.setItem('userPhoto', data.imageUrl);
            alert("✅ Profile Photo Uploaded Successfully!"); 
        }
    } catch (error) {
        console.error("Upload failed:", error);
        alert("❌ Photo upload failed!");
    }
};

const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => setProfileImage(event.target.result);
        reader.readAsDataURL(file);

        await uploadProfilePicture(file); 
    }
};

    useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(styleSheet);

    // --- 2. Backend එකෙන් User Data ගේන කොටස (අලුත් කොටස) ---
    const fetchUserData = async () => {
    const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            try {
                const response = await API.get(`/customers/user-details/${userEmail}`);
                const data = response.data;

            if (data.user) {
                setFormData(data.user);
                if (data.user.profilePic) {
                    setProfileImage(data.user.profilePic);
                }
            }
            } catch (error) {
                console.error("Error fetching user data:", error.response?.data || error.message);
            }
        }
    };

    fetchUserData(); 

     return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    // Logout Function
    const handleLogout = () => {
        if(window.confirm("Are you sure you want to logout?")) {
            localStorage.clear(); 
            navigate('/'); 
        }
    };

    const categories = [
        { name: "Electronic and Electrical EPR", img: elecImg, path: "/electronic-order", desc: "Environmentally friendly disposal and recycling of all discarded electronic devices and electrical household appliances." },
        { name: "Plastic EPR", img: plasticImg, path: "/plastic-order", desc: "Comprehensive plastic waste management focusing on sorting and processing polymers to reduce pollution." },
        { name: "Solar EPR", img: solarImg, path: "/solar-order", desc: "Specialized recycling for end-of-life photovoltaic panels, ensuring hazardous materials are handled safely." },
        { name: "Agro EPR", img: agroImg, path: "/agro-order", desc: "Efficient transformation of agricultural organic waste into high-quality resources for a circular economy." },
        { name: "Battery EPR", img: batteryImg, path: "/battery-order", desc: "Safe extraction and recycling of lead-acid and lithium-ion batteries using advanced technologies." },
        { name: "Oil EPR", img: oilImg, path: "/oil-order", desc: "Professional collection and re-refining of used automotive and industrial oils to prevent contamination." }
    ];

    return (
        <div style={{
            ...styles.container,
            backgroundImage: `url(${bgImage})` 
        }}>
            <div style={styles.overlay}></div>

            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={styles.logoWrapper}>
                    <img src={logo} alt="Logo" style={styles.glowingLogo} />
                    <p style={styles.ecoMotto}>Circular Economy Platform</p>
                </div>

                
                
              <nav style={styles.navMenu}>
    {[
        { id: 'REGISTER PRODUCT', label: 'REGISTER YOUR PRODUCT' },
        { id: 'ORDER NOW', label: 'ORDER NOW' },
        { id: 'about', label: 'ABOUT US'},
        { id: 'profile', label: 'MY PROFILE' },
        { id: 'feedback', label: 'FEEDBACK' }
    ].map((item) => {
        const isActive = activeTab === item.id;
        return (
            <div 
                key={item.id}
                style={{
                    ...styles.navLink, 
                    ...(isActive ? styles.activeNavLink : {})
                }} 

              onClick={() => {
                    if (item.id === 'about') {
                        window.open('https://eprs.lk', '_blank');
                    } else {
                        setActiveTab(item.id);
                    }
                }}


                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)'; 
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }}
            >
                <span style={{ 
                    fontSize: '20px',
                    filter: isActive ? 'drop-shadow(0 0 5px #2ecc71)' : 'none' 
                }}>
                    {item.icon}
                </span> 
                {item.label}
            </div>
        );
    })}
</nav>
{/* LOGOUT BUTTON - දැන් NAVIGATION එකට උඩින් තියෙන්නේ (Req: Udta ganna) */}
                <div 
                    style={styles.logoutBtn} 
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 77, 77, 0.6)';
                        e.currentTarget.style.background = 'rgba(255, 77, 77, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = 'rgba(255, 77, 77, 0.05)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <span style={{ fontSize: '18px' }}></span> LOG OUT
                </div>



            </aside>

{/* MAIN AREA */}
<main style={styles.mainArea}>

{/* --- PRODUCT REGISTRATION SECTION --- */}
{activeTab === 'REGISTER PRODUCT' && (
    <div style={{ ...styles.contentPadding, animation: 'fadeInUp 0.6s ease-out forwards' }}>
        <ProductRegistration />
    </div>
)}


    {activeTab === 'ORDER NOW' && (
        /* මෙන්න මෙතනටයි animation එකයි contentPadding එකයි දෙන්නම දාන්න ඕනේ */
        <div style={{ 
            ...styles.contentPadding, 
            animation: 'fadeInUp 0.6s ease-out forwards' 
        }}>
            <h1 style={styles.mainTitle}>CUSTOMER DASHBOARD</h1>
            <p style={styles.subTitle}>Select a category to start your recycling journey</p>
            
            <div style={styles.grid}>
                {categories.map((cat, i) => (
                    <div 
                        key={i} 
                        style={styles.card} 
                        onClick={() => navigate(cat.path)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05) translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 15px 35px rgba(46, 204, 113, 0.3)';
                            e.currentTarget.style.borderColor = '#2ecc71';
                        }}        
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#333';
                    }}
                >
                    <img src={cat.img} alt={cat.name} style={styles.cardImg} />
                    <div style={styles.cardInfo}>
                        <h3 style={styles.cardTitle}>{cat.name}</h3>
                        <p style={styles.cardDesc}>{cat.desc}</p>
                    </div>
                </div>
                /* -------------------------------------- */

            ))}
        </div>
    </div>
)}
              
                        
               {/* UserDashboard.js ඇතුළේ */}
{activeTab === 'feedback' && <FeedbackPage currentUser={formData} />}         

             {/* --- MY PROFILE SECTION --- */}
{activeTab === 'profile' && (
    <div style={{ ...styles.contentPadding, animation: 'fadeInUp 0.6s ease-out' }}>
        <h1 style={styles.mainTitle}>MY PROFILE</h1>
        <p style={styles.subTitle}>Manage your account and profile details</p>

        <div style={styles.profileCard}>
            {/* Profile Picture Header */}
            <div style={styles.profileHeader}>
                <div style={styles.avatarWrapper}>
                    <img 
    src={profileImage.startsWith('data:') ? profileImage : `${profileImage}?t=${new Date().getTime()}`} 
    alt="Profile" 
    style={styles.profileImg} 
/>
                    {isEditing && (
                        <label style={styles.uploadIcon}>
                            📷 <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                        </label>
                    )}
                </div>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ margin: 0, color: '#2ecc71', fontSize: '28px' }}>{formData.contactPersonName}</h2>
                    <p style={{ color: '#888', margin: '5px 0' }}>{formData.officialEmail}</p>
                    <span style={styles.roleTag}>{formData.orgRole}</span>
                </div>
            </div>

            <hr style={{ border: '0.1px solid rgba(255,255,255,0.05)', margin: '30px 0' }} />

            {/* Input Fields Grid */}
            <div style={styles.profileGrid}>
             {[
    { label: 'Organization Role', name: 'orgRole', value: formData.orgRole },
    { label: 'Company Name', name: 'companyName', value: formData.companyName },
    { label: 'Official Email (Read Only)', name: 'officialEmail', value: formData.officialEmail, isEmail: true },
    { label: 'Phone Number', name: 'phone', value: formData.phone },
    { label: 'WhatsApp', name: 'whatsapp', value: formData.whatsapp },
    { label: 'Company Website', name: 'companyWebsite', value: formData.companyWebsite },
    { label: 'Address Line 1', name: 'address1', value: formData.address1 },
    { label: 'Address Line 2', name: 'address2', value: formData.address2 }, 
    { label: 'Postal Code', name: 'postalCode', value: formData.postalCode },
    { label: 'Country', name: 'country', value: formData.country },
    { label: 'Contact Person Name', name: 'contactPersonName', value: formData.contactPersonName },
    { label: 'Contact Person Mobile', name: 'contactPersonMobile', value: formData.contactPersonMobile },
].map((field) => (
    <div key={field.name} style={styles.infoBox}>
        <label style={styles.infoLabel}>{field.label}</label>
        <input 
            name={field.name}
            type="text" 
            value={formData[field.name] || ''} 
            onChange={handleInputChange}
            disabled={field.isEmail ? true : !isEditing}
            style={{
                ...styles.profileInput,
                border: field.isEmail ? '1px solid #333' : (isEditing ? '1px solid #2ecc71' : '1px solid rgba(255,255,255,0.1)'),
                opacity: field.isEmail ? 0.6 : 1,
                cursor: field.isEmail ? 'not-allowed' : 'text'
            }} 
        />
    </div>

                ))}
            </div>

            {/* Action Buttons */}
            <div style={styles.profileActions}>
             <button 
    style={{ ...styles.updateBtn, background: isEditing ? '#7dc27f' : '#7dc27f' }} 
    onClick={async () => {
       if (isEditing) {
            try {
                const response = await API.put(`/customers/user-details/update/${formData.officialEmail}`, formData);

                const data = response.data;

                alert("✅ Profile Updated in Database Successfully!");
                localStorage.setItem('user', JSON.stringify(formData));
                
            } catch (error) {
                console.error("Update error:", error);
                
                if (error.response) {
                    alert(`❌ Update Failed: ${error.response.data.error || 'Server error'}`);
                } else {
                    alert("⚠️ Connection Error! Make sure your server is running.");
                }
            }
        }
        setIsEditing(!isEditing);
    }}
>
    {isEditing ? " SAVE CHANGES" : " EDIT PROFILE"}
</button>
                {isEditing && (
                    <button style={{ ...styles.deleteAccBtn, borderColor: '#666', color: '#666' }} onClick={() => setIsEditing(false)}>
                        CANCEL
                    </button>
                )}
            </div>
        </div>
    </div>
)}

{/* --- ABOUT SECTION --- */}
{activeTab === 'about' && (
    <div style={styles.centeredPage}>
        <h1 style={styles.mainTitle}>ABOUT US</h1>
        <p style={styles.subTitle}>We are committed to a greener future.</p>
        <div style={{maxWidth: '600px', textAlign: 'center', color: '#bbb', lineHeight: '1.8'}}>
            EPRS (Pvt) Ltd is a leading waste management solution provider in Sri Lanka, 
            specializing in electronic, plastic, and industrial waste recycling.
        </div>
    </div>
)}
            </main>
        </div>
    );
};

const styles = {

// --- Profile Styles ටික ---
    profileCard: { background: 'rgba(255, 255, 255, 0.03)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255, 255, 255, 0.05)', maxWidth: '950px', margin: '0 auto', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' },
    profileHeader: { display: 'flex', alignItems: 'center', gap: '35px' },
    avatarWrapper: { position: 'relative', width: '130px', height: '130px' },
    profileImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #2ecc71', padding: '4px' },
    uploadIcon: { position: 'absolute', bottom: '5px', right: '5px', background: '#395d46', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    roleTag: { background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', padding: '6px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
    profileGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '25px' },
    infoBox: { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
    infoLabel: { fontSize: '12px', color: '#666', marginLeft: '5px' },
    profileInput: { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '14px 18px', color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s' },
    profileActions: { display: 'flex', gap: '20px', marginTop: '40px' },
    updateBtn: { flex: 2, color: '#000', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' },
    deleteAccBtn: { flex: 1, background: 'transparent', color: '#ff4d4d', border: '1.5px solid #ff4d4d', padding: '16px', borderRadius: '15px', fontWeight: '800', cursor: 'pointer' },




mainContentAnimation: {
        animation: 'fadeInUp 0.6s ease-out forwards',
    },

    contentPadding: { 
        padding: '50px' 
    },


    container: {
        display: 'flex', minHeight: '100vh', backgroundSize: 'cover',
        backgroundPosition: 'center', backgroundAttachment: 'fixed',
        color: '#fff', fontFamily: 'Poppins, sans-serif'
    },
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1
    },
    sidebar: {
        width: '280px', backgroundColor: 'rgba(23, 22, 22, 0.98)',
        borderRight: '1px solid #333', display: 'flex', flexDirection: 'column',
        padding: '40px 20px', zIndex: 10, position: 'fixed', height: '100vh'
    },
    logoWrapper: { textAlign: 'center', marginBottom: '30px' },
 glowingLogo: {
    width: '140px',          
    height: '140px',
    borderRadius: '50%',     
    objectFit: 'contain',    
    backgroundColor: '#fff', 
    padding: '5px',          
    border: '5px solid #00ff11', 
    marginBottom: '30px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
},
    navMenu: { flex: 1, marginTop: '20px' },
navLink: {
    padding: '20px 20px',
    margin: '10px 0',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    borderRadius: '15px',      
    transition: 'all 0.3s ease',
    fontWeight: '500',
    color: '#ccc',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)', 
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
},

// මේකෙන් තමයි Active බටන් එක කැපිලා පේන්නේ
activeNavLink: {
    background: 'rgba(46, 204, 113, 0.15)', 
    color: '#2ecc71',
    border: '1px solid rgba(46, 204, 113, 0.4)',
    boxShadow: '0 0 15px rgba(46, 204, 113, 0.2)', 
},
    logoutBtn: {
        padding: '12px 20px', color: '#ff4d4d', cursor: 'pointer',
        fontWeight: 'bold', border: '1px solid rgba(255, 77, 77, 0.3)',
        borderRadius: '12px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '19px', transition: 'all 0.3s ease',
        background: 'rgba(255, 77, 77, 0.05)', width: '85%',
        fontSize: '15px', letterSpacing: '4px',marginTop: 'auto', marginBottom: '60px'
    },
    mainArea: {
        flex: 1, marginLeft: '280px', zIndex: 2, position: 'relative'
    },
    mainTitle: { fontSize: '40px', textAlign: 'center', letterSpacing: '2px', fontWeight: '800' },
    subTitle: { textAlign: 'center', color: '#2ecc71', marginBottom: '50px' },
    grid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px'
    },
   card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '25px',
    overflow: 'hidden',
    border: '1px solid #333',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
    position: 'relative'
},
    cardImg: { width: '100%', height: '220px', objectFit: 'cover' },
    cardInfo: { padding: '25px' },
    cardTitle: { color: '#2ecc71', margin: '0 0 12px 0', fontSize: '20px' },
    cardDesc: { fontSize: '14px', color: '#bbb', lineHeight: '1.6' },

    // Feedback Styles
    feedbackContainer: { maxWidth: '900px', margin: '0 auto', padding: '50px' },
    feedbackForm: {
        background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '25px',
        border: '1px solid #444', marginBottom: '40px'
    },
    starRow: { fontSize: '30px', marginBottom: '20px', cursor: 'pointer' },
    textArea: {
        width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)',
        border: '1px solid #444', color: '#fff', borderRadius: '15px',
        padding: '15px', outline: 'none', marginBottom: '20px'
    },
    submitBtn: {
        background: '#2ecc71', color: '#000', border: 'none',
        padding: '12px 30px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
    },

ecoMotto: { 
        fontSize: '23px', 
        fontStyle: 'italic', 
        color: '#2ecc71', // ලස්සන කොළ පාටක්
        marginTop: '-10px', // ලෝගෝ එකට ලං වෙන්න
        marginBottom: '30px', 
        textAlign: 'center',
        fontWeight: '500',
        letterSpacing: '0.5px',
        textShadow: '0 0 10px rgba(46, 204, 113, 0.3)' // ලාවට Glow වෙනවා
    },


    commentsSection: { marginTop: '50px' },
    commentItem: {
        background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px',
        marginBottom: '15px', border: '1px solid #222'
    },
    commentHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    replyBtn: {
        background: 'transparent', border: '1px solid #444', color: '#888',
        padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px'
    },
    replyTag: { fontSize: '10px', background: '#2ecc71', color: '#000', padding: '2px 8px', borderRadius: '4px' },
    centeredPage: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }
};

export default UserDashboard;