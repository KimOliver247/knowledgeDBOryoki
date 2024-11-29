import { supabase } from './supabase';
import { log, LogLevel } from './logger';

interface AuthResult {
  authenticated: boolean;
  is_admin: boolean;
}

export async function authenticateUser(username: string, password: string): Promise<AuthResult> {
  try {
    await log(LogLevel.INFO, 'Authentication attempt', { username });

    const { data, error } = await supabase.rpc('authenticate_user', {
      p_username: username,
      p_password: password
    });

    if (error) {
      await log(LogLevel.ERROR, 'Authentication error', {
        username,
        error: error.message,
        code: error.code,
        details: error.details
      });
      throw error;
    }

    if (!data || !data[0]) {
      await log(LogLevel.WARN, 'Authentication failed - no data returned', { username });
      return { authenticated: false, is_admin: false };
    }

    const result = data[0];
    await log(LogLevel.INFO, 'Authentication result', {
      username,
      authenticated: result.authenticated,
      is_admin: result.is_admin
    });

    return result;
  } catch (error) {
    await log(LogLevel.ERROR, 'Authentication exception', {
      username,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function updateLastLogin(username: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('kb_users')
      .update({ last_login: new Date().toISOString() })
      .eq('username', username);

    if (error) {
      await log(LogLevel.ERROR, 'Failed to update last login', {
        username,
        error: error.message
      });
      throw error;
    }

    await log(LogLevel.INFO, 'Updated last login', { username });
  } catch (error) {
    await log(LogLevel.ERROR, 'Exception updating last login', {
      username,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function getCurrentUser(): Promise<{ id: string } | null> {
  try {
    const currentUsername = localStorage.getItem('currentUser');
    console.log('Current username from storage:', currentUsername); // Add this debug line

    if (!currentUsername) {
      console.log('No username found in storage');
      return null;
    }

    const { data, error } = await supabase
        .from('kb_users')
        .select('id, username')
        .eq('username', currentUsername)
        .single();

    console.log('User data from db:', data); // Add this debug line

    if (error) {
      console.error('Error fetching current user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching current user:', error);
    return null;
  }
}