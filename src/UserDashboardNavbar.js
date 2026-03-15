import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserDashboardNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: "Dashboard", path: "/user-dashboard", color: "#00f2fe", icon: "🏠" },
        { name: "Electronic", path: "/electronic-order", color: "#4facfe", icon: "🔌" },
        { name: "Plastic", path: "/plastic-order", color: "#00f2fe", icon: "♻️" },
        { name: "Solar", path: "/solar-order", color: "#f9d423", icon: "☀️" },
        { name: "Agro", path: "/agro-order", color: "#43e97b", icon: "🌱" },
        { name: "Battery", path: "/battery-order", color: "#fa709a", icon: "🔋" },
        { name: "Oil", path: "/oil-order", color: "#84fab0", icon: "🛢️" }
    ];

    return (
        <nav style={styles.navContainer}>
            <style>
                {`
                .nav-wrapper {
                    display: flex;
                    width: 100%;
                    gap: 15px;
                    padding: 5px;
                }

                .nav-btn {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 16px 10px;
                    cursor: pointer;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 20px;
                    position: relative;
                    z-index: 1;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }

                /* 1. මවුස් එක ගෙනිච්චම ඇතුළෙන් පාට පිරෙන හැටි */
                .nav-btn::before {
                    content: "";
                    position: absolute;
                    top: 100%; left: 0;
                    width: 100%; height: 100%;
                    background: linear-gradient(135deg, var(--btn-color), transparent);
                    transition: all 0.4s ease;
                    z-index: -1;
                    opacity: 0.2;
                }

                .nav-btn:hover::before {
                    top: 0;
                }

                .nav-btn:hover {
                    transform: translateY(-8px) scale(1.05);
                    border-color: var(--btn-color);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.6), 0 0 15px var(--glow-color);
                }

                /* 2. Active Button එකට පට්ට Colorful ලුක් එකක් */
                .active-btn {
                    background: linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05)) !important;
                    border: 1.5px solid var(--btn-color) !important;
                    box-shadow: 0 0 25px var(--glow-color), inset 0 0 10px var(--glow-color) !important;
                }

                .active-btn .nav-icon {
                    transform: scale(1.2);
                    filter: drop-shadow(0 0 10px var(--btn-color));
                }

                .nav-text {
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-top: 8px;
                    color: #fff;
                    opacity: 0.7;
                    transition: 0.3s;
                }

                .active-btn .nav-text {
                    opacity: 1;
                    text-shadow: 0 0 10px var(--btn-color);
                }

                /* 3. Shine Effect */
                .shine {
                    position: absolute;
                    top: 0; left: -100%;
                    width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transform: skewX(-25deg);
                    transition: 0.7s;
                }
                .nav-btn:hover .shine {
                    left: 150%;
                }

                @media (max-width: 1000px) {
                    .nav-wrapper { overflow-x: auto; scrollbar-width: none; padding-bottom: 10px; }
                    .nav-btn { min-width: 110px; }
                }
                `}
            </style>

            <div className="nav-wrapper">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <div 
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`nav-btn ${isActive ? 'active-btn' : ''}`}
                            style={{
                                '--btn-color': item.color,
                                '--glow-color': `${item.color}66`,
                            }}
                        >
                            <div className="shine" />
                            <span className="nav-icon" style={{ fontSize: '24px', transition: '0.4s' }}>
                                {item.icon}
                            </span>
                            <span className="nav-text">
                                {item.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
};

const styles = {
    navContainer: {
        width: '100%',
        background: 'linear-gradient(to bottom, #0f0f0f, #1a1a1a)', 
        padding: '20px 25px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '40px',
        boxSizing: 'border-box',
        borderRadius: '0 0 30px 30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }
};

export default UserDashboardNavbar;