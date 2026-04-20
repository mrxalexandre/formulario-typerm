import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Form } from '../types';
import { Plus, Settings, BarChart2, ExternalLink, Sparkles, Trash2 } from 'lucide-react';
import AIGeneratorModal from '../components/AIGeneratorModal';

export default function AdminDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'ADM';
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const data = await api.getForms();
      setForms(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load forms from Xano. Please check if CORS is enabled in your Xano settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newFormTitle.trim()) return;
    setIsCreating(true);
    try {
      const newForm = await api.createForm({
        title: newFormTitle,
        slug: newFormTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        settings: {
          bg_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          font_family: 'Inter',
          primary_color: '#667eea',
          admin_email: '',
          auto_advance: true,
          hide_browser_ui: false,
        }
      });
      setIsCreateModalOpen(false);
      setNewFormTitle('');
      navigate(`/form/${newForm.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to create form');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(id);
    try {
      await api.deleteForm(id);
      setForms(forms.filter(f => f.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete form');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meus Formulários</h1>
          <div className="flex gap-3">
            <Link 
              to="/analytics"
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 font-medium"
            >
              <BarChart2 size={20} />
              Analytics
            </Link>
            <button 
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200"
            >
              <Sparkles size={20} />
              Gerar com IA
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={20} />
              Criar Form
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map(form => (
            <div key={form.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{form.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <BarChart2 size={16} />
                  {form.responses_count || 0} respostas
                </span>
              </div>
              <div className="flex gap-2">
                <Link 
                  to={`/form/${form.id}`}
                  className="flex-1 flex justify-center items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Settings size={16} />
                  Editar
                </Link>
                <Link 
                  to={`/form/${form.id}/responses`}
                  className="flex-1 flex justify-center items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <BarChart2 size={16} />
                  Resultados
                </Link>
                <Link 
                  to={`/formulario/${form.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                  title="Ver Formulário"
                >
                  <ExternalLink size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(form.id)}
                  disabled={isDeleting === form.id}
                  className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                  title="Excluir Formulário"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {forms.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              Nenhum formulário ainda. Crie um para começar!
            </div>
          )}
        </div>
      </div>
      <AIGeneratorModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
      />

      {/* Create Form Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Novo Formulário</h2>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewFormTitle('');
                }} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Formulário</label>
                <input
                  type="text"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="ex: Pesquisa de Clima Organizacional"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                  disabled={isCreating}
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewFormTitle('');
                }}
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreate}
                disabled={isCreating || !newFormTitle.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Criando...' : 'Criar Formulário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
