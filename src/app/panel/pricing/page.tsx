"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function UserPricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("50370000000");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchPlansAndSettings = async () => {
    try {
      const [resPlans, resSettings] = await Promise.all([
        fetch("/api/plans"),
        fetch("/api/settings")
      ]);
      const dataPlans = await resPlans.json();
      const dataSettings = await resSettings.json();
      setPlans(dataPlans);
      if (dataSettings.whatsapp_number) {
        setWhatsappNumber(dataSettings.whatsapp_number.replace(/\+/g, ""));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlansAndSettings();
  }, []);

  const handleBuy = (plan: any) => {
     const message = `Hola! Me gustaría adquirir el plan "${plan.name}" (ID: ${plan.id}, ${plan.practicesAmount} prácticas + ${plan.examsAmount} exámenes + ${plan.simulationsAmount} simulacros) para la cuenta ${session?.user?.email}.`;
     window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) return <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>Cargando planes...</div>;

  return (
    <div className="container" style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1rem" }}>
          Mejora tu <span style={{ color: "var(--landing-accent)" }}>Preparación</span>
        </h1>
        <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
          Elige el paquete que mejor se adapte a tu ritmo de estudio y asegura tu éxito en el examen de notariado.
        </p>
      </header>

      <div style={{ background: 'rgba(88, 166, 255, 0.05)', border: '1px solid rgba(88, 166, 255, 0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--landing-accent)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>¿Cómo Adquirir un Plan?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, lineHeight: '1.6' }}>
          <strong>Paso 1:</strong> Haz clic en <span style={{ color: 'var(--text-main)' }}>&quot;Adquirir este Plan&quot;</span>.<br/>
          <strong>Paso 2:</strong> Se abrirá un chat en nuestro WhatsApp oficial.<br/>
          <strong>Paso 3:</strong> Te proporcionaremos los números de cuenta para que realices tu transferencia.<br/>
          <strong>Paso 4:</strong> Envíanos tu comprobante y <span style={{ color: 'var(--success-color)' }}>activaremos tu acceso de inmediato</span>.
        </p>
      </div>

      <div className="features-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
        {plans.length === 0 && (
          <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "4rem", opacity: 0.6 }}>
            <p>No hay planes disponibles en este momento. Vuelve pronto.</p>
          </div>
        )}
        
        {plans.map((p) => (
          <div key={p.id} className="module-card" style={{ 
            padding: "3rem", 
            textAlign: "center", 
            border: p.examsAmount >= 50 ? "2px solid var(--landing-accent)" : "1px solid rgba(255,255,255,0.1)",
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: p.examsAmount >= 50 ? 'rgba(88, 166, 255, 0.05)' : 'var(--landing-card-bg)',
            width: '100%',
            maxWidth: '380px',
            flex: '1 1 300px'
          }}>
            {p.examsAmount >= 50 && (
              <span style={{ 
                position: 'absolute', 
                top: '-15px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                background: 'var(--landing-accent)', 
                color: 'var(--landing-bg)',
                padding: '0.25rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                Más Popular
              </span>
            )}
            <div>
              <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{p.name}</h3>
              <div style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>
                ${p.price}
              </div>
              <div style={{ padding: '0.8rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong style={{ fontSize: '1.2rem', color: 'var(--success-color)' }}>{p.practicesAmount}</strong> Prácticas</div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--landing-accent)' }}>{p.examsAmount}</strong> Exámenes Estándar
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'orange' }}>{p.simulationsAmount}</strong> Simulacros Reales
                </div>
              </div>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: "1.6" }}>
                {p.description || "Acceso ilimitado a simulacros interactivos con revisión al final de cada intento."}
              </p>
            </div>
            <button 
              onClick={() => handleBuy(p)} 
              className={`btn ${p.examsAmount >= 50 ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem", fontWeight: "bold" }}
            >
              Adquirir este Plan
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "4rem", textAlign: "center" }}>
         <Link href="/panel" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "1rem" }}>
           ← Volver al Panel de Usuario
         </Link>
      </div>
    </div>
  );
}
