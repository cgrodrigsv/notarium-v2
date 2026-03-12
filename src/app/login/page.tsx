"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
      setLoading(false);
    } else {
      const session = await getSession();
      if ((session?.user as any)?.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/panel");
      }
      router.refresh();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
      <main className="glass-panel" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--accent-color)', fontSize: '2rem', margin: 0 }}>Notarium</h1>
          <p style={{ color: 'var(--text-muted)' }}>Plataforma Profesional de Evaluación</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {error && <div style={{ color: 'var(--danger-color)', backgroundColor: 'rgba(248, 81, 73, 0.1)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>{error}</div>}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Correo Electrónico</label>
            <input 
              type="email" 
              required
              className="input-field" 
              placeholder="usuario@notarium.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Contraseña</label>
            <input 
              type="password"
              required
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <Link href="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
