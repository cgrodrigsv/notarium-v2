"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    whatsapp_number: "50370000000"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any).role !== "ADMIN") router.push("/panel");
  }, [status, session]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.whatsapp_number) {
          setSettings(prev => ({ ...prev, whatsapp_number: data.whatsapp_number }));
        }
      } catch (err) {
        console.error("Error cargando configs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Configuraciones guardadas correctamente." });
      } else {
        setMessage({ type: "error", text: "Hubo un error al guardar." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error de red al guardar." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container">Cargando...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem' }}>←</Link>
        <h1 style={{ margin: 0 }}>Ajustes de Empresa</h1>
      </header>

      <section className="glass-panel">
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configura los datos globales de tu plataforma que verán los estudiantes.</p>

        {message && (
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem',
            backgroundColor: message.type === "success" ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)',
            border: `1px solid ${message.type === "success" ? 'var(--success-color)' : 'var(--danger-color)'}`,
            color: message.type === "success" ? 'var(--success-color)' : 'var(--danger-color)'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Número de WhatsApp (Ventas)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Incluye el código de país sin el símbolo "+". Ejemplo: 50370000000</p>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={settings.whatsapp_number}
              onChange={e => setSettings({...settings, whatsapp_number: e.target.value})}
              placeholder="Ej: 50371234567"
            />
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
