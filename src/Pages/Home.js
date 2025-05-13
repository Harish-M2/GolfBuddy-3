import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import golfImage from '../assets/golf.jpg';
import coursesImage from '../assets/courses.jpg'; // Add a new image for Courses

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Welcome</h1>
      <h2>Click below for more!</h2>
      <div className="image-buttons">
        <div className="image-button-container">
          <img
            src={golfImage}
            alt="Golf"
            onClick={() => navigate('/golf')}
            className="image-button"
            loading="lazy"
          />
          <p>Golf Ranges</p>
        </div>
        <div className="image-button-container">
          <img
            src={coursesImage}
            alt="Courses"
            onClick={() => navigate('/courses')} // Navigate to Courses page
            className="image-button"
            loading="lazy"
          />
          <p>Courses</p>
        </div>
      </div>
    </div>
  );
}

