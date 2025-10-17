import { createClient } from '@supabase/supabase-js'

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Fetch all receipts from Supabase ordered by created_at descending
 * @returns {Promise<Array>} Array of receipt objects
 */
export async function getReceipts() {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch receipts: ${error.message}`)
  }
  
  return data
}

/**
 * Add a new receipt to Supabase
 * @param {Object} receiptData - The receipt data to insert
 * @returns {Promise<Object>} The inserted receipt
 */
export async function addReceipt(receiptData) {
  const { data, error } = await supabase
    .from('receipts')
    .insert([receiptData])
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to add receipt: ${error.message}`)
  }
  
  return data
}