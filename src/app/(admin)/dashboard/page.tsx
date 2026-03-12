"use client";
export const dynamic = 'force-dynamic';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState({ totalUsers: "-", totalExams: "-", averageScore: "-", activeQuestions: 0, totalQuestions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if ((session?.user as any)?.role === "ADMIN") {
      fetch("/api/metrics").then(res => res.json())
        .then((mData) => {
          setMetrics(mData);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else if (session?.user && (session.user as any)?.role !== "ADMIN") {
      // Not admin
      router.push("/panel");
    }
  }, [session, router]);

  if (status === "loading" || loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>Cargando panel de administración...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ color: 'var(--text-main)', margin: 0 }}>Notarium Admin</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{session?.user?.email} (Admin)</span>
          <button onClick={() => signOut()} className="btn btn-secondary">Cerrar Sesión</button>
        </div>
      </header>
      
      <main className="main-content">
        
        {/* STATS HIGHLIGHTS (Top bar as per mockup) */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{metrics.activeQuestions}</div>
            <div className="stat-label">Preguntas Activas de {metrics.totalQuestions} totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{metrics.totalUsers}</div>
            <div className="stat-label">Usuarios Registrados</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{metrics.totalExams}</div>
            <div className="stat-label">Exámenes Realizados</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{metrics.averageScore}</div>
            <div className="stat-label">Promedio General</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* MAIN MODULES COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>MÓDULOS DEL SISTEMA</h3>
            
            <div className="module-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                  <span role="img" aria-label="questions" style={{ fontSize: '1.5rem' }}>📝</span>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Banco de Preguntas</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Crear, editar, activar y gestionar preguntas. Importar desde CSV.</p>
                </div>
              </div>
              <Link 
                href="/questions"
                className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}
              >
                Ir al banco ↓
              </Link>
            </div>

            <div className="module-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                  <span role="img" aria-label="users" style={{ fontSize: '1.5rem' }}>👥</span>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Gestión de Usuarios</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Administrar usuarios, roles y estado de acceso.</p>
                </div>
              </div>
              <Link 
                href="/users"
                className="btn btn-primary" 
                style={{ width: '100%', textDecoration: 'none', backgroundColor: 'var(--success-color)', display: 'block', textAlign: 'center' }}
              >
                Ir al módulo →
              </Link>
            </div>
          </div>

          {/* QUICK ACTIONS COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>ACCIONES RÁPIDAS</h3>
            
            <div className="quick-actions">
              <div className="action-btn" onClick={() => alert("Usa la importación CSV por ahora")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>➕</span> Nueva Pregunta
                </div>
                <span style={{ color: 'var(--text-muted)' }}>›</span>
              </div>
              
              <div className="action-btn" style={{ position: 'relative' }} onClick={() => router.push('/questions')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📥</span> Importar CSV
                </div>
                <span style={{ color: 'var(--text-muted)' }}>›</span>
              </div>

              <div className="action-btn" onClick={() => alert("Pronto")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📊</span> Ver Reportes
                </div>
                <span style={{ color: 'var(--text-muted)' }}>›</span>
              </div>

              <div className="action-btn" onClick={() => router.push('/questions')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--danger-color)' }}>
                  <span style={{ fontSize: '1.2rem' }}>🗑️</span> Vaciar Banco
                </div>
                <span style={{ color: 'var(--danger-color)' }}>›</span>
              </div>
            </div>

            <div className="module-card" style={{ borderLeft: '4px solid var(--success-color)' }}>
              <h4 style={{ margin: 0 }}>Estado del Sistema</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></div>
                Sistema operativo — Exámenes disponibles
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
