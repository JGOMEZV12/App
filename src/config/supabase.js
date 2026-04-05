import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wejjyxcqalaqbxgrwnls.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlamp5eGNxYWxhcWJ4Z3J3bmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTgyNDEsImV4cCI6MjA5MDk3NDI0MX0.MPdkSzeatJJ9YoCN2PO4t36BhV0AdCNWegvGquu9oP0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
