import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.error('Connection failed:', error.message);
      if (error.message.includes('relation "public.profiles" does not exist')) {
          console.error('ERROR: The "profiles" table has not been created yet. Please run the SQL setup script.');
      }
    } else {
      console.log('Connection successful!');
      console.log('Profiles table exists and is accessible.');
    }

    const { error: ordersError } = await supabase.from('orders').select('*').limit(1);
    if (ordersError) {
      console.error('Orders table check failed:', ordersError.message);
    } else {
      console.log('Orders table exists and is accessible.');
    }
  } catch (err) {
    console.error('An unexpected error occurred:', err.message);
  }

  process.exit(0);
}

testConnection();
