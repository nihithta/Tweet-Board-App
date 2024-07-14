import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

const Followers = () => {
  const [followers, setFollowers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await axios.get('/user/followers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setFollowers(response.data);
      } catch (error) {
        setError('Error fetching followers');
      }
    };
    fetchFollowers();
  }, []);

  return (
    <div className="container">
      <div className="form-container">
        <h2>Followers</h2>
        {error && <p className="message">{error}</p>}
        <ul>
          {followers.map((follower, index) => (
            <li key={index}>
              {follower.name}
            </li>
          ))}
        </ul>
        <p>
          <Link to="/tweets/feed">Back to Feed</Link>
        </p>
      </div>
    </div>
  );
};

export default Followers;
