import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGolfBall, FaChartLine, FaCalendarAlt, FaMapMarkerAlt, FaThermometerHalf, FaEye, FaWind, FaTint, FaCog, FaUser, FaTrophy, FaUsers, FaTimes, FaEnvelope, FaPhone, FaMapPin } from 'react-icons/fa';
import { weatherService } from '../services/weatherService';
import { useAuth } from '../contexts/AuthContext';
import { getUserBuddies, getUserTeeTimes } from '../firebase/platformDatabase';
import './Dashboard.css';

const Dashboard = () => {
  const { userProfile, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buddies, setBuddies] = useState([]);
  const [buddiesLoading, setBuddiesLoading] = useState(true);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    // Don't fetch weather until we have the user profile loaded
    if (!userProfile) {
      console.log('Waiting for user profile to load...');
      return;
    }

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use user's location from profile, fallback to Los Angeles only if location is not set
        const city = userProfile.location || 'Los Angeles';
        console.log('Fetching weather for city from profile:', city);
        console.log('User profile location:', userProfile.location);
        const weatherData = await weatherService.getWeather(city);
        setWeather(weatherData);
      } catch (err) {
        setError(err.message);
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [userProfile, userProfile?.location]); // Re-fetch when profile or location changes

  // Fetch buddies
  useEffect(() => {
    const fetchBuddies = async () => {
      console.log('🔍 Fetching buddies - Auth loading:', authLoading, 'User UID:', currentUser?.uid);
      
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('⏳ Waiting for auth to finish loading...');
        return;
      }
      
      if (!currentUser?.uid) {
        console.log('⚠️  No user UID, setting buddies to empty and loading to false');
        setBuddies([]);
        setBuddiesLoading(false);
        return;
      }
      
      try {
        setBuddiesLoading(true);
        console.log('📞 Calling getUserBuddies for user:', currentUser.uid);
        const buddyList = await getUserBuddies(currentUser.uid);
        console.log('✅ Buddies fetched:', buddyList?.length || 0, 'buddies');
        setBuddies(buddyList || []);
      } catch (err) {
        console.error('❌ Error fetching buddies:', err);
        setBuddies([]);
      } finally {
        setBuddiesLoading(false);
        console.log('✅ Buddies loading complete');
      }
    };

    fetchBuddies();
  }, [currentUser, authLoading]);

  // Fetch upcoming tee times
  useEffect(() => {
    const fetchTeeTimes = async () => {
      console.log('📅 Fetching tee times - Auth loading:', authLoading, 'User UID:', currentUser?.uid);
      
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('⏳ Waiting for auth to finish loading...');
        return;
      }
      
      if (!currentUser?.uid) {
        console.log('⚠️  No user UID, setting events to empty');
        setUpcomingEvents([]);
        setEventsLoading(false);
        return;
      }
      
      try {
        setEventsLoading(true);
        console.log('📞 Calling getUserTeeTimes for user:', currentUser.uid);
        const teeTimes = await getUserTeeTimes(currentUser.uid);
        console.log('✅ Tee times fetched:', teeTimes?.length || 0, 'events');
        
        // Filter for upcoming events only
        const now = new Date();
        const upcoming = teeTimes.filter(event => {
          const eventDateTime = new Date(`${event.date} ${event.time}`);
          return eventDateTime >= now;
        }).slice(0, 3); // Show only next 3 events
        
        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error('❌ Error fetching tee times:', err);
        setUpcomingEvents([]);
      } finally {
        setEventsLoading(false);
        console.log('✅ Events loading complete');
      }
    };

    fetchTeeTimes();
  }, [currentUser, authLoading]);

  const handleBuddyClick = (buddy) => {
    setSelectedBuddy(buddy);
    setShowBuddyModal(true);
  };

  const closeBuddyModal = () => {
    setShowBuddyModal(false);
    setSelectedBuddy(null);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">
              <FaGolfBall className="title-icon" />
              Golf Buddy Dashboard
            </h1>
            <p className="dashboard-subtitle">Track your game, improve your score</p>
          </div>
          <div className="header-right">
            <button className="header-btn" onClick={() => navigate('/settings')} title="Settings">
              <FaCog />
            </button>
            <button className="header-btn" onClick={() => navigate('/settings')} title="User Profile">
              <FaUser />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Quick Stats Row */}
        <div className="stats-row">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">18</h3>
              <p className="stat-label">Best Score</p>
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">+12</h3>
              <p className="stat-label">Average Score</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">24</h3>
              <p className="stat-label">Rounds Played</p>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <FaGolfBall />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">156</h3>
              <p className="stat-label">Total Holes</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Weather Widget */}
          <div className="content-card weather-card">
            <div className="card-header">
              <h2 className="card-title">
                <FaMapMarkerAlt className="card-icon" />
                Weather Conditions
              </h2>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading weather...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>Unable to load weather data</p>
                  <p className="error-message">{error}</p>
                </div>
              ) : (
                <div className="weather-content">
                  <div className="weather-main">
                    <div className="weather-temp">
                      <FaThermometerHalf className="temp-icon" />
                      <span className="temp-value">{weather?.temp || 22}°C</span>
                    </div>
                    <div className="weather-desc">
                      <p className="weather-condition">{weather?.description || 'Clear Sky'}</p>
                      <p className="weather-location">
                        <FaMapMarkerAlt />
                        {weather?.city || 'Los Angeles'}
                      </p>
                    </div>
                  </div>

                  <div className="weather-details">
                    <div className="weather-detail">
                      <FaEye className="detail-icon" />
                      <span>Feels like {weather?.feelsLike || 24}°C</span>
                    </div>
                    <div className="weather-detail">
                      <FaTint className="detail-icon" />
                      <span>{weather?.humidity || 65}% humidity</span>
                    </div>
                    <div className="weather-detail">
                      <FaWind className="detail-icon" />
                      <span>{weather?.windSpeed || 5} km/h wind</span>
                    </div>
                  </div>

                  <div className="golf-recommendation">
                    <p className="recommendation-text">
                      {weather?.golfMessage || 'Perfect weather for golf! ⛳'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Rounds */}
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <FaChartLine className="card-icon" />
                Recent Rounds
              </h2>
            </div>
            <div className="card-body">
              <div className="rounds-list">
                <div className="round-item">
                  <div className="round-info">
                    <h4>Pebble Beach Golf Links</h4>
                    <p className="round-date">March 15, 2024</p>
                  </div>
                  <div className="round-score excellent">72</div>
                </div>
                <div className="round-item">
                  <div className="round-info">
                    <h4>Torrey Pines South</h4>
                    <p className="round-date">March 12, 2024</p>
                  </div>
                  <div className="round-score good">78</div>
                </div>
                <div className="round-item">
                  <div className="round-info">
                    <h4>Bethpage Black</h4>
                    <p className="round-date">March 8, 2024</p>
                  </div>
                  <div className="round-score average">85</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <FaTrophy className="card-icon" />
                Performance Metrics
              </h2>
            </div>
            <div className="card-body">
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-value">67%</div>
                  <div className="metric-label">Fairways Hit</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">72%</div>
                  <div className="metric-label">Greens in Regulation</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">1.8</div>
                  <div className="metric-label">Avg. Putts</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">234</div>
                  <div className="metric-label">Avg. Drive (yds)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <FaCalendarAlt className="card-icon" />
                Upcoming Events
              </h2>
            </div>
            <div className="card-body">
              {eventsLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading events...</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="empty-state">
                  <FaCalendarAlt className="empty-icon" />
                  <p>No upcoming tee times scheduled</p>
                  <button 
                    className="find-buddies-btn"
                    onClick={() => navigate('/tee-times')}
                  >
                    Schedule a Tee Time
                  </button>
                </div>
              ) : (
                <div className="events-list">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const day = eventDate.getDate();
                    const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    
                    return (
                      <div 
                        key={event.id} 
                        className="event-item"
                        onClick={() => navigate('/tee-times')}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="event-date">
                          <div className="event-day">{day}</div>
                          <div className="event-month">{month}</div>
                        </div>
                        <div className="event-info">
                          <h4>{event.courseName}</h4>
                          <p>{event.time} • {event.courseAddress || 'No address provided'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* My Golf Buddies */}
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <FaUsers className="card-icon" />
                My Golf Buddies
              </h2>
            </div>
            <div className="card-body">
              {buddiesLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading buddies...</p>
                </div>
              ) : buddies.length === 0 ? (
                <div className="empty-state">
                  <FaUsers className="empty-icon" />
                  <p>No buddies connected yet</p>
                  <button 
                    className="find-buddies-btn"
                    onClick={() => navigate('/golf')}
                  >
                    Find Golf Buddies
                  </button>
                </div>
              ) : (
                <div className="buddies-list">
                  {buddies.slice(0, 5).map((buddy) => (
                    <div 
                      key={buddy.id} 
                      className="buddy-item"
                      onClick={() => handleBuddyClick(buddy)}
                    >
                      <div className="buddy-avatar">
                        {buddy.photoURL ? (
                          <img src={buddy.photoURL} alt={buddy.name} />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className="buddy-info">
                        <h4>{buddy.name || buddy.displayName}</h4>
                        <p className="buddy-location">
                          <FaMapPin /> {buddy.location || 'Location not set'}
                        </p>
                        <p className="buddy-skill">Handicap: {buddy.skillLevel || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                  {buddies.length > 5 && (
                    <button 
                      className="view-all-btn"
                      onClick={() => navigate('/golf')}
                    >
                      View all {buddies.length} buddies
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Buddy Profile Modal */}
      {showBuddyModal && selectedBuddy && (
        <div className="modal-overlay" onClick={closeBuddyModal}>
          <div className="buddy-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeBuddyModal}>
              <FaTimes />
            </button>
            
            <div className="buddy-modal-header">
              <div className="buddy-modal-avatar">
                {selectedBuddy.photoURL ? (
                  <img src={selectedBuddy.photoURL} alt={selectedBuddy.name} />
                ) : (
                  <FaUser />
                )}
              </div>
              <h2>{selectedBuddy.name || selectedBuddy.displayName}</h2>
              <p className="buddy-modal-bio">{selectedBuddy.bio || 'Golf enthusiast'}</p>
            </div>

            <div className="buddy-modal-body">
              <div className="buddy-detail">
                <FaMapPin className="detail-icon" />
                <div>
                  <label>Location</label>
                  <p>{selectedBuddy.location || 'Not specified'}</p>
                </div>
              </div>

              <div className="buddy-detail">
                <FaTrophy className="detail-icon" />
                <div>
                  <label>Skill Level / Handicap</label>
                  <p>{selectedBuddy.skillLevel || 'Not specified'}</p>
                </div>
              </div>

              {selectedBuddy.email && (
                <div className="buddy-detail">
                  <FaEnvelope className="detail-icon" />
                  <div>
                    <label>Email</label>
                    <p>{selectedBuddy.email}</p>
                  </div>
                </div>
              )}

              {selectedBuddy.phone && (
                <div className="buddy-detail">
                  <FaPhone className="detail-icon" />
                  <div>
                    <label>Phone</label>
                    <p>{selectedBuddy.phone}</p>
                  </div>
                </div>
              )}

              {selectedBuddy.availability && (
                <div className="buddy-detail">
                  <FaCalendarAlt className="detail-icon" />
                  <div>
                    <label>Availability</label>
                    <p>{selectedBuddy.availability}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="buddy-modal-footer">
              <button 
                className="message-btn"
                onClick={() => {
                  closeBuddyModal();
                  navigate('/golf');
                }}
              >
                <FaEnvelope /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
