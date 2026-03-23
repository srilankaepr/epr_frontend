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
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = 
        (qr.qrId || "").toLowerCase().includes(term) || 
        (qr.serialNumber || "").toLowerCase().includes(term) ||
        (qr.registrationId || "").toLowerCase().includes(term) ||
        (qr.company || "").toLowerCase().includes(term);

    const matchesCompany = filters.company === 'All' || qr.company === filters.company;
    const matchesProduct = filters.product === 'All' || qr.product === filters.product;
    const matchesBrand = filters.brand === 'All' || qr.brand === filters.brand;
    
    return matchesSearch && matchesCompany && matchesProduct && matchesBrand;
});
    // 3. PDF එක සාදන ලොජික් එක...............................................................
    const exportPDF = () => {
    const doc = new jsPDF();
    
    // PDF එකේ ප්‍රධාන මාතෘකාව
    doc.setFontSize(16);
    doc.setTextColor(46, 204, 113); // කොළ පාට
    doc.text("EPR System - Master QR Audit Report", 14, 15);
    
    // විස්තර (දිනය සහ වාර්තා ගණන)
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Records Found: ${filteredQRs.length}`, 14, 27);

    // ටේබල් එකේ තීරු (Columns) - Reg ID එකත් එකතු කළා
    const tableColumn = ["QR ID", "Reg ID", "Company", "Product", "Brand", "MFD"];
    
    // 📊 වැදගත්ම තැන: .slice(0, 100) කරන්නේ නැතුව සර්ච් එකේ තියෙන ඔක්කොම (filteredQRs) ගන්නවා
    const tableRows = filteredQRs.map(qr => [
        qr.qrId,
        qr.registrationId || 'N/A',
        qr.company,
        qr.product,
        qr.brand,
        qr.mfd
    ]);

    // ටේබල් එක PDF එකට ඇතුළත් කිරීම
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { 
            fillColor: [46, 204, 113], 
            fontSize: 10,
            halign: 'center'
        },
        styles: { 
            fontSize: 8,
            cellPadding: 3 
        },
        columnStyles: {
            0: { cellWidth: 40 }, // QR ID එකට ඉඩ ටිකක් වැඩි කළා
            1: { fontStyle: 'bold' } // Reg ID එක තද අකුරෙන්
        }
    });

    // PDF එක සේව් කිරීම
    doc.save(`Master_QR_Report_${new Date().getTime()}.pdf`);
};

    return (
       <div style={reportStyles.container}>
    <div style={reportStyles.header}>
        <div>
            {/* ප්‍රධාන මාතෘකාව */}
            <h3 style={{ color: '#2ecc71', margin: 0 }}>Master QR Audit Log</h3>
            
            {/* 📊 මෙන්න මෙතන තමයි අලුත් Count ලොජික් එක තියෙන්නේ */}
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                Total Records: <span style={{ color: '#fff' }}>{allData.length}</span> | 
                Filtered Results: <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{filteredQRs.length}</span>
            </div>
        </div>

        {/* PDF Export බටන් එක */}
        <button onClick={exportPDF} style={reportStyles.pdfBtn}>Export PDF Report</button>
    </div>

            {/* ෆිල්ටර් කොටස */}
          <div style={reportStyles.filterGrid}>
    <input 
        placeholder="🔍 Search QR ID/Company name or Reg NO" 
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
                <div style={{ color: '#fff', fontWeight: '600' }}>{qr.company}</div>
                <div style={{ fontSize: '11px', color: '#2ecc71', opacity: 0.8, marginTop: '4px' }}>
                    {qr.registrationId || 'REG-N/A'}
                           </div>
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