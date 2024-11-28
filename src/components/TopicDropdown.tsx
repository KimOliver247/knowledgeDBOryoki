import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface TopicDropdownProps {
  value: string;
  onChange: (topic: string) => void;
}

export function TopicDropdown({ value, onChange }: TopicDropdownProps) {
  const [topics, setTopics] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('topic')
        .order('topic');

      if (error) throw error;

      const uniqueTopics = Array.from(new Set(data.map(item => item.topic)));
      setTopics(uniqueTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
    }
  };

  const handleAddNewTopic = async () => {
    if (!newTopic.trim()) {
      toast.error('Topic cannot be empty');
      return;
    }

    if (topics.includes(newTopic.trim())) {
      toast.error('Topic already exists');
      return;
    }

    setTopics([...topics, newTopic.trim()]);
    onChange(newTopic.trim());
    setNewTopic('');
    setIsAddingNew(false);
    setIsOpen(false);
    toast.success('New topic added');
  };

  return (
    <div className="relative">
      <div
        className="mt-1 relative rounded-lg border border-gray-300 shadow-sm"
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-white pl-4 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
        >
          <span className="block truncate">{value || 'Select Topic'}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <div className="sticky top-0 bg-white px-2 py-1.5">
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
              >
                <Plus className="h-4 w-4" />
                Add New Topic
              </button>
              {isAddingNew && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter new topic"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewTopic}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
              )}
              <div className="border-t my-2"></div>
            </div>
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  onChange(topic);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  value === topic ? 'bg-indigo-50 text-indigo-600' : 'text-gray-900'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}