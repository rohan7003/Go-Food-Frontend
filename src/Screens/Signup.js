import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar';

export default function Signup() {

  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    geolocation: ""
  });

  let [address, setAddress] = useState("");
  let navigate = useNavigate();

  // 🔹 Get current location
  const handleClick = async (e) => {
    e.preventDefault();

    try {
      let navLocation = () => {
        return new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej);
        });
      };

      let latlong = await navLocation().then(res => {
        let latitude = res.coords.latitude;
        let longitude = res.coords.longitude;
        return [latitude, longitude];
      });

      let [lat, long] = latlong;

      const response = await fetch("https://go-food-2-9v3n.onrender.com/api/auth/getlocation", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ latlong: { lat, long } })
      });

      const { location } = await response.json();

      setAddress(location);

      // ✅ FIXED: set geolocation correctly
      setCredentials((prev) => ({
        ...prev,
        geolocation: location
      }));

    } catch (error) {
      console.error(error);
      alert("Unable to fetch location");
    }
  };

  // 🔹 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION (IMPORTANT FIX)
    if (!credentials.geolocation || credentials.geolocation === "") {
      alert("Please click 'Click for current Location' first");
      return;
    }

    try {
      const response = await fetch("https://go-food-2-9v3n.onrender.com/api/auth/createuser", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
          location: credentials.geolocation
        })
      });

      const json = await response.json();
      console.log(json);

      if (json.success) {
        localStorage.setItem('token', json.authToken);
        navigate("/login");
      } else {
        alert(json.error || "Signup failed");
      }

    } catch (error) {
      console.error(error);
      alert("Server error, please try again later");
    }
  };

  // 🔹 Input change
  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div style={{
      backgroundImage: 'url("https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg")',
      backgroundSize: 'cover',
      height: '100vh'
    }}>

      <Navbar />

      <div className='container'>
        <form className='w-50 m-auto mt-5 border bg-dark border-success rounded' onSubmit={handleSubmit}>

          <div className="m-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" name='name'
              value={credentials.name} onChange={onChange} />
          </div>

          <div className="m-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name='email'
              value={credentials.email} onChange={onChange} />
          </div>

          <div className="m-3">
            <label className="form-label">Address</label>
            <input type="text" className="form-control"
              value={address}
              placeholder="Click below to fetch address"
              readOnly
            />
          </div>

          <div className="m-3">
            <button type="button"
              onClick={handleClick}
              className="btn btn-success">
              Click for current Location
            </button>
          </div>

          <div className="m-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control"
              name='password'
              value={credentials.password}
              onChange={onChange} />
          </div>

          <button type="submit" className="m-3 btn btn-success">
            Submit
          </button>

          <Link to="/login" className="m-3 btn btn-danger">
            Already a user
          </Link>

        </form>
      </div>
    </div>
  );
}