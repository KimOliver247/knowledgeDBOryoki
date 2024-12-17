import React, { useState, useEffect } from 'react';
import { X, Clock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EntryType } from '../types';
import { StarRating } from './StarRating';
import { log, LogLevel } from '../lib/logger';
import toast from 'react-hot-toast';
import {ViewImages} from "./ViewImages.tsx";

interface ViewEntryModalProps {
  entryId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface EntryData {
  id: string;
  type: EntryType;
  heading: string;
  created_at: string;
  is_frequent: boolean;
  needs_improvement: boolean;
  status: 'draft' | 'published';
  author: {
    id: string;
    username: string;
  } | null;
  last_modified_by: {
    id: string;
    username: string;
  } | null;
  last_modified_at: string | null;
  topics: Array<{
    topics: {
      name: string;
    };
  }>;
  support_case?: {
    problem: string;
    solution: string;
    customer_satisfaction: number;
  };
  product_knowledge?: {
    knowledge_content: string;
  };
  process?: {
    description: string;
  };
  images: Array<{
    id: string;
    file_path: string;
    created_at: string;
  }>;
}

export function ViewEntryModal({ entryId, isOpen, onClose }: ViewEntryModalProps) {
  const [entry, setEntry] = useState<EntryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && entryId) {
      fetchEntry();
    } else {
      setEntry(null);
    }
  }, [isOpen, entryId]);

  const fetchEntry = async () => {
    try {
      setIsLoading(true);
      await log(LogLevel.INFO, 'Fetching entry details', { entryId });

      // Updated with correct foreign key relationship
      const { data: entryData, error: entryError } = await supabase
          .from('entries')
          .select(`
          id,
          type,
          heading,
          created_at,
          is_frequent,
          needs_improvement,
          status,
          last_modified_at,
          author:kb_users!entries_created_by_fkey(id, username),
          last_modified_by:kb_users!entries_last_modified_by_fkey(id, username),
          topics:entry_topics(topics(name)),
          images:entry_images(id, file_path, created_at)
        `)
          .eq('id', entryId)
          .single();

      if (entryError) {
        console.error('Entry query error:', entryError);
        throw entryError;
      }

      if (!entryData) {
        console.error('No entry data found');
        throw new Error('Entry not found');
      }

      // Then fetch type-specific data
      let typeData = null;
      if (entryData.type === EntryType.SUPPORT_CASE) {
        const { data: supportCase, error: supportError } = await supabase
            .from('support_case')
            .select('*')
            .eq('id', entryId)
            .single();

        if (supportError) {
          console.error('Support case query error:', supportError);
          throw supportError;
        }
        typeData = { support_case: supportCase };
      } else if (entryData.type === EntryType.PRODUCT_KNOWLEDGE) {
        const { data: productKnowledge, error: knowledgeError } = await supabase
            .from('product_knowledge')
            .select('*')
            .eq('id', entryId)
            .single();

        if (knowledgeError) {
          console.error('Product knowledge query error:', knowledgeError);
          throw knowledgeError;
        }
        typeData = { product_knowledge: productKnowledge };
      } else if (entryData.type === EntryType.PROCESS) {
        const { data: process, error: processError } = await supabase
            .from('process')
            .select('*')
            .eq('id', entryId)
            .single();

        if (processError) {
          console.error('Process query error:', processError);
          throw processError;
        }
        typeData = { process: process };
      }

      const finalData = { ...entryData, ...typeData };
      setEntry(finalData);
      await log(LogLevel.INFO, 'Entry details fetched successfully', { entryId });
    } catch (error) {
      console.error('Error fetching entry:', error);
      await log(LogLevel.ERROR, 'Failed to fetch entry details', { entryId, error });
      toast.error('Failed to load entry');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !entry) return null;

  return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity modal-overlay" onClick={onClose} />

          <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#59140b] dark:border-[#ff8b7e] mx-auto"></div>
                </div>
            ) : (
                <div className="relative">
                  <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="pr-8">
                      <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#59140b]/10 dark:bg-[#59140b]/50 text-[#59140b] dark:text-white">
                        {(() => {
                          const typeMap: Record<string, string> = {
                            'SUPPORT_CASE': 'SUPPORT-FALL',
                            'PRODUCT_KNOWLEDGE': 'PRODUKTWISSEN',
                            'PROCESS': 'PROZESS'
                          };
                          return typeMap[entry.type];
                        })()}
                      </span>
                        {entry.status === 'draft' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            DRAFT
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-light text-gray-900 dark:text-white">{entry.heading}</h3>

                      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4"/>
                          <span>Created on {formatDate(entry.created_at)}</span>
                          <span className="mx-2">by</span>
                          <User className="w-4 h-4"/>
                          <span>{entry.author?.username || 'Unknown'}</span>
                        </div>
                      </div>

                      {entry.last_modified_at && (
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4"/>
                              <span>Modified on {formatDate(entry.last_modified_at)}</span>
                              <span className="mx-2">by</span>
                              <User className="w-4 h-4"/>
                              <span>{entry.last_modified_by?.username || 'Unknown'}</span>
                            </div>
                          </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-4">
                        {entry.topics?.map(({topics: {name}}, index) => (
                            <span
                                key={`${entry.id}-${name}-${index}`}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tag dark:bg-gray-700 dark:text-gray-300"
                            >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-[#59140b] dark:hover:text-[#ff8b7e] transition-colors"
                    >
                      <X className="w-6 h-6"/>
                    </button>
                  </div>

                  <div className="p-8">
                    {entry.type === EntryType.SUPPORT_CASE && entry.support_case && (
                        <>
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Problem</h4>
                            <div className="p-4 bg-stone-50 dark:bg-gray-700/50 rounded-lg">
                              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{entry.support_case.problem}</p>
                            </div>
                          </div>
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Solution</h4>
                            <div className="p-4 bg-stone-50 dark:bg-gray-700/50 rounded-lg">
                              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{entry.support_case.solution}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Satisfaction</h4>
                            <StarRating
                                value={entry.support_case.customer_satisfaction}
                                onChange={() => {}}
                                disabled
                            />
                          </div>
                        </>
                    )}

                    {entry.type === EntryType.PRODUCT_KNOWLEDGE && entry.product_knowledge && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</h4>
                          <div className="p-4 bg-stone-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                              {entry.product_knowledge.knowledge_content}
                            </p>
                          </div>
                        </div>
                    )}

                    {entry.type === EntryType.PROCESS && entry.process && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                          <div className="p-4 bg-stone-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{entry.process.description}</p>
                          </div>
                        </div>
                    )}
                  </div>
                  {entry.images && entry.images.length > 0 && (
                      <ViewImages images={entry.images} entryId={entry.id} />
                  )}
                </div>

            )}
          </div>
        </div>
      </div>
  );
}