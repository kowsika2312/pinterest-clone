import React, { useState } from 'react';
import Feed from './components/Feed';         
import CreatePin from './components/createpin'; 
import Auth from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null); 
  
  const [view, setView] = useState('feed');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null); 
  const [allPinsCache, setAllPinsCache] = useState([]);      

  const handleLoginSuccess = (userData) => {
    setUser(userData); 
  };

  const handleLogout = () => {
    setUser(null);
    setSearchQuery('');
    setSearchResults(null);
    setAllPinsCache([]);
    setView('feed');
  };

  
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/pins?q=${searchQuery}`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      
      setSearchResults(data); 
      setView('feed');     
    } catch (err) {
      console.error("Search API Connection Error:", err);
    }
  };

  
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null); 
  };

 
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      
      <nav className="pinterest-navbar">
        <div className="nav-logo" onClick={() => { setView('feed'); handleClearSearch(); }}>
          <svg viewBox="0 0 24 24" className="pinterest-icon" aria-hidden="true" width="24" height="24">
            <path d="M0 12c0 5.123 3.211 9.497 7.73 11.218-.11-.957-.208-2.428.044-3.473.227-.943 1.468-6.223 1.468-6.223s-.375-.75-.375-1.86c0-1.742 1.01-3.042 2.267-3.042 1.07 0 1.586.803 1.586 1.767 0 1.076-.685 2.684-1.038 4.175-.295 1.25.626 2.268 1.859 2.268 2.23 0 3.945-2.352 3.945-5.747 0-3.005-2.159-5.105-5.24-5.105-3.57 0-5.665 2.677-5.665 5.443 0 1.077.414 2.232.931 2.857a.386.386 0 01.089.368c-.097.404-.315 1.282-.358 1.458-.057.23-.189.28-.435.165C3.804 15.534 2.5 12.384 2.5 9.774c0-4.394 3.193-8.43 9.204-8.43 4.832 0 8.587 3.443 8.587 8.047 0 4.802-3.028 8.667-7.23 8.667-1.412 0-2.739-.733-3.193-1.6l-.87 3.313c-.315 1.203-1.168 2.71-1.74 3.645A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12z" fill="#E60023"></path>
          </svg>
          <span className="brand-name">Pinterest</span>
        </div>

        
        <div className="nav-menu" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            className={`nav-btn ${view === 'feed' && !searchResults ? 'active' : ''}`} 
            onClick={() => { setView('feed'); handleClearSearch(); }}
          >
            Home
          </button>
          <button 
            className={`nav-btn ${view === 'create' ? 'active' : ''}`} 
            onClick={() => setView('create')}
          >
            Create
          </button>

          
          {user && (
            <button 
              onClick={() => {
             
                const myPersonalPins = allPinsCache.filter(pin => 
                  pin.user === user.userId || 
                  pin.user?._id === user.userId || 
                  pin.user === user.id ||
                  String(pin.user) === String(user.userId)
                );
                setSearchResults(myPersonalPins);
                setView('feed');
              }} 
              className="nav-profile-btn"
              style={{
                backgroundColor: '#efefef',
                padding: '8px 14px',
                borderRadius: '18px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#111',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#e2e2e2'}
              onMouseOut={(e) => e.target.style.background = '#efefef'}
            >
              ⚙️ {user.username}'s Profile
            </button>
          )}
        </div>

       
        <div className="nav-search-container" style={{ flexGrow: 1, position: 'relative' }}>
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search for ideas, wallpaper, aesthetics..." 
              className="nav-search-bar" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingRight: '35px' }}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#767676',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            )}
          </form>
        </div>

        
        <div className="nav-profile-section" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
          <span className="user-greeting" style={{ fontWeight: '600', color: '#111', fontSize: '14px' }}>
            Hi, {user.username}!
          </span>
          <button 
            onClick={handleLogout} 
            style={{ 
              background: '#efefef', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '16px', 
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#e2e2e2'}
            onMouseOut={(e) => e.target.style.background = '#efefef'}
          >
            Logout
          </button>
        </div>
      </nav>

     
      <main className="main-content">
        {view === 'feed' ? (
          <Feed 
            user={user} 
            searchResults={searchResults} 
            
            onPinsLoaded={(loadedPins) => setAllPinsCache(loadedPins)} 
          />
        ) : (
          <CreatePin user={user} />
        )}
      </main>
    </div>
  );
}

export default App;