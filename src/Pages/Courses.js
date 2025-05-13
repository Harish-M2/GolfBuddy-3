import React, { useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardContent, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

export function Courses() {
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(10); // Default radius in miles
  const [country, setCountry] = useState('UK'); // Default country
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const coursesPerPage = 6; // Number of courses to display per page

  const handleSearch = async () => {
    if (!postcode.trim()) {
      setError('Please enter a valid postcode.');
      return;
    }

    setLoading(true);
    setError('');
    setCourses([]);
    setCurrentPage(1); // Reset to the first page on a new search

    try {
      // Convert postcode to latitude and longitude (using a geocoding API)
      const geocodeResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${postcode},${country}`
      );

      if (geocodeResponse.data.length === 0) {
        setError('Invalid postcode or country. Please try again.');
        setLoading(false);
        return;
      }

      const { lat, lon } = geocodeResponse.data[0];

      // Fetch golf courses using the provided API
      const response = await axios.get(
        'https://golf-course-finder.p.rapidapi.com/api/golf-clubs/',
        {
          params: {
            miles: radius,
            latitude: lat,
            longitude: lon,
          },
          headers: {
            'X-RapidAPI-Key': '90fd7a1297msha82ae66822b3251p110588jsnd0e41d094a19', // Replace with your RapidAPI key
            'X-RapidAPI-Host': 'golf-course-finder.p.rapidapi.com',
          },
        }
      );

      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch golf courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate the courses to display on the current page
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div
      className="courses-container"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // Center vertically
        backgroundColor: '#f9f9f9', // Optional: Light background
      }}
    >
      <Typography variant="h4" gutterBottom>
        Find Nearby Golf Courses
      </Typography>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <TextField
          label="Postcode"
          variant="outlined"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="Enter postcode"
          style={{ marginRight: '10px', marginBottom: '10px' }}
        />
        <FormControl
          style={{
            marginRight: '10px',
            marginBottom: '10px',
            minWidth: '150px',
          }}
        >
          <InputLabel>Country</InputLabel>
          <Select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <MenuItem value="UK">United Kingdom</MenuItem>
            <MenuItem value="US">United States</MenuItem>
            <MenuItem value="CA">Canada</MenuItem>
            <MenuItem value="AU">Australia</MenuItem>
            <MenuItem value="IN">India</MenuItem>
          </Select>
        </FormControl>
        <FormControl
          style={{
            marginRight: '10px',
            marginBottom: '10px',
            minWidth: '150px',
          }}
        >
          <InputLabel>Radius (miles)</InputLabel>
          <Select
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          >
            <MenuItem value={5}>5 miles</MenuItem>
            <MenuItem value={10}>10 miles</MenuItem>
            <MenuItem value={20}>20 miles</MenuItem>
            <MenuItem value={30}>30 miles</MenuItem>
            <MenuItem value={50}>50 miles</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {error && <Typography color="error">{error}</Typography>}

      <Grid
        container
        spacing={3}
        justifyContent="center"
        style={{ maxWidth: '1200px' }} // Limit grid width
      >
        {currentCourses.length > 0 ? (
          currentCourses.map((course) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={course.place_id}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <Card
                style={{
                  width: '300px', // Fixed width
                  height: '250px', // Fixed height
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {course.club_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Address: {course.address}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    City: {course.city}, State: {course.state}, Country: {course.country}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Phone: {course.phone || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Driving Range: {course.driving_range ? 'Yes' : 'No'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          !loading && (
            <Typography variant="body1" color="textSecondary">
              No courses found. Try a different search.
            </Typography>
          )
        )}
      </Grid>

      {/* Pagination Controls */}
      {courses.length > coursesPerPage && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{ marginRight: '10px' }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextPage}
            disabled={indexOfLastCourse >= courses.length}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}