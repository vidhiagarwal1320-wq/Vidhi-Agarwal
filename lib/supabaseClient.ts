
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzfjkqleomwsxqvfbgge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6ZmprcWxlb213c3hxdmZiZ2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjQzNjgsImV4cCI6MjA3OTc0MDM2OH0.aq8dvDBdFHAeZ_auXSbQo9Co-wgyRxRLoFA-sNONHgM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
