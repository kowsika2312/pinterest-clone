import React, { useEffect, useState } from 'react';
import './Feed.css';


export default function Feed({ user, searchResults, onPinsLoaded }) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);

  
  useEffect(() => {
    if (searchResults !== null) {
      
      setPins(searchResults);
      setLoading(false);
    } else {
      
      setLoading(true);
      fetch('http://localhost:5000/api/pins')
        .then((res) => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then((data) => {
          const pinsArray = Array.isArray(data) ? data : [];
          setPins(pinsArray);
          
          
          if (onPinsLoaded) {
            onPinsLoaded(pinsArray);
          }
          
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching pins:', err);
          setPins([]);
          setLoading(false);
        });
    }
  }, [searchResults]); 

  
  const handleLike = async (e, pinId) => {
    e.stopPropagation(); 
    
    
    console.log("Active User State Object:", user);

    
    const currentUserId = user?.userId || user?.id || localStorage.getItem("userId");

    if (!currentUserId) {
      alert("Please log in to like this pin!");
      return;
    }

    try {
      
      const response = await fetch('http://localhost:5000/api/pins/interaction/like', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUserId, 
          pinId: pinId           
        }) 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend response error details:", errorData);
        throw new Error("Could not update like state");
      }
      
      const updatedPin = await response.json();

      
      setPins(pins.map(pin => pin._id === pinId ? updatedPin : pin));
      if (selectedPin && selectedPin._id === pinId) {
        setSelectedPin(updatedPin);
      }
    } catch (err) {
      console.error("Error liking pin:", err);
    }
  };

  
  const handleDownload = async (imageUrl, title) => {
    const sanitizedName = `${title.replace(/\s+/g, '_')}_pin.jpg`;

    try {
     
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error("CORS or network block");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = sanitizedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("⚠️ Native blob fetch blocked by CORS. Switching to safe tab download fallback...");
      
      
      const attachmentUrl = imageUrl.replace('/upload/', '/upload/fl_attachment/');
      
      const fallbackLink = document.createElement('a');
      fallbackLink.href = attachmentUrl;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.download = sanitizedName;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    }
  };

  
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevents click from bubbling up to the modal backdrop container elements
    
    if (window.confirm("Are you sure you want to delete this pin?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/pins/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSelectedPin(null);
          setPins(pins.filter(pin => pin._id !== id));
          alert("Pin deleted successfully!");
        } else {
          alert("Failed to delete the pin.");
        }
      } catch (error) {
        console.error("Error deleting pin:", error);
        alert("An error occurred while deleting.");
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', fontWeight: '500' }}>Loading your feed...</div>;

  return (
    <div className="feed-container">
      {pins.length === 0 ? (
        
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#5f5f5f' }}>
          <h2>You haven't saved any ideas yet!</h2>
          <p style={{ color: '#767676', marginTop: '8px' }}>Click "Create" at the top to build your first pin.</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {pins.map((pin) => {
            
            const currentUserId = user?.userId || user?.id || localStorage.getItem("userId");
            const isLikedByMe = pin.likes?.includes(currentUserId);

            return (
              <div 
                key={pin._id} 
                className="pin-card"
                onClick={() => setSelectedPin(pin)}
              >
                {/* 🌟 Floating Hover Like Action Button Box Layout */}
                <div className="like-container">
                  <button 
                    className={`like-btn ${isLikedByMe ? 'liked' : ''}`}
                    onClick={(e) => handleLike(e, pin._id)}
                  >
                    {isLikedByMe ? '❤️ Liked' : '🤍 Save'}
                  </button>
                </div>

                <img src={pin.imageUrl} alt={pin.title} className="pin-image" />
                <div className="pin-overlay">
                  <p className="pin-title">{pin.title}</p>
                  {pin.likes?.length > 0 && (
                    <span className="like-counter-badge">❤️ {pin.likes.length}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      
      {selectedPin && (
        <div className="modal-backdrop" onClick={() => setSelectedPin(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedPin(null)}>×</button>
            <div className="modal-body">
              <div className="modal-image-container">
                <img src={selectedPin.imageUrl} alt={selectedPin.title} />
              </div>
              <div className="modal-details">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>{selectedPin.title}</h2>
                  
                  <button 
                    className={`like-btn ${selectedPin.likes?.includes(user?.userId || user?.id || localStorage.getItem("userId")) ? 'liked' : ''}`}
                    onClick={(e) => handleLike(e, selectedPin._id)}
                    style={{ position: 'static', opacity: 1 }}
                  >
                    {selectedPin.likes?.includes(user?.userId || user?.id || localStorage.getItem("userId")) ? '❤️ Saved' : '🤍 Save'}
                  </button>
                </div>
                <p style={{ marginTop: '12px' }}>{selectedPin.description}</p>
                {selectedPin.likes?.length > 0 && (
                  <p style={{ fontSize: '13px', color: '#767676', fontWeight: '500', marginTop: '4px' }}>
                    Liked by {selectedPin.likes.length} account{selectedPin.likes.length > 1 ? 's' : ''}
                  </p>
                )}
                
               
                <div className="modal-actions" style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  
                  
                  <button 
                    onClick={() => handleDownload(selectedPin.imageUrl, selectedPin.title)}
                    className="custom-download-btn"
                  >
                    Download Image
                  </button>

                 
                  {(
                    selectedPin.user === user?.userId || 
                    selectedPin.user?._id === user?.userId || 
                    selectedPin.user === user?.id ||
                    String(selectedPin.user) === String(user?.userId) ||
                    String(selectedPin.user) === String(localStorage.getItem("userId"))
                  ) && (
                    <button 
                      onClick={(e) => handleDelete(e, selectedPin._id)} 
                      className="delete-btn"
                    >
                      Delete Pin
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}