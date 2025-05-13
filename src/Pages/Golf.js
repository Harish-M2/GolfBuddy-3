import React, { useState } from 'react';
import { Grid, Card, CardContent, Typography, Button, Select, MenuItem, InputLabel, FormControl, TextField } from '@mui/material';

export function Golf() {
  const [skillLevel, setSkillLevel] = useState('');
  const [location, setLocation] = useState('');
  const [golfers, setGolfers] = useState([
    { id: 1, name: 'Alice', skill: 'Beginner', location: 'London', available: true },
    { id: 2, name: 'Bob', skill: 'Intermediate', location: 'Manchester', available: false },
    { id: 3, name: 'Charlie', skill: 'Advanced', location: 'London', available: true },
    { id: 4, name: 'Diana', skill: 'Beginner', location: 'Birmingham', available: true },
  ]);
  const [filteredGolfers, setFilteredGolfers] = useState(golfers);
  const [requests, setRequests] = useState([]);

  const handleSearch = () => {
    const filtered = golfers.filter(
      (golfer) =>
        (skillLevel === '' || golfer.skill === skillLevel) &&
        (location === '' || golfer.location.toLowerCase().includes(location.toLowerCase()))
    );
    setFilteredGolfers(filtered);
  };

  const handleRequest = (golferId) => {
    const golfer = golfers.find((g) => g.id === golferId);
    setRequests((prevRequests) => [...prevRequests, golfer]);
    alert(`Request sent to ${golfer.name}!`);
  };

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Find Golf Buddies
      </Typography>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <FormControl style={{ marginRight: '10px', minWidth: '150px' }}>
          <InputLabel>Skill Level</InputLabel>
          <Select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Location"
          variant="outlined"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
          style={{ marginRight: '10px' }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <Grid container spacing={3} justifyContent="center" style={{ maxWidth: '1200px' }}>
        {filteredGolfers.map((golfer) => (
          <Grid item xs={12} sm={6} md={4} key={golfer.id}>
            <Card style={{ width: '300px', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {golfer.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Skill Level: {golfer.skill}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Location: {golfer.location}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Availability: {golfer.available ? 'Available' : 'Not Available'}
                </Typography>
              </CardContent>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleRequest(golfer.id)}
                disabled={!golfer.available}
              >
                {golfer.available ? 'Send Request' : 'Unavailable'}
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Sent Requests
        </Typography>
        {requests.length > 0 ? (
          <ul>
            {requests.map((request) => (
              <li key={request.id}>{request.name} - {request.skill}</li>
            ))}
          </ul>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No requests sent yet.
          </Typography>
        )}
      </div>
    </div>
  );
}