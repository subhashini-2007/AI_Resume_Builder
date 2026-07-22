'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBackendUrl } from '@/lib/config';
import { 
  User, 
  Phone, 
  Globe, 
  Linkedin, 
  Github, 
  Briefcase, 
  FileText, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function ProfileForm() {
  const { getIdToken } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
    currentTitle: '',
    summary: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch initial profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('');
        const token = await getIdToken();
        const response = await fetch(`${getBackendUrl()}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || 'mock-dev-token'}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve profile information.');
        }

        const data = await response.json();
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          website: data.website || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          currentTitle: data.currentTitle || '',
          summary: data.summary || '',
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setSaving(true);
      const token = await getIdToken();

      const response = await fetch(`${getBackendUrl()}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile.');
      }

      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '0.5rem', color: 'var(--text-secondary)' }}>
        <Loader2 className="animate-spin" size={24} />
        <span>Loading profile data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Alert Messages */}
      {error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '8px',
          padding: '1rem',
          color: 'var(--error)',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
          {(error.toLowerCase().includes('fetch') || error.toLowerCase().includes('load') || error.toLowerCase().includes('retrieve')) && (
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(239, 68, 68, 0.1)', paddingTop: '0.5rem' }}>
              Connection failed. If you need to change the backend API server address, click the <strong>Server</strong> settings icon in the top navigation bar.
            </p>
          )}
        </div>
      )}

      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          color: 'var(--success)',
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      {/* Grid Inputs */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {/* Name Fields */}
        <div className="form-group">
          <label className="form-label">First Name</label>
          <div style={{ position: 'relative' }}>
            <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              name="firstName"
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Last Name</label>
          <div style={{ position: 'relative' }}>
            <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              name="lastName"
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        {/* Title & Phone */}
        <div className="form-group">
          <label className="form-label">Professional Title</label>
          <div style={{ position: 'relative' }}>
            <Briefcase size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              name="currentTitle"
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="e.g. Senior Software Architect"
              value={formData.currentTitle}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="tel" 
              name="phone"
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        {/* Links */}
        <div className="form-group">
          <label className="form-label">Personal Website / Portfolio</label>
          <div style={{ position: 'relative' }}>
            <Globe size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="url" 
              name="website"
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="https://portfolio.com"
              value={formData.website}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">LinkedIn URL</label>
          <div style={{ position: 'relative' }}>
            <Linkedin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="url" 
              name="linkedin"
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">GitHub URL</label>
          <div style={{ position: 'relative' }}>
            <Github size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="url" 
              name="github"
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="https://github.com/username"
              value={formData.github}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {/* Summary Field */}
      <div className="form-group">
        <label className="form-label">Professional Summary</label>
        <div style={{ position: 'relative' }}>
          <FileText size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <textarea 
            name="summary"
            className="form-input" 
            style={{ paddingLeft: '2.5rem', minHeight: '120px', resize: 'vertical' }} 
            placeholder="Write a short summary about your professional background and goals..."
            value={formData.summary}
            onChange={handleChange}
            disabled={saving}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="btn-primary" 
        style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>Saving Changes...</span>
          </>
        ) : (
          <>
            <Save size={16} />
            <span>Save Profile</span>
          </>
        )}
      </button>
    </form>
  );
}
