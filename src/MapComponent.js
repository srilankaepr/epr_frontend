import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import API from './api';
import L from 'leaflet';

// Leaflet default marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = () => {
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    useEffect(() => {
        const fetchMapLocations = async () => {
            try {
                const response = await API.get('/map/locations');
                setLocations(response.data || []);
                setFilteredLocations(response.data || []);
            } catch (error) {
                console.error("Error fetching map locations:", error);
                // ඩමී ඩේටා (ටෙස්ට් කිරීමට)
                const dummyData = [
                    { id: 1, name: 'Eco Recyclers Hub', lat: 6.9271, lng: 79.8612, type: 'Plastic', city: 'Colombo' },
                    { id: 2, name: 'Green Loop E-Waste', lat: 6.9000, lng: 79.9000, type: 'E-Waste', city: 'Kaduwela' }
                ];
                setLocations(dummyData);
                setFilteredLocations(dummyData);
            }
        };
        fetchMapLocations();
    }, []);

    // 🤖 AI Smart Search Handler
    const handleAISearch = () => {
        if (!searchQuery.trim()) {
            setFilteredLocations(locations);
            setAiResponse('');
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = locations.filter(loc => 
            loc.name.toLowerCase().includes(query) || 
            loc.type.toLowerCase().includes(query) || 
            loc.city.toLowerCase().includes(query)
        );

        setFilteredLocations(results);
        setAiResponse(`🤖 AI Found ${results.length} matching facility(ies) for your search.`);
    };

    return (
        <div style={{ padding: '30px', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '10px', color: '#2ecc71' }}>🗺️ Eco-Facility & Recycler Map</h1>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>Find collection points, recycling centers, and AI-optimized routes near you.</p>

            {/* AI Search & Filter Bar */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
                <input 
                    type="text" 
                    placeholder="🤖 Ask AI or search (e.g., 'Plastic recycling near Kaduwela')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '12px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(155,89,182,0.3)', color: '#fff', outline: 'none' }}
                />
                <button 
                    onClick={handleAISearch}
                    style={{ padding: '12px 25px', borderRadius: '12px', background: '#9b59b6', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
                >
                    🤖 AI Search
                </button>
            </div>

            {aiResponse && (
                <div style={{ marginBottom: '15px', padding: '10px 15px', borderRadius: '8px', background: 'rgba(155,89,182,0.2)', border: '1px solid #9b59b6', fontSize: '14px', color: '#f3e5f5' }}>
                    {aiResponse}
                </div>
            )}

            {/* Map View Container */}
            <div style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', minHeight: '400px' }}>
                <MapContainer center={[7.8731, 80.7718]} zoom={8} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {filteredLocations.map((loc, index) => (
                        <Marker key={index} position={[loc.lat || 6.9271, loc.lng || 79.8612]}>
                            <Popup>
                                <div style={{ color: '#000' }}>
                                    <strong>{loc.name}</strong><br />
                                    Type: {loc.type}<br />
                                    City: {loc.city}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapComponent;   