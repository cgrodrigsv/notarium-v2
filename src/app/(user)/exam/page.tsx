"use client";
export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef, useCallback } from "react";

function ExamContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "EXAM") as "EXAM" | "PRACTICE" | "SIMULATION";

  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // States for timing and protection
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const [questionTimeLeft, setQuestionTimeLeft] = useState(5 * 60); // 5 minutes per question
  const [showWarning, setShowWarning] = useState(false);
  const [warningCount, setWarningCount] = useState(0);

  // Refs for tracking values without triggering re-renders in effects
  const answersStateRef = useRef(answers);
  const lastBlurTime = useRef<number | null>(null);

  useEffect(() => {
    answersStateRef.current = answers;
  }, [answers]);

  // --- FUNCTIONS ---
  const handleSubmit = useCallback(async (isAuto = false) => {
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
  }, [attemptId, answers, questions.length, router]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuestionTimeLeft(5 * 60); // Reset per-question timer
    }
  }, [currentIndex, questions.length]);

  const handlePrevious = () => {
    if (currentIndex > 0 && mode !== "SIMULATION") {
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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- EFFECTS ---
  
  // 1. Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // 2. Fetch/Generate Exam
  useEffect(() => {
    if (status === "authenticated" && session?.user && !attemptId && loading) {
      const payloadUserId = (session.user as any).id;
      
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
          alert(data.error || "No se pudo generar el examen.");
          router.push("/panel");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [status, session, mode, router, attemptId, loading]);

  // 3. Tab Switching Protection
  useEffect(() => {
    if (loading || !attemptId || submitting) return;

    const handleBlur = () => { lastBlurTime.current = Date.now(); };
    const handleFocus = () => {
      if (lastBlurTime.current) {
        const timeAway = Date.now() - lastBlurTime.current;
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

  // 4. Strike System (Simulation Mode)
  useEffect(() => {
    if (mode === "SIMULATION" && warningCount >= 3) {
      alert("HAS INCUMPLIDO LAS NORMAS DE SEGURIDAD. Tu examen se cerrará automáticamente por integridad.");
      handleSubmit(true);
    }
  }, [warningCount, mode, handleSubmit]);

  // 5. Global Timer (90 min)
  useEffect(() => {
    if (loading || !attemptId || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, attemptId, submitting, handleSubmit]);

  // 6. Per-Question Timer (Simulation Mode)
  useEffect(() => {
    if (loading || !attemptId || submitting || mode !== "SIMULATION") return;

    const qTimer = setInterval(() => {
      setQuestionTimeLeft(prev => {
        if (prev <= 1) {
          if (currentIndex === questions.length - 1) {
            handleSubmit(true);
          } else {
            handleNext();
          }
          return 5 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(qTimer);
  }, [loading, attemptId, submitting, mode, currentIndex, questions.length, handleSubmit, handleNext]);


  if (status === "loading" || loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>Cargando simulación...</div>;
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

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
      
      {/* WARNING MODAL */}
      {showWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ 
            maxWidth: '500px', width: '100%', padding: '2.5rem', textAlign: 'center',
            border: '2px solid var(--danger-color)'
          }}>
            <div style={{ color: 'var(--danger-color)', marginBottom: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>¡ATENCIÓN!</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Has salido de la ventana del examen. Esta acción se registra por motivos de seguridad.
            </p>
            <div style={{ 
              backgroundColor: 'rgba(248, 81, 73, 0.15)', padding: '1rem', 
              borderRadius: 'var(--radius-md)', marginBottom: '2rem',
              border: '1px solid var(--danger-color)'
            }}>
              <p style={{ fontWeight: 700, color: '#f85149', margin: 0 }}>
                Advertencia #{warningCount} de 3
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
        <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--accent-color)' }}>
          {mode === "SIMULATION" ? "Simulacro Real Notariado" : (mode === "EXAM" ? "Examen de Simulacro" : "Modo Práctica Guiada")}
        </h2>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {mode === "SIMULATION" && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              padding: '0.4rem 0.6rem', backgroundColor: 'rgba(255, 165, 0, 0.1)',
              borderRadius: 'var(--radius-sm)', border: '1px solid orange', color: 'orange',
              fontWeight: 700, fontSize: '0.85rem'
            }}>
              Q: {formatTime(questionTimeLeft)}
            </div>
          )}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', 
            backgroundColor: timeLeft < 300 ? 'rgba(248, 81, 73, 0.15)' : 'rgba(88, 166, 255, 0.1)',
            borderRadius: 'var(--radius-sm)', border: `1px solid ${timeLeft < 300 ? '#f85149' : 'var(--accent-color)'}`,
            color: timeLeft < 300 ? '#f85149' : 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem'
          }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {currentIndex + 1}/{questions.length}
          </div>
        </div>
      </header>
      
      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-pane)', borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, height: '100%', backgroundColor: 'var(--accent-color)', transition: 'width 0.3s ease' }} />
      </div>
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Pregunta:</h3>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              {currentQuestion.statement}
            </p>
            {currentQuestion.legalBase && (
              <div style={{ backgroundColor: 'rgba(46, 160, 67, 0.1)', border: '1px solid var(--success-color)', borderLeft: '4px solid var(--success-color)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>Base legal: </span>
                <span style={{ color: 'var(--text-main)' }}>{currentQuestion.legalBase}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: 'auto' }}>
            {currentQuestion.options.map((opt: any) => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              return (
                <button 
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  style={{ 
                    padding: '1rem', textAlign: 'left', 
                    backgroundColor: isSelected ? 'rgba(88, 166, 255, 0.1)' : 'var(--bg-pane)',
                    border: `2px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)', color: 'var(--text-main)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
                  }}
                >
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                    width: '30px', height: '30px', borderRadius: '50%',
                    backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--bg-color)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    border: `1px solid ${isSelected ? 'transparent' : 'var(--border-color)'}`,
                    fontWeight: 700, fontSize: '0.8rem'
                  }}>{opt.orderLetter}</span>
                  <span style={{ flex: 1, lineHeight: 1.4, fontSize: '0.95rem' }}>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button className="btn btn-secondary" onClick={handlePrevious} disabled={currentIndex === 0 || mode === "SIMULATION"}>Anterior</button>
            {currentIndex === 0 && (
              <button className="btn" onClick={handleCancel} disabled={submitting} 
                style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: '#f85149', border: '1px solid rgba(248, 81, 73, 0.3)', padding: '0.5rem 1rem' }}>
                Cancelar
              </button>
            )}
          </div>
          
          {isLastQuestion ? (
            <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
              {submitting ? "Cargando..." : "Finalizar"}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNext}>Siguiente</button>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Iniciando...</div>}>
      <ExamContent />
    </Suspense>
  );
}
