import { supabase } from './supabase';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  details?: any;
  timestamp: string;
}

export async function log(level: LogLevel, message: string, details?: any) {
  const logEntry: LogEntry = {
    level,
    message,
    details: details ? JSON.stringify(details) : null,
    timestamp: new Date().toISOString()
  };

  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('system_logs')
      .insert([{
        level: logEntry.level,
        message: logEntry.message,
        details: logEntry.details ? JSON.parse(logEntry.details) : null,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      }]);

    if (error) {
      // Log to console if database logging fails
      console.error('Failed to write log:', error);
      console.log(`[${level}] ${message}`, details || '');
      return;
    }

    // Additional console logging in development
    if (import.meta.env.DEV) {
      console.log(`[${level}] ${message}`, details || '');
    }
  } catch (error) {
    // Fallback to console logging
    console.error('Logging failed:', error);
    console.log(`[${level}] ${message}`, details || '');
  }
}