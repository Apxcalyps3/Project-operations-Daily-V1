import React, { useState } from 'react';

const FeedbackForm = () => {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="retro-window" style={{ maxWidth: '600px', width: '100%' }}>
      <div className="retro-window-header">
        <div className="window-dots">
          <div className="window-dot" />
          <div className="window-dot" />
          <div className="window-dot" />
        </div>
        <div className="window-title">SYSTEM REVIEW & FEEDBACK</div>
      </div>

      <div className="retro-window-body">
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '1.2rem', color: '#4ade80', marginBottom: '10px' }}>
              TRANSMISSION RECEIVED
            </div>
            <p style={{ opacity: 0.8 }}>Thank you for submitting telemetry and review feedback.</p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="pill-button"
              style={{ marginTop: '1rem' }}
            >
              SEND ANOTHER
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>RATING (1-5)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="counter-btn"
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: rating >= star ? 'rgba(74, 222, 128, 0.3)' : 'transparent',
                      color: '#4ade80'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>FEEDBACK / COMMENTS</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="pill-input"
                style={{ width: '100%', minHeight: '100px', borderRadius: '12px', resize: 'vertical' }}
                placeholder="Enter feedback transmission here..."
                required
              />
            </div>

            <button type="submit" className="run-analysis-btn" style={{ alignSelf: 'flex-start' }}>
              SUBMIT TRANSMISSION
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
