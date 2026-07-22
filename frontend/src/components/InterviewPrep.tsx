'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBackendUrl } from '@/lib/config';
import { 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  AlertCircle,
  BookOpen,
  Edit2
} from 'lucide-react';

interface InterviewPrepProps {
  resumeId: string;
  resumeData: any;
}

export default function InterviewPrep({ resumeId, resumeData }: InterviewPrepProps) {
  const { getIdToken } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      setError('');
      setLoading(true);
      setQuestions([]);
      setExpandedId(null);
      setShowAnswers({});
      
      const token = await getIdToken();

      const response = await fetch(`${getBackendUrl()}/api/ai/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-dev-token'}`
        },
        body: JSON.stringify({
          resumeId,
          resumeData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate interview prep questions.');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generating mock questions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleAnswer = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Description & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Interview Simulator</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '550px', margin: 0 }}>
            Generate 5 highly customized, behavioral and technical interview questions based on your experience, alongside expert model answers to help you practice.
          </p>
        </div>
        
        {!loading && (
          <button 
            onClick={handleGenerate} 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
          >
            <Sparkles size={16} />
            <span>{questions.length > 0 ? 'Regenerate Questions' : 'Generate Mock Prep'}</span>
          </button>
        )}
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

      {/* Loading state */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '250px',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <Loader2 className="animate-spin" size={36} color="var(--accent-primary)" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Analyzing experiences to craft engineering questions. This takes a few seconds...
          </p>
        </div>
      )}

      {/* Placeholder empty state */}
      {questions.length === 0 && !loading && !error && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          border: '2px dashed var(--border-color)',
          borderRadius: '12px',
          color: 'var(--text-muted)'
        }}>
          <HelpCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Questions Generated Yet</h4>
          <p style={{ fontSize: '0.9rem', maxWidth: '350px', margin: '0 auto' }}>
            Click the "Generate Mock Prep" button above to scan your qualifications and create mock questions.
          </p>
        </div>
      )}

      {/* Questions list */}
      {questions.length > 0 && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
          {questions.map((q) => {
            const isExpanded = expandedId === q.id;
            const showAnswer = !!showAnswers[q.id];
            
            return (
              <div 
                key={q.id} 
                className="glass-panel" 
                style={{ 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  border: isExpanded ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleExpand(q.id)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(139, 92, 246, 0.02)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isExpanded ? 'var(--accent-primary)' : 'var(--border-color)',
                      color: isExpanded ? '#ffffff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      Q{q.id}
                    </span>
                    <h4 style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: 600, 
                      color: isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                      lineHeight: 1.4
                    }}>
                      {q.question}
                    </h4>
                  </div>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div style={{ 
                    padding: '1.5rem', 
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    background: 'rgba(255,255,255,0.01)'
                  }} className="animate-fade-in">
                    
                    {/* Practice Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Edit2 size={12} />
                        <span>Draft Your Answer (Practice)</span>
                      </label>
                      <textarea
                        className="form-input"
                        style={{ minHeight: '80px', resize: 'vertical', fontSize: '0.875rem' }}
                        placeholder="Type your talking points or summary notes here..."
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                      />
                    </div>

                    {/* Model Answer Trigger */}
                    <div>
                      <button
                        onClick={(e) => toggleAnswer(q.id, e)}
                        className="btn-secondary"
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '0.4rem 0.8rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.4rem'
                        }}
                      >
                        <BookOpen size={12} />
                        <span>{showAnswer ? 'Hide Model Answer' : 'Reveal Model Answer'}</span>
                      </button>
                    </div>

                    {/* Model Answer Body */}
                    {showAnswer && (
                      <div style={{
                        padding: '1.25rem 1.5rem',
                        borderRadius: '8px',
                        background: 'rgba(139, 92, 246, 0.03)',
                        borderLeft: '3px solid var(--accent-secondary)'
                      }} className="animate-fade-in">
                        <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                          Exemplary Response Guidelines
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {q.sampleAnswer}
                        </p>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
