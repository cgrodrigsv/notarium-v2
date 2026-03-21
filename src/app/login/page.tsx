"use client";

import { signIn, getSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setIsRegister(true);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Algo salió mal.");
      }

      setSuccess("¡Cuenta creada! Ahora puedes iniciar sesión.");
      setIsRegister(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
      <main className="glass-panel" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--accent-color)', fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Notarium</h1>
          <p style={{ color: 'var(--text-muted)' }}>Tu camino hacia la fe pública</p>
        </div>

        {/* Tabs Control */}
        <div style={{ display: 'flex', marginBottom: '2rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
          <button 
            type="button"
            onClick={() => { setIsRegister(false); setError(""); setSuccess(""); }}
            style={{ 
              flex: 1, padding: '0.75rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              background: !isRegister ? 'var(--bg-pane)' : 'transparent',
              color: !isRegister ? 'var(--accent-color)' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.2s'
            }}
          >
            Entrar
          </button>
          <button 
            type="button"
            onClick={() => { setIsRegister(true); setError(""); setSuccess(""); }}
            style={{ 
              flex: 1, padding: '0.75rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              background: isRegister ? 'var(--bg-pane)' : 'transparent',
              color: isRegister ? 'var(--accent-color)' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.2s'
            }}
          >
            Registro
          </button>
        </div>

        <form onSubmit={isRegister ? handleSignup : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {error && <div style={{ color: 'var(--danger-color)', backgroundColor: 'rgba(248, 81, 73, 0.1)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>{error}</div>}
          {success && <div style={{ color: 'var(--success-color)', backgroundColor: 'rgba(46, 160, 67, 0.1)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>{success}</div>}
          
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

          {isRegister && (
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
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? "Cargando..." : (isRegister ? "Crear Cuenta" : "Iniciar Sesión")}
          </button>
          
          {!isRegister && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link href="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
        <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
