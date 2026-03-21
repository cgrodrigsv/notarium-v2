"use client";
export const dynamic = 'force-dynamic';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.id) {
      const payloadUserId = (session.user as any).id;
      // Fetch history and plan in parallel
      Promise.all([
        fetch(`/api/exams/history?userId=${payloadUserId}`).then(r => r.json()),
        fetch(`/api/users/${payloadUserId}/plan`).then(r => r.json()),
      ]).then(([historyData, planData]) => {
        if (historyData.data) setAttempts(historyData.data);
        setPlan(planData);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>Cargando datos...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ color: 'var(--accent-color)', margin: 0 }}>Notarium</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{session?.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-secondary">Cerrar Sesión</button>
        </div>
      </header>
      
      <main className="main-content">

        {/* Plan Status Banner */}
        {plan && plan.role !== 'ADMIN' && (
          <section className="glass-panel" style={{ marginBottom: '2rem', borderLeft: `4px solid ${
            plan.planType === 'NONE' ? 'var(--danger-color)' : 
            (plan.practicesRemaining <= 1 || plan.examsRemaining <= 1) ? 'var(--warning-color, #e3a008)' : 'var(--success-color)'
          }` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>🎟️ Tu Plan Activo</h3>
                {plan.planType === 'NONE' && (
                  <p style={{ margin: '0.3rem 0 0 0', color: 'var(--danger-color)', fontWeight: 600 }}>Sin plan activo. Contacta al administrador para adquirir acceso.</p>
                )}
                {plan.planType === 'TRIAL' && (
                  <p style={{ margin: '0.3rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {plan.planName || 'Período de prueba'} · Vence: {plan.trialExpiresAt ? new Date(plan.trialExpiresAt).toLocaleDateString('es-ES') : '—'}
                  </p>
                )}
                {plan.planType === 'PACK' && (
                  <p style={{ margin: '0.3rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{plan.planName || 'Pack de exámenes'}</p>
                )}
              <div style={{ padding: '0.5rem 0' }}>
                <Link href="/panel/pricing" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                  Comprar Exámenes
                </Link>
              </div>
            </div>
            {plan.planType !== 'NONE' && (
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: plan.practicesRemaining <= 1 ? 'var(--warning-color, #e3a008)' : 'var(--success-color)', lineHeight: 1 }}>
                      {plan.practicesRemaining}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prácticas</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: plan.examsRemaining <= 2 ? 'var(--warning-color, #e3a008)' : 'var(--success-color)', lineHeight: 1 }}>
                      {plan.examsRemaining}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exámenes Estándar</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: plan.simulationsRemaining === 0 ? 'var(--danger-color)' : 'var(--accent-color)', lineHeight: 1 }}>
                      {plan.simulationsRemaining}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulacros Reales</div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h2>Tu Historial de Intentos</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Revisa tu progreso y resultados anteriores.</p>
          
          {attempts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              No hay intentos registrados todavía.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {attempts.map(attempt => (
                <div key={attempt.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1.2rem', 
                  backgroundColor: 'var(--bg-pane)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)' 
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                      {attempt.mode === "SIMULATION" ? "Simulacro Real" : (attempt.mode === "PRACTICE" ? "Práctica" : "Examen Estándar")}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(attempt.startedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '1.2rem', fontWeight: 700, 
                      color: attempt.percentage >= 70 ? 'var(--success-color)' : 'var(--danger-color)' 
                    }}>
                      {attempt.percentage}%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {attempt.score} / 20 aciertos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10v6M12 4v16M2 10l10-4 10 4-10 4-10-4z"/></svg>
            </div>
            <h3>Modo Práctica</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, fontSize: '0.9rem' }}>
              Sin límites de tiempo por pregunta. Ideal para estudiar la base legal tranquilamente.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/exam?mode=PRACTICE')}>Iniciar Práctica</button>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid var(--accent-color)' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>Simulacro Real</h3>
              <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--accent-color)', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>ESTRICTO</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, fontSize: '0.9rem' }}>
              Condiciones reales: 5 min por pregunta, sin retroceso, detección de foco y 90 min total.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => router.push('/exam?mode=SIMULATION')}>Iniciar Simulacro</button>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--warning-color, #e3a008)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h3>Examen Estándar</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, fontSize: '0.9rem' }}>
              20 preguntas con cronómetro de 90 min. Sin las restricciones de foco del simulacro real.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/exam?mode=EXAM')}>Iniciar Examen</button>
          </div>
        </section>
      </main>
    </div>
  );
}
