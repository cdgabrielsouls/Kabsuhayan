
import { useState } from 'react'
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [message, setMessage] = useState('')
  const [page, setPage] = useState('login')
  const [userName, setUserName] = useState('')

  // Listing information
  const [showForm, setShowForm] = useState(false)
  const [itemName, setItemName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [listings, setListings] = useState([])

  function handleSubmit(e) {
    e.preventDefault()

    if (!/^[^\s@]+@cvsu\.edu\.ph$/i.test(email.trim())) {
      setMessage('Please use your @cvsu.edu.ph email.')
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    const username = email.trim().split('@')[0]

    const name = username
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    setUserName(name)
    setMessage('')
    setPage('greeting')
  }

  function switchForm() {
    setIsLogin(!isLogin)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setMessage('')
  }

  function handleImage(e) {
    const file = e.target.files[0]

    if (file) {
      setImage(URL.createObjectURL(file))
    }
  }

  function handleListing(e) {
    e.preventDefault()

    const newListing = {
      name: itemName,
      description: description,
      price: price,
      image: image
    }

    setListings([...listings, newListing])

    setItemName('')
    setDescription('')
    setPrice('')
    setImage('')
    setShowForm(false)
  }

  // Greeting page
  if (page === 'greeting') {
    return (
      <div className="container">
        <div className="greeting-box">
          <h1>Hello, {userName}!</h1>
          <p>Welcome to Kabsuhayan!</p>

          <button onClick={() => setPage('home')}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // Main marketplace page
  if (page === 'home') {
    return (
      <div className="home-page">

        <header className="navbar">
          <h1>Kabsuhayan</h1>
          <p>Welcome, {userName}</p>
        </header>

        <div className="marketplace">

          <div className="market-header">
            <div>
              <h2>Marketplace</h2>
              <p>Find and sell items within CvSU.</p>
            </div>

            <button
              className="add-button"
              onClick={() => setShowForm(true)}
            >
              + Add Listing
            </button>
          </div>

          {showForm && (
            <div className="listing-form">

              <h2>Add New Listing</h2>

              <form onSubmit={handleListing}>

                <label>Item Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  required
                />

                {image && (
                  <img
                    src={image}
                    alt="Item Preview"
                    className="preview-image"
                  />
                )}

                <label>Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />

                <label>Description</label>
                <textarea
                  placeholder="Describe your item..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <label>Price (PHP)</label>
                <input
                  type="number"
                  placeholder="Enter price"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />

                <button type="submit">
                  Post Listing
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

              </form>
            </div>
          )}

          <div className="listing-container">

            {listings.length === 0 ? (
              <div className="empty-list">
                <h2>No listings yet</h2>
                <p>Start selling by adding your first item!</p>
              </div>
            ) : (
              listings.map((item, index) => (
                <div className="listing-card" key={index}>

                  <img src={item.image} alt={item.name} />

                  <div className="listing-info">
                    <h3>{item.name}</h3>
                    <h2>₱{Number(item.price).toLocaleString('en-PH')}</h2>
                    <p>{item.description}</p>
                  </div>

                </div>
              ))
            )}

          </div>

        </div>
      </div>
    )
  }

  // Login and Sign Up page
  return (
    <div className="container">
      <div className="form-box">

        <h1>Kabsuhayan</h1>
        <p className="subtitle">CvSU Community Marketplace</p>

        <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>

        <p className="description">
          {isLogin
            ? 'Login to your account.'
            : 'Join the Kabsuhayan community.'}
        </p>

        <form onSubmit={handleSubmit}>

          <label>Email Address</label>
          <input
            type="email"
            placeholder="student@cvsu.edu.ph"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isLogin && (
            <>
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}

          <button type="submit">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>

        </form>

        <p className="message">{message}</p>

        <div className="switch">
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          <button className="switch-button" onClick={switchForm}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>

        <p className="footer">
          Exclusively for CvSU students
        </p>

      </div>
    </div>
  )
}

export default App
