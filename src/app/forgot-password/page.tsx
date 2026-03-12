"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always show success to avoid user enumeration
      setSubmitted(true);
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
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Recuperación de Contraseña</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📨</div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Solicitud enviada</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Si el correo <strong>{email}</strong> está registrado, un administrador te enviará el enlace de recuperación por WhatsApp o correo.
            </p>
            <Link href="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && (
              <div style={{ color: 'var(--danger-color)', backgroundColor: 'rgba(248, 81, 73, 0.1)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Ingresa tu correo y un administrador te enviará el enlace para restablecer tu contraseña.
            </p>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="usuario@notarium.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={loading}>
              {loading ? "Enviando solicitud..." : "Solicitar recuperación"}
            </button>
            <div style={{ textAlign: 'center' }}>
              <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
