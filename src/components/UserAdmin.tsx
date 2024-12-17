import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Trash2, Check, X, Shield, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export function UserAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user' as const,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('kb_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.rpc('create_user', {
        p_username: newUser.username,
        p_password: newUser.password,
        p_role: newUser.role
      });

      if (error) throw error;

      toast.success('User created successfully');
      setNewUser({ username: '', password: '', role: 'user' });
      setShowCreateForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('kb_users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user ${username}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Call the delete_user RPC function instead of directly deleting
      const { error } = await supabase.rpc('delete_user', {
        p_user_id: userId
      });

      if (error) throw error;

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-light text-gray-900 dark:text-white">Benutzernamen</h2>
          <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            Benutzer erstellen
          </button>
        </div>

        {showCreateForm && (
            <form onSubmit={handleCreateUser} className="mb-8 bg-stone-50 dark:bg-gray-700/50 rounded-lg p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Benutzername
                  </label>
                  <input
                      type="text"
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white input-focus"
                      required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Passwort
                  </label>
                  <input
                      type="password"
                      id="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white input-focus"
                      required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Rolle</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                        type="radio"
                        value="user"
                        checked={newUser.role === 'user'}
                        onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                        className="form-radio text-[#59140b] focus:ring-[#59140b]"
                    />
                    <span className="ml-2 dark:text-gray-200">User</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                        type="radio"
                        value="admin"
                        checked={newUser.role === 'admin'}
                        onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                        className="form-radio text-[#59140b] focus:ring-[#59140b]"
                    />
                    <span className="ml-2 dark:text-gray-200">Admin</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-sm font-medium btn-secondary rounded-lg"
                >
                  Abbrechen
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium btn-primary rounded-lg disabled:opacity-50"
                >
                  Benutzer erstellen
                </button>
              </div>
            </form>
        )}

        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Benutzername</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Rolle</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Erstellt</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Letzte Anmeldung</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-200">Aktionen</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-3 py-4 text-sm dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' ? (
                              <Shield className="w-4 h-4 text-[#59140b]" />
                          ) : (
                              <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          )}
                          {user.username}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-[#59140b]/10 text-[#59140b] dark:bg-[#59140b]/20 dark:text-[#ff8b7e]' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.is_active ? (
                            <>
                              <Check className="w-3 h-3" />
                              Active
                            </>
                        ) : (
                            <>
                              <X className="w-3 h-3" />
                              Inactive
                            </>
                        )}
                      </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.last_login)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                              title="Delete user"
                          >
                            <Trash2 className="w-5 h-5"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}