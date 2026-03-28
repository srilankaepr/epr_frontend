import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminProductView = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null); // Modal එකට අදාළ Product එක
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('https://eprbackend-production.up.railway.app/api/admin/products');
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => 
        p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productModel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
                <h2 style={styles.title}>PRODUCT REGISTRY</h2>
                <div style={styles.searchWrapper}>
                    <input 
                        type="text" 
                        placeholder="Search by Brand or Model..." 
                        style={styles.searchInput}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>BRAND NAME</th>
                            <th style={styles.th}>MODEL</th>
                            <th style={styles.th}>TYPE</th>
                            <th style={styles.th}>ANNUAL UNITS</th>
                            <th style={styles.th}>STATUS</th>
                            <th style={styles.th}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product._id} style={styles.tr}>
                                <td style={{...styles.td, color: '#2ecc71', fontWeight: 'bold'}}>{product.brandName.toUpperCase()}</td>
                                <td style={styles.td}>{product.productModel}</td>
                                <td style={styles.td}>{product.productType}</td>
                                <td style={styles.td}>{product.annualQuantityUnits}</td>
                                <td style={styles.td}><span style={styles.badge}>Active</span></td>
                                <td style={styles.td}>
                                    <button 
                                        style={styles.viewBtn} 
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        View Info
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- 📦 PRODUCT DETAILS MODAL --- */}
            {selectedProduct && (
                <div style={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>PRODUCT SPECIFICATIONS</h3>
                            <button style={styles.closeBtn} onClick={() => setSelectedProduct(null)}>×</button>
                        </div>
                        
                        <div style={styles.modalBody}>
                            <div style={styles.infoGrid}>
                                <div style={styles.infoBox}><strong>Brand:</strong> {selectedProduct.brandName}</div>
                                <div style={styles.infoBox}><strong>Model:</strong> {selectedProduct.productModel}</div>
                                <div style={styles.infoBox}><strong>Type:</strong> {selectedProduct.productType}</div>
                                <div style={styles.infoBox}><strong>Origin:</strong> {selectedProduct.originCountry}</div>
                                <div style={styles.infoBox}><strong>Packaging:</strong> {selectedProduct.packagingCategory}</div>
                                <div style={styles.infoBox}><strong>Material:</strong> {selectedProduct.packagingMaterial}</div>
                                <div style={styles.infoBox}><strong>Usage:</strong> {selectedProduct.usageType}</div>
                                <div style={styles.infoBox}><strong>Unit Weight:</strong> {selectedProduct.unitWeight}</div>
                            </div>

                            <h4 style={styles.sectionTitle}>Material Composition</h4>
                            <div style={styles.materialList}>
                                {selectedProduct.materials && selectedProduct.materials.map((m, i) => (
                                    <div key={i} style={styles.materialItem}>
                                        <span>{m.materialName}</span>
                                        <span style={{color: '#2ecc71'}}>{m.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    // ... කලින් තිබුණ styles ටික එලෙසමයි ...
    container: { padding: '40px', minHeight: '100vh', background: '#0a0a0a', color: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    backBtn: { background: 'none', border: '1px solid #333', color: '#888', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' },
    title: { fontSize: '24px', letterSpacing: '2px', fontWeight: '900' },
    searchWrapper: { width: '300px' },
    searchInput: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' },
    tableWrapper: { background: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '15px', borderBottom: '1px solid #333', fontSize: '12px', color: '#888' },
    td: { padding: '15px', borderBottom: '1px solid #222' },
    badge: { background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' },
    viewBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' },

    // --- Modal Styles ---
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
    modalContent: { background: '#111', width: '90%', maxWidth: '600px', padding: '30px', borderRadius: '20px', border: '1px solid #333', position: 'relative' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px' },
    closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' },
    infoBox: { padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '14px' },
    sectionTitle: { color: '#2ecc71', marginBottom: '15px', fontSize: '16px', borderLeft: '3px solid #2ecc71', paddingLeft: '10px' },
    materialList: { background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '10px' },
    materialItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222', fontSize: '14px' }
};

export default AdminProductView;