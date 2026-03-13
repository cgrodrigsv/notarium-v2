"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";

export default function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { status } = useSession();
  const router = useRouter();
  const { id: attemptId } = use(params);

  const [attempt, setAttempt] = useState<any>(null);
  const [optionsMap, setOptionsMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && attemptId) {
      fetch(`/api/exams/${attemptId}/results`)
        .then(res => res.json())
        .then(data => {
          if (data.attempt) {
            setAttempt(data.attempt);
            setOptionsMap(data.optionsByQuestion);
          } else {
            alert(data.error || "No se pudieron cargar los resultados.");
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [status, attemptId]);

  if (status === "loading" || loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>Cargando resultados...</div>;
  }

  if (!attempt) return null;

  return (
    <div className="container" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '900px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-pane)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-color)' }}>
          Resultados de tu Simulación
        </h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>
            Calificación: {attempt.score} / 20
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            {attempt.percentage}%
          </div>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {attempt.details.map((detail: any, index: number) => {
          const question = detail.question;
          const options = optionsMap[question.id] || [];
          
          return (
            <div key={detail.id} className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>
                Pregunta {index + 1}
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                {question.statement}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {options.map((opt: any) => {
                  const isUserSelection = detail.selectedOptionId === opt.id;
                  const isCorrectAnswer = opt.isCorrect;
                  
                  let borderColor = 'var(--border-color)';
                  let bgColor = 'var(--bg-pane)';
                  
                  if (isCorrectAnswer) {
                    borderColor = 'var(--success-color)';
                    bgColor = 'rgba(46, 160, 67, 0.1)';
                  } else if (isUserSelection && !isCorrectAnswer) {
                    borderColor = 'var(--danger-color)';
                    bgColor = 'rgba(248, 81, 73, 0.1)';
                  }

                  return (
                    <div 
                      key={opt.id}
                      style={{ 
                        padding: '1rem', 
                        backgroundColor: bgColor,
                        border: `2px solid ${borderColor}`,
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontWeight: isUserSelection || isCorrectAnswer ? 600 : 400
                      }}
                    >
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: isUserSelection ? 'var(--text-main)' : 'var(--bg-color)',
                        color: isUserSelection ? 'var(--bg-color)' : 'var(--text-muted)',
                        border: `1px solid ${isUserSelection ? 'transparent' : 'var(--border-color)'}`,
                        fontWeight: 700, fontSize: '0.9rem'
                      }}>
                        {opt.orderLetter}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.5 }}>{opt.text}</span>
                      {isCorrectAnswer && <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓ Correcta</span>}
                      {isUserSelection && !isCorrectAnswer && <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>✗ Seleccionada</span>}
                    </div>
                  );
                })}
              </div>

              {question.legalBase && (
                <div style={{ backgroundColor: 'rgba(88, 166, 255, 0.1)', border: '1px solid var(--accent-color)', borderLeft: '4px solid var(--accent-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-color)', display: 'block', marginBottom: '0.5rem' }}>Fundamento Legal / Base Legal: </span>
                  <span style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6 }}>{question.legalBase}</span>
                </div>
              )}

              {/* AI Explanation Feature */}
              <AIExplanation 
                question={question} 
                selectedOptionId={detail.selectedOptionId}
                correctOptionId={options.find((o: any) => o.isCorrect)?.id}
                options={options}
              />
            </div>
          );
        })}
      </main>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
        <Link href="/panel" className="btn btn-primary" style={{ textDecoration: 'none', padding: '1rem 2rem' }}>
          Volver al Panel Principal
        </Link>
      </div>
    </div>
  );
}

function AIExplanation({ question, selectedOptionId, correctOptionId, options }: any) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleExplain = async () => {
    if (explanation) {
      setShow(!show);
      return;
    }

    setLoading(true);
    setShow(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          selectedOptionId,
          correctOptionId,
          statement: question.statement,
          legalBase: question.legalBase,
          options
        })
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (err) {
      console.error(err);
      setExplanation("No se pudo conectar con el servicio de IA. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button 
        onClick={handleExplain}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: 'transparent', color: 'var(--accent-color)',
          border: '1px solid var(--accent-color)', padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)', cursor: 'pointer',
          fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(88, 166, 255, 0.1)')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.1 12.1"/><path d="M12 12l9.9 0.1"/><path d="M12 12l0 9.9"/><path d="M12 12l-9.9-0.1"/><circle cx="12" cy="12" r="3"/></svg>
        {loading ? "Generando explicación..." : (show ? "Ocultar Explicación" : "Consultar Tutor IA")}
      </button>

      {show && (
        <div style={{ 
          marginTop: '1rem', padding: '1.2rem', 
          backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)', borderLeft: '4px solid var(--success-color)',
          position: 'relative', animation: 'fadeIn 0.3s ease'
        }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Analizando base legal...</div>
          ) : (
            <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
              {explanation}
            </div>
          )}
          <div style={{ 
            position: 'absolute', top: '-10px', left: '20px', 
            width: 0, height: 0, borderLeft: '10px solid transparent', 
            borderRight: '10px solid transparent', borderBottom: '10px solid var(--border-color)' 
          }} />
        </div>
      )}
    </div>
  );
}
