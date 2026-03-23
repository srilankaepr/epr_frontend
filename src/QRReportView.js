import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const QRReportView = () => {
    const [allData, setAllData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        company: 'All',
        product: 'All',
        brand: 'All'
    });

    // 1. බැක්එන්ඩ් එකෙන් දත්ත ගේන ලොජික් එක
    useEffect(() => {
        const fetchAllQRs = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://eprbackend-production.up.railway.app/api/get-all-generated-qrs');
                const data = await response.json();
                if (response.ok) {
                    setAllData(data);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllQRs();
    }, []);

    // 2. සර්ච් සහ ෆිල්ටර් ලොජික් එක
    const filteredQRs = allData.filter(qr => {
        const matchesSearch = (qr.qrId || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (qr.serialNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCompany = filters.company === 'All' || qr.company === filters.company;
        const matchesProduct = filters.product === 'All' || qr.product === filters.product;
        const matchesBrand = filters.brand === 'All' || qr.brand === filters.brand;
        
        return matchesSearch && matchesCompany && matchesProduct && matchesBrand;
    });

    // 3. PDF එක සාදන ලොජික් එක
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("EPR System - Master QR Audit Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()} | Total Records: ${filteredQRs.length}`, 14, 22);

        const tableColumn = ["QR ID", "Company", "Product", "Brand", "MFD"];
        const tableRows = filteredQRs.map(qr => [
            qr.qrId,
            qr.company,
            qr.product,
            qr.brand,
            qr.mfd
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [46, 204, 113] } // පද්ධතියේ කොළ පාට
        });

        doc.save(`Master_QR_Report_${new Date().getTime()}.pdf`);
    };

    if (isLoading) {
        return <div style={{ color: '#2ecc71', textAlign: 'center', padding: '50px' }}>Loading Master QR Records...</div>;
    }

    return (
        <div style={reportStyles.container}>
            <div style={reportStyles.header}>
                <h3 style={{ color: '#2ecc71', margin: 0 }}>Master QR Audit Log ({allData.length})</h3>
                <button onClick={exportPDF} style={reportStyles.pdfBtn}>Export PDF Report</button>
            </div>

            {/* ෆිල්ටර් කොටස */}
          <div style={reportStyles.filterGrid}>
    <input 
        placeholder="🔍 Search ID or Serial..." 
        style={reportStyles.input} 
        onChange={(e) => setSearchTerm(e.target.value)} 
    />
    
    {/* Company Filter */}
    <select 
        style={{ ...reportStyles.input, backgroundColor: '#1a1a1a', color: '#fff' }} 
        onChange={(e) => setFilters({...filters, company: e.target.value})}
    >
        <option value="All" style={{ background: '#1a1a1a', color: '#fff' }}>All Companies</option>
        {[...new Set(allData.map(q => q.company))].map(c => (
            <option key={c} value={c} style={{ background: '#1a1a1a', color: '#fff' }}>{c}</option>
        ))}
    </select>

    {/* Product Filter */}
    <select 
        style={{ ...reportStyles.input, backgroundColor: '#1a1a1a', color: '#fff' }} 
        onChange={(e) => setFilters({...filters, product: e.target.value})}
    >
        <option value="All" style={{ background: '#1a1a1a', color: '#fff' }}>All Products</option>
        {[...new Set(allData.map(q => q.product))].map(p => (
            <option key={p} value={p} style={{ background: '#1a1a1a', color: '#fff' }}>{p}</option>
        ))}
    </select>

    {/* Brand Filter */}
    <select 
        style={{ ...reportStyles.input, backgroundColor: '#1a1a1a', color: '#fff' }} 
        onChange={(e) => setFilters({...filters, brand: e.target.value})}
    >
        <option value="All" style={{ background: '#1a1a1a', color: '#fff' }}>All Brands</option>
        {[...new Set(allData.map(q => q.brand))].map(b => (
            <option key={b} value={b} style={{ background: '#1a1a1a', color: '#fff' }}>{b}</option>
        ))}
    </select>
</div>

            {/* ටේබල් කොටස */}
            <div style={reportStyles.tableWrapper}>
                <table style={reportStyles.table}>
                    <thead>
                        <tr style={reportStyles.tableHead}>
                            <th style={reportStyles.th}>QR ID</th>
                            <th style={reportStyles.th}>Company Details</th>
                            <th style={reportStyles.th}>Product & Brand</th>
                            <th style={reportStyles.th}>MFD Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQRs.slice(0, 100).map((qr, idx) => ( 
                            <tr key={idx} style={reportStyles.tr}>
                                <td style={{ ...reportStyles.td, color: '#2ecc71', fontWeight: 'bold' }}>{qr.qrId}</td>
                                <td style={reportStyles.td}>
                                    <div style={{ color: '#fff' }}>{qr.company}</div>
                                </td>
                                <td style={reportStyles.td}>
                                    <div style={{ color: '#ccc' }}>{qr.product}</div>
                                    <div style={{ fontSize: '12px', color: '#2ecc71' }}>{qr.brand}</div>
                                </td>
                                <td style={{ ...reportStyles.td, color: '#888' }}>{qr.mfd}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredQRs.length > 100 && (
                    <p style={{ textAlign: 'center', color: '#555', marginTop: '10px' }}>
                        Showing first 100 records. Use filters to narrow down.
                    </p>
                )}
            </div>
        </div>
    );
};

const reportStyles = {
    container: { animation: 'fadeIn 0.5s' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    pdfBtn: { background: '#3de467', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' },
    input: { padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' },
    tableWrapper: { background: 'rgba(0,0,0,0.2)', borderRadius: '15px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { background: 'rgba(46, 204, 113, 0.1)', borderBottom: '2px solid #2ecc71' },
    th: { padding: '15px', textAlign: 'left', fontSize: '13px' },
    td: { padding: '15px', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.03)' },
    tr: { transition: '0.3s' }
};

export default QRReportView;