import React, { useState, useEffect } from 'react';
import API from './api'; 

const FeedbackPage = ({ currentUser }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [editingId, setEditingId] = useState(null);

    // 1. සියලුම Feedback ලබා ගැනීම
    const fetchFeedbacks = async () => {
        try {
            const res = await API.get('/admin/feedbacks'); 
            setFeedbacks(res.data);
        } catch (err) { 
            console.error("Error fetching feedbacks:", err); 
        }
    };

    useEffect(() => { 
        fetchFeedbacks(); 
    }, []);

    /* 2. Feedback එකක් Submit කිරීම (Create & Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a star rating!");

        const feedbackData = { 
            user: currentUser?.contactPersonName || "Anonymous", 
            officialEmail: currentUser?.officialEmail || "N/A",
            text, 
            rating 
        };

        try {
            if (editingId) {
                await API.put(`/admin/feedbacks/${editingId}`, { text, rating });
                setEditingId(null);
            } else {
                await API.post('/admin/feedbacks', feedbackData);
            }
            setText(""); 
            setRating(0); 
            fetchFeedbacks();
        } catch (err) { 
            console.error("Error submitting feedback:", err); 
        }
    };*/

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a star rating!");

        // 1. LocalStorage එකෙන් දත්ත ගන්නවා
        const rawData = localStorage.getItem('user');
        const storedUser = rawData ? JSON.parse(rawData) : null;

        // 2. නම හරියටම තෝරාගැනීම (Backend එකේ අලුත් Key එක මුලින්ම බලනවා)
        const userName = storedUser?.fullName || 
                         storedUser?.contactPersonName || 
                         storedUser?.name || 
                         "Anonymous";

        const feedbackData = { 
            user: userName, 
            officialEmail: storedUser?.email || storedUser?.officialEmail || "N/A",
            text, 
            rating 
        };

        console.log("Saving feedback for:", feedbackData.user); // 👈 මෙතන දැන් නම වැටෙන්න ඕනේ

        try {
            if (editingId) {
                await API.put(`/admin/feedbacks/${editingId}`, { text, rating });
                setEditingId(null);
            } else {
                await API.post('/admin/feedbacks', feedbackData);
            }
            setText(""); 
            setRating(0); 
            fetchFeedbacks();
        } catch (err) { 
            console.error("Error submitting feedback:", err); 
        }
    };

    // 3. Feedback එකක් මකා දැමීම (Delete)
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            try {
                await API.delete(`/admin/feedbacks/${id}`);
                fetchFeedbacks();
            } catch (err) {
                console.error("Error deleting feedback:", err);
            }
        }
    };

    return (
        <div style={styles.feedbackContainer}>
            <h1 style={styles.mainTitle}>USER FEEDBACK</h1>
            
            {/* Feedback Form එක */}
            <form onSubmit={handleSubmit} style={styles.feedbackForm}>
                <h3 style={{marginBottom: '15px', color: '#2ecc71'}}>
                    {editingId ? "Update Your Review" : "Share Your Experience"}
                </h3>
                
                {/* Star Rating Section */}
                <div style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} 
                            style={{...styles.star, color: (hover || rating) >= star ? '#2ecc71' : '#555'}}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >★</span>
                    ))}
                </div>

                <textarea 
                    value={text} 
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tell us what you think..." 
                    style={styles.textArea} 
                    required
                />

                <div style={{display: 'flex', gap: '10px'}}>
                    <button type="submit" style={styles.submitBtn}>
                        {editingId ? "Update Now" : "Post Feedback"}
                    </button>
                    {editingId && (
                        <button 
                            type="button" 
                            onClick={() => {setEditingId(null); setText(""); setRating(0);}} 
                            style={styles.cancelBtn}
                        >Cancel</button>
                    )}
                </div>
            </form>

            {/* Feedback List එක */}
            <div style={styles.commentsSection}>
                <h3 style={{marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px'}}>
                    Community Reviews ({feedbacks.length})
                </h3>
                
                {feedbacks.length === 0 ? <p style={{color: '#888'}}>No reviews yet. Be the first!</p> : null}

                {feedbacks.map((f) => (
                    <div key={f._id} style={styles.commentItem}>
                        <div style={styles.commentHeader}>
                            <strong>{f.user}</strong>
                            <span style={{color: '#2ecc71'}}>
                                {"★".repeat(f.rating)}{"☆".repeat(5-f.rating)}
                            </span>
                        </div>
                        <p style={styles.commentText}>{f.text}</p>
                        
                        {/* තමන්ගේම Feedback එකක් නම් විතරක් Edit/Delete පෙන්නන්න */}
                        {f.officialEmail === currentUser?.officialEmail && (
                            <div style={styles.actionRow}>
                                <button onClick={() => {setEditingId(f._id); setText(f.text); setRating(f.rating);}} style={styles.editBtn}>Edit</button>
                                <button onClick={() => handleDelete(f._id)} style={styles.deleteBtn}>Delete</button>
                            </div>
                        )}

                        {/* Admin Reply කොටස */}
                        {f.reply && (
                            <div style={styles.replyBox}>
                                <strong>Admin <span style={styles.replyTag}>REPLY</span></strong>
                                <p style={{margin: '5px 0 0 0', color: '#eee'}}>{f.reply}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    feedbackContainer: { 
        maxWidth: '700px',     
        margin: '0 auto',       
        padding: '40px 20px',
        boxSizing: 'border-box',
        width: '100%'           
    },
    mainTitle: { fontSize: '28px', textAlign: 'center', color: '#fff', marginBottom: '30px', letterSpacing: '2px' },
    feedbackForm: { background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '15px', border: '1px solid #333', marginBottom: '40px' },
    starRow: { fontSize: '32px', marginBottom: '15px', display: 'flex', gap: '8px' },
    star: { cursor: 'pointer', transition: '0.2s' },
    textArea: { width: '100%', height: '120px', background: '#000', border: '1px solid #444', color: '#fff', borderRadius: '10px', padding: '15px', marginBottom: '15px', outline: 'none',boxSizing: 'border-box',display: 'block'},
    submitBtn: { background: '#2ecc71', color: '#000', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
    cancelBtn: { background: '#444', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer' },
    commentItem: { background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222', marginBottom: '20px' },
    commentHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    commentText: { color: '#ccc', lineHeight: '1.6', fontSize: '15px' },
    actionRow: { display: 'flex', gap: '20px', marginTop: '15px', borderTop: '1px solid #222', paddingTop: '10px' },
    editBtn: { background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
    deleteBtn: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
    replyBox: { marginTop: '15px', padding: '12px', borderLeft: '3px solid #2ecc71', background: 'rgba(46, 204, 113, 0.08)', borderRadius: '0 8px 8px 0' },
    replyTag: { background: '#2ecc71', color: '#000', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '8px', verticalAlign: 'middle' }
};

export default FeedbackPage;