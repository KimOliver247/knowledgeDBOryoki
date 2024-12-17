import React, { useState, useEffect, memo  } from 'react';
import { X, AlertTriangle, BarChart2, Save, ArrowUpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FormData, EntryType } from '../types';
import { TopicMultiSelect } from './TopicMultiSelect';
import { StarRating } from './StarRating';
import { log, LogLevel } from '../lib/logger';
import { getCurrentUser } from '../lib/auth';
import toast from 'react-hot-toast';
import {EditImages} from "./EditImages.tsx";

interface EditEntryModalProps {
  entryId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}
interface ImageData {
  id: string;
  file_path: string;
  created_at: string;
}
export function EditEntryModal({ entryId, isOpen, onClose, onUpdate }: EditEntryModalProps) {
  const [images, setImages] = useState<ImageData[]>([]);
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
    status: 'published',
    files: []
  });
  const [entryType, setEntryType] = useState<EntryType>(EntryType.SUPPORT_CASE);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  const handleConvertToPub = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    try {
      // Save the changes first
      await handleSubmit(e);

      // Then proceed with converting the status
      const { error } = await supabase
          .from('entries')
          .update({ status: 'published' })
          .eq('id', entryId);

      if (error) throw error;

      toast.success('Entry successfully published');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error publishing entry:', error);
      toast.error('Failed to publish entry');
    }
  };

  const handleConvertToDraft = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    try {
      // Save the changes first
      await handleSubmit(e);

      // Then proceed with converting the status
      const { error } = await supabase
          .from('entries')
          .update({ status: 'draft' })
          .eq('id', entryId);

      if (error) throw error;

      toast.success('Entry converted to draft');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error converting to draft:', error);
      toast.error('Failed to convert entry to draft');
    }
  };
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

      const { data: entryData, error: entryError } = await supabase
          .from('entries')
          .select(`
        *,
        topics:entry_topics(
          topics(name)
        ),
        support_case(*),
        product_knowledge(*),
        process(*),
        images:entry_images(id, file_path, created_at)
      `)
          .eq('id', entryId)
          .single();

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
      if (entryData.images) {
        setImages(entryData.images);
      }

      await log(LogLevel.INFO, 'Entry data fetched successfully', { entryId });
    } catch (error) {
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

      const updatePayload = {
        heading: formData.heading,
        is_frequent: formData.isFrequent,
        needs_improvement: formData.needsImprovement,
        last_modified_by: currentUser.id,
        last_modified_at: new Date().toISOString()
      };

      const { data: updateResult, error: entryError } = await supabase
          .from('entries')
          .update(updatePayload)
          .eq('id', entryId)
          .select();

      if (entryError) {
        throw entryError;
      }

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
      await log(LogLevel.ERROR, 'Failed to update entry', { entryId, error });
      toast.error('Failed to update entry');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const StatusButtons = memo(({ status, onPublish, onDraft }: {
    status: 'draft' | 'published';
    onPublish: () => (e: React.MouseEvent) => Promise<void>;
    onDraft: (e: React.MouseEvent) => void;
  }) => {
    if (status === 'draft') {
      return (
          <button
              type="button"
              onClick={onPublish}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded-lg flex items-center gap-2"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Publish Entry
          </button>
      );
    }

    return (
        <button
            type="button"
            onClick={onDraft}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Convert to Draft
        </button>
    );
  });

  return (

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity modal-overlay" onClick={onClose} />

          <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Eintrag bearbeiten</h3>
              <button
                  onClick={onClose}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Themen</label>
                  <TopicMultiSelect
                      selectedTopics={formData.topics}
                      onChange={(topics) => setFormData(prev => ({...prev, topics}))}
                  />
                </div>

                <div>
                  <label htmlFor="heading" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#59140b]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#59140b]"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center gap-2">
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
                        className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#59140b]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#59140b]"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center gap-2">
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
                          Problem
                        </label>
                        <textarea
                            id="problem"
                            name="problem"
                            value={formData.problem}
                            onChange={handleInputChange}
                            rows={4}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white input-focus transition-colors"
                            required
                        />
                      </div>
                      <div>
                        <label htmlFor="solution"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Lösung
                        </label>
                        <textarea
                            id="solution"
                            name="solution"
                            value={formData.solution}
                            onChange={handleInputChange}
                            rows={4}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white input-focus transition-colors"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kundenzufriedenheit
                        </label>
                        <StarRating
                            value={formData.customerSatisfaction}
                            onChange={(rating) => setFormData(prev => ({...prev, customerSatisfaction: rating}))}
                        />
                      </div>
                    </>
                )}

                {entryType === EntryType.PRODUCT_KNOWLEDGE && (
                    <div>
                      <label htmlFor="knowledgeContent"
                             className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Produktwissen
                      </label>
                      <textarea
                          id="knowledgeContent"
                          name="knowledgeContent"
                          value={formData.knowledgeContent}
                          onChange={handleInputChange}
                          rows={6}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white input-focus transition-colors"
                          required
                      />
                    </div>
                )}

                {entryType === EntryType.PROCESS && (
                    <div>
                      <label htmlFor="description"
                             className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Beschreibung
                      </label>
                      <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={6}
                          className="block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white input-focus transition-colors"
                          required
                      />
                    </div>

                )}

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bilder
                </label>
                <EditImages
                    entryId={entryId}
                    images={images}
                    onImagesChange={() => fetchEntryData()}
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <StatusButtons
                    status={formData.status}
                    onPublish={handleConvertToPub}
                    onDraft={handleConvertToDraft}
                />
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium btn-secondary rounded-lg"
                >
                  Abbrechen
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