import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Check, ChevronDown, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Topic } from '../types';
import { log, LogLevel } from '../lib/logger';
import toast from 'react-hot-toast';

interface TopicMultiSelectProps {
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
}

export function TopicMultiSelect({ selectedTopics, onChange }: TopicMultiSelectProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTopics();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = topics.filter(topic => 
      topic.name.toLowerCase().includes(query)
    );
    setFilteredTopics(filtered);
  }, [searchQuery, topics]);

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const fetchTopics = async () => {
    try {
      await log(LogLevel.INFO, 'Fetching topics');
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const capitalizedTopics = (data || []).map(topic => ({
        ...topic,
        name: capitalizeFirstLetter(topic.name)
      }));
      
      setTopics(capitalizedTopics);
      setFilteredTopics(capitalizedTopics);
      await log(LogLevel.INFO, 'Topics fetched successfully', { count: capitalizedTopics.length });
    } catch (error) {
      console.error('Error fetching topics:', error);
      await log(LogLevel.ERROR, 'Failed to fetch topics', { error });
      toast.error('Failed to load topics');
    }
  };

  const handleAddNewTopic = async () => {
    const newTopicName = capitalizeFirstLetter(searchQuery.trim());
    
    if (!newTopicName) {
      toast.error('Topic cannot be empty');
      return;
    }

    // Check if topic already exists (case-insensitive)
    if (topics.some(t => t.name.toLowerCase() === newTopicName.toLowerCase())) {
      toast.error('Topic already exists');
      return;
    }

    try {
      await log(LogLevel.INFO, 'Creating new topic', { name: newTopicName });
      const { data, error } = await supabase
        .from('topics')
        .insert([{ name: newTopicName }])
        .select()
        .single();

      if (error) throw error;

      const newTopic = { ...data, name: capitalizeFirstLetter(data.name) };
      setTopics(prev => [...prev, newTopic]);
      onChange([...selectedTopics, newTopic.name]);
      setSearchQuery('');
      await log(LogLevel.INFO, 'Topic created successfully', { name: newTopic.name });
      toast.success('New topic added');
    } catch (error) {
      console.error('Error adding topic:', error);
      await log(LogLevel.ERROR, 'Failed to create topic', { error });
      toast.error('Failed to add topic');
    }
  };

  const toggleTopic = (topicName: string) => {
    const newSelection = selectedTopics.includes(topicName)
      ? selectedTopics.filter(t => t !== topicName)
      : [...selectedTopics, topicName];
    onChange(newSelection);
  };

  const exactMatchExists = searchQuery.trim() !== '' && 
    topics.some(t => t.name.toLowerCase() === searchQuery.trim().toLowerCase());

  return (
      <div className="relative" ref={containerRef}>
        <div className="mt-1">
          <div
              className="relative w-full cursor-pointer border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              onClick={() => {
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
          >
            <div className="min-h-[2.75rem] flex flex-wrap gap-1.5 p-2">
              {selectedTopics.length > 0 ? (
                  selectedTopics.map(topic => (
                      <span
                          key={topic}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-[#59140b]/10 text-[#59140b] dark:bg-[#59140b]/50 dark:text-white"
                      >
                  {topic}
                        <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTopic(topic);
                            }}
                            className="ml-1.5 inline-flex items-center justify-center rounded-full text-[#59140b]/70 hover:text-[#59140b] dark:text-white/70 dark:hover:text-white focus:outline-none"
                        >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
                  ))
              ) : (
                  <span className="text-gray-500 dark:text-gray-400">Select or create topics</span>
              )}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>

        {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="sticky top-0 bg-white dark:bg-gray-800 px-3 py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm input-focus"
                      placeholder="Search or create topic..."
                      onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-auto">
                {filteredTopics.length > 0 && (
                    <div className="py-1">
                      {filteredTopics.map((topic) => (
                          <button
                              key={topic.id}
                              type="button"
                              onClick={() => toggleTopic(topic.name)}
                              className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-stone-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                    <span className={selectedTopics.includes(topic.name)
                        ? 'text-[#59140b] dark:text-[#ff8b7e] font-medium'
                        : 'text-gray-900 dark:text-white'}>
                      {topic.name}
                    </span>
                            {selectedTopics.includes(topic.name) && (
                                <Check className="h-4 w-4 text-[#59140b] dark:text-[#ff8b7e]" />
                            )}
                          </button>
                      ))}
                    </div>
                )}

                {searchQuery.trim() !== '' && !exactMatchExists && (
                    <>
                      <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleAddNewTopic}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#59140b] dark:text-[#ff8b7e] hover:bg-[#59140b]/5 dark:hover:bg-[#59140b]/20 rounded-md transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Create "{capitalizeFirstLetter(searchQuery.trim())}"
                        </button>
                      </div>
                    </>
                )}

                {filteredTopics.length === 0 && searchQuery.trim() === '' && (
                    <div className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400">
                      Start typing to search or create a topic
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
}