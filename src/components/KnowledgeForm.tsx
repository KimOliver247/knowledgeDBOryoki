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
  status: 'draft'
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
    const entryToCreate = {
      type: entryType,
      heading: formData.heading,
      is_frequent: formData.isFrequent,
      needs_improvement: formData.needsImprovement,
      status,
      created_by: currentUser.id
    };

    setIsLoading(true);
    try {
      await log(LogLevel.INFO, 'Creating new entry');

      const { data: entryData, error: entryError } = await supabase
        .from('entries')
        .insert([entryToCreate])
        .select()
        .single();

      if (entryError) throw entryError;

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
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-end items-center gap-3 mb-12">
        {!showDraftsOnly && (
          <>
            <button
              onClick={() => setShowImprovements(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors dark:bg-amber-700 dark:hover:bg-amber-600"
            >
              <Lightbulb className="w-4 h-4" />
              Improvements
            </button>
            <ExportButton />
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
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              New Entry
            </>
          )}
        </button>
      </div>

      {showForm ? (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8 transition-all duration-300`}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="entryType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entry Type
                </label>
                <select
                  id="entryType"
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value as EntryType)}
                  className="block w-full pl-4 pr-10 py-3 text-base border-gray-200 rounded-lg input-focus transition-colors"
                >
                  <option value={EntryType.SUPPORT_CASE}>Support Case</option>
                  <option value={EntryType.PRODUCT_KNOWLEDGE}>Product Knowledge</option>
                  <option value={EntryType.PROCESS}>Process</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topics</label>
                <TopicMultiSelect
                  selectedTopics={formData.topics}
                  onChange={(topics) => setFormData(prev => ({ ...prev, topics }))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="heading" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heading
              </label>
              <input
                type="text"
                id="heading"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 rounded-lg border border-gray-200 input-focus transition-colors"
                required
              />
            </div>

            <div className="flex gap-6">
              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.isFrequent}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFrequent: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#59140b]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#59140b]"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Occurs Frequently
                </span>
              </label>

              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.needsImprovement}
                  onChange={(e) => setFormData(prev => ({ ...prev, needsImprovement: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#59140b]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#59140b]"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Needs Improvement
                </span>
              </label>
            </div>

            {entryType === EntryType.SUPPORT_CASE && (
              <>
                <div>
                  <label htmlFor="problem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Problem
                  </label>
                  <textarea
                    id="problem"
                    name="problem"
                    value={formData.problem}
                    onChange={handleInputChange}
                    rows={4}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-200 input-focus transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="solution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Solution
                  </label>
                  <textarea
                    id="solution"
                    name="solution"
                    value={formData.solution}
                    onChange={handleInputChange}
                    rows={4}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-200 input-focus transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer Satisfaction
                  </label>
                  <StarRating
                    value={formData.customerSatisfaction}
                    onChange={(rating) => setFormData(prev => ({ ...prev, customerSatisfaction: rating }))}
                  />
                </div>
              </>
            )}

            {entryType === EntryType.PRODUCT_KNOWLEDGE && (
              <div>
                <label htmlFor="knowledgeContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Knowledge Content
                </label>
                <textarea
                  id="knowledgeContent"
                  name="knowledgeContent"
                  value={formData.knowledgeContent}
                  onChange={handleInputChange}
                  rows={6}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-200 input-focus transition-colors"
                  required
                />
              </div>
            )}

            {entryType === EntryType.PROCESS && (
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-200 input-focus transition-colors"
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Send className="w-4 h-4" />
                Publish
              </button>
            </div>
          </form>
        </div>
      ) : (
        <SearchEntries showDraftsOnly={showDraftsOnly} />
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