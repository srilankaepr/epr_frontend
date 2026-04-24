import React from 'react';

const DirectVerify = () => {
    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#000', 
            color: '#fff' 
        }}>
            <h1 style={{ color: '#2ecc71' }}>✔ Product Verified</h1>
            <p>This is a Direct Collected Item.</p>
        </div>
    );
};

export default DirectVerify;