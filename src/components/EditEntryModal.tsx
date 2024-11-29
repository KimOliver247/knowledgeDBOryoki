import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FormData, EntryType } from '../types';
import { TopicMultiSelect } from './TopicMultiSelect';
import { StarRating } from './StarRating';
import { log, LogLevel } from '../lib/logger';
import { getCurrentUser } from '../lib/auth';
import toast from 'react-hot-toast';

interface EditEntryModalProps {
  entryId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditEntryModal({ entryId, isOpen, onClose, onUpdate }: EditEntryModalProps) {
  const [formData, setFormData] = useState<FormData>({
    topics: [],
    heading: '',
    problem: '',
    solution: '',
    customerSatisfaction: 0,
    knowledgeContent: '',
    description: '',
    isFrequent: false,
    needsImprovement: false,
    status: 'published'
  });
  const [entryType, setEntryType] = useState<EntryType>(EntryType.SUPPORT_CASE);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (isOpen && entryId) {
      fetchEntryData();
    }
  }, [isOpen, entryId]);

  const fetchCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const fetchEntryData = async () => {
    try {
      await log(LogLevel.INFO, 'Fetching entry for editing', { entryId });
      console.log('Fetching entry with ID:', entryId);

      const { data: entryData, error: entryError } = await supabase
          .from('entries')
          .select(`
        *,
        topics:entry_topics(
          topics(name)
        ),
        support_case(*),
        product_knowledge(*),
        process(*)
      `)
          .eq('id', entryId)
          .single();

      console.log('Entry data:', entryData);
      console.log('Entry error:', entryError);

      if (entryError) throw entryError;

      setEntryType(entryData.type as EntryType);
      setFormData(prev => ({
        ...prev,
        heading: entryData.heading,
        topics: entryData.topics.map((t: any) => t.topics.name),
        isFrequent: entryData.is_frequent,
        needsImprovement: entryData.needs_improvement,
        status: entryData.status,
        // Set type-specific fields based on the type
        ...(entryData.type === EntryType.SUPPORT_CASE && {
          problem: entryData.support_case?.problem || '',
          solution: entryData.support_case?.solution || '',
          customerSatisfaction: entryData.support_case?.customer_satisfaction || 0
        }),
        ...(entryData.type === EntryType.PRODUCT_KNOWLEDGE && {
          knowledgeContent: entryData.product_knowledge?.knowledge_content || ''
        }),
        ...(entryData.type === EntryType.PROCESS && {
          description: entryData.process?.description || ''
        })
      }));

      await log(LogLevel.INFO, 'Entry data fetched successfully', { entryId });
    } catch (error) {
      console.error('Detailed error:', error);
      await log(LogLevel.ERROR, 'Failed to fetch entry data', { entryId, error });
      toast.error('Failed to load entry data');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('User information not available');
      return;
    }

    setIsLoading(true);

    try {
      await log(LogLevel.INFO, 'Updating entry', { entryId });

      const { error: entryError } = await supabase
        .from('entries')
        .update({
          heading: formData.heading,
          is_frequent: formData.isFrequent,
          needs_improvement: formData.needsImprovement,
          last_modified_by: currentUser.id,
          last_modified_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (entryError) throw entryError;

      // Update topics
      await supabase
        .from('entry_topics')
        .delete()
        .eq('entry_id', entryId);

      for (const topicName of formData.topics) {
        let topicId;
        const { data: existingTopic } = await supabase
          .from('topics')
          .select('id')
          .eq('name', topicName)
          .single();

        if (existingTopic) {
          topicId = existingTopic.id;
        } else {
          const { data: newTopic } = await supabase
            .from('topics')
            .insert([{ name: topicName }])
            .select()
            .single();
          topicId = newTopic?.id;
        }

        if (topicId) {
          await supabase
            .from('entry_topics')
            .insert([{
              entry_id: entryId,
              topic_id: topicId
            }]);
        }
      }

      const specificData = {
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

      const { error: specificError } = await supabase
        .from(entryType)
        .update(specificData)
        .eq('id', entryId);

      if (specificError) throw specificError;

      await log(LogLevel.INFO, 'Entry updated successfully', { entryId });
      toast.success('Entry updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating entry:', error);
      await log(LogLevel.ERROR, 'Failed to update entry', { entryId, error });
      toast.error('Failed to update entry');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity modal-overlay" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Edit Entry</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
                <TopicMultiSelect
                  selectedTopics={formData.topics}
                  onChange={(topics) => setFormData(prev => ({ ...prev, topics }))}
                />
              </div>

              <div>
                <label htmlFor="heading" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#59140b]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#59140b]"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900 flex items-center gap-2">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#59140b]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#59140b]"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Needs Improvement
                  </span>
                </label>
              </div>

              {entryType === EntryType.SUPPORT_CASE && (
                <>
                  <div>
                    <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label htmlFor="solution" className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="knowledgeContent" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
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
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium btn-secondary rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}