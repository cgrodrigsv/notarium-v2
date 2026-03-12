"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error || "Error al restablecer la contraseña.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
      <main className="glass-panel" style={{ maxWidth: '420px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--accent-color)', fontSize: '2rem', margin: 0 }}>Notarium</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Nueva Contraseña</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: 'var(--success-color)', marginBottom: '0.5rem' }}>¡Contraseña actualizada!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
            <Link href="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Iniciar Sesión ahora
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && (
              <div style={{ color: 'var(--danger-color)', backgroundColor: 'rgba(248, 81, 73, 0.1)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Nueva Contraseña</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Confirmar Contraseña</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={loading}>
              {loading ? "Actualizando..." : "Cambiar Contraseña"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
