'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getBackendUrl } from '@/lib/config';
import ResumePreview from '../../../../components/ResumePreview';
import AtsChecker from '../../../../components/AtsChecker';
import CoverLetterEditor from '../../../../components/CoverLetterEditor';
import InterviewPrep from '../../../../components/InterviewPrep';
import VersionHistory from '../../../../components/VersionHistory';
import { 
  Sparkles, 
  Save, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  User, 
  Briefcase, 
  BookOpen, 
  Code, 
  Cpu, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  X,
  Search,
  HelpCircle,
  History,
  FileText
} from 'lucide-react';

export default function ResumeEditorPage() {
  const { getIdToken, currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('modern-glow');
  
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
    title: '',
    summary: '',
  });

  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'projects' | 'skills' | 'ats' | 'cover-letter' | 'interview' | 'history'>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [polishingIndex, setPolishingIndex] = useState<number | null>(null);

  // Route protection
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, authLoading]);

  // Fetch initial resume data
  useEffect(() => {
    const fetchResume = async () => {
      if (!id) return;
      try {
        setError('');
        const token = await getIdToken();
        const response = await fetch(`${getBackendUrl()}/api/resumes/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || 'mock-dev-token'}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve resume details.');
        }

        const data = await response.json();
        setTitle(data.title || 'Untitled Resume');
        setTemplateId(data.templateId || 'modern-glow');
        setPersonalInfo(data.personalInfo || {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          website: '',
          linkedin: '',
          github: '',
          title: '',
          summary: '',
        });
        setExperience(data.experience || []);
        setEducation(data.education || []);
        setProjects(data.projects || []);
        setSkills(data.skills || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading resume.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchResume();
    }
  }, [id, currentUser]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Add items
  const addExperience = () => {
    setExperience((prev) => [
      ...prev,
      { company: '', position: '', startDate: '', endDate: '', current: false, description: '' }
    ]);
  };

  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }
    ]);
  };

  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      { name: '', description: '', url: '', technologies: [] }
    ]);
  };

  // Remove items
  const removeExperience = (index: number) => {
    setExperience((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const removeProject = (index: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  // Item field changes
  const handleExperienceChange = (index: number, field: string, value: any) => {
    setExperience((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleEducationChange = (index: number, field: string, value: any) => {
    setEducation((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleProjectChange = (index: number, field: string, value: any) => {
    setProjects((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Skills handlers
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (!skills.includes(skillInput.trim())) {
      setSkills((prev) => [...prev, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Form validations
  const validateForm = () => {
    if (!title.trim()) {
      setError('Please provide a resume title.');
      return false;
    }
    if (!personalInfo.firstName.trim() || !personalInfo.lastName.trim()) {
      setError('First and Last name are required in Personal Details.');
      return false;
    }
    // Experience validations
    for (let i = 0; i < experience.length; i++) {
      const exp = experience[i];
      if (!exp.company.trim() || !exp.position.trim()) {
        setError(`Experience #${i + 1} must have a Company Name and Position.`);
        return false;
      }
      if (exp.startDate && exp.endDate && new Date(exp.startDate) > new Date(exp.endDate)) {
        setError(`Experience #${i + 1}: Start date cannot be after End date.`);
        return false;
      }
    }
    // Education validations
    for (let i = 0; i < education.length; i++) {
      const ed = education[i];
      if (!ed.institution.trim() || !ed.degree.trim()) {
        setError(`Education #${i + 1} must have an Institution and Degree.`);
        return false;
      }
      if (ed.startDate && ed.endDate && new Date(ed.startDate) > new Date(ed.endDate)) {
        setError(`Education #${i + 1}: Start date cannot be after End date.`);
        return false;
      }
    }
    // Projects validations
    for (let i = 0; i < projects.length; i++) {
      const proj = projects[i];
      if (!proj.name.trim()) {
        setError(`Project #${i + 1} must have a name.`);
        return false;
      }
    }
    return true;
  };

  // AI summary generator call
  const handleAiSummary = async () => {
    try {
      setError('');
      setSuccess('');
      setGeneratingSummary(true);
      const token = await getIdToken();
      
      const response = await fetch(`${getBackendUrl()}/api/ai/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify({
          targetTitle: personalInfo.title,
          experience,
          education,
          skills
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary with AI.');
      }

      const data = await response.json();
      setPersonalInfo((prev) => ({
        ...prev,
        summary: data.summary || ''
      }));
      setSuccess('AI summary generated successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generating AI summary.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // AI grammar polisher call
  const handleAiPolish = async (index: number) => {
    const bulletText = experience[index].description;
    if (!bulletText || !bulletText.trim()) {
      return setError('Please enter some text in the description first before polishing.');
    }

    try {
      setError('');
      setSuccess('');
      setPolishingIndex(index);
      const token = await getIdToken();
      
      const response = await fetch(`${getBackendUrl()}/api/ai/grammar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify({ text: bulletText })
      });

      if (!response.ok) {
        throw new Error('Failed to polish text with AI.');
      }

      const data = await response.json();
      handleExperienceChange(index, 'description', data.polishedText || '');
      setSuccess('Experience description polished by AI.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error polishing grammar.');
    } finally {
      setPolishingIndex(null);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      if (!validateForm()) return;
      setSaving(true);

      const payload = {
        title,
        templateId,
        personalInfo,
        experience,
        education,
        projects,
        skills,
      };

      const token = await getIdToken();
      const response = await fetch(`${getBackendUrl()}/api/resumes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update resume details.');
      }

      setSuccess('Resume updated successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save resume.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', color: 'var(--text-secondary)' }}>
        <Loader2 className="animate-spin" size={32} />
        <span>Loading editor workspace...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '3rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link href="/dashboard" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 500
            }} className="back-link">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid transparent',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                outline: 'none',
                padding: '0.2rem 0',
                transition: 'border-color var(--transition-fast)'
              }}
              placeholder="Resume Name"
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'transparent'}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              value={templateId} 
              onChange={(e) => setTemplateId(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                padding: '0.5rem 1rem',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="modern-glow">Modern Glow</option>
              <option value="minimal-slate">Minimal Slate</option>
              <option value="classic-navy">Classic Navy</option>
            </select>

            <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Resume</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
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
            fontSize: '0.9rem',
            marginBottom: '2rem'
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
            fontSize: '0.9rem',
            marginBottom: '2rem'
          }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Workspace Layout: Sidebar + Dynamic Content Pane */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2.5rem', alignItems: 'start' }} className="main-workspace-grid">
          
          {/* Sidebar Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="editor-tabs">
            <button 
              onClick={() => setActiveTab('personal')} 
              className="tab-btn" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'personal' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === 'personal' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'personal' ? 700 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <User size={16} />
              <span>Personal Details</span>
            </button>
            <button 
              onClick={() => setActiveTab('experience')} 
              className="tab-btn" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'experience' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === 'experience' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'experience' ? 700 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Briefcase size={16} />
              <span>Experience</span>
            </button>
            <button 
              onClick={() => setActiveTab('education')} 
              className="tab-btn" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'education' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === 'education' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'education' ? 700 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <BookOpen size={16} />
              <span>Education</span>
            </button>
            <button 
              onClick={() => setActiveTab('projects')} 
              className="tab-btn" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'projects' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === 'projects' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'projects' ? 700 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Code size={16} />
              <span>Projects</span>
            </button>
            <button 
              onClick={() => setActiveTab('skills')} 
              className="tab-btn" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'skills' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === 'skills' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'skills' ? 700 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Cpu size={16} />
              <span>Skills</span>
            </button>
            <button 
              onClick={() => setActiveTab('ats')} 
              className="tab-btn" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'ats' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === 'ats' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'ats' ? 700 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Search size={16} />
              <span>ATS Optimizer</span>
            </button>
            <button 
              onClick={() => setActiveTab('cover-letter')} 
              className="tab-btn" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'cover-letter' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === 'cover-letter' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'cover-letter' ? 700 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <FileText size={16} />
              <span>Cover Letter</span>
            </button>
            <button 
              onClick={() => setActiveTab('interview')} 
              className="tab-btn" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'interview' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === 'interview' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'interview' ? 700 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <HelpCircle size={16} />
              <span>Interview Prep</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className="tab-btn" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'history' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'history' ? 700 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <History size={16} />
              <span>Version History</span>
            </button>
          </div>

          {/* Right Column: Dynamic Workspace View */}
          <div className="workspace-view-content" style={{ width: '100%' }}>
            {activeTab === 'cover-letter' ? (
              <CoverLetterEditor 
                resumeId={id as string} 
                resumeData={{ title, personalInfo, experience, education, projects, skills }} 
                templateId={templateId} 
              />
            ) : activeTab === 'history' ? (
              <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <VersionHistory 
                  resumeId={id as string} 
                  resumeData={{ title, personalInfo, experience, education, projects, skills, templateId }} 
                  onRestore={(restored) => {
                    if (restored) {
                      setTitle(restored.title || '');
                      setTemplateId(restored.templateId || 'modern-glow');
                      setPersonalInfo(restored.personalInfo || {
                        firstName: '', lastName: '', email: '', phone: '', github: '', linkedin: '', website: '', summary: '', title: ''
                      });
                      setExperience(restored.experience || []);
                      setEducation(restored.education || []);
                      setProjects(restored.projects || []);
                      setSkills(restored.skills || []);
                    }
                  }}
                />
              </div>
            ) : activeTab === 'interview' ? (
              <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <InterviewPrep 
                  resumeId={id as string} 
                  resumeData={{ title, personalInfo, experience, education, projects, skills }} 
                />
              </div>
            ) : activeTab === 'ats' ? (
              <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <AtsChecker 
                  resumeId={id as string} 
                  resumeData={{ title, personalInfo, experience, education, projects, skills }} 
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }} className="resume-split-grid">
                
                {/* Form Content Panel */}
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
            
            {/* 1. PERSONAL DETAILS */}
            {activeTab === 'personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" name="firstName" className="form-input" value={personalInfo.firstName} onChange={handlePersonalChange} placeholder="John" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="lastName" className="form-input" value={personalInfo.lastName} onChange={handlePersonalChange} placeholder="Doe" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-input" value={personalInfo.email} onChange={handlePersonalChange} placeholder="name@example.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="text" name="phone" className="form-input" value={personalInfo.phone} onChange={handlePersonalChange} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input type="url" name="website" className="form-input" value={personalInfo.website} onChange={handlePersonalChange} placeholder="https://website.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn</label>
                    <input type="url" name="linkedin" className="form-input" value={personalInfo.linkedin} onChange={handlePersonalChange} placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub</label>
                    <input type="url" name="github" className="form-input" value={personalInfo.github} onChange={handlePersonalChange} placeholder="https://github.com/username" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Professional Title</label>
                    <input type="text" name="title" className="form-input" value={personalInfo.title} onChange={handlePersonalChange} placeholder="e.g. Senior Frontend Engineer" />
                  </div>
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Professional Summary</label>
                    <button 
                      type="button" 
                      onClick={handleAiSummary}
                      disabled={generatingSummary}
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        color: 'var(--accent-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {generatingSummary ? <Loader2 size={12} className="animate-spin" style={{ display: 'inline' }} /> : <Sparkles size={12} />}
                      <span>{generatingSummary ? 'Generating...' : 'Enhance with AI'}</span>
                    </button>
                  </div>
                  <textarea name="summary" className="form-input" style={{ minHeight: '120px' }} value={personalInfo.summary} onChange={handlePersonalChange} placeholder="A short description of your professional experience..." />
                </div>
              </div>
            )}

            {/* 2. EXPERIENCE */}
            {activeTab === 'experience' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Work History</h3>
                  <button type="button" onClick={addExperience} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Plus size={14} /> Add Work
                  </button>
                </div>

                {experience.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No work history added yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {experience.map((exp, idx) => (
                      <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', position: 'relative' }}>
                        <button type="button" onClick={() => removeExperience(idx)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                        <h4 style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '1rem' }}>Position #{idx + 1}</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">Company</label>
                            <input type="text" className="form-input" value={exp.company} onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)} placeholder="Google" required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Position</label>
                            <input type="text" className="form-input" value={exp.position} onChange={(e) => handleExperienceChange(idx, 'position', e.target.value)} placeholder="Software Engineer" required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input type="date" className="form-input" value={exp.startDate} onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input type="date" className="form-input" value={exp.endDate} onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)} disabled={exp.current} />
                          </div>
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <input type="checkbox" id={`current-${idx}`} checked={exp.current} onChange={(e) => {
                            handleExperienceChange(idx, 'current', e.target.checked);
                            if (e.target.checked) handleExperienceChange(idx, 'endDate', '');
                          }} />
                          <label htmlFor={`current-${idx}`} className="form-label" style={{ margin: 0, cursor: 'pointer' }}>I currently work here</label>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ margin: 0 }}>Description / Responsibilities</label>
                            <button 
                              type="button" 
                              onClick={() => handleAiPolish(idx)}
                              disabled={polishingIndex === idx}
                              style={{
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                color: 'var(--accent-primary)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                padding: '0.3rem 0.6rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              {polishingIndex === idx ? <Loader2 size={12} className="animate-spin" style={{ display: 'inline' }} /> : <Sparkles size={12} />}
                              <span>{polishingIndex === idx ? 'Polishing...' : 'Polish with AI'}</span>
                            </button>
                          </div>
                          <textarea className="form-input" style={{ minHeight: '100px' }} value={exp.description} onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)} placeholder="Outline achievements, tech stack used, metrics, etc..." />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. EDUCATION */}
            {activeTab === 'education' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Education Background</h3>
                  <button type="button" onClick={addEducation} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Plus size={14} /> Add Education
                  </button>
                </div>

                {education.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No education history added yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {education.map((ed, idx) => (
                      <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', position: 'relative' }}>
                        <button type="button" onClick={() => removeEducation(idx)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                        <h4 style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '1rem' }}>Education #{idx + 1}</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">Institution / School</label>
                            <input type="text" className="form-input" value={ed.institution} onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)} placeholder="MIT" required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Degree</label>
                            <input type="text" className="form-input" value={ed.degree} onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)} placeholder="B.S." required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Field of Study</label>
                            <input type="text" className="form-input" value={ed.fieldOfStudy} onChange={(e) => handleEducationChange(idx, 'fieldOfStudy', e.target.value)} placeholder="Computer Science" />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div className="form-group">
                              <label className="form-label">Start Date</label>
                              <input type="date" className="form-input" value={ed.startDate} onChange={(e) => handleEducationChange(idx, 'startDate', e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">End Date</label>
                              <input type="date" className="form-input" value={ed.endDate} onChange={(e) => handleEducationChange(idx, 'endDate', e.target.value)} />
                            </div>
                          </div>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Description / Extra Info (GPA, societies, honors)</label>
                          <textarea className="form-input" style={{ minHeight: '80px' }} value={ed.description} onChange={(e) => handleEducationChange(idx, 'description', e.target.value)} placeholder="Relevant coursework, GPA: 3.9/4.0..." />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. PROJECTS */}
            {activeTab === 'projects' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Featured Projects</h3>
                  <button type="button" onClick={addProject} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Plus size={14} /> Add Project
                  </button>
                </div>

                {projects.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No projects added yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {projects.map((proj, idx) => (
                      <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', position: 'relative' }}>
                        <button type="button" onClick={() => removeProject(idx)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                        <h4 style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '1rem' }}>Project #{idx + 1}</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">Project Name</label>
                            <input type="text" className="form-input" value={proj.name} onChange={(e) => handleProjectChange(idx, 'name', e.target.value)} placeholder="AI Resume Builder" required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">URL / Repository link</label>
                            <input type="url" className="form-input" value={proj.url || ''} onChange={(e) => handleProjectChange(idx, 'url', e.target.value)} placeholder="https://github.com/username/project" />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Technologies (comma-separated)</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || ''} 
                            onChange={(e) => handleProjectChange(idx, 'technologies', e.target.value.split(',').map((s: string) => s.trim()))} 
                            placeholder="React, TypeScript, Express, Firebase" 
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Project Description</label>
                          <textarea className="form-input" style={{ minHeight: '80px' }} value={proj.description} onChange={(e) => handleProjectChange(idx, 'description', e.target.value)} placeholder="Explain the project scope, technical implementations, achievements..." />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. SKILLS */}
            {activeTab === 'skills' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Skills & Core Competencies</h3>
                
                <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={skillInput} 
                    onChange={(e) => setSkillInput(e.target.value)} 
                    placeholder="e.g. TypeScript, Docker, Systems Design" 
                  />
                  <button type="submit" className="btn-secondary" style={{ flexShrink: 0, padding: '0.75rem 1.5rem' }}>
                    Add Tag
                  </button>
                </form>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                  {skills.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills added. Add tags above.</span>
                  ) : (
                    skills.map((skill) => (
                      <span key={skill} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        color: 'var(--text-primary)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '100px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        <span>{skill}</span>
                        <X 
                          size={14} 
                          color="var(--text-muted)" 
                          className="remove-tag-btn"
                          style={{ cursor: 'pointer' }} 
                          onClick={() => handleRemoveSkill(skill)}
                        />
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Live Preview */}
          <div style={{ position: 'sticky', top: '2rem', height: 'calc(100vh - 4rem)', overflowY: 'auto', paddingRight: '0.5rem' }} className="preview-pane">
            <ResumePreview 
              personalInfo={personalInfo}
              experience={experience}
              education={education}
              projects={projects}
              skills={skills}
              templateId={templateId}
              onPrint={async () => {
                try {
                  const token = await getIdToken();
                  await fetch(`${getBackendUrl()}/api/pdf/generate`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token || 'mock-dev-token'}`
                    },
                    body: JSON.stringify({
                      resumeId: id,
                      templateId,
                      exportType: 'resume'
                    })
                  });
                } catch (err) {
                  console.error('Failed to log PDF export event:', err);
                }
              }}
            />
          </div>

        </div>
      )}
    </div>

  </div>

</div>

      <style jsx global>{`
        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.02) !important;
          color: var(--text-primary) !important;
        }
        .back-link:hover {
          color: var(--text-primary) !important;
        }
        @media (max-width: 1024px) {
          .main-workspace-grid {
            grid-template-columns: 1fr !important;
          }
          .preview-pane {
            position: static !important;
            height: auto !important;
          }
        }
        @media (max-width: 768px) {
          .editor-layout {
            grid-template-columns: 1fr !important;
          }
          .editor-tabs {
            flex-direction: row !important;
            overflow-x: auto !important;
            padding-bottom: 0.5rem !important;
          }
          .tab-btn {
            white-space: nowrap !important;
          }
        }
      `}</style>
    </div>
  );
}
