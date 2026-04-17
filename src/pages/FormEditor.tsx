import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Form, Question, QuestionType } from '../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, ArrowLeft, Save, Copy } from 'lucide-react';

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'build' | 'design' | 'settings'>('build');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(Number(id));
    }
  }, [id]);

  useEffect(() => {
    if (form) {
      document.title = `Editor - ${form.title}`;
    }
  }, [form]);

  const loadData = async (formId: number) => {
    try {
      const [formData, questionsData] = await Promise.all([
        api.getForm(formId.toString()),
        api.getQuestions(formId)
      ]);
      setForm(formData);
      setQuestions(questionsData);
    } catch (e) {
      console.error(e);
      alert('Failed to load form from Xano. Check console for details.');
      navigate('/admin');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = [...questions];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order
    const updatedItems = items.map((item: Question, index: number) => ({ ...item, order: index }));
    setQuestions(updatedItems);
  };

  const addQuestion = () => {
    const newQ: Partial<Question> = {
      form_id: form!.id,
      title: 'New Question',
      type: 'short_text',
      required: false,
      order: questions.length
    };
    setQuestions([...questions, { ...newQ, id: Date.now() } as Question]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], ...updates };
    setQuestions(newQs);
  };

  const duplicateQuestion = (index: number) => {
    const qToDuplicate = questions[index];
    const newQ: Partial<Question> = {
      ...qToDuplicate,
      title: `${qToDuplicate.title} (Copy)`,
      id: Date.now(), // Temporary ID until saved
      order: index + 1
    };
    
    const newQs = [...questions];
    newQs.splice(index + 1, 0, newQ as Question);
    
    // Update order for all questions
    const updatedItems = newQs.map((item: Question, idx: number) => ({ ...item, order: idx }));
    setQuestions(updatedItems);
  };

  const removeQuestion = (index: number) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const saveForm = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await api.updateForm(form.id, form);
      // In a real app, we'd sync questions individually or via a bulk endpoint
      const updatedQuestions = [];
      for (const q of questions) {
        if (q.id > 1000000000000) { // arbitrary check for newly created mock ids
           const newQ = await api.createQuestion(q);
           updatedQuestions.push(newQ);
        } else {
           const updatedQ = await api.updateQuestion(q.id, q);
           updatedQuestions.push(updatedQ);
        }
      }
      setQuestions(updatedQuestions);
      alert('Saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <input 
            type="text" 
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            className="text-xl font-bold bg-transparent border-none focus:ring-0 p-0"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['build', 'design', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={saveForm}
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6">
        {activeTab === 'build' && (
          <div className="space-y-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {questions.map((q, index) => (
                      // @ts-ignore
                      <Draggable key={q.id.toString()} draggableId={q.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 group"
                          >
                            <div {...provided.dragHandleProps} className="mt-2 text-gray-400 hover:text-gray-600 cursor-grab">
                              <GripVertical size={20} />
                            </div>
                            <div className="flex-1 space-y-4">
                              <input 
                                type="text" 
                                value={q.title}
                                onChange={e => updateQuestion(index, { title: e.target.value })}
                                className="w-full text-lg font-medium border-0 border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-0 p-0 bg-transparent"
                                placeholder="Question title"
                              />
                              <div className="flex gap-4 items-center">
                                <select 
                                  value={q.type}
                                  onChange={e => updateQuestion(index, { type: e.target.value as QuestionType })}
                                  className="border-gray-300 rounded-md text-sm"
                                >
                                  <option value="short_text">Short Text</option>
                                  <option value="textarea">Long Text</option>
                                  <option value="multiple_choice">Multiple Choice</option>
                                  <option value="boolean">Yes / No</option>
                                </select>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                  <input 
                                    type="checkbox" 
                                    checked={q.required}
                                    onChange={e => updateQuestion(index, { required: e.target.checked })}
                                    className="rounded border-gray-300 text-black focus:ring-black"
                                  />
                                  Required
                                </label>
                              </div>
                              {q.type === 'multiple_choice' && (
                                <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                                  {(q.options || []).map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full border border-gray-300" />
                                      <input 
                                        type="text"
                                        value={opt}
                                        onChange={e => {
                                          const newOpts = [...(q.options || [])];
                                          newOpts[optIdx] = e.target.value;
                                          updateQuestion(index, { options: newOpts });
                                        }}
                                        className="text-sm border-none focus:ring-0 p-0 bg-transparent"
                                        placeholder={`Option ${optIdx + 1}`}
                                      />
                                      <button 
                                        onClick={() => {
                                          const newOpts = [...(q.options || [])];
                                          newOpts.splice(optIdx, 1);
                                          updateQuestion(index, { options: newOpts });
                                        }}
                                        className="text-gray-400 hover:text-red-500"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => updateQuestion(index, { options: [...(q.options || []), ''] })}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                  >
                                    + Add option
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                              <button 
                                onClick={() => duplicateQuestion(index)}
                                className="text-gray-400 hover:text-blue-500"
                                title="Duplicate question"
                              >
                                <Copy size={18} />
                              </button>
                              <button 
                                onClick={() => removeQuestion(index)}
                                className="text-gray-400 hover:text-red-500"
                                title="Delete question"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button 
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Question
            </button>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-4">Background Style</label>
              
              <div className="space-y-5">
                {/* Solid Color */}
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Solid Color</span>
                  <div className="mt-2 flex items-center gap-3">
                    <input 
                      type="color" 
                      value={(!form.settings.bg_gradient.includes('url(') && !form.settings.bg_gradient.includes('gradient(')) ? form.settings.bg_gradient : '#ffffff'}
                      onChange={e => setForm({...form, settings: {...form.settings, bg_gradient: e.target.value}})}
                      className="h-10 w-20 cursor-pointer rounded border border-gray-300"
                    />
                    <span className="text-sm text-gray-500">Pick a custom color</span>
                  </div>
                </div>

                {/* Gradients */}
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Gradients</span>
                  <div className="mt-2 grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {[
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                      'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
                      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                      'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
                      'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
                    ].map((grad, i) => (
                      <button
                        key={i}
                        onClick={() => setForm({...form, settings: {...form.settings, bg_gradient: grad}})}
                        className={`h-10 rounded-md border-2 transition-all ${form.settings.bg_gradient === grad ? 'border-black scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                        style={{ background: grad }}
                        title="Select gradient"
                      />
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Background Image</span>
                  <p className="text-xs text-gray-400 mb-2">Recommended dimensions: 1920x1080 pixels</p>
                  <label className="flex items-center justify-center w-full h-24 px-4 transition bg-gray-50 border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-gray-400 hover:bg-gray-100 focus:outline-none">
                    <span className="flex flex-col items-center space-y-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="font-medium text-gray-600 text-sm">Click to browse image</span>
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setForm({...form, settings: {...form.settings, bg_gradient: `url(${base64})`}});
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Preview</span>
                <div 
                  className="mt-2 h-32 rounded-xl border border-gray-200 shadow-inner" 
                  style={{ 
                    ...(form.settings.bg_gradient.includes('url(') || form.settings.bg_gradient.includes('gradient(')
                      ? {
                          backgroundImage: form.settings.bg_gradient,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }
                      : {
                          backgroundColor: form.settings.bg_gradient
                        }
                    )
                  }} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  value={form.settings.primary_color}
                  onChange={e => setForm({...form, settings: {...form.settings, primary_color: e.target.value}})}
                  className="h-10 w-20 cursor-pointer"
                />
                <span className="text-sm text-gray-500">{form.settings.primary_color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
              <select 
                value={form.settings.font_family}
                onChange={e => setForm({...form, settings: {...form.settings, font_family: e.target.value}})}
                className="w-full border-gray-300 rounded-md"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notification Email</label>
              <input 
                type="email" 
                value={form.settings.admin_email}
                onChange={e => setForm({...form, settings: {...form.settings, admin_email: e.target.value}})}
                className="w-full border-gray-300 rounded-md"
                placeholder="admin@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Where to send submission notifications.</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto-advance</h4>
                <p className="text-xs text-gray-500">Automatically move to next question on multiple choice selection.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.settings.auto_advance}
                  onChange={e => setForm({...form, settings: {...form.settings, auto_advance: e.target.checked}})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Focus Mode</h4>
                <p className="text-xs text-gray-500">Hide browser UI elements (requires PWA setup).</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.settings.hide_browser_ui}
                  onChange={e => setForm({...form, settings: {...form.settings, hide_browser_ui: e.target.checked}})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
