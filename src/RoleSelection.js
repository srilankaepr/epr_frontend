import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import earthVideo from './assets/earth.mp4'; 

const RoleSelection = () => {
    const navigate = useNavigate();

    // 🚀 ඔයා දුන්න Content එකට අනුව අලුතින් හදපු Data Array එක
    const roles = [
        { 
            name: 'BECOME PRO',  
            icon: '💎',  
            shortDesc: 'Producer Responsibility Organization',
            who: 'Organizations managing EPR compliance and coordinating collection and recycling systems.',
            examples: ['Waste management companies', 'Environmental service providers', 'Industry associations'],
            responsibilities: ['Manage EPR obligations', 'Coordinate collectors & recyclers', 'Submit verified reports', 'Ensure transparency & traceability'],
            color: '#f1c40f',  
            bg: 'rgba(241, 196, 15, 0.05)',  
            glow: 'rgba(241, 196, 15, 0.4)',
            path: '/register-pro', 
            roleType: 'pro' 
        },
        { 
            name: 'PIBO', 
            icon: '👤', 
            shortDesc: 'Producer, Importer & Brand Owner',
            who: 'Organizations introducing products or packaging into the Sri Lankan market.',
            examples: ['FMCG manufacturers & importers', 'Plastic product suppliers', 'Electronics & battery importers'],
            responsibilities: ['Declare products placed on the market', 'Fulfill EPR obligations', 'Work with registered PROs', 'Maintain regulatory compliance'],
            color: '#3498db', 
            bg: 'rgba(52, 152, 219, 0.05)', 
            glow: 'rgba(52, 152, 219, 0.4)',
            path: '/register-pibo', 
            roleType: 'producer' 
        }, 
        { 
            name: 'WASTE MANAGEMENT', 
            icon: '🚚', 
            shortDesc: 'Collection, Recovery & Logistics',
            who: 'Individuals or organizations involved in collecting, aggregating, processing, or transporting recyclable waste.',
            examples: ['Scrap collectors & aggregators', 'Plastic & Metal recycling plants', 'Waste logistics providers'],
            responsibilities: ['Collect, sort & process waste', 'Ensure material traceability', 'Maintain recycling efficiency data', 'Support recycling targets'],
            color: '#2ecc71', 
            bg: 'rgba(46, 204, 113, 0.05)', 
            glow: 'rgba(46, 204, 113, 0.4)',
            path: '/register-waste', 
            roleType: 'RECYCLER' 
        }, 
        { 
            name: 'AUTHORITY ACCESS', 
            icon: '🏛️', 
            shortDesc: 'Government & Regulatory Authorities',
            who: 'National and local institutions responsible for environmental policy and EPR enforcement.',
            examples: ['Central Environmental Authority (CEA)', 'Local Government Bodies'],
            responsibilities: ['Define EPR policies & targets', 'Monitor environmental performance', 'Enforce compliance frameworks', 'Access digital dashboards'],
            color: '#9b59b6', 
            bg: 'rgba(155, 89, 182, 0.05)', 
            glow: 'rgba(155, 89, 182, 0.4)',
            path: '/register-authority', 
            roleType: 'authority' 
        }
    ];

    return (  
        <div style={styles.container}>
            {/* --- Background Video --- */}
            <video autoPlay loop muted playsInline style={styles.videoBg}>
                <source src={earthVideo} type="video/mp4" />
            </video>

            {/* Premium Overlay Layer */}
            <div style={styles.overlay}></div>
            
            <div style={styles.glassWrapper}>
                <div style={styles.headerArea}>
                    <div style={styles.logoFrame}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                    <h1 style={styles.title}>EPR PORTAL</h1>
                    <p style={styles.subText}>SELECT YOUR ORGANIZATION ROLE</p>
                </div>

                {/* 🌟 Interactive Reveal Cards Container */}
                <div className="cards-grid">
                    {roles.map((role) => (
                        <div 
                            key={role.name}
                            className="reveal-card"
                            style={{ 
                                '--hover-color': role.color, 
                                '--glow-color': role.glow,
                                '--bg-color': role.bg
                            }}
                            onClick={() => role.path ? navigate(role.path, { state: { selectedRole: role.roleType } }) : alert('Coming soon!')}
                        >
                            {/* Card Front (Always Visible) */}
                            <div className="card-front">
                                <div className="icon-wrapper" style={{ color: role.color }}>
                                    {role.icon}
                                </div>
                                <h3 className="card-title" style={{ color: role.color }}>{role.name}</h3>
                                <p className="card-short-desc">{role.shortDesc}</p>
                            </div>

                            {/* Card Hidden Details (Revealed on Hover) */}
                            <div className="card-details">
                                <div className="detail-scroll-area">
                                    <div className="detail-section">
                                        <h4>Who Should Register</h4>
                                        <p>{role.who}</p>
                                    </div>
                                    <div className="detail-section">
                                        <h4>Examples</h4>
                                        <ul>
                                            {role.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                                        </ul>
                                    </div>
                                    <div className="detail-section">
                                        <h4>Responsibilities</h4>
                                        <ul>
                                            {role.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                                        </ul>
                                    </div>
                                </div>
                                <button className="register-btn" style={{ background: role.color, boxShadow: `0 5px 15px ${role.glow}` }}>
                                    Proceed to Register ➔
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Already registered with us? 
                        <span style={styles.loginLink} onClick={() => navigate('/')}> Secure Login</span>
                    </p>
                </div>
            </div>

            {/* 🎨 CSS Animations & Hover Logic for Reveal Cards */}
            <style>
                {`
                @keyframes wrapperFadeIn {
                    from { opacity: 0; transform: scale(0.95) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 25px;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Reveal Card Base Styling */
                .reveal-card {
                    position: relative;
                    height: 420px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    overflow: hidden;
                    cursor: pointer;
                    backdrop-filter: blur(20px);
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .reveal-card:hover {
                    border-color: var(--hover-color);
                    background: var(--bg-color);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.5), 0 0 20px var(--glow-color);
                    transform: translateY(-10px);
                }

                /* Front Content (Icon + Title) */
                .card-front {
                    text-align: center;
                    padding: 30px 20px;
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                    transform: translateY(0);
                }

                .icon-wrapper {
                    font-size: 60px;
                    margin-bottom: 20px;
                    transition: 0.5s;
                    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));
                }

                .card-title {
                    font-size: 24px;
                    font-weight: 900;
                    letter-spacing: 1.5px;
                    margin: 0 0 10px 0;
                }

                .card-short-desc {
                    color: #bbb;
                    font-size: 13px;
                    line-height: 1.5;
                    margin: 0;
                    padding: 0 10px;
                }

                /* Hover Actions for Front Content */
                .reveal-card:hover .card-front {
                    transform: translateY(-140px) scale(0.85);
                    opacity: 0.9;
                }
                .reveal-card:hover .icon-wrapper {
                    filter: drop-shadow(0 0 15px var(--hover-color));
                }

                /* Hidden Details Section */
                .card-details {
                    position: absolute;
                    bottom: -100%;
                    left: 0;
                    width: 100%;
                    height: 68%;
                    padding: 0 20px 20px 20px;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                    opacity: 0;
                    box-sizing: border-box;
                }

                .reveal-card:hover .card-details {
                    bottom: 0;
                    opacity: 1;
                }

                /* Detail Scroll Area */
                .detail-scroll-area {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 5px;
                    margin-bottom: 15px;
                }

                /* Custom Scrollbar for Details */
                .detail-scroll-area::-webkit-scrollbar { width: 4px; }
                .detail-scroll-area::-webkit-scrollbar-thumb { background: var(--hover-color); border-radius: 10px; }
                .detail-scroll-area::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }

                .detail-section {
                    text-align: left;
                    margin-bottom: 15px;
                }

                .detail-section h4 {
                    color: #fff;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 6px 0;
                    border-left: 3px solid var(--hover-color);
                    padding-left: 8px;
                }

                .detail-section p {
                    color: #aaa;
                    font-size: 12px;
                    margin: 0;
                    line-height: 1.5;
                }

                .detail-section ul {
                    margin: 0;
                    padding-left: 15px;
                    color: #aaa;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .detail-section ul li {
                    margin-bottom: 4px;
                }

                /* Proceed Button */
                .register-btn {
                    width: 100%;
                    border: none;
                    color: #000;
                    font-weight: 900;
                    padding: 12px;
                    border-radius: 10px;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: 0.3s;
                }

                .register-btn:hover {
                    filter: brightness(1.2);
                    transform: scale(1.02);
                }

                /* Responsive Logic for Mobile (Force Reveal) */
                @media (max-width: 768px) {
                    .cards-grid { grid-template-columns: 1fr; }
                    .reveal-card { height: auto; min-height: 420px; justify-content: flex-start; padding-top: 20px; }
                    .card-front { transform: translateY(0) scale(1); padding-bottom: 10px; }
                    .reveal-card:hover .card-front { transform: translateY(0) scale(1); opacity: 1; }
                    
                    .card-details { 
                        position: relative; 
                        bottom: 0; 
                        opacity: 1; 
                        height: auto; 
                        margin-top: 10px;
                    }
                    .detail-scroll-area { overflow-y: visible; margin-bottom: 20px; }
                }
                `}
            </style>
        </div>
    );
};

const styles = {
  container: {
    minHeight: '100vh',   
    width: '100vw',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative', 
    overflowY: 'auto',      
    backgroundColor: '#000',
    fontFamily: "'Inter', sans-serif",
    padding: '60px 20px'    
},
    videoBg: {
        position: 'absolute', top: '50%', left: '50%',
        width: '100%', height: '100%', objectFit: 'cover',
        transform: 'translate(-50%, -50%)', zIndex: 1, filter: 'brightness(0.35)'
    },
    overlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.9) 100%)',
        zIndex: 2
    },
    glassWrapper: {
        position: 'relative', zIndex: 3,
        width: '100%', maxWidth: '1300px',
        padding: '20px',
        textAlign: 'center',
        animation: 'wrapperFadeIn 0.8s ease-out forwards'
    },
    headerArea: { marginBottom: '50px' },
    logoFrame: {
        width: '110px', height: '110px',
        background: '#fff', borderRadius: '50%',
        margin: '0 auto 20px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        border: '4px solid #2ecc71',
        boxShadow: '0 0 40px rgba(46, 204, 113, 0.5)'
    },
    logoImg: { width: '75%' },
    title: { fontSize: '36px', fontWeight: '900', letterSpacing: '6px', color: '#fff', margin: '0' },
    subText: { fontSize: '14px', color: '#2ecc71', marginTop: '10px', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' },
    footer: { marginTop: '60px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '30px' },
    footerText: { color: '#888', fontSize: '15px' },
    loginLink: { color: '#2ecc71', fontWeight: '900', cursor: 'pointer', textDecoration: 'none', transition: '0.3s', marginLeft: '5px' }
};

export default RoleSelection;