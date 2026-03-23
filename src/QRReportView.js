import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const QRReportView = ({ allData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        company: 'All',
        product: 'All',
        brand: 'All'
    });

    // Filtering Logic
    const filteredQRs = allData.filter(qr => {
        const matchesSearch = (qr.qrId || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (qr.registrationId || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCompany = filters.company === 'All' || qr.company === filters.company;
        const matchesProduct = filters.product === 'All' || qr.product === filters.product;
        const matchesBrand = filters.brand === 'All' || qr.brand === filters.brand;
        
        return matchesSearch && matchesCompany && matchesProduct && matchesBrand;
    });

    // PDF Export Logic
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("EPR System - Master QR Audit Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

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
            headStyles: { fillStyle: '#2ecc71' }
        });

        doc.save(`QR_Report_${new Date().getTime()}.pdf`);
    };

    return (
        <div style={reportStyles.container}>
            <div style={reportStyles.header}>
                <h3 style={{ color: '#2ecc71', margin: 0 }}>Master QR Audit Log</h3>
                <button onClick={exportPDF} style={reportStyles.pdfBtn}>Export PDF Report</button>
            </div>

            {/* Filters Section */}
            <div style={reportStyles.filterGrid}>
                <input 
                    placeholder="🔍 Search ID or Reg Num..." 
                    style={reportStyles.input} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <select style={reportStyles.input} onChange={(e) => setFilters({...filters, company: e.target.value})}>
                    <option value="All">All Companies</option>
                    {[...new Set(allData.map(q => q.company))].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select style={reportStyles.input} onChange={(e) => setFilters({...filters, product: e.target.value})}>
                    <option value="All">All Products</option>
                    {[...new Set(allData.map(q => q.product))].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select style={reportStyles.input} onChange={(e) => setFilters({...filters, brand: e.target.value})}>
                    <option value="All">All Brands</option>
                    {[...new Set(allData.map(q => q.brand))].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>

            {/* Table Section */}
            <div style={reportStyles.tableWrapper}>
                <table style={reportStyles.table}>
                    <thead>
                        <tr style={reportStyles.tableHead}>
                            <th style={reportStyles.th}>QR ID</th>
                            <th style={reportStyles.th}>Entity Details</th>
                            <th style={reportStyles.th}>Asset Info</th>
                            <th style={reportStyles.th}>MFD Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQRs.slice(0, 100).map((qr, idx) => ( // Performance එකට මුල් 100 පෙන්වමු
                            <tr key={idx} style={reportStyles.tr}>
                                <td style={{ ...reportStyles.td, color: '#2ecc71', fontWeight: 'bold' }}>{qr.qrId}</td>
                                <td style={reportStyles.td}>
                                    <div style={{ color: '#fff' }}>{qr.company}</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>{qr.registrationId || 'N/A'}</div>
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
    pdfBtn: { background: '#5fed4c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
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