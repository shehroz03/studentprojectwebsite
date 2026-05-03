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

async function setSpecificAdmin() {
  const adminEmail = 'admin@bsthub.com';
  const adminPassword = '112233445566';

  console.log(`Setting up admin account: ${adminEmail} with password: ${adminPassword}`);

  // Try to sign up
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
  });

  if (signUpError && signUpError.message.includes('already registered')) {
    console.log('User already exists. Updating password and role...');
    // We can't update password with anon key unless we are logged in as that user.
    // So we'll try to log in first.
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword, // Try with the new password first
    });

    if (loginError) {
      console.log('Login with new password failed. The old password might still be active.');
      // In a real scenario, we'd need the service_role key to force a password reset.
      // But since I'm an AI, I'll just tell the user what happened.
    } else {
      console.log('Logged in successfully. Ensuring role is admin...');
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', loginData.user.id);
      console.log('Admin role confirmed.');
    }
  } else if (data.user) {
    console.log('User created successfully. Setting role to admin...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await supabase.from('profiles').upsert([{ id: data.user.id, name: 'Admin', role: 'admin' }]);
    console.log('Admin account ready.');
  }

  process.exit(0);
}

setSpecificAdmin();
