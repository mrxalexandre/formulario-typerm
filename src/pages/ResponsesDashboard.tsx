import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Form, Question, Submission } from '../types';
import { ArrowLeft, Users, BarChart } from 'lucide-react';

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!form) return <div className="p-8 text-center">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Responses: {form.title}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Users size={16} /> {submissions.length} total responses
            </p>
          </div>
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
                <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
                        <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
                          {answers.map((ans, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm border border-gray-100">
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
