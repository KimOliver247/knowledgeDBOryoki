import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FormData, EntryType } from '../types';
import { TopicMultiSelect } from './TopicMultiSelect';
import { ExportButton } from './ExportButton';
import { SearchEntries } from './SearchEntries';
import { StarRating } from './StarRating';
import { ImprovementsModal } from './ImprovementsModal';
import { PlusCircle, X, AlertTriangle, BarChart2, Lightbulb, Save, Send } from 'lucide-react';
import { log, LogLevel } from '../lib/logger';
import { getCurrentUser } from '../lib/auth';
import toast from 'react-hot-toast';
import { useTheme } from '../hooks/useTheme';
import {ImageUploader} from "./ImageUploader.tsx";

interface KnowledgeFormProps {
  showDraftsOnly: boolean;
}

const initialFormData: FormData = {
  topics: [],
  heading: '',
  problem: '',
  solution: '',
  customerSatisfaction: 0,
  knowledgeContent: '',
  description: '',
  isFrequent: false,
  needsImprovement: false,
  status: 'draft',
    files: []
};

export function KnowledgeForm({ showDraftsOnly }: KnowledgeFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [entryType, setEntryType] = useState<EntryType>(EntryType.SUPPORT_CASE);
  const [isLoading, setIsLoading] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!currentUser) {
            toast.error('User information not available');
            return;
        }

        setIsLoading(true);
        try {
            await log(LogLevel.INFO, 'Creating new entry');

            // Create the main entry
            const entryToCreate = {
                type: entryType,
                heading: formData.heading,
                is_frequent: formData.isFrequent,
                needs_improvement: formData.needsImprovement,
                status,
                created_by: currentUser.id
            };

            const { data: entryData, error: entryError } = await supabase
                .from('entries')
                .insert([entryToCreate])
                .select()
                .single();

            if (entryError) throw entryError;

            // Handle images if present
            if (formData.files.length > 0) {
                for (const file of formData.files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${entryData.id}/${Date.now()}.${fileExt}`;

                    // Upload file to storage bucket
                    const { error: uploadError } = await supabase.storage
                        .from('entry-images')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    // Create entry in entry_images table
                    const { error: imageError } = await supabase
                        .from('entry_images')
                        .insert([{
                            entry_id: entryData.id,
                            file_path: fileName,
                            created_at: new Date().toISOString()
                        }]);

                    if (imageError) throw imageError;
                }
            }

            // Create specific entry data based on type
            const specificData = {
                id: entryData.id,
                ...(entryType === EntryType.SUPPORT_CASE && {
                    problem: formData.problem,
                    solution: formData.solution,
                    customer_satisfaction: formData.customerSatisfaction
                }),
                ...(entryType === EntryType.PRODUCT_KNOWLEDGE && {
                    knowledge_content: formData.knowledgeContent
                }),
                ...(entryType === EntryType.PROCESS && {
                    description: formData.description
                })
            };

            const { data: specificEntryData, error: specificError } = await supabase
                .from(entryType)
                .insert([specificData])
                .select()
                .single();

            if (specificError) {
                console.error('Error creating specific entry:', specificError);
                await supabase.from('entries').delete().eq('id', entryData.id);
                throw specificError;
            }

            // Handle topics
            for (const topicName of formData.topics) {
                const { data: topicData, error: topicError } = await supabase
                    .from('topics')
                    .select('id')
                    .eq('name', topicName)
                    .single();

                if (topicError) {
                    const { data: newTopic, error: createError } = await supabase
                        .from('topics')
                        .insert([{ name: topicName }])
                        .select()
                        .single();

                    if (createError) throw createError;

                    await supabase
                        .from('entry_topics')
                        .insert([{
                            entry_id: entryData.id,
                            topic_id: newTopic.id
                        }]);
                } else {
                    await supabase
                        .from('entry_topics')
                        .insert([{
                            entry_id: entryData.id,
                            topic_id: topicData.id
                        }]);
                }
            }

            await log(LogLevel.INFO, 'Entry created successfully');
            toast.success(`Entry ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
            setFormData(initialFormData);
            setShowForm(false);
        } catch (error) {
            console.error('Detailed error creating entry:', error);
            await log(LogLevel.ERROR, 'Failed to create entry', { error });
            toast.error('Failed to create entry');
        } finally {
            setIsLoading(false);
        }
    };

  return (
      <div className="max-w-7xl mx-auto bg-stone-50 dark:bg-gray-900">
        <div className="flex justify-end items-center gap-3 mb-12">
          {!showDraftsOnly && (
              <>
                <button
                    onClick={() => setShowImprovements(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                  <Lightbulb className="w-4 h-4"/>
                  Verbesserungen
                </button>
                <ExportButton/>
              </>
          )}
          <button
              onClick={() => setShowForm(!showForm)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  showForm ? 'btn-secondary' : 'btn-primary'
              }`}
          >
            {showForm ? (
                <>
                  <X className="w-4 h-4"/>
                  Abbrechen
                </>
            ) : (
                <>
                  <PlusCircle className="w-4 h-4"/>
                  Neuer Eintrag
                </>
            )}
          </button>
        </div>

        {showForm ? (
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8 transition-all duration-300">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div>
                            <label htmlFor="entryType"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Eintragstyp
                            </label>
                                    <select
                                    id="entryType"
                                    value={entryType}
                                    onChange={(e) => setEntryType(e.target.value as EntryType)}
                                    className="block w-full pl-4 border border-gray-200 pr-10 py-3 text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg input-focus transition-colors"
                                >
                                    <option value={EntryType.SUPPORT_CASE}>Support Anfrage</option>
                                    <option value={EntryType.PRODUCT_KNOWLEDGE}>Produktwissen</option>
                                    <option value={EntryType.PROCESS}>Prozess</option>
                                </select>
                        </div>

                        <div>
                            <label
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Themen</label>
                            <TopicMultiSelect
                                selectedTopics={formData.topics}
                                onChange={(topics) => setFormData(prev => ({...prev, topics}))}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="heading"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Titel
                        </label>
                        <input
                            type="text"
                            id="heading"
                            name="heading"
                            value={formData.heading}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white input-focus transition-colors"
                            required
                        />
                    </div>

                    <div className="flex gap-6">
                        <label className="relative inline-flex items-center">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.isFrequent}
                                onChange={(e) => setFormData(prev => ({...prev, isFrequent: e.target.checked}))}
                            />
                            <div
                                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#59140b]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#59140b]"></div>
                            <span
                                className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4"/>
                  Häufig
                </span>
                        </label>

                        <label className="relative inline-flex items-center">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.needsImprovement}
                                onChange={(e) => setFormData(prev => ({...prev, needsImprovement: e.target.checked}))}
                            />
                            <div
                                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#59140b]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#59140b]"></div>
                            <span
                                className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4"/>
                  Verbesserung erforderlich
                </span>
                        </label>
                    </div>

                    {entryType === EntryType.SUPPORT_CASE && (
                        <>
                            <div>
                                <label htmlFor="problem"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Problem <span className="text-xs text-gray-500">(Markdown unterstützt)</span>
                                </label>
                                <textarea
                                    id="problem"
                                    name="problem"
                                    value={formData.problem}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="font-mono block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white input-focus transition-colors"
                                    placeholder="# Überschrift&#10;- Aufzählung&#10;**Fett** oder *kursiv*"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="solution"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Lösung <span className="text-xs text-gray-500">(Markdown unterstützt)</span>
                                </label>
                                <textarea
                                    id="solution"
                                    name="solution"
                                    value={formData.solution}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="font-mono block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white input-focus transition-colors"
                                    placeholder="# Überschrift&#10;- Aufzählung&#10;**Fett** oder *kursiv*"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kundenzufriedenheit
                                </label>
                                <StarRating
                                    value={formData.customerSatisfaction}
                                    onChange={(rating) => setFormData(prev => ({
                                        ...prev,
                                        customerSatisfaction: rating
                                    }))}
                                />
                            </div>
                        </>
                    )}

                    {entryType === EntryType.PRODUCT_KNOWLEDGE && (
                        <div>
                            <label htmlFor="knowledgeContent"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Wissensinhalte <span className="text-xs text-gray-500">(Markdown unterstützt)</span>
                            </label>
                            <textarea
                                id="knowledgeContent"
                                name="knowledgeContent"
                                value={formData.knowledgeContent}
                                onChange={handleInputChange}
                                rows={6}
                                className="font-mono block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white input-focus transition-colors"
                                placeholder="# Überschrift&#10;- Aufzählung&#10;**Fett** oder *kursiv*"
                                required
                            />
                        </div>
                    )}

                    {entryType === EntryType.PROCESS && (
                        <div>
                            <label htmlFor="description"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Beschreibung <span className="text-xs text-gray-500">(Markdown unterstützt)</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                className="font-mono block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white input-focus transition-colors"
                                placeholder="# Überschrift&#10;- Aufzählung&#10;**Fett** oder *kursiv*"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bilder
                        </label>
                        <ImageUploader
                            files={formData.files}
                            onChange={(files) => setFormData(prev => ({...prev, files}))}
                            maxFiles={5}
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => handleSubmit('draft')}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <Save className="w-4 h-4"/>
                            Als Entwurf speichern
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit('published')}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <Send className="w-4 h-4"/>
                            Veröffentlichen
                        </button>
                    </div>
                </form>
            </div>
        ) : (
            <SearchEntries showDraftsOnly={showDraftsOnly}/>
        )}

          <ImprovementsModal
              isOpen={showImprovements}
              onClose={() => setShowImprovements(false)}
              onCreateEntry={(improvement) => {
              setFormData({
                ...initialFormData,
                heading: improvement.question,
                knowledgeContent: improvement.answer
              });
              setEntryType(EntryType.PRODUCT_KNOWLEDGE);
              setShowForm(true);
              setShowImprovements(false);
            }}
        />
      </div>
  );
}