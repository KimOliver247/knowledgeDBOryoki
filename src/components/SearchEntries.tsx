import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Edit, Loader2, X, AlertTriangle, BarChart2, Save, User, Trash2, RotateCcw  } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EntryType, Topic } from '../types';
import { EditEntryModal } from './EditEntryModal';
import { ViewEntryModal } from './ViewEntryModal';
import toast from 'react-hot-toast';
import { Clock } from 'lucide-react';

interface Entry {
  id: string;
  type: EntryType;
  heading: string;
  created_at: string;
  last_modified_at: string | null;
  is_frequent: boolean;
  needs_improvement: boolean;
  status: 'draft' | 'published';
  author: {
    username: string;
  };
  topics: Array<{
    topics: {
      name: string;
    };
  }>;
}

const ENTRY_TYPES = [
  { id: EntryType.SUPPORT_CASE, label: 'Support Anfrage' },
  { id: EntryType.PRODUCT_KNOWLEDGE, label: 'Produktwissen' },
  { id: EntryType.PROCESS, label: 'Prozess' }
];

export function SearchEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<EntryType | null>(null);
  const [showDraftsOnly, setShowDraftsOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [viewingEntryId, setViewingEntryId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{ id: string, username: string }>>([]);
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTopics([]);
    setSelectedType(null);
    setShowDraftsOnly(false);
    setSelectedUser(null);
  };
  useEffect(() => {
    fetchEntries();
    fetchTopics();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
          .from('kb_users')
          .select('id, username')
          .order('username');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleDelete = async (entryId: string, entryType: EntryType) => {
    try {
      // Delete from type-specific table first
      const { error: specificError } = await supabase
          .from(entryType)
          .delete()
          .eq('id', entryId);

      if (specificError) {
        console.error('Error deleting from specific table:', specificError);
        throw specificError;
      }

      // Delete related topics
      const { error: topicsError } = await supabase
          .from('entry_topics')
          .delete()
          .eq('entry_id', entryId);

      if (topicsError) {
        console.error('Error deleting related topics:', topicsError);
        throw topicsError;
      }

      // Finally delete the main entry
      const { error: entryError } = await supabase
          .from('entries')
          .delete()
          .eq('id', entryId);

      if (entryError) {
        console.error('Error deleting main entry:', entryError);
        throw entryError;
      }

      toast.success('Entry deleted successfully');
      fetchEntries(); // Refresh the list
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const availableTopics = useMemo(() => {
    const relevantEntries = selectedType
        ? entries.filter(entry => entry.type === selectedType)
        : entries;

    const topicSet = new Set<string>();
    relevantEntries.forEach(entry => {
      entry.topics.forEach(({ topics: { name } }) => topicSet.add(name));
    });

    return topics.filter(topic => topicSet.has(topic.name));
  }, [entries, selectedType, topics]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch = entry.heading.toLowerCase().includes(searchTerm) ||
          entry.topics.some(({ topics: { name } }) => name.toLowerCase().includes(searchTerm));
      const matchesTopics = selectedTopics.length === 0 ||
          selectedTopics.some(selectedTopic =>
              entry.topics.some(t => t.topics.name === selectedTopic)
          );
      const matchesType = !selectedType || entry.type === selectedType;
      const matchesDraftFilter = !showDraftsOnly || entry.status === 'draft';

      // Add user filter
      const matchesUser = !selectedUser ||
          entry.author?.id === selectedUser ||
          entry.last_modified_by?.id === selectedUser;

      return matchesSearch && matchesTopics && matchesType && matchesDraftFilter && matchesUser;
    });
  }, [entries, searchQuery, selectedTopics, selectedType, showDraftsOnly, selectedUser]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
          .from('entries')
          .select(`
        id,
        type,
        heading,
        created_at,
        last_modified_at,
        is_frequent,
        needs_improvement,
        status,
        author:kb_users!entries_created_by_fkey(id, username),
        topics:entry_topics(topics(name))
      `)
          .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
          .from('topics')
          .select('*')
          .order('name');

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
    }
  };

  const toggleTopic = (topicName: string) => {
    setSelectedTopics(prev =>
        prev.includes(topicName)
            ? prev.filter(t => t !== topicName)
            : [...prev, topicName]
    );
  };

  const toggleType = (type: EntryType) => {
    setSelectedType(prev => prev === type ? null : type);
  };

  const getEntryTypeIcon = (type: EntryType) => {
    switch (type) {
      case EntryType.SUPPORT_CASE:
        return 'bg-[#59140b]/10 text-[#59140b]';
      case EntryType.PRODUCT_KNOWLEDGE:
        return 'bg-[#59140b]/10 text-[#59140b]';
      case EntryType.PROCESS:
        return 'bg-[#59140b]/10 text-[#59140b]';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#59140b]" />
        </div>
    );
  }

  return (
      <>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="space-y-6">
            {/* First row with justified content */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              {/* Left side filters wrapped in a div */}
              <div className="flex flex-wrap items-center gap-2">
                {ENTRY_TYPES.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => toggleType(type.id)}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                            selectedType === type.id
                                ? 'bg-[#59140b] text-white border-[#59140b]'
                                : 'border-gray-200 dark:border-gray-600 hover:border-[#59140b] text-gray-600 dark:text-gray-300 hover:text-[#59140b] dark:hover:text-[#ff8b7e]'
                        }`}
                    >
                      <span>{type.label}</span>
                      {selectedType === type.id && (
                          <X className="w-4 h-4 opacity-50 group-hover:opacity-100"/>
                      )}
                    </button>
                ))}

                <button
                    onClick={() => setShowDraftsOnly(!showDraftsOnly)}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                        showDraftsOnly
                            ? 'bg-[#59140b] text-white border-[#59140b]'
                            : 'border-gray-200 dark:border-gray-600 hover:border-[#59140b] text-gray-600 dark:text-gray-300 hover:text-[#59140b] dark:hover:text-[#ff8b7e]'
                    }`}
                >
                  <Save className="w-4 h-4"/>
                  <span>Nur Entwürfe</span>
                  {showDraftsOnly && (
                      <X className="w-4 h-4 opacity-50 group-hover:opacity-100"/>
                  )}
                </button>
                <button
                    onClick={resetFilters}
                    className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[#59140b] text-gray-600 dark:text-gray-300 hover:text-[#59140b] dark:hover:text-[#ff8b7e] transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4"/>
                  <span>Filter zurücksetzen</span>
                </button>
              </div>

              {/* Right-aligned user dropdown */}
              <select
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value || null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59140b]/20 transition-colors"
              >
                <option value="">Alle Benutzer</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {availableTopics.map((topic) => (
                  <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.name)}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                          selectedTopics.includes(topic.name)
                              ? 'bg-[#59140b] text-white border-[#59140b]'
                              : 'border-gray-200 dark:border-gray-600 hover:border-[#59140b] text-gray-600 dark:text-gray-300 hover:text-[#59140b] dark:hover:text-[#ff8b7e]'
                      }`}
                  >
                    <span>{topic.name}</span>
                    {selectedTopics.includes(topic.name) && (
                        <X className="w-4 h-4 opacity-50 group-hover:opacity-100"/>
                    )}
                  </button>
              ))}
              {availableTopics.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Keine Themen verfügbar für die ausgewählten Filter</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500"/>
              </div>
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg input-focus transition-colors"
                  placeholder="Suche nach Titel oder Thema..."
              />
            </div>
          </div>

          <div className="flow-root mt-8">
            <ul role="list" className="-my-6 divide-y divide-gray-100 dark:divide-gray-700">
              {filteredEntries.map((entry) => (
                  <li key={entry.id} className="py-6 group -mx-8 px-8 relative">
                    {/* Clickable container for view */}
                    <button
                        onClick={() => setViewingEntryId(entry.id)}
                        className="absolute inset-0 w-full h-full cursor-pointer z-10"
                    >
                      <div
                          className="absolute top-2 right-[35%] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Eye className="w-4 h-4"/>
                          <span className="text-sm">Klicken um zu öffnen</span>
                        </div>
                      </div>
                    </button>

                    {/* Edit and Delete buttons overlay */}
                    <div
                        className="absolute right-8 top-0 h-full w-[30%] opacity-0 group-hover:opacity-80 flex transition-opacity duration-200 z-20">
                      <button
                          onClick={() => setEditingEntryId(entry.id)}
                          className="h-full flex items-center justify-center flex-1 bg-blue-500/70 hover:bg-blue-500/80 text-white font-medium transition-all duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <Edit className="w-5 h-5"/>
                          <span>Edit</span>
                        </div>
                      </button>

                      <button
                          onClick={() => {
                            if (confirm('Sind Sie sicher, dass Sie diese Eintrag löschen möchten?')) {
                              handleDelete(entry.id, entry.type);
                            }
                          }}
                          className="h-full flex items-center justify-center flex-1 bg-red-500/70 hover:bg-red-500/80 text-white font-medium transition-all duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <Trash2 className="w-5 h-5"/>
                          <span>Delete</span>
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
              <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#59140b]/10 dark:bg-[#59140b]/50 text-[#59140b] dark:text-white">
  {(() => {
    switch (entry.type) {
      case EntryType.SUPPORT_CASE:
        return 'SUPPORT-FALL';
      case EntryType.PRODUCT_KNOWLEDGE:
        return 'PRODUKTWISSEN';
      case EntryType.PROCESS:
        return 'PROZESS';
      default:
        return entry.type;
    }
  })()}
</span>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400"/>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Erstellt: {formatDate(entry.created_at)}
                              {entry.last_modified_at && (
                                  <span className="ml-2">• Geändert: {formatDate(entry.last_modified_at)}</span>
                              )}
                            </p>
                          </div>
                          {entry.status === 'draft' && (
                              <span
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Save className="w-3 h-3"/>
            Entwurf
          </span>
                          )}
                          {entry.is_frequent && (
                              <span
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            <BarChart2 className="w-3 h-3"/>
            Häufig
          </span>
                          )}
                          {entry.needs_improvement && (
                              <span
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3"/>
            Verbesserung erforderlich
          </span>
                          )}
                          <span
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          <User className="w-3 h-3"/>
                            {entry.author?.username || 'Unknown'}
        </span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mt-2">{entry.heading}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {entry.topics.map(({topics: {name}}, index) => (
                              <span
                                  key={`${entry.id}-${name}-${index}`}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tag dark:bg-gray-700 dark:text-gray-300"
                              >
            {name}
          </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
              ))}
              {filteredEntries.length === 0 && (
                  <li className="py-12">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      {entries.length === 0 ? (
                          <p>Keine Einträge gefunden. Erstellen Sie einen neuen Eintrag.</p>
                      ) : (
                          <p>Keine Einträge passen zu Ihren Suchkriterien.</p>
                      )}
                    </div>
                  </li>
              )}
            </ul>
          </div>
        </div>

        <EditEntryModal
            entryId={editingEntryId || ''}
            isOpen={!!editingEntryId}
            onClose={() => setEditingEntryId(null)}
            onUpdate={fetchEntries}
        />

        <ViewEntryModal
            entryId={viewingEntryId || ''}
            isOpen={!!viewingEntryId}
            onClose={() => setViewingEntryId(null)}
        />
      </>
  );
}