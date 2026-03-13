"use client";
export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";

function ExamContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "EXAM";

  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Use a Ref to keep track of the latest answers for the timer submission (avoids stale closures)
  const answersStateRef = useRef(answers);
  useEffect(() => {
    answersStateRef.current = answers;
  }, [answers]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, boolean>>({}); // For Practice mode
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds

  // --- NEW: TAB SWITCHING PROTECTION ---
  const [showWarning, setShowWarning] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const lastBlurTime = useRef<number | null>(null);

  useEffect(() => {
    if (loading || !attemptId || submitting) return;

    const handleBlur = () => {
      lastBlurTime.current = Date.now();
    };

    const handleFocus = () => {
      if (lastBlurTime.current) {
        const timeAway = Date.now() - lastBlurTime.current;
        // If the user was away for more than 2 seconds, count as a violation
        if (timeAway > 2000) {
          setShowWarning(true);
          setWarningCount(prev => prev + 1);
        }
        lastBlurTime.current = null;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loading, attemptId, submitting]);
  // ---------------------------------------

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Only generate an exam if we don't have one yet and are not currently submitting
    // This prevents re-generating (and losing credits) when NextAuth refreshes the session on window focus (Alt+Tab)
    if (status === "authenticated" && session?.user && !attemptId && loading) {
      const payloadUserId = (session.user as any).id || "admin-or-user-id";
      
      fetch("/api/exams/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, userId: payloadUserId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.attemptId) {
          setAttemptId(data.attemptId);
          setQuestions(data.questions);
        } else {
          const errorMsg = data.details ? `${data.error}\nDetalles: ${data.details}` : (data.error || "No se pudo generar el examen.");
          alert(errorMsg);
          router.push("/panel");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
    // We include all dependencies used inside the effect to satisfy the linter
  }, [status, session, mode, router, attemptId, loading]);

  const handleSubmit = async (isAuto = false) => {
    // When auto-submitting (timer run out), use the ref to get the most recent answers
    const currentAnswers = isAuto ? answersStateRef.current : answers;

    if (!isAuto && Object.keys(currentAnswers).length < questions.length) {
      const confirmIncomplete = confirm("No has respondido todas las preguntas. ¿Estás seguro de enviar el examen?");
      if (!confirmIncomplete) return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers: currentAnswers })
      });
      const data = await res.json();
      
      if (res.ok) {
        router.push(`/exam/${attemptId}/results`);
      } else {
        alert(data.error || "Hubo un error al evaluar el examen.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión...");
      setSubmitting(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (loading || !attemptId || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, attemptId, submitting]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (status === "loading" || loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>Generando simulación...</div>;
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };


  const handleCancel = async () => {
    if (!attemptId) return;
    
    const confirmCancel = confirm("¿Estás seguro de que deseas cancelar el examen? Tu crédito será devuelto.");
    if (!confirmCancel) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/exams/${attemptId}/cancel`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (res.ok) {
        router.push("/panel");
      } else {
        const errorMsg = data.details ? `${data.error}\nDetalles: ${data.details}` : (data.error || "Hubo un error al cancelar el examen.");
        alert(errorMsg);
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión...");
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '900px', position: 'relative' }}>
      
      {/* WARNING MODAL */}
      {showWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ 
            maxWidth: '500px', width: '100%', padding: '2.5rem', textAlign: 'center',
            border: '2px solid var(--danger-color)', animation: 'pulse 2s infinite'
          }}>
            <div style={{ color: 'var(--danger-color)', marginBottom: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>¡ATENCIÓN!</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Has salido de la ventana del examen. Esta acción se registra para el reporte de integridad.
            </p>
            <div style={{ 
              backgroundColor: 'rgba(248, 81, 73, 0.15)', padding: '1rem', 
              borderRadius: 'var(--radius-md)', marginBottom: '2rem',
              border: '1px solid var(--danger-color)'
            }}>
              <p style={{ fontWeight: 700, color: '#f85149', margin: 0 }}>
                Advertencia #{warningCount}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Si excedes el límite de salidas, el examen podría ser invalidado automáticamente.
              </p>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', backgroundColor: 'var(--danger-color)' }}
              onClick={() => setShowWarning(false)}
            >
              Entiendo y deseo continuar
            </button>
          </div>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-pane)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-color)' }}>
          {mode === "EXAM" ? "Simulador de Examen de Notariado" : "Modo Práctica Guiada"}
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.4rem 0.8rem', 
            backgroundColor: timeLeft < 300 ? 'rgba(248, 81, 73, 0.15)' : 'rgba(88, 166, 255, 0.1)',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${timeLeft < 300 ? '#f85149' : 'var(--accent-color)'}`,
            color: timeLeft < 300 ? '#f85149' : 'var(--text-main)',
            fontWeight: 700,
            fontSize: '1rem',
            fontVariantNumeric: 'tabular-nums'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontWeight: '500', color: 'var(--text-muted)' }}>
            Pregunta {currentIndex + 1} de {questions.length}
          </div>
        </div>
      </header>
      
      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-pane)', borderRadius: '3px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, height: '100%', backgroundColor: 'var(--accent-color)', transition: 'width 0.3s ease' }} />
      </div>
      
      <main className="main-content" style={{ display: 'flex', gap: '2rem', flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2.5rem' }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Enunciado del Caso:</h3>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                {currentQuestion.statement}
              </p>
              
              {/* Green Legal Base Banner inspired by official presentational format */}
              {currentQuestion.legalBase && (
                <div style={{ backgroundColor: 'rgba(46, 160, 67, 0.15)', border: '1px solid var(--success-color)', borderLeft: '4px solid var(--success-color)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>Base legal: </span>
                  <span style={{ color: 'var(--text-main)' }}>{currentQuestion.legalBase}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
              {currentQuestion.options.map((opt: any) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                return (
                  <button 
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    style={{ 
                      padding: '1.2rem', 
                      textAlign: 'left', 
                      backgroundColor: isSelected ? 'rgba(88, 166, 255, 0.1)' : 'var(--bg-pane)',
                      border: `2px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontWeight: isSelected ? 600 : 400
                    }}
                  >
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                      width: '36px', height: '36px', borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--bg-color)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      border: `1px solid ${isSelected ? 'transparent' : 'var(--border-color)'}`,
                      fontWeight: 700, fontSize: '0.9rem'
                    }}>
                      {opt.orderLetter}
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.5 }}>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {mode === "PRACTICE" && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(240, 246, 252, 0.05)', borderLeft: '4px solid var(--accent-color)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                <h4 style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Modo Práctica Activo</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Las respuestas se evaluarán al final de manera conjunta.</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="btn btn-secondary" onClick={handlePrevious} disabled={currentIndex === 0}>
                Anterior
              </button>
              
              {currentIndex === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button 
                    className="btn" 
                    onClick={handleCancel} 
                    disabled={submitting}
                    style={{ 
                      backgroundColor: 'rgba(248, 81, 73, 0.1)', 
                      color: '#f85149', 
                      border: '1px solid rgba(248, 81, 73, 0.4)',
                      padding: '0.6rem 1.2rem',
                      width: 'fit-content'
                    }}
                  >
                    {submitting ? "Saliendo..." : (mode === "EXAM" ? "Cancelar Examen" : "Salir de Práctica")}
                  </button>
                  {mode === "EXAM" ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      * La cancelación con devolución de crédito solo es válida en la pregunta 1.
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      * El botón de salida rápida solo está disponible en la pregunta 1.
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {isLastQuestion ? (
              <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
                {submitting ? "Evaluando..." : "Finalizar y Evaluar"}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNext}>
                Siguiente
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Cargando examen...</div>}>
      <ExamContent />
    </Suspense>
  );
}
