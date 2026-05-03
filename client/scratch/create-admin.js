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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  console.log('Creating Admin Account...');
  
  const adminEmail = 'admin@bsthub.com';
  const adminPassword = 'AdminPassword123';

  // 1. Sign up the admin
  const { data, error: authError } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log('Admin user already exists in Auth. We will try to log in to get the ID.');
        const { data: loginData } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
        });
        if (loginData.user) {
             console.log('Updating existing user to admin role...');
             await supabase.from('profiles').update({ role: 'admin' }).eq('id', loginData.user.id);
             console.log('Done! User role set to admin.');
        } else {
             console.log('Failed to login existing admin user. Is the password correct?');
        }
        process.exit(0);
    } else {
        console.error('Registration failed:', authError.message);
        process.exit(1);
    }
  }

  if (data.user) {
    // 2. Set role to admin in profiles
    // Wait a second for the trigger/initial insert (if any) to happen
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // We try to update. If it doesn't exist yet, we insert.
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{ id: data.user.id, name: 'Super Admin', role: 'admin' }]);
        
    if (profileError) {
        console.error('Failed to set admin role:', profileError.message);
    } else {
        console.log('SUCCESS!');
        console.log('-----------------------------------');
        console.log(`Admin Email: ${adminEmail}`);
        console.log(`Admin Password: ${adminPassword}`);
        console.log('-----------------------------------');
        console.log('You can now log in with these credentials on the website.');
    }
  }

  process.exit(0);
}

createAdmin();
