'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { 
  Users, 
  FileText, 
  Sparkles, 
  Search, 
  Download, 
  Settings, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser, getIdToken, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [templates, setTemplates] = useState<any[]>([
    { id: 'modern-glow', name: 'Modern Glow', background: 'var(--bg-secondary)', color: 'var(--text-primary)', isDefault: true },
    { id: 'minimal-slate', name: 'Minimal Slate', background: '#ffffff', color: '#0f172a', isDefault: false },
    { id: 'classic-navy', name: 'Classic Navy', background: '#fafafa', color: '#1e293b', isDefault: false }
  ]);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading]);

  // Fetch analytics metrics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setError('');
        const token = await getIdToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/admin/analytics`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || 'mock-dev-token'}`
          }
        });

        if (!response.ok) {
          throw new Error('Access denied. Admin privileges required.');
        }

        const data = await response.json();
        setMetrics(data.metrics || null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error fetching system metrics.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAnalytics();
    }
  }, [currentUser]);

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      setError('');
      setSuccess('');
      setActionLoading(true);
      const token = await getIdToken();

      // Log the admin action to backend logs
      const logResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/admin/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify({
          action: 'UPDATE_TEMPLATE',
          details: `Admin modified styling parameters for layout template: ${editingTemplate.name}`
        })
      });

      if (!logResponse.ok) {
        throw new Error('Failed to log admin template update.');
      }

      // Update local templates state
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      setSuccess(`Layout styles for "${editingTemplate.name}" updated successfully.`);
      setEditingTemplate(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error updating template styles.');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 className="animate-spin" size={32} />
          <span style={{ marginLeft: '0.75rem', fontSize: '1rem' }}>Verifying authorization...</span>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '450px' }}>
            <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto 1.5rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Access Restricted</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {error}
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>System Admin Center</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Monitor system metrics, aggregate AI operations, and manage layouts.</p>
          </div>
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            color: 'var(--accent-primary)',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '1px'
          }}>
            SUPERADMIN PRIVILEGES
          </div>
        </div>

        {success && (
          <div className="animate-fade-in" style={{
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
            <TrendingUp size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* System metrics cards */}
        {metrics && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Usage Analytics Analytics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              
              <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <Users size={22} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Users</span>
                  <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics.users}</strong>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Resumes Created</span>
                  <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics.resumes}</strong>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '8px' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Generations</span>
                  <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics.aiCalls}</strong>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.75rem', borderRadius: '8px' }}>
                  <Search size={22} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ATS Scans Runs</span>
                  <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics.atsScans}</strong>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem', borderRadius: '8px' }}>
                  <Download size={22} />
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PDF Downloads</span>
                  <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>{metrics.pdfDownloads}</strong>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Template management */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Layout Templates Catalog</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {templates.map(tpl => (
              <div key={tpl.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyGap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <LayoutGrid size={18} color="var(--accent-secondary)" />
                    <span>{tpl.name}</span>
                  </h4>
                  {tpl.isDefault && (
                    <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                      DEFAULT
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ marginBottom: '0.4rem' }}><strong>Style ID:</strong> {tpl.id}</div>
                  <div style={{ marginBottom: '0.4rem' }}><strong>Background Style:</strong> {tpl.background}</div>
                  <div><strong>Text Color:</strong> {tpl.color}</div>
                </div>

                <button 
                  onClick={() => setEditingTemplate(tpl)} 
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyAlignment: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <Settings size={14} />
                  <span>Configure layout styles</span>
                </button>
              </div>
            ))}

          </div>
        </div>

        {/* Edit modal */}
        {editingTemplate && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 1000
          }}>
            <form onSubmit={handleUpdateTemplate} className="glass-panel animate-fade-in" style={{ padding: '2.5rem', maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Configure Layout: {editingTemplate.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Modify primary styles parameters for document rendering engines.</p>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Background Color (Hex / String)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingTemplate.background}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, background: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Primary Text Color (Hex / String)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingTemplate.color}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, color: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyGrid: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingTemplate(null)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} disabled={actionLoading}>
                  {actionLoading && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Config</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
