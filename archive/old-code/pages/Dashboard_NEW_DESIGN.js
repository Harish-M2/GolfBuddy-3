import React, { useState, useEffect } from 'react';
import { FaGolfBall, FaChartLine, FaCalendarAlt, FaMapMarkerAlt, FaThermometerHalf, FaEye, FaWind, FaTint, FaCog, FaUser, FaTrophy } from 'react-icons/fa';
import { weatherService } from '../services/weatherService';
import './Dashboard.css';

const Dashboard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const weatherData = await weatherService.getWeather('Los Angeles');
        setWeather(weatherData);
      } catch (err) {
        setError(err.message);
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

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
            <button className="header-btn">
              <FaCog />
            </button>
            <button className="header-btn">
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
              <div className="events-list">
                <div className="event-item">
                  <div className="event-date">
                    <div className="event-day">22</div>
                    <div className="event-month">MAR</div>
                  </div>
                  <div className="event-info">
                    <h4>Club Championship</h4>
                    <p>Riviera Country Club</p>
                  </div>
                </div>
                <div className="event-item">
                  <div className="event-date">
                    <div className="event-day">28</div>
                    <div className="event-month">MAR</div>
                  </div>
                  <div className="event-info">
                    <h4>Weekly Group Round</h4>
                    <p>Los Angeles Country Club</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
