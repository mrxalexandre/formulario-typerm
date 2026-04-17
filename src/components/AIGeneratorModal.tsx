import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { generateFormFromPrompt } from '../services/ai';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIGeneratorModal({ isOpen, onClose }: AIGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // 1. Generate form structure with AI
      const { form, questions } = await generateFormFromPrompt(prompt);
      
      // 2. Save form to Xano
      const createdForm = await api.createForm(form);
      
      // 3. Save questions to Xano
      for (const q of questions) {
        await api.createQuestion({ ...q, form_id: createdForm.id });
      }
      
      // 4. Navigate to the editor
      onClose();
      navigate(`/admin/form/${createdForm.id}`);
    } catch (error) {
      console.error("Error generating form:", error);
      alert("Failed to generate form. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles size={20} />
            <h2 className="font-semibold text-gray-900">Gerar Formulário com IA</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Descreva o formulário que você deseja criar. A Inteligência Artificial irá gerar automaticamente o título, descrição e todas as perguntas necessárias.
          </p>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="ex: Crie uma pesquisa de satisfação para uma cafeteria com 5 perguntas, incluindo avaliação e feedback aberto."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={isGenerating}
          />
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Gerar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
