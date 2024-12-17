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
    const timestamp = new Date().toISOString();

    await log(LogLevel.INFO, 'Attempting last login update', {
      username,
      timestamp,
    });

    // First, let's verify the user exists
    const { data: user, error: selectError } = await supabase
        .from('kb_users')
        .select('username')
        .eq('username', username)
        .single();

    if (selectError || !user) {
      await log(LogLevel.ERROR, 'User not found for last login update', {
        username,
        error: selectError?.message
      });
      throw new Error('User not found');
    }

    // Now perform the update
    const { error: updateError } = await supabase
        .from('kb_users')
        .update({ last_login: timestamp })
        .eq('username', username);

    if (updateError) {
      await log(LogLevel.ERROR, 'Failed to update last login', {
        username,
        error: updateError.message,
        code: updateError.code,
        details: updateError.details
      });
      throw updateError;
    }

    await log(LogLevel.INFO, 'Last login updated successfully', {
      username,
      timestamp
    });

  } catch (error) {
    await log(LogLevel.ERROR, 'Exception updating last login', {
      username,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function verifyLastLogin(username: string): Promise<void> {
  const { data, error } = await supabase
      .from('kb_users')
      .select('last_login')
      .eq('username', username)
      .single();

  await log(LogLevel.INFO, 'Verify last login value', {
    username,
    lastLogin: data?.last_login,
    error: error?.message
  });
}

export async function getCurrentUser(): Promise<{ id: string } | null> {
  try {
    const currentUsername = localStorage.getItem('currentUser');

    if (!currentUsername) {
      return null;
    }

    const { data, error } = await supabase
        .from('kb_users')
        .select('id, username')
        .eq('username', currentUsername)
        .single();

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