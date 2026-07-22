'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBackendUrl } from '@/lib/config';
import { 
  Sparkles, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  RefreshCw,
  Award,
  Lightbulb
} from 'lucide-react';

interface AtsCheckerProps {
  resumeId: string;
  resumeData: any;
}

export default function AtsChecker({ resumeId, resumeData }: AtsCheckerProps) {
  const { getIdToken } = useAuth();
  
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Results states
  const [atsResult, setAtsResult] = useState<any | null>(null);
  const [jobMatchResult, setJobMatchResult] = useState<any | null>(null);
  const [skillResult, setSkillResult] = useState<any | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      return setError('Please paste a job description first.');
    }

    try {
      setError('');
      setLoading(true);
      setAtsResult(null);
      setJobMatchResult(null);
      setSkillResult(null);

      const token = await getIdToken();
      const backendUrl = getBackendUrl();
      const payload = { resumeId, resumeData, jobDescription };

      // Trigger all three AI endpoints concurrently
      const [atsRes, matchRes, skillRes] = await Promise.all([
        fetch(`${backendUrl}/api/ai/ats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || 'mock-dev-token'}` },
          body: JSON.stringify(payload)
        }),
        fetch(`${backendUrl}/api/ai/job-match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || 'mock-dev-token'}` },
          body: JSON.stringify(payload)
        }),
        fetch(`${backendUrl}/api/ai/skill-suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || 'mock-dev-token'}` },
          body: JSON.stringify(payload)
        })
      ]);

      if (!atsRes.ok || !matchRes.ok || !skillRes.ok) {
        throw new Error('One or more AI evaluation steps failed. Please try again.');
      }

      const atsData = await atsRes.json();
      const matchData = await matchRes.json();
      const skillData = await skillRes.json();

      setAtsResult(atsData);
      setJobMatchResult(matchData);
      setSkillResult(skillData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing resume audit scan.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  const handleReset = () => {
    setAtsResult(null);
    setJobMatchResult(null);
    setSkillResult(null);
  };

  const isScanned = atsResult && jobMatchResult && skillResult;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Input Phase */}
      {!isScanned && !loading && (
        <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Auditor & Optimizer</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Submit a target job posting below. Gemini will scan keywords compliance, calculate semantic match percentages, and provide coaching tips on inserting missing skills.
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
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Job Posting Details</label>
            <textarea 
              className="form-input" 
              style={{ minHeight: '200px', resize: 'vertical', fontFamily: 'inherit' }} 
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Search size={18} />
            <span>Audit Resume Alignment</span>
          </button>
        </form>
      )}

      {/* Loading Phase */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            <Sparkles size={20} color="var(--accent-secondary)" style={{ position: 'absolute', top: '14px', left: '14px' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Auditor Scanning...</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '320px' }}>
              Performing keyword match, semantic relevancy grading, and missing skill generation. Please wait...
            </p>
          </div>
        </div>
      )}

      {/* Results Phase */}
      {isScanned && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
          
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Evaluation Dashboard</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Comprehensive AI match diagnostics and actionable improvements.</p>
            </div>
            <button 
              onClick={handleReset} 
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} />
              <span>Scan New Job</span>
            </button>
          </div>

          {/* Double Dial Metrics Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem'
          }}>
            
            {/* 1. ATS Score Card */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                position: 'relative',
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: `6px solid var(--border-color)`,
                borderTopColor: getScoreColor(atsResult.score),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{atsResult.score}%</span>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Award size={16} color="var(--accent-secondary)" />
                  <span>ATS Keyword Match</span>
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Keyword density grading. Scan matches technology terminology directly from the job text.
                </p>
              </div>
            </div>

            {/* 2. Semantic Relevancy Card */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                position: 'relative',
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: `6px solid var(--border-color)`,
                borderTopColor: getScoreColor(jobMatchResult.matchScore),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{jobMatchResult.matchScore}%</span>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Award size={16} color="var(--accent-primary)" />
                  <span>Semantic Relevancy</span>
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Overall qualifications alignment based on career history and scope.
                </p>
              </div>
            </div>

          </div>

          {/* Match Explanation Banner */}
          <div className="glass-panel" style={{ 
            padding: '1.5rem 2rem', 
            background: 'rgba(139, 92, 246, 0.03)',
            borderLeft: '4px solid var(--accent-primary)'
          }}>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>AI Alignment Summary</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {jobMatchResult.explanation}
            </p>
          </div>

          {/* Skill coach section */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lightbulb size={20} color="var(--warning)" />
              <span>Skill-Builder Coach Tips</span>
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Our AI coach recommends incorporating these missing target skills. Use the suggested writing guidelines to add them:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {skillResult.suggestions.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>
                  <CheckCircle size={18} />
                  <span>Excellent skills coverage! No missing target competencies identified.</span>
                </div>
              ) : (
                skillResult.suggestions.map((item: any, idx: number) => (
                  <div key={idx} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
                    <span style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      color: 'var(--error)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      flexShrink: 0
                    }}>
                      {item.skill}
                    </span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Coaching Tip:</strong> {item.tip}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Missing Keywords tags */}
          {atsResult.missingKeywords.length > 0 && (
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>Key Terms Scanner</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Ensure these job posting keyword tags are inserted in your resume description blocks to pass standard parser filtering:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {atsResult.missingKeywords.map((kw: string) => (
                  <span key={kw} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
