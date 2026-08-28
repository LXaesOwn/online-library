import { createClient, SupabaseClient } from '@supabase/supabase-js';
import env from './env';
import { DATABASE } from './constants';
import './dns'; 

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔗 Connecting to Supabase:', supabaseUrl);
console.log('🔑 Using service role key');

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

(async () => {
  try {
    const { error } = await supabase
      .from(DATABASE.TABLES.USERS)
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('   Please check your credentials and that the table "users" exists.');
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
  }
})();
