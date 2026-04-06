import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import axios from 'axios'

function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
  })
  
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile/')
      setProfile(response.data)
      setFormData({
        bio: response.data.bio || '',
        location: response.data.location || '',
      })
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData({
      bio: profile?.bio || '',
      location: profile?.location || '',
    })
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await api.patch('/profile/', formData)
      setProfile(response.data)
      setEditing(false)
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0])
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      // Create a fresh API instance for file upload to avoid JSON header interference
      const fileApi = axios.create({
        baseURL: '/api',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      const response = await fileApi.patch('/profile/', formData)
      setProfile(response.data)
      setAvatarFile(null)
      setSuccess('Avatar updated successfully')
    } catch (err) {
      console.error('Avatar upload error:', err.response?.data || err.message)
      const errorData = err.response?.data
      let errorMsg = 'Failed to update avatar'
      
      if (errorData?.avatar?.[0]) {
        errorMsg = `Avatar error: ${errorData.avatar[0]}`
      } else if (errorData?.detail) {
        errorMsg = errorData.detail
      } else if (typeof errorData === 'object') {
        errorMsg = JSON.stringify(errorData)
      }
      
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="profile-page">Loading profile...</div>
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="profile-info">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile?.avatar ? (
              <img 
                src={profile.avatar} 
                alt="Avatar" 
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">No avatar</div>
            )}
          </div>
          
          <div className="profile-details">
            <h2>{user?.username}</h2>
            <p>{user?.email}</p>
          </div>
        </div>
        
        <div className="profile-fields">
          <div className="field-group">
            <label>Bio</label>
            {editing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p>{profile?.bio || 'No bio set'}</p>
            )}
          </div>
          
          <div className="field-group">
            <label>Location</label>
            {editing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Your location"
              />
            ) : (
              <p>{profile?.location || 'No location set'}</p>
            )}
          </div>
        </div>
        
        <div className="profile-actions">
          {editing ? (
            <>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={handleCancel} 
                disabled={saving}
                className="btn-secondary"
              >
                Cancel
              </button>
            </>
          ) : (
            <button onClick={handleEdit} className="btn-primary">Edit Profile</button>
          )}
        </div>
        
        <div className="avatar-upload">
          <h3>Update Avatar</h3>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange}
          />
          {avatarFile && (
            <button 
              onClick={handleAvatarUpload}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Uploading...' : 'Upload Avatar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
