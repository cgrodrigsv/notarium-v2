"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type OptionType = { text: string, isCorrect: boolean, orderLetter: string };
type QuestionType = { id?: string, statement: string, legalBase: string, isActive: boolean, options: OptionType[] };

export default function BasicQuestionBank() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionType | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if ((session?.user as any)?.role === "ADMIN") {
      fetch("/api/questions?limit=500")
        .then(res => res.json())
        .then(data => {
          setQuestions(data.data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else if (session?.user && (session.user as any)?.role !== "ADMIN") {
      router.push("/panel");
    }
  }, [session, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/questions/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || "Preguntas importadas exitosamente.");
        const reload = await fetch("/api/questions?limit=500");
        const reloadedData = await reload.json();
        setQuestions(reloadedData.data || []);
      } else {
        alert(data.error || "Ocurrió un error al importar.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al cargar el archivo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const openEditModal = (q: QuestionType) => {
    let clonedOptions = q.options ? [...q.options] : [];
    while (clonedOptions.length < 4) {
      clonedOptions.push({
        text: '',
        isCorrect: clonedOptions.length === 0,
        orderLetter: String.fromCharCode(65 + clonedOptions.length)
      });
    }
    setEditingQuestion({ ...q, options: clonedOptions });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuestion)
      });
      const data = await res.json();
      
      if (res.ok) {
        setQuestions(questions.map(q => q.id === editingQuestion.id ? data : q));
        setEditingQuestion(null);
      } else {
        alert(data.error || "Ocurrió un error al guardar.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al guardar.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleClearBank = async () => {
    if (!window.confirm("¿Estás MUY SEGURO de querer eliminar TODAS las preguntas del banco? Esta acción es irreversible.")) return;

    setClearing(true);
    try {
      const res = await fetch("/api/questions/clear", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setQuestions([]);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al limpiar el banco.");
    } finally {
      setClearing(false);
    }
  };

  if (status === "loading" || loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>Cargando banco de preguntas...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>← Volver</Link>
          <h1 style={{ color: 'var(--text-main)', margin: 0 }}>Banco de Preguntas</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{session?.user?.email} (Admin)</span>
          <button onClick={() => signOut()} className="btn btn-secondary">Cerrar Sesión</button>
        </div>
      </header>

      <main className="main-content">
        <section className="glass-panel" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>Listado de Preguntas ({questions.length})</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleClearBank} disabled={clearing || uploading} 
                className="btn btn-secondary" 
                style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
              >
                {clearing ? "Vaciando..." : "Vaciar Banco"}
              </button>
              <div>
                <input type="file" accept=".csv" id="csv-upload" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading || clearing}/>
                <label htmlFor="csv-upload" className="btn btn-primary" style={{ cursor: (uploading || clearing) ? 'wait' : 'pointer' }}>
                  {uploading ? "Importando..." : "Importar CSV"}
                </label>
              </div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>ID</th>
                  <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>Enunciado</th>
                  <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>Base Legal</th>
                  <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>Estado</th>
                  <th style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>No hay preguntas registradas.</td></tr>
                ) : (
                  questions.map(q => (
                    <tr key={q.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{q.id?.split('-')[0]}</td>
                      <td style={{ padding: '1rem 0', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.statement}</td>
                      <td style={{ padding: '1rem 0' }}>{q.legalBase}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                          backgroundColor: q.isActive ? 'rgba(46, 160, 67, 0.2)' : 'rgba(248, 81, 73, 0.2)',
                          color: q.isActive ? 'var(--success-color)' : 'var(--danger-color)'
                        }}>
                          {q.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        <button onClick={() => openEditModal(q)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Editar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* EDIT MODAL */}
      {editingQuestion && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Editar Pregunta</h3>
            <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Enunciado</label>
                <textarea required className="input-field" value={editingQuestion.statement} onChange={e => setEditingQuestion({...editingQuestion, statement: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }}/>
              </div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Base Legal (Artículos)</label>
                <textarea required className="input-field" value={editingQuestion.legalBase} onChange={e => setEditingQuestion({...editingQuestion, legalBase: e.target.value})} style={{ minHeight: '60px', resize: 'vertical' }}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="isActive" checked={editingQuestion.isActive} onChange={e => setEditingQuestion({...editingQuestion, isActive: e.target.checked})}/>
                <label htmlFor="isActive" style={{ cursor: 'pointer' }}>Pregunta activa (visible en exámenes)</label>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Opciones (Selecciona la correcta)</h4>
                {editingQuestion.options.map((opt: OptionType, index: number) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input type="radio" name="correctOption" checked={opt.isCorrect} style={{ cursor: 'pointer' }}
                      onChange={() => {
                        const newOptions = editingQuestion.options.map((o: OptionType, i: number) => ({...o, isCorrect: i === index}));
                        setEditingQuestion({...editingQuestion, options: newOptions});
                      }}
                    />
                    <span style={{ fontWeight: 'bold', width: '20px' }}>{opt.orderLetter})</span>
                    <textarea required className="input-field" value={opt.text} style={{ flex: 1, padding: '0.5rem', minHeight: '60px', resize: 'vertical' }}
                      onChange={e => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[index].text = e.target.value;
                        setEditingQuestion({...editingQuestion, options: newOptions});
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingQuestion(null)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={savingEdit} className="btn btn-primary">{savingEdit ? "Guardando..." : "Guardar Cambios"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
