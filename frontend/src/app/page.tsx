'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Layers, 
  Terminal, 
  FileText, 
  Cpu, 
  Compass, 
  UserCheck, 
  Search, 
  ArrowRight,
  Github,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const sprints = [
    { num: 'Sprint 1', title: 'Project Setup & Monorepo Foundation', desc: 'Initialize Git, configure CI/CD workflows, set up TypeScript backend and Next.js frontend.', status: 'completed' },
    { num: 'Sprint 2', title: 'Firebase Authentication & Security', desc: 'Implement client & server Auth, JWT authorization, Password reset, and database rules.', status: 'completed' },
    { num: 'Sprint 3', title: 'User Dashboard & Profiles', desc: 'Construct profile creation and management views with secure backend routes.', status: 'completed' },
    { num: 'Sprint 4', title: 'Interactive Resume Form & CRUD', desc: 'Develop deep forms with validations and support full MongoDB-like Firestore CRUD.', status: 'completed' },
    { num: 'Sprint 5', title: 'Live Preview & Template Engine', desc: 'Render real-time resumes. Provide curated templates with instant swapping.', status: 'completed' },
    { num: 'Sprint 6', title: 'Gemini AI Summary & Grammar', desc: 'Integrate Google Gemini AI for smart summarization and professional grammar polishing.', status: 'completed' },
    { num: 'Sprint 7', title: 'ATS Scanner & Score Card', desc: 'Analyze resumes against job keywords and calculate realistic ATS scores.', status: 'completed' },
    { num: 'Sprint 8', title: 'Job Matching & Skill Insights', desc: 'Compare resume vs. job descriptions and suggest missing high-value skills.', status: 'completed' },
    { num: 'Sprint 9', title: 'AI Cover Letter Generator', desc: 'Generate customized cover letters tailored for specific company applications.', status: 'completed' },
    { num: 'Sprint 10', title: 'Mock Interview Simulator', desc: 'Generate target interview questions based on the resume and field.', status: 'completed' },
    { num: 'Sprint 11', title: 'Version History & Restores', desc: 'Keep full change logs and allow users to roll back to previous resume versions.', status: 'completed' },
    { num: 'Sprint 12', title: 'High-Fidelity PDF Exporter', desc: 'Print pixel-perfect PDF documents using customized browser layouts.', status: 'completed' },
    { num: 'Sprint 13', title: 'Admin Analytics Panel', desc: 'Monitor platform-wide AI usage metrics and modify layout styles rules.', status: 'completed' },
    { num: 'Sprint 14', title: 'Security Auditing & Hardening', desc: 'Enforce endpoint rate-limiting and check sanitization validation scripts.', status: 'completed' },
    { num: 'Sprint 15', title: 'Deployment & Demo', desc: 'Perform final staging verifications and release to production cloud hosting.', status: 'completed' },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', position: 'relative' }}>
      {/* Header */}
      <header style={{ 
        maxWidth: '1200px', 
        margin: '0 auto 5rem auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem 0'
      }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em' }}>
            RESUMIFY<span className="gradient-text">.AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }} className="github-link">
            <Github size={20} />
            <span>GitHub</span>
          </a>
          <Link href="/dashboard" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Launch App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '8rem' }} className="animate-fade-in animation-delay-100">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'rgba(139, 92, 246, 0.1)', 
            border: '1px solid rgba(139, 92, 246, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            color: 'var(--accent-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '2rem'
          }}>
            <Cpu size={16} />
            <span>Powered by Google Gemini 1.5 Pro</span>
          </div>
          <h1 className="hero-title">
            Craft a Winning Resume<br />
            With Next-Gen <span className="gradient-text">AI Guidance</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '700px', 
            margin: '0 auto 3rem auto',
            lineHeight: 1.6
          }}>
            Unlock your career potential. Write customized, ATS-optimized, high-converting resumes that land interviews, backed by state-of-the-art AI analysis.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link href="/dashboard" className="btn-primary">
              Build My Resume <ArrowRight size={18} />
            </Link>
            <button className="btn-secondary">
              View Roadmap
            </button>
          </div>
        </section>

        {/* Features / Roadmap Grid */}
        <section style={{ marginBottom: '6rem' }} className="animate-fade-in animation-delay-200">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>
              Project Sprint Roadmap
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Tracking our development progress step by step. Currently initialized Sprint 1.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1px))', /* fallback */
            gridAutoRows: 'auto',
            gap: '1.5rem',
            // Using inline styling that handles responsive layouts
          }} className="sprint-grid">
            {sprints.map((sprint, idx) => (
              <div 
                key={idx} 
                className="glass-panel" 
                style={{ 
                  padding: '2rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      color: sprint.status === 'completed' ? 'var(--success)' : 'var(--accent-secondary)'
                    }}>
                      {sprint.num}
                    </span>
                    {sprint.status === 'completed' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <CheckCircle2 size={14} />
                        <span>Done</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Planned
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    {sprint.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {sprint.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Health Check Panel */}
        <section className="glass-panel animate-fade-in animation-delay-300" style={{ 
          padding: '2.5rem', 
          marginBottom: '5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Terminal size={16} />
              <span>Developer Workspace Diagnostic</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Active Environment Status
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Check if the backend local API server and configuration files are online.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1px))',
            gap: '1.5rem',
            width: '100%'
          }} className="diagnostic-grid">
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Next.js Client Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                <span>Configured (Ready)</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Express Backend Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                <span>Configured (Ready)</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Database / Auth Engine</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></div>
                <span>Pending Setup (Sprint 2)</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '3rem 0 1rem 0', 
        borderTop: '1px solid var(--border-color)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        <span>&copy; {new Date().getFullYear()} Resumify AI. Built with Antigravity.</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" className="nav-link">Terms</a>
          <a href="#" className="nav-link">Privacy</a>
          <a href="#" className="nav-link">Security</a>
        </div>
      </footer>

    </div>
  );
}
