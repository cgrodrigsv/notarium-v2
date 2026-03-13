"use client";
export const dynamic = 'force-dynamic';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    if (status === "authenticated" && session?.user?.id) {
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
          <button onClick={() => signOut()} className="btn btn-secondary">Cerrar Sesión</button>
        </div>
      </header>
      
      <main className="main-content">

        {/* Plan Status Banner */}
        {plan && plan.role !== 'ADMIN' && (
          <section className="glass-panel" style={{ marginBottom: '2rem', borderLeft: `4px solid ${
            plan.planType === 'NONE' ? 'var(--danger-color)' : 
            plan.examsRemaining <= 2 ? 'var(--warning-color, #e3a008)' : 'var(--success-color)'
          }` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>🎟️ Tu Plan Activo</h3>
                {plan.planType === 'NONE' && (
                  <p style={{ margin: '0.3rem 0 0 0', color: 'var(--danger-color)', fontWeight: 600 }}>Sin plan activo. Contacta al administrador para adquirir acceso.</p>
                )}
                {plan.planType === 'TRIAL' && (
                  <p style={{ margin: '0.3rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Período de prueba · Vence: {plan.trialExpiresAt ? new Date(plan.trialExpiresAt).toLocaleDateString('es-ES') : '—'}
                  </p>
                )}
                {plan.planType === 'PACK' && (
                  <p style={{ margin: '0.3rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pack de exámenes</p>
                )}
              </div>
              {plan.planType !== 'NONE' && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: plan.examsRemaining <= 2 ? 'var(--warning-color, #e3a008)' : 'var(--success-color)', lineHeight: 1 }}>
                    {plan.examsRemaining}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exámen(es) restantes</div>
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
                      {attempt.mode === "PRACTICE" ? "Práctica" : "Examen Estricto"}
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

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h3>Modo Examen Estricto</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>
              Simula el examen real de 20 preguntas generadas aleatoriamente. Sin retroalimentación durante la prueba.
            </p>
            <button className="btn btn-primary" onClick={() => router.push('/exam?mode=EXAM')}>Iniciar Examen</button>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h3>Modo Práctica Guiada</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', flex: 1 }}>
              Evalúate sin presión de tiempo y consulta al <strong style={{color: 'var(--accent-color)'}}>Tutor IA</strong> después de finalizar para analizar la base legal de tus errores.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--warning-color, #e3a008)', fontWeight: 600, marginBottom: '1.5rem' }}>
              ⚠️ Este modo consume 1 crédito de tu plan.
            </p>
            <button className="btn btn-secondary" onClick={() => router.push('/exam?mode=PRACTICE')}>Iniciar Práctica (1 Crédito)</button>
          </div>
        </section>
      </main>
    </div>
  );
}
