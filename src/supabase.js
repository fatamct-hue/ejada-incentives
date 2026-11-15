import { createClient } from '@supabase/supabase-js'
import { mockSb } from './mock'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const demo = import.meta.env.VITE_DEMO === '1'
export const configured = demo || Boolean(url && key)
export const sb = demo ? mockSb : configured ? createClient(url, key) : null
