import React from 'react';

const MapComponent = () => {
    return (
        <div style={{ 
            width: '100%', 
            height: '60vh', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '25px', 
            border: '1px solid #444', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff',
            marginTop: '20px',
            overflow: 'hidden'
        }}>
            {/* මෙතනට පසුව Leaflet.js හෝ Google Maps API සම්බන්ධ කළ හැක */}
            <p>Interactive Map View Loading...</p>
        </div>
    );
};

export default MapComponent;