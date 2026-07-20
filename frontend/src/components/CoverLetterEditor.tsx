'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Save, 
  Printer, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Building,
  User,
  FileText
} from 'lucide-react';

interface CoverLetterEditorProps {
  resumeId: string;
  resumeData: any;
  templateId: string;
}

export default function CoverLetterEditor({
  resumeId,
  resumeData,
  templateId
}: CoverLetterEditorProps) {
  const { getIdToken } = useAuth();
  const previewRef = useRef<HTMLDivElement>(null);

  const [companyName, setCompanyName] = useState('');
  const [recipientName, setRecipientName] = useState('Hiring Manager');
  const [jobDescription, setJobDescription] = useState('');
  const [letterContent, setLetterContent] = useState('');

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [letterId, setLetterId] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch existing cover letter for this resume
  useEffect(() => {
    const fetchLetter = async () => {
      try {
        setError('');
        const token = await getIdToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/cover-letters/resume/${resumeId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || 'mock-dev-token'}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setLetterId(data.id);
          setCompanyName(data.companyName || '');
          setRecipientName(data.recipientName || 'Hiring Manager');
          setJobDescription(data.jobDescription || '');
          setLetterContent(data.letterContent || '');
        }
      } catch (err: any) {
        console.error('Error fetching cover letter:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [resumeId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      return setError('Please enter a target company name.');
    }

    try {
      setError('');
      setSuccess('');
      setGenerating(true);
      const token = await getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/cover-letters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify({
          resumeId,
          resumeData,
          jobDescription,
          companyName,
          recipientName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate cover letter.');
      }

      const data = await response.json();
      setLetterId(data.coverLetter.id);
      setLetterContent(data.coverLetter.letterContent || '');
      setSuccess('AI cover letter drafted successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generating cover letter.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!letterId) return;
    try {
      setError('');
      setSuccess('');
      setSaving(true);
      const token = await getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/cover-letters/${letterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify({ letterContent })
      });

      if (!response.ok) {
        throw new Error('Failed to update cover letter.');
      }

      setSuccess('Cover letter modifications saved.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save modifications.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const printContent = previewRef.current?.innerHTML;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cover Letter - ${companyName || 'Draft'}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20mm;
                  font-family: ${templateId === 'classic-navy' ? 'Georgia, serif' : 'Inter, sans-serif'};
                  background-color: white !important;
                  color: #0f172a !important;
                  line-height: 1.6;
                  font-size: 14px;
                }
                .sheet { max-width: 650px; margin: 0 auto; white-space: pre-wrap; }
              </style>
            </head>
            <body onload="window.print();window.close();">
              <div class="sheet">${printContent}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Styles matching parent template
  const getTemplateStyles = () => {
    switch (templateId) {
      case 'modern-glow':
        return {
          wrapper: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--box-shadow-glow)'
          }
        };
      case 'minimal-slate':
        return {
          wrapper: {
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: 'system-ui, sans-serif',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }
        };
      case 'classic-navy':
        return {
          wrapper: {
            background: '#fafafa',
            color: '#1e293b',
            fontFamily: 'Georgia, serif',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }
        };
      default:
        return { wrapper: {} };
    }
  };

  const styles = getTemplateStyles();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '0.5rem', color: 'var(--text-secondary)' }}>
        <Loader2 className="animate-spin" size={24} />
        <span>Loading cover letter workspace...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'start' }} className="main-workspace-grid">
      
      {/* Left Column: Form & Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Form Inputs */}
        <form onSubmit={handleGenerate} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            AI Cover Letter Generator
          </h3>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Company Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem' }} 
                  placeholder="e.g. Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Recipient Name / Title</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem' }} 
                  placeholder="e.g. Hiring Manager"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Job Description (optional context)</label>
            <textarea 
              className="form-input" 
              style={{ minHeight: '100px', resize: 'vertical' }} 
              placeholder="Paste responsibilities to customize keywords..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            disabled={generating}
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{generating ? 'Drafting...' : 'Draft Cover Letter'}</span>
          </button>
        </form>

        {/* Edit Panel */}
        {letterContent && (
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} color="var(--accent-primary)" />
                <span>Customize Draft Letter</span>
              </h4>
              <button 
                onClick={handleSave} 
                className="btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                disabled={saving}
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                <span>Save Edits</span>
              </button>
            </div>
            <textarea 
              className="form-input" 
              style={{ minHeight: '300px', resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }}
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              disabled={saving}
            />
          </div>
        )}
      </div>

      {/* Right Column: Live Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handlePrint} 
            className="btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            disabled={!letterContent}
          >
            <Printer size={14} />
            <span>Print Cover Letter</span>
          </button>
        </div>

        <div 
          ref={previewRef}
          style={{
            ...styles.wrapper,
            padding: '2.5rem',
            borderRadius: '12px',
            minHeight: '200mm', // cover letter height
            whiteSpace: 'pre-wrap',
            fontSize: '0.95rem',
            lineHeight: 1.6
          }}
        >
          {letterContent || (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem 2rem' }}>
              Your cover letter preview will appear here once drafted.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
