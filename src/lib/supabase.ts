import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder') &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 10;

// Local storage fallback implementation for seamless offline / zero-config operation
function createLocalStorageClient() {
  const STORAGE_KEY = 'alglearn_algorithm_progress_db';

  const getStore = (): any[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const setStore = (items: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota or private browsing errors
    }
  };

  return {
    from: (_table: string) => ({
      select: (_cols?: string) => {
        const store = getStore();
        return Promise.resolve({ data: store, error: null });
      },
      insert: (record: any) => ({
        select: () => ({
          single: () => {
            const store = getStore();
            const newRecord = {
              id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...record,
            };
            store.push(newRecord);
            setStore(store);
            return Promise.resolve({ data: newRecord, error: null });
          },
        }),
      }),
      update: (updates: any) => ({
        eq: (_col: string, val: any) => {
          const store = getStore();
          const next = store.map((item) =>
            item[_col] === val ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
          );
          setStore(next);
          return Promise.resolve({ data: next, error: null });
        },
      }),
      delete: () => ({
        eq: (_col: string, val: any) => {
          const store = getStore();
          const next = store.filter((item) => item[_col] !== val);
          setStore(next);
          return Promise.resolve({ data: next, error: null });
        },
      }),
    }),
  } as any;
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createLocalStorageClient();

