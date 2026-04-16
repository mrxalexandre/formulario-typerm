import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Form, Question, Submission } from '../types';
import { ArrowLeft, Users, BarChart, Download, Printer } from 'lucide-react';

export default function ResponsesDashboard() {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (formId: number) => {
    try {
      const formData = await api.getForm(formId.toString());
      const questionsData = await api.getQuestions(formId);
      const submissionsData = await api.getSubmissions(formId);
      
      setForm(formData);
      setQuestions(questionsData);
      setSubmissions(submissionsData);
    } catch (e) {
      console.error(e);
      alert('Failed to load responses data.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!questions.length || !submissions.length) return;

    const headers = ['ID', 'Data', ...questions.map(q => `"${q.title.replace(/"/g, '""')}"`)];
    
    const rows = submissions.map(sub => {
      const dateStr = new Date(sub.created_at).toLocaleString('pt-BR');
      const row = [
        sub.id,
        `"${dateStr}"`,
        ...questions.map(q => {
          const answer = sub.content[q.id];
          const strAnswer = answer !== undefined && answer !== null ? String(answer) : '';
          return `"${strAnswer.replace(/"/g, '""')}"`;
        })
      ];
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `respostas_${form?.title || 'formulario'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!form) return <div className="p-8 text-center">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 print:mb-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-gray-200 rounded-full transition-colors print:hidden">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Respostas: {form.title}</h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Users size={16} /> {submissions.length} total de respostas
              </p>
            </div>
          </div>
          
          {submissions.length > 0 && (
            <div className="flex gap-3 print:hidden">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                Exportar CSV
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer size={18} />
                Imprimir PDF
              </button>
            </div>
          )}
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <BarChart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No responses yet</h3>
            <p className="text-gray-500">Share your form to start collecting responses.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => {
              // Calculate stats for this question
              const answers = submissions
                .map(sub => sub.content[q.id])
                .filter(val => val !== undefined && val !== null && val !== '');
              
              const totalAnswers = answers.length;

              return (
                <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300 print:break-inside-avoid print:p-4 print:mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {idx + 1}. {q.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{totalAnswers} responses</p>

                  {totalAnswers === 0 ? (
                    <p className="text-gray-400 italic">No answers for this question.</p>
                  ) : (
                    <>
                      {(q.type === 'multiple_choice' || q.type === 'boolean') && (
                        <div className="space-y-3">
                          {/* Calculate frequencies */}
                          {(() => {
                            const frequencies: Record<string, number> = {};
                            answers.forEach(ans => {
                              const key = String(ans);
                              frequencies[key] = (frequencies[key] || 0) + 1;
                            });

                            // Sort by frequency descending
                            const sortedEntries = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);

                            return sortedEntries.map(([option, count]) => {
                              const percentage = Math.round((count / totalAnswers) * 100);
                              return (
                                <div key={option} className="relative">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{option}</span>
                                    <span className="text-gray-500">{count} ({percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div 
                                      className="bg-blue-600 h-2.5 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}

                      {(q.type === 'short_text' || q.type === 'textarea') && (
                        <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2 print:max-h-none print:overflow-visible">
                          {answers.map((ans, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm border border-gray-100 print:bg-white print:border-gray-200">
                              {String(ans)}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
