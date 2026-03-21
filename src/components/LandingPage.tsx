"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "¿Cómo funcionan los simulacros?",
      a: "Nuestros simulacros seleccionan 20 preguntas aleatorias de nuestro banco actualizado, siguiendo la estructura del examen real. Al finalizar, recibes una calificación instantánea y retroalimentación detallada."
    },
    {
      q: "¿El contenido está actualizado?",
      a: "Sí. Nuestro equipo legal revisa y actualiza el banco de preguntas constantemente para reflejar los cambios en la legislación y los reglamentos vigentes."
    },
    {
      q: "¿Puedo usar Notarium en mi celular?",
      a: "¡Absolutamente! La plataforma es totalmente responsiva y está optimizada para que puedas estudiar desde cualquier dispositivo móvil o tablet."
    },
    {
      q: "¿Ofrecen reembolsos?",
      a: "Ofrecemos una garantía de satisfacción de 7 días. Si no estás convencido, te devolvemos tu dinero sin preguntas."
    }
  ];

  const testimonials = [
    {
      name: "Lic. Roberto Méndez",
      role: "Aspirante a Notario",
      quote: "Gracias a los simulacros de Notarium pude identificar exactamente qué áreas del Código de Comercio necesitaba reforzar. ¡Altamente recomendado!",
      avatar: "RM"
    },
    {
      name: "Dra. Elena Castro",
      role: "Abogada Litigante",
      quote: "La plataforma es intuitiva y el banco de preguntas está siempre al día con las últimas reformas. Es la herramienta definitiva.",
      avatar: "EC"
    },
    {
      name: "Abog. Carlos Ruiz",
      role: "Notario en formación",
      quote: "El seguimiento de progreso me motivó a seguir practicando hasta alcanzar la calificación que buscaba. ¡Excelente servicio!",
      avatar: "CR"
    }
  ];

  return (
    <div className="landing-body">
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <Link href="/" className="logo">Notarium</Link>
        <div className="nav-links">
          <Link href="#features" className="nav-link">Características</Link>
          <Link href="#how-it-works" className="nav-link">Cómo funciona</Link>
          <Link href="#pricing" className="nav-link">Precios</Link>
          <Link href="#testimonials" className="nav-link">Testimonios</Link>
          <ThemeToggle className="nav-theme-toggle" />
          <Link href="/login" className="btn btn-secondary">Entrar</Link>
          <Link href="/login?signup=true" className="btn btn-primary">Registrarse</Link>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="hero container">
          <div className="hero-content">
            <h1 className="hero-headline">
              Domina el Examen de <br />
              <span className="hero-accent">Notariado</span>
            </h1>
            <p className="hero-subheadline">
              La plataforma de entrenamiento jurídico más avanzada. 
              Simulacros reales, análisis profundo y seguimiento de progreso para asegurar tu fe pública.
            </p>
            <div className="hero-actions">
              <Link href="/login?signup=true" className="btn btn-primary">
                Comenzar ahora
              </Link>
              <Link href="#features" className="btn btn-secondary">
                Ver más
              </Link>
            </div>
          </div>
          <div className="hero-image-container">
            <div className="hero-image-blur"></div>
            <Image 
              src="/images/hero_high_res.png" 
              alt="Notarium Platform" 
              width={1200} 
              height={900} 
              className="hero-image"
              priority
              quality={100}
            />
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="section container">
          <div className="container">
            <h2 className="section-title">¿Por qué elegir Notarium?</h2>
            <p className="section-subtitle">Diseñado por expertos legales para garantizar resultados excepcionales.</p>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Image src="/images/feature_exam.png" alt="Simulacros" width={64} height={64} className="feature-icon" quality={90} />
                </div>
                <h3 className="feature-title">Simulacros Reales</h3>
                <p className="feature-desc">
                  Entrena con exámenes de 20 preguntas seleccionadas aleatoriamente, simulando el entorno real del examen de notariado.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Image src="/images/feature_analytics.png" alt="Análisis" width={64} height={64} className="feature-icon" quality={90} />
                </div>
                <h3 className="feature-title">Seguimiento de Progreso</h3>
                <p className="feature-desc">
                  Visualiza tu evolución, identifica áreas de mejora y mide tu desempeño con métricas detalladas post-simulacro.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Image src="/images/feature_legal.png" alt="Motor Legal" width={64} height={64} className="feature-icon" quality={90} />
                </div>
                <h3 className="feature-title">Motor Legal Robusto</h3>
                <p className="feature-desc">
                  Base de datos actualizada con las últimas leyes, garantizando que tu preparación sea siempre vigente y relevante.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="how-it-works">
          <div className="container">
            <h2 className="section-title">Tu camino al éxito</h2>
            <p className="section-subtitle">Tres pasos simples para asegurar tu preparación notarial.</p>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <h3 className="step-title">Regístrate</h3>
                <p className="step-desc">Crea tu cuenta en segundos y accede a nuestro banco de preguntas especializado.</p>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <h3 className="step-title">Practica</h3>
                <p className="step-desc">Realiza simulacros ilimitados en modo práctica o estricto para medir tus conocimientos.</p>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <h3 className="step-title">Triunfa</h3>
                <p className="step-desc">Analiza tus resultados y llega al examen real con la confianza de un experto.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="pricing">
          <div className="container">
            <h2 className="section-title">Planes para tu Éxito</h2>
            <p className="section-subtitle">Elige el nivel de preparación que mejor se adapte a tus necesidades.</p>
            <div className="pricing-grid">
              <div className="price-card">
                <span className="plan-name">Básico</span>
                <div className="plan-price">$0 <span>/ siempre</span></div>
                <ul className="plan-features">
                  <li>3 simulacros diarios</li>
                  <li>Banco limitado</li>
                  <li>Soporte básico</li>
                </ul>
                <Link href="/login?signup=true" className="btn btn-secondary">Empezar gratis</Link>
              </div>

              <div className="price-card featured">
                <span className="plan-badge">Popular</span>
                <span className="plan-name">Profesional</span>
                <div className="plan-price">$29 <span>/ mes</span></div>
                <ul className="plan-features">
                  <li>Simulacros ilimitados</li>
                  <li>Banco completo actualizado</li>
                  <li>Análisis de progreso detallado</li>
                  <li>Soporte prioritario</li>
                </ul>
                <Link href="/login?signup=true" className="btn btn-primary">Elegir Pro</Link>
              </div>

              <div className="price-card">
                <span className="plan-name">Vitalicio</span>
                <div className="plan-price">$99 <span>/ único</span></div>
                <ul className="plan-features">
                  <li>Acceso de por vida</li>
                  <li>Todas las actualizaciones</li>
                  <li>Contenido exclusivo Pro</li>
                  <li>Comunidad VIP</li>
                </ul>
                <Link href="/login?signup=true" className="btn btn-secondary">Comprar ahora</Link>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section id="testimonials" className="testimonials">
          <div className="container">
            <h2 className="section-title">Confianza Notarial</h2>
            <p className="section-subtitle">Lo que dicen los futuros notarios sobre su experiencia con Notarium.</p>
            <div className="testimonials-grid">
              {testimonials.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-quote">&quot;{t.quote}&quot;</div>
                  <div className="testimonial-user">
                    <div className="user-avatar">{t.avatar}</div>
                    <div className="user-info">
                      <h4>{t.name}</h4>
                      <p>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="faq">
          <h2 className="section-title">Preguntas Frecuentes</h2>
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeFaq === index ? "active" : ""}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  {faq.q}
                  <span className="faq-toggle"></span>
                </div>
                <div className="faq-answer">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="cta-section container">
          <div className="cta-box">
            <h2 className="cta-title">¿Listo para asegurar tu éxito?</h2>
            <p className="cta-desc">
              Únete a miles de abogados que ya están utilizando Notarium para alcanzar la fe pública.
            </p>
            <Link href="/login?signup=true" className="btn btn-primary">
              Empieza Gratis Hoy
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="logo">Notarium</div>
        <div className="footer-nav">
          <Link href="#features" className="nav-link">Características</Link>
          <Link href="#pricing" className="nav-link">Precios</Link>
          <Link href="/terminos" className="nav-link">Términos</Link>
        </div>
        <p className="copyright">© 2026 Notarium. Diseñado para la excelencia en la práctica notarial.</p>
      </footer>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

