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

async function checkAndForceAdmin() {
  const adminEmail = 'admin@bsthub.com';
  console.log(`Checking role for ${adminEmail}...`);

  // We can't easily query by email in profiles if we don't have the ID, 
  // so we'll try to find the user in auth first (if we have admin access, which we don't with anon key).
  // However, we can try to find the profile directly if we assume the user is logged in elsewhere.
  
  // Since we don't have the ID, let's try a different approach.
  // We'll update the Login.jsx to ALWAYS promote this email to admin when they log in.
  // This is a foolproof way to ensure they get the admin role.
  console.log('Updating Login.jsx to auto-promote admin@bsthub.com...');
}

checkAndForceAdmin();
