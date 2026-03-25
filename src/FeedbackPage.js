import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [editingId, setEditingId] = useState(null);

    // 1. සියලුම Feedback ලබා ගැනීම
    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/feedbacks');
            setFeedbacks(res.data);
        } catch (err) { console.log(err); }
    };

    useEffect(() => { fetchFeedbacks(); }, []);

    // 2. Feedback එකක් Submit කිරීම (Create & Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/feedbacks/${editingId}`, { text, rating });
                setEditingId(null);
            } else {
                // මෙතන "User" කියන තැනට ලොග් වෙලා ඉන්න කෙනාගේ නම දාන්න පුළුවන්
                await axios.post('http://localhost:5000/api/feedbacks', { user: "Nuwan Perera", text, rating });
            }
            setText(""); setRating(0); fetchFeedbacks();
        } catch (err) { console.log(err); }
    };

    // 3. Feedback එකක් මකා දැමීම (Delete)
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            await axios.delete(`http://localhost:5000/api/feedbacks/${id}`);
            fetchFeedbacks();
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Dashboard</button>
            
            <div style={styles.feedbackContainer}>
                <h1 style={styles.mainTitle}>USER FEEDBACK</h1>
                
                {/* Form එක */}
                <form onSubmit={handleSubmit} style={styles.feedbackForm}>
                    <h3>{editingId ? "Edit Your Feedback" : "Share Your Experience"}</h3>
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
                        placeholder="Write your feedback here..." 
                        style={styles.textArea} 
                        required
                    />
                    <button type="submit" style={styles.submitBtn}>
                        {editingId ? "Update Feedback" : "Submit Feedback"}
                    </button>
                    {editingId && <button onClick={() => {setEditingId(null); setText(""); setRating(0);}} style={styles.cancelBtn}>Cancel</button>}
                </form>

                {/* Feedback List එක */}
                <div style={styles.commentsSection}>
                    <h3>Recent Community Reviews</h3>
                    {feedbacks.map((f) => (
                        <div key={f._id} style={styles.commentItem}>
                            <div style={styles.commentHeader}>
                                <strong>{f.user}</strong>
                                <span style={{color: '#2ecc71'}}>{"★".repeat(f.rating)}{"☆".repeat(5-f.rating)}</span>
                            </div>
                            <p style={styles.commentText}>{f.text}</p>
                            
                            {/* Edit/Delete Buttons */}
                            <div style={styles.actionRow}>
                                <button onClick={() => {setEditingId(f._id); setText(f.text); setRating(f.rating);}} style={styles.editBtn}>Edit</button>
                                <button onClick={() => handleDelete(f._id)} style={styles.deleteBtn}>Delete</button>
                            </div>

                            {/* Admin Reply */}
                            {f.reply && (
                                <div style={styles.replyBox}>
                                    <strong>Admin <span style={styles.replyTag}>REPLY</span></strong>
                                    <p>{f.reply}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const styles = {
    pageWrapper: { minHeight: '100vh', background: '#0a0a0a', padding: '40px', color: '#fff' },
    feedbackContainer: { maxWidth: '800px', margin: '0 auto' },
    backBtn: { background: 'none', border: 'none', color: '#2ecc71', cursor: 'pointer', marginBottom: '20px' },
    mainTitle: { fontSize: '32px', textAlign: 'center', color: '#fff', marginBottom: '40px' },
    feedbackForm: { background: '#111', padding: '30px', borderRadius: '20px', border: '1px solid #222', marginBottom: '40px' },
    starRow: { fontSize: '30px', marginBottom: '15px', display: 'flex', gap: '5px' },
    star: { cursor: 'pointer', transition: '0.2s' },
    textArea: { width: '100%', height: '100px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '10px', padding: '15px', marginBottom: '15px' },
    submitBtn: { background: '#2ecc71', color: '#000', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { background: 'none', border: 'none', color: '#888', marginLeft: '10px', cursor: 'pointer' },
    commentItem: { background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222', marginBottom: '20px' },
    commentHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    commentText: { color: '#bbb', lineHeight: '1.6' },
    actionRow: { display: 'flex', gap: '15px', marginTop: '15px' },
    editBtn: { background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '13px' },
    deleteBtn: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '13px' },
    replyBox: { marginTop: '15px', paddingLeft: '15px', borderLeft: '2px solid #2ecc71', background: 'rgba(46, 204, 113, 0.05)', padding: '10px' },
    replyTag: { background: '#2ecc71', color: '#000', fontSize: '10px', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '5px' }
};