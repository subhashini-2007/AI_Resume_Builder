'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBackendUrl } from '@/lib/config';
import { 
  History, 
  Plus, 
  RotateCcw, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Clock
} from 'lucide-react';

interface VersionHistoryProps {
  resumeId: string;
  resumeData: any;
  onRestore: (restoredData: any) => void;
}

export default function VersionHistory({
  resumeId,
  resumeData,
  onRestore
}: VersionHistoryProps) {
  const { getIdToken } = useAuth();

  const [versionName, setVersionName] = useState('');
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch revisions list
  const fetchHistory = async () => {
    try {
      const token = await getIdToken();
      const response = await fetch(`${getBackendUrl()}/api/resumes/${resumeId}/history`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve version history.');
      }

      const data = await response.json();
      setHistoryItems(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Could not retrieve version control logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [resumeId]);

  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionName.trim()) return;

    try {
      setError('');
      setSuccess('');
      setSaving(true);
      const token = await getIdToken();

      const response = await fetch(`${getBackendUrl()}/api/resumes/${resumeId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify({
          versionName,
          resumeData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save snapshot.');
      }

      setVersionName('');
      setSuccess('Snapshot saved successfully.');
      await fetchHistory(); // refresh list
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving snapshot.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (historyId: string) => {
    const confirmRestore = window.confirm('Are you sure you want to restore this revision? Your current unsaved inputs will be overwritten.');
    if (!confirmRestore) return;

    try {
      setError('');
      setSuccess('');
      setRestoringId(historyId);
      const token = await getIdToken();

      const response = await fetch(`${getBackendUrl()}/api/resumes/${resumeId}/restore/${historyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to restore snapshot.');
      }

      const data = await response.json();
      onRestore(data.resume);
      setSuccess('Revision restored successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error restoring revision.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Save snapshot form */}
      <form onSubmit={handleSaveSnapshot} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Version Control Timeline</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Save the current state of your resume fields as a revision history checkpoint. You can restore your resume data to any of these checkpoints at any time.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: 'var(--error)',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
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
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="form-group" style={{ margin: 0, display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <label className="form-label">Revision Name / Description</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Before changing work descriptions"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '42px' }}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
            <span>Save Snapshot</span>
          </button>
        </div>
      </form>

      {/* Revision History list */}
      <div>
        <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <History size={18} color="var(--accent-primary)" />
          <span>Timeline Log</span>
        </h4>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={18} className="animate-spin" />
            <span>Loading history log...</span>
          </div>
        ) : historyItems.length === 0 ? (
          <div style={{ padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No saved snapshots found. Create one using the form above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
            {historyItems.map((item) => (
              <div 
                key={item.id} 
                className="glass-panel" 
                style={{ 
                  padding: '1.25rem 1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Clock size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.25rem 0' }}>{item.versionName}</h5>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Saved on: {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(item.id)}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  disabled={restoringId === item.id}
                >
                  {restoringId === item.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
