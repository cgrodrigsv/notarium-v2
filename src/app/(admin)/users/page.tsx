"use client";
export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  planType: string;
  planName: string | null;
  examsRemaining: number;
  practicesRemaining: number;
  simulationsRemaining: number;
  trialExpiresAt: string | null;
  createdAt: string;
};

const PLAN_LABELS: Record<string, string> = {
  NONE: "Sin Plan",
  TRIAL: "Prueba",
  PACK: "Pack",
};

const PLAN_COLORS: Record<string, string> = {
  NONE: "var(--text-muted)",
  TRIAL: "var(--warning-color, #e3a008)",
  PACK: "var(--success-color)",
};

export default function UsersAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [isActive, setIsActive] = useState(true);
  const [planType, setPlanType] = useState("NONE");
  const [planName, setPlanName] = useState("");
  const [examsRemaining, setExamsRemaining] = useState(0);
  const [practicesRemaining, setPracticesRemaining] = useState(0);
  const [simulationsRemaining, setSimulationsRemaining] = useState(0);
  const [trialDays, setTrialDays] = useState(7);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if ((session?.user as any)?.role !== "ADMIN") {
        router.push("/panel");
      } else {
        fetchUsers();
        fetchPlans();
      }
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (res.ok) setPlans(data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEmail(""); setPassword(""); setRole("USER"); setIsActive(true);
    setPlanType("NONE"); setPlanName(""); setExamsRemaining(0); setPracticesRemaining(0); setSimulationsRemaining(0); setTrialDays(7);
    setFormError(""); setEditingUserId(null);
  };

  const openNewModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (user: User) => {
    resetForm();
    setEditingUserId(user.id);
    setEmail(user.email);
    setRole(user.role);
    setIsActive(user.isActive);
    setPlanType(user.planType || "NONE");
    setPlanName(user.planName || "");
    setExamsRemaining(user.examsRemaining || 0);
    setPracticesRemaining(user.practicesRemaining || 0);
    setSimulationsRemaining(user.simulationsRemaining || 0);
    setIsModalOpen(true);
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      let url = "/api/users";
      let method = "POST";
      const payload: any = { email, role, isActive, planType, planName, examsRemaining, practicesRemaining, simulationsRemaining };

      if (planType === "TRIAL") {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + trialDays);
        payload.trialExpiresAt = expiry.toISOString();
      } else {
        payload.trialExpiresAt = null;
      }

      if (editingUserId) {
        url = `/api/users/${editingUserId}`;
        method = "PUT";
        if (password.trim()) payload.password = password;
      } else {
        if (!password) {
          setFormError("La contraseña es requerida para un nuevo usuario.");
          setSubmitting(false);
          return;
        }
        payload.password = password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        setFormError(data.error || "Ocurrió un error al guardar el usuario.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Error de conexión al servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>Cargando usuarios...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '1100px' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Administra acceso, roles y licencias de la plataforma.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none' }}>← Dashboard</Link>
          <button className="btn btn-primary" onClick={openNewModal}>+ Nuevo Usuario</button>
        </div>
      </header>

      <main className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Usuario</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Rol</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Plan / Licencia</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>{user.email}</td>

                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                    backgroundColor: user.role === 'ADMIN' ? 'rgba(88, 166, 255, 0.15)' : 'var(--bg-color)',
                    border: `1px solid ${user.role === 'ADMIN' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    color: user.role === 'ADMIN' ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                    {user.role}
                  </span>
                </td>

                <td style={{ padding: '1rem' }}>
                  {user.role === 'ADMIN' ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ilimitado</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block',
                        backgroundColor: 'rgba(0,0,0,0.1)', color: PLAN_COLORS[user.planType] || 'var(--text-muted)',
                        border: `1px solid ${PLAN_COLORS[user.planType] || 'var(--border-color)'}` }}>
                        {user.planName || PLAN_LABELS[user.planType] || user.planType}
                      </span>
                      {user.planType !== 'NONE' && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '0.3rem', display: 'flex', flexDirection: 'column' }}>
                          <span>{user.practicesRemaining} prácticas restantes</span>
                          <span>{user.examsRemaining} exámenes restantes</span>
                          <span>{user.simulationsRemaining} simulacros restantes</span>
                        </div>
                      )}
                      {user.planType === 'TRIAL' && user.trialExpiresAt && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.3rem' }}>
                          Vence: {new Date(user.trialExpiresAt).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                    backgroundColor: user.isActive ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                    color: user.isActive ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => toggleUserStatus(user)} className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      {user.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => openEditModal(user)} className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay usuarios en la plataforma.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>
              {editingUserId ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>
            
            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {formError && <div style={{ color: 'var(--danger-color)', backgroundColor: 'rgba(248,81,73,0.1)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>{formError}</div>}
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Correo Electrónico</label>
                <input type="email" required className="input-field" placeholder="usuario@notarium.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                  {editingUserId ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
                </label>
                <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingUserId} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Rol</label>
                  <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '0.8rem' }}>
                    <option value="USER">Usuario</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Estado</label>
                  <select className="input-field" value={isActive ? "true" : "false"} onChange={(e) => setIsActive(e.target.value === "true")} style={{ padding: '0.8rem' }}>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* License / Plan Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--accent-color)' }}>🎟️ Plan / Licencia</h4>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tipo de Plan</label>
                  <select className="input-field" value={planType} onChange={(e) => setPlanType(e.target.value)} style={{ padding: '0.8rem' }}>
                    <option value="NONE">Sin Plan (bloqueado)</option>
                    <option value="TRIAL">Prueba Gratuita</option>
                    <option value="PACK">Pack de Exámenes</option>
                  </select>
                </div>

                {planType !== "NONE" && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--success-color)' }}>
                      ⚡ Autocompletar desde Plantilla
                    </label>
                    <select className="input-field" style={{ padding: '0.8rem', border: '1px solid var(--success-color)' }} onChange={(e) => {
                      const selected = plans.find(p => p.id === e.target.value);
                      if (selected) {
                        setPlanName(selected.name);
                        setExamsRemaining(selected.examsAmount);
                        setPracticesRemaining(selected.practicesAmount);
                        setSimulationsRemaining(selected.simulationsAmount);
                        if (selected.price === 0) {
                          setPlanType("TRIAL");
                          setTrialDays(7);
                        } else {
                          setPlanType("PACK");
                        }
                      }
                    }}>
                      <option value="">-- Seleccionar un plan comercial --</option>
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}

                {planType !== "NONE" && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                      Nombre del Plan Asignado (Visible para el alumno)
                    </label>
                    <input type="text" className="input-field" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Ej. Plan Avanzado" />
                  </div>
                )}

                {planType !== "NONE" && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '80px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                        Prácticas
                      </label>
                      <input type="number" min={0} className="input-field" value={practicesRemaining}
                        onChange={(e) => setPracticesRemaining(parseInt(e.target.value) || 0)} />
                    </div>
                    <div style={{ flex: 1, minWidth: '80px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                        Exámenes
                      </label>
                      <input type="number" min={0} className="input-field" value={examsRemaining}
                        onChange={(e) => setExamsRemaining(parseInt(e.target.value) || 0)} />
                    </div>
                    <div style={{ flex: 1, minWidth: '80px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                        Simulacros
                      </label>
                      <input type="number" min={0} className="input-field" value={simulationsRemaining}
                        onChange={(e) => setSimulationsRemaining(parseInt(e.target.value) || 0)} />
                    </div>
                    {planType === "TRIAL" && (
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                          Días
                        </label>
                        <input type="number" min={1} className="input-field" value={trialDays}
                          onChange={(e) => setTrialDays(parseInt(e.target.value) || 7)} />
                      </div>
                    )}
                  </div>
                )}

                {planType !== "NONE" && (
                  <div style={{ marginTop: '0.8rem', padding: '0.8rem', backgroundColor: 'rgba(88,166,255,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {planType === "TRIAL" && `El usuario tendrá acceso durante ${trialDays} días desde hoy.`}
                    {planType === "PACK" && `El usuario tendrá acceso hasta agotar los créditos.`}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
