import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Improvement {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

interface ImprovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEntry: (improvement: Improvement) => void;
}

export function ImprovementsModal({ isOpen, onClose, onCreateEntry }: ImprovementsModalProps) {
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchImprovements();
    } else {
      setImprovements([]);
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen]);

  const fetchImprovements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('improvements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImprovements(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load improvements';
      console.error('Error fetching improvements:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async (improvement: Improvement) => {
    try {
      // Delete the improvement first
      const { error: deleteError } = await supabase
        .from('improvements')
        .delete()
        .eq('id', improvement.id);

      if (deleteError) throw deleteError;

      // Remove the improvement from local state
      setImprovements(prev => prev.filter(imp => imp.id !== improvement.id));

      // Call the parent handler to create the entry
      onCreateEntry(improvement);
      toast.success('Improvement converted to entry');
    } catch (error) {
      console.error('Error converting improvement:', error);
      toast.error('Failed to convert improvement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this improvement?')) {
      return;
    }

    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('improvements')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setImprovements(prev => prev.filter(imp => imp.id !== id));
      toast.success('Improvement deleted successfully');
    } catch (error) {
      console.error('Error deleting improvement:', error);
      toast.error('Failed to delete improvement');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity modal-overlay" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Suggested Improvements</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#59140b]" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            ) : improvements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No improvements available
              </div>
            ) : (
              <div className="space-y-6">
                {improvements.map((improvement) => (
                  <div
                    key={improvement.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:border-[#59140b]/20 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                          {improvement.question}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Added on {formatDate(improvement.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(improvement.id)}
                          disabled={deletingId === improvement.id}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === improvement.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete
                        </button>
                        <button
                          onClick={() => handleCreateEntry(improvement)}
                          disabled={deletingId === improvement.id}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                          Convert to Entry
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {improvement.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}