'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Sparkles, Layout, LogOut, Settings, Server } from 'lucide-react';
import { getBackendUrl } from '@/lib/config';
import ApiConfigModal from './ApiConfigModal';

export default function Navbar() {
  const { currentUser, logout, getIdToken } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = await getIdToken();
        const response = await fetch(`${getBackendUrl()}/api/users/profile`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || 'mock-dev-token'}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.role === 'admin' || data.isAdmin === true);
        }
      } catch (err) {
        console.error('Navbar admin check failed:', err);
      }
    };

    if (currentUser) {
      checkAdmin();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(10, 10, 12, 0.5)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.8rem 2rem'
    }} className="navbar-header">
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }} className="navbar-container">
        
        {/* Brand Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: 'var(--text-primary)',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }} className="brand-logo-text">
            AI Resume Builder
          </span>
        </Link>

        {/* Action Controls */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="navbar-actions">
            <Link href="/dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500
            }} className="nav-link">
              <Layout size={16} />
              <span className="nav-link-text">Dashboard</span>
            </Link>

            <button 
              onClick={() => setIsConfigOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                padding: 0
              }} 
              className="nav-link"
            >
              <Server size={16} />
              <span className="nav-link-text">Server</span>
            </button>

            {isAdmin && (
              <Link href="/admin" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--accent-secondary)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600
              }} className="nav-link">
                <Settings size={16} />
                <span className="nav-link-text">Admin</span>
              </Link>
            )}

            <div style={{
              width: '1px',
              height: '16px',
              background: 'var(--border-color)'
            }} className="user-divider" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="user-profile-section">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="user-email-header">
                {currentUser.email}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn-secondary" 
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: 'var(--error)'
                }}
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

      </div>
      <ApiConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </header>
  );
}
