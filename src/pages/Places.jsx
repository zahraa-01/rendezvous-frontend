import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import axios from 'axios'

// Random gradient selection on page load
const gradients = [
  { 
    bg: 'radial-gradient(circle at 65% 70%, #E5F9E0 0%, #A3F7B5 40%, #40C9A2 100%)', 
    primary: '#2F9C95', 
    secondary: '#40C9A2', 
    accent: '#A3F7B5' 
  }, // Greens
  { 
    bg: 'radial-gradient(circle at 70% 30%, #757BC8 0%, #8E94F2 40%, #ADA7FF 60%, #9FA0FF 100%)', 
    primary: '#757BC8', 
    secondary: '#8E94F2', 
    accent: '#ADA7FF' 
  }, // Purples  
  { 
    bg: 'radial-gradient(circle at 40% 60%, #F7B267 0%, #F79D65 50%, #F25C54 100%)', 
    primary: '#F25C54', 
    secondary: '#F79D65', 
    accent: '#F7B267' 
  }, // Oranges
]

const getRandomGradient = () => gradients[Math.floor(Math.random() * gradients.length)]

function Places() {
  const { user } = useAuth()
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [theme, setTheme] = useState(gradients[0])
  const [selectedPlace, setSelectedPlace] = useState(null)

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    description: '',
  })
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    const selectedTheme = getRandomGradient()
    setTheme(selectedTheme)
    
    // Set CSS variables for dynamic theming
    document.documentElement.style.setProperty('--theme-primary', selectedTheme.primary)
    document.documentElement.style.setProperty('--theme-secondary', selectedTheme.secondary)
    document.documentElement.style.setProperty('--theme-accent', selectedTheme.accent)
    
    fetchPlaces()
  }, []) // Remove search and cityFilter dependencies to prevent background changes

  // Extract unique cities and countries from places
  const uniqueCities = places && Array.isArray(places) ? [...new Set(places.map(place => place.city))].sort() : []
  const uniqueCountries = places && Array.isArray(places) ? [...new Set(places.map(place => place.country))].sort() : []

  // Separate effect for search/filter changes
  useEffect(() => {
    fetchPlaces()
  }, [search, cityFilter, countryFilter])

  const fetchPlaces = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (cityFilter) params.append('city', cityFilter)
      if (countryFilter) params.append('country', countryFilter)
      
      console.log('Fetching places with params:', params.toString())
      const response = await api.get(`/places/?${params.toString()}`)
      console.log('Places response:', response.data)
      setPlaces(response.data.results)
      setError('')
    } catch (err) {
      console.error('Failed to fetch places:', err)
      setError('Failed to load places')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setCityFilter('')
    setCountryFilter('')
  }

  const handleCreatePlace = async () => {
    if (!formData.name.trim() || !formData.city.trim() || !formData.country.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields')
      return
    }
    
    if (formData.description.length > 1000) {
      setError('Description must be less than 1000 characters')
      return
    }
    
    if (!imageFile) {
      setError('Please select an image')
      return
    }

    setCreating(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('city', formData.city)
      formDataToSend.append('country', formData.country)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('image', imageFile)
      
      const response = await api.post('/places/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setPlaces([...places, response.data])
      setFormData({ name: '', city: '', country: '', description: '' })
      setImageFile(null)
      setShowCreateForm(false)
    } catch (err) {
      console.error('Failed to create place:', err)
      if (err.response?.data) {
        // Handle specific backend validation errors
        const errorData = err.response.data
        if (typeof errorData === 'string') {
          setError(errorData)
        } else if (errorData.detail) {
          setError(errorData.detail)
        } else if (errorData.name) {
          setError(`Name: ${errorData.name}`)
        } else if (errorData.city) {
          setError(`City: ${errorData.city}`)
        } else if (errorData.country) {
          setError(`Country: ${errorData.country}`)
        } else if (errorData.description) {
          setError(`Description: ${errorData.description}`)
        } else if (errorData.image) {
          setError(`Image: ${errorData.image}`)
        } else {
          setError('Validation failed. Please check all fields.')
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('Failed to create place. Please try again.')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB')
      setImageFile(null)
      e.target.value = ''
      return
    }
    setImageFile(file)
  }

  const toggleDescription = (placeId) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(placeId)) {
      newExpanded.delete(placeId)
    } else {
      newExpanded.add(placeId)
    }
    setExpandedCards(newExpanded)
  }

  const truncateDescription = (description, maxLength = 150) => {
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  const handlePlaceClick = (place) => {
    setSelectedPlace(place)
  }

  const handleCloseDetail = () => {
    setSelectedPlace(null)
  }

  if (loading && places.length === 0) {
    return <div className="places-page">Loading places...</div>
  }

  return (
    <div className="places-page" style={{ background: theme?.bg || gradients[0].bg }}>
      <div className="places-header">
        <h1>Discover Places</h1>
        <p>Find your next rendezvous spot</p>
      </div>

      {/* Search and Filters */}
      <div className="places-controls">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search places..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="city-filter"
          >
            <option value="">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="country-filter"
          >
            <option value="">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear All
          </button>
        </div>
        
        {user && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="create-place-btn"
          >
            {showCreateForm ? 'Cancel' : 'Add Place'}
          </button>
        )}
      </div>

      {/* Create Place Form */}
      {showCreateForm && (
        <div className="create-place-form auth-card">
          {/* Error Display */}
          {error && <div className="error-message">{error}</div>}
          
          <h3>Add New Place</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Place Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="auth-input"
            />
            <input
              type="text"
              placeholder="City *"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="auth-input"
            />
            <input
              type="text"
              placeholder="Country *"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="auth-input"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="auth-input"
            />
            <textarea
              placeholder="Description *"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="auth-input"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button
              onClick={handleCreatePlace}
              disabled={creating}
              className="btn-primary"
            >
              {creating ? 'Creating...' : 'Create Place'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
          {imageFile && (
            <p className="image-preview">Selected: {imageFile.name}</p>
          )}
        </div>
      )}

      {/* Error Display for non-form errors */}
      {error && !showCreateForm && <div className="error-message">{error}</div>}

      {/* Places Grid */}
      {(!places || places.length === 0) && !loading ? (
        <div className="empty-state">
          <h3>No places found</h3>
          <p>Try adjusting your search or be the first to add a place!</p>
        </div>
      ) : (
        <div className="places-grid">
          {places && Array.isArray(places) && places.map(place => (
            <div key={place.id} className="place-card" onClick={() => handlePlaceClick(place)}>
              {place.image && (
                <div className="place-image">
                  <img src={place.image} alt={place.name} />
                </div>
              )}
              <div className="place-content">
                <h3 style={{ color: theme.primary }}>{place.name}</h3>
                <p className="place-location" style={{ color: theme.secondary }}>{place.city}, {place.country}</p>
                <p className="place-description">
                  {expandedCards.has(place.id) 
                    ? place.description 
                    : truncateDescription(place.description)
                  }
                  {place.description.length > 150 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlaceClick(place)
                      }}
                      className="read-more-btn"
                      style={{ color: theme.primary }}
                    >
                      {expandedCards.has(place.id) ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </p>
                <div className="place-meta">
                  <span className="place-owner" style={{ color: theme.accent }}>by {place.owner}</span>
                  <span className="place-date" style={{ color: theme.accent }}>
                    {new Date(place.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place Detail Modal */}
      {selectedPlace && (
        <div className="place-detail-modal" onClick={handleCloseDetail}>
          <div className="place-detail-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleCloseDetail}>×</button>
            {selectedPlace.image && (
              <div className="place-detail-image">
                <img src={selectedPlace.image} alt={selectedPlace.name} />
              </div>
            )}
            <div className="place-detail-info">
              <h2 style={{ color: theme.primary }}>{selectedPlace.name}</h2>
              <p className="place-detail-location" style={{ color: theme.secondary }}>
                {selectedPlace.city}, {selectedPlace.country}
              </p>
              <p className="place-detail-description">{selectedPlace.description}</p>
              <div className="place-detail-meta">
                <span style={{ color: theme.accent }}>by {selectedPlace.owner}</span>
                <span style={{ color: theme.accent }}>
                  {new Date(selectedPlace.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Places
