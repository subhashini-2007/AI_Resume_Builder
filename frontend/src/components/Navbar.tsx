'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Sparkles, Layout, LogOut, Settings } from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout, getIdToken } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = await getIdToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/users/profile`, {
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
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        
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
          }}>
            AI Resume Builder
          </span>
        </Link>

        {/* Action Controls */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
              <span>Dashboard</span>
            </Link>

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
                <span>Admin Center</span>
              </Link>
            )}

            <div style={{
              width: '1px',
              height: '16px',
              background: 'var(--border-color)'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

    </header>
  );
}
