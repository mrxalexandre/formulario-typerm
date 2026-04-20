import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Form, Question, Submission } from '../types';
import { ArrowLeft, BarChart2, PieChart, LineChart, Activity, Table, Filter } from 'lucide-react';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
  LineChart as RechartsLineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function AnalyticsDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'table'>('bar');
  
  // Filter states
  const [filterQuestionId, setFilterQuestionId] = useState<number | null>(null);
  const [filterAnswer, setFilterAnswer] = useState<string>('');

  useEffect(() => {
    document.title = 'Analytics';
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      loadFormData(selectedFormId);
      setFilterQuestionId(null);
      setFilterAnswer('');
    } else {
      setQuestions([]);
      setSubmissions([]);
    }
  }, [selectedFormId]);

  const loadForms = async () => {
    try {
      const data = await api.getForms();
      setForms(data);
      if (data.length > 0) {
        setSelectedFormId(data[0].id);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to load forms.');
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async (formId: number) => {
    setLoadingData(true);
    try {
      const questionsData = await api.getQuestions(formId);
      const submissionsData = await api.getSubmissions(formId);
      setQuestions(questionsData);
      setSubmissions(submissionsData);
    } catch (e) {
      console.error(e);
      alert('Failed to load form data.');
    } finally {
      setLoadingData(false);
    }
  };

  // Filter submissions based on selected filter
  const filteredSubmissions = submissions.filter(sub => {
    if (!filterQuestionId || !filterAnswer) return true;
    const answer = sub.content[filterQuestionId];
    return String(answer) === filterAnswer;
  });

  const filterableQuestions = questions.filter(q => q.type === 'multiple_choice' || q.type === 'boolean');

  const renderChart = (data: any[]) => {
    if (data.length === 0) return <div className="text-center text-gray-500 py-8">No data available</div>;

    switch (chartType) {
      case 'table':
        const total = data.reduce((acc, curr) => acc + curr.count, 0);
        return (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opção / Resposta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentagem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, i) => {
                  const percentage = total > 0 ? Math.round((row.count / total) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.count} pessoas</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="w-8">{percentage}%</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Respostas" />
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Respostas">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        );
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Resumo</h1>
            <p className="text-gray-500 mt-1">Visualize o resumo de respostas dos seus formulários</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Formulário</label>
                <select
                  value={selectedFormId || ''}
                  onChange={(e) => setSelectedFormId(Number(e.target.value))}
                  className="w-full md:w-96 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {forms.length === 0 && <option value="">Nenhum formulário encontrado</option>}
                  {forms.map(form => (
                    <option key={form.id} value={form.id}>{form.title}</option>
                  ))}
                </select>
              </div>

              {submissions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Gráfico</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${chartType === 'bar' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <BarChart2 size={16} /> Barras
                    </button>
                    <button
                      onClick={() => setChartType('pie')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${chartType === 'pie' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <PieChart size={16} /> Pizza
                    </button>
                    <button
                      onClick={() => setChartType('line')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${chartType === 'line' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <LineChart size={16} /> Linha
                    </button>
                    <button
                      onClick={() => setChartType('table')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${chartType === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Table size={16} /> Tabela
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Section */}
            {filterableQuestions.length > 0 && submissions.length > 0 && (
              <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex items-center gap-2 text-gray-500 mb-2 md:mb-0 md:pb-3">
                  <Filter size={18} />
                  <span className="text-sm font-medium">Filtro:</span>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Filtrar por Pergunta (ex: Setor)</label>
                  <select
                    value={filterQuestionId || ''}
                    onChange={(e) => {
                      setFilterQuestionId(Number(e.target.value) || null);
                      setFilterAnswer('');
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="">Sem filtro</option>
                    {filterableQuestions.map(q => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))}
                  </select>
                </div>
                
                {filterQuestionId && (
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Valor da Resposta</label>
                    <select
                      value={filterAnswer}
                      onChange={(e) => setFilterAnswer(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    >
                      <option value="">Todas as respostas</option>
                      {Array.from(new Set(submissions.map(s => String(s.content[filterQuestionId])).filter(val => val !== 'undefined' && val !== 'null' && val !== ''))).map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {loadingData ? (
          <div className="text-center py-12">Carregando dados do formulário...</div>
        ) : !selectedFormId ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            Selecione um formulário acima para ver o resumo.
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <Activity size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma resposta ainda</h3>
            <p className="text-gray-500">Este formulário ainda não recebeu nenhuma resposta.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Respostas Filtradas</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredSubmissions.length} <span className="text-sm font-normal text-gray-500">de {submissions.length}</span></p>
                </div>
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum resultado para este filtro</h3>
                <p className="text-gray-500">Tente selecionar outra opção ou remover o filtro.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {questions.map((q, idx) => {
                  const isChartable = q.type === 'multiple_choice' || q.type === 'boolean';
                  
                  const answers = filteredSubmissions
                    .map(sub => sub.content[q.id])
                    .filter(val => val !== undefined && val !== null && val !== '');
                  
                  const totalAnswers = answers.length;

                let chartData: any[] = [];
                if (isChartable && totalAnswers > 0) {
                  const frequencies: Record<string, number> = {};
                  answers.forEach(ans => {
                    const key = String(ans);
                    frequencies[key] = (frequencies[key] || 0) + 1;
                  });
                  chartData = Object.entries(frequencies).map(([name, count]) => ({ name, count }));
                }

                return (
                  <div key={q.id} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${!isChartable ? 'lg:col-span-2' : ''}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {idx + 1}. {q.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">{totalAnswers} respostas</p>

                    {totalAnswers === 0 ? (
                      <p className="text-gray-400 italic text-center py-8">Nenhuma resposta para esta pergunta.</p>
                    ) : isChartable ? (
                      <div>
                        {renderChart(chartData)}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {answers.map((ans, i) => (
                          <div key={i} className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm border border-gray-100">
                            {String(ans)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
