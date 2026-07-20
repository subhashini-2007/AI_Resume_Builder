'use client';

import React, { useRef } from 'react';
import { Mail, Phone, Globe, Linkedin, Github, Printer } from 'lucide-react';

interface ResumePreviewProps {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    website: string;
    linkedin: string;
    github: string;
    title: string;
    summary: string;
  };
  experience: any[];
  education: any[];
  projects: any[];
  skills: string[];
  templateId: string;
  onPrint?: () => void;
}

export default function ResumePreview({
  personalInfo,
  experience,
  education,
  projects,
  skills,
  templateId,
  onPrint
}: ResumePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    }
    
    const printContent = previewRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      // Create a clean print window style
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${personalInfo.firstName || 'Resume'}_${personalInfo.lastName || 'Preview'}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20mm;
                  font-family: ${templateId === 'classic-navy' ? 'Georgia, serif' : 'Inter, sans-serif'};
                  background-color: white !important;
                  color: black !important;
                }
                a { color: inherit; text-decoration: none; }
                h1, h2, h3, h4 { margin: 0; padding: 0; }
                
                /* Template specific prints */
                .theme-modern-glow {
                  color: #0f172a !important; /* Force readable print color */
                }
                .theme-modern-glow .accent-heading {
                  color: #7c3aed !important;
                }
                .theme-minimal-slate {
                  color: #1e293b !important;
                }
                .theme-classic-navy {
                  color: #0f172a !important;
                }
                .theme-classic-navy .accent-heading {
                  color: #1e3a8a !important;
                }
                
                .header-section { margin-bottom: 25px; text-align: center; }
                .name { font-size: 28px; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; }
                .title { font-size: 16px; font-weight: 600; color: #64748b; margin-bottom: 12px; }
                .contacts { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; font-size: 12px; color: #475569; }
                
                .section { margin-bottom: 25px; }
                .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 12px; }
                
                .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; margin-bottom: 4px; }
                .item-subheader { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 6px; }
                .item-desc { font-size: 13px; color: #334155; line-height: 1.5; margin-bottom: 15px; }
                
                .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
                .skill-tag { background: #f1f5f9; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #334155; }
              </style>
            </head>
            <body onload="window.print();window.close();">
              <div class="theme-${templateId}">
                ${printContent}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Get active styling based on template selection
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
          },
          accentColor: 'var(--accent-primary)',
          accentText: 'gradient-text',
          divider: 'rgba(139, 92, 246, 0.2)',
          tagStyle: {
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            color: 'var(--text-primary)'
          }
        };
      case 'minimal-slate':
        return {
          wrapper: {
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          },
          accentColor: '#475569',
          accentText: '',
          divider: '#cbd5e1',
          tagStyle: {
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#334155'
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
          },
          accentColor: '#1e3a8a',
          accentText: '',
          divider: '#1e3a8a',
          tagStyle: {
            background: 'transparent',
            border: '1px solid #1e3a8a',
            color: '#1e3a8a'
          }
        };
      default:
        return {
          wrapper: {},
          accentColor: '',
          accentText: '',
          divider: '',
          tagStyle: {}
        };
    }
  };

  const styles = getTemplateStyles();
  const hasName = personalInfo.firstName || personalInfo.lastName;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handlePrint}
          className="btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Printer size={14} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* A4 Sheet Container */}
      <div 
        ref={previewRef}
        style={{
          ...styles.wrapper,
          padding: '2.5rem',
          borderRadius: '12px',
          minHeight: '297mm', // A4 Aspect ratio container
          transition: 'all var(--transition-normal)',
          fontSize: '0.95rem'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 800, 
            letterSpacing: '-0.02em', 
            textTransform: 'uppercase',
            color: templateId === 'modern-glow' ? undefined : styles.accentColor
          }} className={styles.accentText}>
            {hasName ? `${personalInfo.firstName} ${personalInfo.lastName}` : 'YOUR NAME'}
          </h2>
          <div style={{ 
            fontSize: '0.95rem', 
            fontWeight: 600, 
            color: templateId === 'modern-glow' ? 'var(--text-secondary)' : '#64748b',
            marginTop: '0.25rem',
            marginBottom: '0.75rem'
          }}>
            {personalInfo.title || 'Professional Title'}
          </div>

          {/* Contacts Grid */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '1rem', 
            fontSize: '0.8rem',
            color: templateId === 'modern-glow' ? 'var(--text-secondary)' : '#475569'
          }}>
            {personalInfo.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Mail size={12} /> {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone size={12} /> {personalInfo.phone}
              </span>
            )}
            {personalInfo.website && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Globe size={12} /> {personalInfo.website}
              </span>
            )}
            {personalInfo.linkedin && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Linkedin size={12} /> LinkedIn
              </span>
            )}
            {personalInfo.github && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Github size={12} /> GitHub
              </span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderBottom: `1.5px solid ${styles.divider}`,
              paddingBottom: '0.25rem',
              marginBottom: '0.75rem',
              color: templateId === 'modern-glow' ? undefined : styles.accentColor
            }} className={styles.accentText}>
              Professional Summary
            </h3>
            <p style={{ 
              fontSize: '0.85rem', 
              lineHeight: 1.6, 
              color: templateId === 'modern-glow' ? 'var(--text-secondary)' : '#334155',
              whiteSpace: 'pre-wrap'
            }}>
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderBottom: `1.5px solid ${styles.divider}`,
              paddingBottom: '0.25rem',
              marginBottom: '1rem',
              color: templateId === 'modern-glow' ? undefined : styles.accentColor
            }} className={styles.accentText}>
              Work Experience
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                    <span>{exp.position || 'Position Title'}</span>
                    <span>{exp.company || 'Company'}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '0.8rem', 
                    color: templateId === 'modern-glow' ? 'var(--text-muted)' : '#64748b',
                    marginBottom: '0.4rem',
                    fontStyle: 'italic'
                  }}>
                    <span>
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''} -{' '}
                      {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                  {exp.description && (
                    <p style={{ 
                      fontSize: '0.85rem', 
                      lineHeight: 1.5, 
                      color: templateId === 'modern-glow' ? 'var(--text-secondary)' : '#334155',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderBottom: `1.5px solid ${styles.divider}`,
              paddingBottom: '0.25rem',
              marginBottom: '1rem',
              color: templateId === 'modern-glow' ? undefined : styles.accentColor
            }} className={styles.accentText}>
              Education
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {education.map((ed, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                    <span>{ed.degree || 'Degree'}{ed.fieldOfStudy ? ` in ${ed.fieldOfStudy}` : ''}</span>
                    <span>{ed.institution || 'School Name'}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '0.8rem', 
                    color: templateId === 'modern-glow' ? 'var(--text-muted)' : '#64748b',
                    marginBottom: '0.4rem',
                    fontStyle: 'italic'
                  }}>
                    <span>
                      {ed.startDate ? new Date(ed.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''} -{' '}
                      {ed.endDate ? new Date(ed.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                  {ed.description && (
                    <p style={{ 
                      fontSize: '0.85rem', 
                      lineHeight: 1.5, 
                      color: templateId === 'modern-glow' ? 'var(--text-secondary)' : '#334155',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {ed.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderBottom: `1.5px solid ${styles.divider}`,
              paddingBottom: '0.25rem',
              marginBottom: '1rem',
              color: templateId === 'modern-glow' ? undefined : styles.accentColor
            }} className={styles.accentText}>
              Projects
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                    <span>{proj.name || 'Project Name'}</span>
                    {proj.url && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--accent-secondary)' }}>
                        {proj.url}
                      </span>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      margin: '0.15rem 0'
                    }}>
                      Tech Stack: {proj.technologies.join(', ')}
                    </div>
                  )}
                  {proj.description && (
                    <p style={{ 
                      fontSize: '0.85rem', 
                      lineHeight: 1.5, 
                      color: templateId === 'modern-glow' ? 'var(--text-secondary)' : '#334155',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h3 style={{ 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderBottom: `1.5px solid ${styles.divider}`,
              paddingBottom: '0.25rem',
              marginBottom: '0.75rem',
              color: templateId === 'modern-glow' ? undefined : styles.accentColor
            }} className={styles.accentText}>
              Skills
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {skills.map((skill) => (
                <span 
                  key={skill} 
                  style={{
                    ...styles.tagStyle,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
