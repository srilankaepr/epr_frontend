import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from './logo.png'; // Company Logo එක

const AdminProductView = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All'); // Category filter එක
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

    // --- 3. Filter Logic (Search + Category) ---
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             p.productModel.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.packagingCategory === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // --- 2. PDF Export Logic (Filtered Data Only) ---
    const exportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more space
        doc.setFontSize(18);
        doc.text("EPR SYSTEM - PRODUCT REGISTRY REPORT", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()} | Category: ${filterCategory}`, 14, 28);

        const tableColumn = [
            "Brand", "Model", "Type", "Origin", "Units", 
            "Weight (kg)", "Category", "Material", "Usage"
        ];
        
        const tableRows = filteredProducts.map(p => [
            p.brandName.toUpperCase(),
            p.productModel,
            p.productType,
            p.originCountry,
            p.annualQuantityUnits,
            p.unitWeight,
            p.packagingCategory,
            p.packagingMaterial,
            p.usageType
        ]);

        doc.autoTable({
            startY: 35,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [46, 204, 113] } // EPR Green
        });

        doc.save(`EPR_Product_Registry_${filterCategory}.pdf`);
    };

    return (
        <div style={styles.container}>
            {/* --- 4. Dashboard Header Style with Logo --- */}
            <div style={styles.header}>
                <div style={styles.logoArea}>
                    <div style={styles.logoCircle}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                    <div style={styles.headerText}>
                        <h2 style={styles.title}>PRODUCT REGISTRY</h2>
                        <div style={styles.divider}></div>
                    </div>
                </div>

                <div style={styles.controls}>
                    <div style={styles.filterGroup}>
                        <select 
                            style={styles.selectInput} 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="tertiary">Tertiary</option>
                        </select>
                        
                        <input 
                            type="text" 
                            placeholder="Search Brand/Model..." 
                            style={styles.searchInput}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <button onClick={exportPDF} style={styles.exportBtn}>📄 EXPORT PDF</button>
                    <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← DASHBOARD</button>
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
                            <th style={styles.th}>PACKAGING</th>
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
                                <td style={styles.td}><span style={styles.badge}>{product.packagingCategory}</span></td>
                                <td style={styles.td}>
                                    <button style={styles.viewBtn} onClick={() => setSelectedProduct(product)}>View Info</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL --- */}
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
                                <div style={styles.infoBox}><strong>Origin:</strong> {selectedProduct.originCountry}</div>
                                <div style={styles.infoBox}><strong>Unit Weight:</strong> {selectedProduct.unitWeight} kg</div>
                                <div style={styles.infoBox}><strong>Packaging:</strong> {selectedProduct.packagingCategory}</div>
                                <div style={styles.infoBox}><strong>Material:</strong> {selectedProduct.packagingMaterial}</div>
                            </div>
                            <h4 style={styles.sectionTitle}>Material Composition</h4>
                            <div style={styles.materialList}>
                                {selectedProduct.materials?.map((m, i) => (
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
    // 1. Dashboard background photo
    container: { 
        padding: '60px 40px', 
        minHeight: '100vh', 
        background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#fff',
        fontFamily: "'Inter', sans-serif"
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' },
    logoArea: { display: 'flex', alignItems: 'center', gap: '25px' },
    logoCircle: { 
        width: '80px', height: '80px', background: '#fff', borderRadius: '20px', 
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    },
    logoImg: { width: '80%' },
    headerText: { textAlign: 'left' },
    title: { fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', margin: 0 },
    divider: { height: '4px', width: '60px', background: '#2ecc71', marginTop: '8px', borderRadius: '10px' },
    
    controls: { display: 'flex', gap: '15px', alignItems: 'center' },
    filterGroup: { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '5px', border: '1px solid rgba(255,255,255,0.1)' },
    selectInput: { background: 'transparent', color: '#fff', border: 'none', padding: '10px', outline: 'none', cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.1)' },
    searchInput: { background: 'transparent', color: '#fff', border: 'none', padding: '10px 15px', outline: 'none', width: '200px' },
    
    exportBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', boxShadow: '0 5px 15px rgba(46, 204, 113, 0.3)' },
    backBtn: { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', transition: '0.3s' },
    
    tableWrapper: { background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(15px)', borderRadius: '30px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: '#888', letterSpacing: '1.5px', fontWeight: 'bold' },
    td: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '15px' },
    tr: { transition: '0.3s' },
    badge: { background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
    viewBtn: { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
    modalContent: { background: '#111', width: '90%', maxWidth: '650px', padding: '40px', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 50px 100px rgba(0,0,0,0.9)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' },
    closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', opacity: 0.5 },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' },
    infoBox: { padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' },
    sectionTitle: { color: '#2ecc71', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' },
    materialList: { background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px' },
    materialItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }
};

export default AdminProductView;