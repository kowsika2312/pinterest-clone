import React, { useState } from 'react';

export default function CreatePin() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert('Please select an image first!');
    
    setIsSubmitting(true);


const formData = new FormData();
formData.append('title', title);
formData.append('description', description);
formData.append('image', imageFile); 
formData.append('userId', user.userId); 
    try {
      
const response = await fetch('http://localhost:5000/api/pins', {
  method: 'POST',
  body: formData,
});

      if (response.ok) {
        alert('Pin successfully created and uploaded!');
        
        setTitle('');
        setDescription('');
        setImage(null);
      } else {
        const errData = await response.json();
        alert(`Failed to save pin: ${errData.error || 'Unknown Error'}`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Could not connect to backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '16px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Create a New Pin</h2>
        
        <input 
          type="text" 
          placeholder="Add your title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        
        <textarea 
          placeholder="Tell everyone what your Pin is about" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', resize: 'vertical' }}
        />
        
        <input 
          type="file" 
          accept="image/*" 
          onChange={e => setImage(e.target.files[0])} 
          required 
          style={{ padding: '5px' }}
        />
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            backgroundColor: isSubmitting ? '#a5a5a5' : '#E60023', 
            color: 'white', 
            padding: '12px', 
            border: 'none', 
            borderRadius: '24px', 
            fontWeight: 'bold', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer' 
          }}
        >
          {isSubmitting ? 'Uploading to Cloudinary...' : 'Publish Pin'}
        </button>
      </form>
    </div>
  );
}