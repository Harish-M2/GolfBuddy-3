import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResponsiveAppBar from './Components/AppBar'; // Import the AppBar
import { Home } from './Pages/Home';
import { Golf } from './Pages/Golf';
import { Courses } from './Pages/Courses';

function App() {
  return (
    <Router>
      <ResponsiveAppBar /> {/* Add the AppBar */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/golf" element={<Golf />} />
        <Route path="/courses" element={<Courses />} />
      </Routes>
    </Router>
  );
}

export default App;