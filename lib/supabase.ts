import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://xccmoaettfzghquxwrfl.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_wLvASPsa8DN5MJrf79WcOQ__sKCVDkd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});