import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from './logo.png';

const AdminProductView = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // --- 1. Multi-Category Filtering States ---
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterType, setFilterType] = useState('All');

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

    // --- 1. Advanced Filter Logic (Brand, Model, Type, Category) ---
    const filteredProducts = products.filter(p => {
        const matchesSearch = 
            p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.productType.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = filterCategory === 'All' || p.packagingCategory === filterCategory;
        const matchesType = filterType === 'All' || p.productType.toLowerCase() === filterType.toLowerCase();
        
        return matchesSearch && matchesCategory && matchesType;
    });

    // --- 2. Fixed PDF Export Logic ---
    const exportPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(18);
            doc.text("EPR SYSTEM - FILTERED PRODUCT REPORT", 14, 20);
            
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
            doc.text(`Filters - Category: ${filterCategory} | Type: ${filterType}`, 14, 33);

            const tableColumn = ["Brand", "Model", "Type", "Category", "Material", "Units", "Weight (kg)", "Origin"];
            const tableRows = filteredProducts.map(p => [
                p.brandName.toUpperCase(),
                p.productModel,
                p.productType,
                p.packagingCategory,
                p.packagingMaterial,
                p.annualQuantityUnits,
                p.unitWeight,
                p.originCountry
            ]);

            autoTable(doc, {
                startY: 40,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [46, 204, 113] },
                styles: { fontSize: 9 }
            });

            doc.save(`EPR_Filtered_Report.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
            alert("Failed to generate PDF. Make sure jspdf is installed.");
        }
    };

    return (
        <div style={styles.container}>
            {/* --- 4. Dashboard Header Style --- */}
            <div style={styles.header}>
                <div style={styles.logoArea}>
                    <div style={styles.logoCircle}>
                        <img src={logo} alt="EPR Logo" style={styles.logoImg} />
                    </div>
                    <div style={styles.headerText}>
                        <h1 style={styles.title}>PRODUCT REGISTRY</h1>
                        <div style={styles.divider}></div>
                    </div>
                </div>

                <div style={styles.controls}>
                    <div style={styles.filterGroup}>
                        {/* Packaging Category Filter */}
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

                        {/* Search Brand/Model/Type */}
                        <input 
                            type="text" 
                            placeholder="Search Brand, Model or Type..." 
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
                        <tr>
                            <th style={styles.th}>BRAND NAME</th>
                            <th style={styles.th}>MODEL</th>
                            <th style={styles.th}>PRODUCT TYPE</th>
                            <th style={styles.th}>ANNUAL UNITS</th>
                            <th style={styles.th}>CATEGORY</th>
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
                                <div style={styles.infoBox}><strong>Type:</strong> {selectedProduct.productType}</div>
                                <div style={styles.infoBox}><strong>Origin:</strong> {selectedProduct.originCountry}</div>
                                <div style={styles.infoBox}><strong>Packaging:</strong> {selectedProduct.packagingCategory}</div>
                                <div style={styles.infoBox}><strong>Unit Weight:</strong> {selectedProduct.unitWeight} kg</div>
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
    container: { 
        padding: '60px 40px', 
        minHeight: '100vh', 
        background: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')`,
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
    filterGroup: { display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '15px', padding: '5px', border: '1px solid rgba(255,255,255,0.1)' },
    selectInput: { background: 'transparent', color: '#fff', border: 'none', padding: '12px', outline: 'none', cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.1)' },
    searchInput: { background: 'transparent', color: '#fff', border: 'none', padding: '12px 20px', outline: 'none', width: '280px' },
    
    exportBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '14px 25px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 20px rgba(46, 204, 113, 0.3)' },
    backBtn: { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 25px', borderRadius: '15px', cursor: 'pointer' },
    
    tableWrapper: { background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '35px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: '#888', letterSpacing: '1.5px', fontWeight: 'bold' },
    td: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '15px' },
    tr: { transition: '0.3s' },
    badge: { background: 'rgba(52, 152, 219, 0.2)', color: '#3498db', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
    viewBtn: { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
    modalContent: { background: '#111', width: '90%', maxWidth: '650px', padding: '40px', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.1)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' },
    infoBox: { padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', fontSize: '14px' },
    sectionTitle: { color: '#2ecc71', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' },
    materialList: { background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px' },
    materialItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }
};

export default AdminProductView;