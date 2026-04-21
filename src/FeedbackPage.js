import React, { useState, useEffect } from 'react';
import API from './api'; 

const FeedbackPage = ({ currentUser: propsUser }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [replyTexts, setReplyTexts] = useState({}); 

    const userString = localStorage.getItem('user');
    const adminEmail = localStorage.getItem('adminEmail');

    const currentUser = propsUser || (userString ? JSON.parse(userString) : null);

    const isAdmin = !!adminEmail && !localStorage.getItem('user');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a star rating!");

        const feedbackData = { 
            user: currentUser?.contactPersonName || currentUser?.companyName || currentUser?.fullName || "Anonymous", 
            officialEmail: currentUser?.officialEmail || currentUser?.email || "N/A",
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
    };

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


    const handleAdminReply = async (id) => {
    const replyText = replyTexts[id];
    if (!replyText || replyText.trim() === "") return alert("Please enter a reply!");

    try {
        await API.put(`/admin/feedbacks/${id}`, { reply: replyText });
        
        setReplyTexts(prev => ({ ...prev, [id]: "" }));
        fetchFeedbacks();
        alert("Reply sent successfully!");
    } catch (err) {
        console.error("Error sending reply:", err);
    }
};

    return (
        <div style={styles.feedbackContainer}>
            <h1 style={styles.mainTitle}>USER FEEDBACK</h1>
            
        {!isAdmin && (    
            <form onSubmit={handleSubmit} style={styles.feedbackForm}>
                <h3 style={{marginBottom: '15px', color: '#2ecc71'}}>
                    {editingId ? "Update Your Review" : "Share Your Experience"}
                </h3>
                
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
        )}
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
                        
                        {/* ✅ currentUser ගේ නිවැරදි email එක අනුව Edit/Delete පාලනය */}
                     {!isAdmin && (f.officialEmail === currentUser?.officialEmail || f.officialEmail === currentUser?.email) && (
                          <div style={styles.actionRow}>
                                 <button onClick={() => {setEditingId(f._id); setText(f.text); setRating(f.rating);}} style={styles.editBtn}>Edit</button>
                                 <button onClick={() => handleDelete(f._id)} style={styles.deleteBtn}>Delete</button>
                            </div>
                           )}

                        {f.reply && (
                            <div style={styles.replyBox}>
                                <strong>Admin <span style={styles.replyTag}>REPLY</span></strong>
                                <p style={{margin: '5px 0 0 0', color: '#eee'}}>{f.reply}</p>
                            </div>
                        )}

{isAdmin && (
    <div style={{ marginTop: '15px', borderTop: '1px solid #222', paddingTop: '15px' }}>
        <input 
            type="text" 
            placeholder={f.reply ? "Update your reply..." : "Write a reply to this customer..."}
            value={replyTexts[f._id] || ""}
            onChange={(e) => setReplyTexts({ ...replyTexts, [f._id]: e.target.value })}
            style={{
                width: '100%', 
                height: '40px', 
                background: '#000', 
                border: '1px solid #444', 
                color: '#fff', 
                borderRadius: '8px', 
                padding: '0 15px', 
                marginBottom: '10px',
                outline: 'none',
                boxSizing: 'border-box',
                display: 'block'
            }} 
        />
        <button 
            type="button"
            onClick={() => handleAdminReply(f._id)} 
            style={{...styles.submitBtn, padding: '8px 15px', fontSize: '12px'}}
        >
            {f.reply ? "Update Reply" : "Send Reply"}
        </button>
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