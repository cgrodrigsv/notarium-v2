"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState({ name: "", description: "", price: "", examsAmount: "", practicesAmount: "", simulationsAmount: "" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any).role !== "ADMIN") router.push("/panel");
  }, [status, session]);

  const fetchPlans = async () => {
    const res = await fetch("/api/plans");
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlan)
    });
    setNewPlan({ name: "", description: "", price: "", examsAmount: "", practicesAmount: "", simulationsAmount: "" });
    setIsAdding(false);
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este plan?")) {
      await fetch(`/api/plans/${id}`, { method: "DELETE" });
      fetchPlans();
    }
  };

  if (loading) return <div className="container">Cargando...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem' }}>←</Link>
          <h1 style={{ margin: 0 }}>Gestión de Planes</h1>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary">
          {isAdding ? "Cancelar" : "+ Nuevo Plan"}
        </button>
      </header>

      {isAdding && (
        <section className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h2>Crear Oferta</h2>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label>Nombre del Plan</label>
              <input 
                type="text" 
                className="input-field" 
                required 
                value={newPlan.name}
                onChange={e => setNewPlan({...newPlan, name: e.target.value})}
              />
            </div>
            <div>
              <label>Precio ($)</label>
              <input 
                type="number" 
                step="0.01"
                className="input-field" 
                required
                value={newPlan.price}
                onChange={e => setNewPlan({...newPlan, price: e.target.value})}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', gridColumn: 'span 2' }}>
              <div>
                <label>Prácticas</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  value={newPlan.practicesAmount}
                  onChange={e => setNewPlan({...newPlan, practicesAmount: e.target.value})}
                />
              </div>
              <div>
                <label>Exámenes</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  value={newPlan.examsAmount}
                  onChange={e => setNewPlan({...newPlan, examsAmount: e.target.value})}
                />
              </div>
              <div>
                <label>Simulacros</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  value={newPlan.simulationsAmount}
                  onChange={e => setNewPlan({...newPlan, simulationsAmount: e.target.value})}
                />
              </div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label>Descripción</label>
              <textarea 
                className="input-field" 
                value={newPlan.description}
                onChange={e => setNewPlan({...newPlan, description: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Guardar Plan</button>
          </form>
        </section>
      )}

      <div className="dashboard-grid">
        {plans.map(plan => (
          <div key={plan.id} className="module-card" style={{ borderTop: '4px solid var(--accent-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{plan.name}</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-color)', margin: '0.5rem 0' }}>${plan.price}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ background: 'var(--bg-hover)', padding: '0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{plan.practicesAmount}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Prácticas</div>
                </div>
                <div style={{ background: 'var(--bg-hover)', padding: '0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{plan.examsAmount}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Exámenes</div>
                </div>
                <div style={{ background: 'var(--bg-hover)', padding: '0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'orange' }}>{plan.simulationsAmount}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Simulacros</div>
                </div>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1, marginTop: '1rem' }}>{plan.description}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
               <button onClick={() => handleDelete(plan.id)} className="btn btn-secondary" style={{ color: 'var(--danger-color)', flex: 1 }}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
