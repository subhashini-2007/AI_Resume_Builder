'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getBackendUrl, setBackendUrl } from '@/lib/config';
import { 
  X, 
  Server, 
  Wifi, 
  WifiOff, 
  Check, 
  RefreshCw, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiConfigModal({ isOpen, onClose }: ApiConfigModalProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isMobileEnv, setIsMobileEnv] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUrl(getBackendUrl());
      setStatus('idle');
      setStatusMessage('');
      
      // Basic check to see if we might be in a Capacitor environment
      const isCapacitor = typeof window !== 'undefined' && 
        (window.hasOwnProperty('Capacitor') || 
         window.location.protocol.startsWith('capacitor') || 
         (window.location.protocol.startsWith('http') && window.location.port === ''));
      setIsMobileEnv(isCapacitor || /Android|iPhone|iPad/i.test(navigator.userAgent));
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleTestConnection = async () => {
    try {
      setStatus('testing');
      setStatusMessage('Testing connection to server...');
      
      // Clean trailing slash if present for test
      const testUrl = url.trim().endsWith('/') ? url.trim().slice(0, -1) : url.trim();
      
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000); // 6s timeout
      
      const response = await fetch(`${testUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(id);

      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setStatusMessage(`Successfully connected! Server status: ${data.status || 'OK'}`);
      } else {
        setStatus('error');
        setStatusMessage(`Connected, but server returned HTTP error: ${response.status}`);
      }
    } catch (err: any) {
      console.error('Connection test failed:', err);
      setStatus('error');
      let msg = 'Failed to connect. Make sure server is running and accessible.';
      if (err.name === 'AbortError') {
        msg = 'Connection timed out. Check your IP and network settings.';
      } else if (err.message) {
        msg = `${err.message}`;
      }
      setStatusMessage(msg);
    }
  };

  const handleSave = () => {
    setBackendUrl(url.trim());
    onClose();
    // Reload window to apply new API URL configuration across all contexts
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleReset = () => {
    const defaultUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ai-resume-builder-ysoe.onrender.com';
    setUrl(defaultUrl);
    setStatus('idle');
    setStatusMessage('');
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          position: 'relative',
          border: '1px solid var(--border-color)',
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          boxShadow: 'var(--box-shadow-glow)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--btn-secondary-hover-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            padding: '0.6rem',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Backend Server Settings
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>
              Configure API connection endpoints for application services.
            </p>
          </div>
        </div>

        {/* URL Input Form */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            Backend API Server URL
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. https://api-server.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setStatus('idle');
                setStatusMessage('');
              }}
              style={{
                flexGrow: 1,
                fontSize: '0.9rem',
                margin: 0
              }}
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={!url || status === 'testing'}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                height: 'auto'
              }}
            >
              {status === 'testing' ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Wifi size={14} />
              )}
              <span>Test Connection</span>
            </button>
          </div>
        </div>

        {/* Connection Status Banner */}
        {status !== 'idle' && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            backgroundColor: 
              status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 
              status === 'testing' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${
              status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 
              status === 'testing' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(239, 68, 68, 0.2)'
            }`,
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: 
              status === 'success' ? 'var(--success)' : 
              status === 'testing' ? 'var(--accent-primary)' : 'var(--error)',
            fontSize: '0.85rem',
            transition: 'all var(--transition-fast)'
          }}>
            {status === 'success' && <Check size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            {status === 'error' && <WifiOff size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            {status === 'testing' && <RefreshCw size={16} className="animate-spin" style={{ flexShrink: 0, marginTop: '2px' }} />}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* API Server connection details */}

        {/* Modal Actions */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          marginTop: '0.5rem'
        }}>
          <button 
            type="button" 
            onClick={handleReset}
            className="btn-secondary"
            style={{ 
              padding: '0.55rem 1rem', 
              fontSize: '0.85rem',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            Reset Default
          </button>
          <div style={{ flexGrow: 1 }} />
          <button 
            type="button" 
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="btn-primary"
            style={{ 
              padding: '0.55rem 1.25rem', 
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span>Save Settings</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
