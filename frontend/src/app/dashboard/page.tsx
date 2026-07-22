'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import ProfileForm from '../../components/ProfileForm';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { getBackendUrl } from '@/lib/config';
import ApiConfigModal from '@/components/ApiConfigModal';
import { 
  Sparkles, 
  Plus, 
  FileText, 
  User, 
  LogOut, 
  Calendar, 
  Layout, 
  Trash2, 
  Edit3, 
  Eye, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Resume {
  id: string;
  title: string;
  templateId: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { currentUser, loading: authLoading, logout, getIdToken } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'resumes' | 'profile'>('resumes');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Route protection
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, authLoading]);

  // Fetch user resumes
  const fetchResumes = async () => {
    try {
      setError('');
      setLoadingResumes(true);
      const token = await getIdToken();
      const response = await fetch(`${getBackendUrl()}/api/resumes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve saved resumes.');
      }

      const data = await response.json();
      setResumes(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading resumes.');
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchResumes();
    }
  }, [currentUser]);

  const handleCreateResume = async () => {
    try {
      setError('');
      setActionLoading(true);
      const token = await getIdToken();
      
      const response = await fetch(`${getBackendUrl()}/api/resumes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify({
          title: 'My Resume',
          templateId: 'modern-glow'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create new resume.');
      }

      const data = await response.json();
      const newResume = data.resume;
      
      // Redirect to edit page
      router.push(`/resume/${newResume.id}/edit`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create resume.');
      setActionLoading(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      setError('');
      const token = await getIdToken();
      const response = await fetch(`${getBackendUrl()}/api/resumes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume.');
      }

      // Update state locally
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete resume.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', color: 'var(--text-secondary)' }}>
        <Loader2 className="animate-spin" size={32} />
        <span>Authenticating session...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>

        {/* Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '12px',
            padding: '1.25rem',
            color: 'var(--error)',
            fontSize: '0.9rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>Connection Error: {error}</span>
            </div>
            {(error.toLowerCase().includes('fetch') || error.toLowerCase().includes('retrieving') || error.toLowerCase().includes('load')) && (
              <div style={{
                marginTop: '0.25rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(239, 68, 68, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                color: 'var(--text-secondary)'
              }}>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  Please check your internet connection or verify if the API server is online.
                </p>
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="btn-secondary"
                  style={{
                    alignSelf: 'flex-start',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    marginTop: '0.25rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    color: 'var(--error)',
                    cursor: 'pointer'
                  }}
                  type="button"
                >
                  Configure Server URL
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Title & Tabs */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3rem'
        }} className="animate-fade-in animation-delay-100">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>User Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your professional portfolio and build tailored resumes.</p>
          </div>

          {/* Toggle Tabs */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px',
            padding: '0.25rem'
          }}>
            <button 
              onClick={() => setActiveTab('resumes')}
              style={{
                background: activeTab === 'resumes' ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTab === 'resumes' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              <FileText size={16} />
              <span>My Resumes</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{
                background: activeTab === 'profile' ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              <User size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="animate-fade-in animation-delay-200">
          {activeTab === 'resumes' ? (
            <div>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Saved Resumes</h3>
                <button 
                  onClick={handleCreateResume} 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  <span>Create Resume</span>
                </button>
              </div>

              {/* Resume List Loader */}
              {loadingResumes ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Fetching resumes...</span>
                </div>
              ) : resumes.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <FileText size={48} color="var(--text-muted)" />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No resumes found</h4>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9rem' }}>
                    You haven't created any resumes yet. Click the "Create Resume" button above to build your first professional profile!
                  </p>
                </div>
              ) : (
                /* Resume Grid */
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  {resumes.map((resume) => (
                    <div key={resume.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ 
                          background: 'rgba(255, 255, 255, 0.03)', 
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-primary)'
                        }}>
                          <FileText size={24} />
                        </div>
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {resume.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <Layout size={12} />
                            <span>Template: {resume.templateId}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Calendar size={14} />
                        <span>Last updated: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                      </div>

                      {/* Actions */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '0.5rem', 
                        borderTop: '1px solid var(--border-color)', 
                        paddingTop: '1.25rem',
                        marginTop: '0.5rem'
                      }}>
                        <Link href={`/resume/${resume.id}/edit`} style={{ 
                          background: 'transparent', 
                          border: '1px solid var(--border-color)', 
                          color: 'var(--text-secondary)',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          transition: 'all var(--transition-fast)'
                        }} className="resume-action-btn">
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </Link>
                        <button style={{ 
                          background: 'transparent', 
                          border: '1px solid var(--border-color)', 
                          color: 'var(--text-secondary)',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          transition: 'all var(--transition-fast)'
                        }} className="resume-action-btn">
                          <Eye size={13} />
                          <span>Preview</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteResume(resume.id)}
                          style={{ 
                            background: 'transparent', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            color: 'var(--error)',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            transition: 'all var(--transition-fast)'
                          }} 
                          className="resume-action-btn-danger"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem 2.5rem' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Personal Profile Details</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  This information will be loaded by default into new resumes.
                </p>
              </div>
              <ProfileForm />
            </div>
          )}
        </div>
      </div>
      <ApiConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  );
}
