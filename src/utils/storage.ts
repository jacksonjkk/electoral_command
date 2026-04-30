import { supabase } from '@/services/supabase';

/**
 * Resolves a candidate image URL from either a full URL or a storage path.
 * Handles various prefixes and ensures the returned URL is valid.
 */
export const resolveCandidateImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;

  // Remove potential surrounding quotes and trim whitespace
  let trimmed = imageUrl.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;

  // 1. If it's already a full HTTP(S) URL, return it with a cache buster
  if (/^https?:\/\//i.test(trimmed)) {
    // If it's our own Supabase URL, we might want to re-construct it to be safe
    const storageMatch = trimmed.match(/\/storage\/v1\/object\/(?:public|authenticated)\/elections\/(.+)$/i);
    if (storageMatch) {
      return constructPublicUrl(storageMatch[1]);
    }
    return `${trimmed}${trimmed.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }

  // 2. If it's a relative path, resolve it
  return constructPublicUrl(trimmed);
};

/**
 * Manually construct the Supabase public URL for an object in the 'elections' bucket.
 * This is more reliable than getPublicUrl in some environments.
 */
function constructPublicUrl(path: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
  
  if (!supabaseUrl) return '';

  // Clean the path
  let cleanPath = path.replace(/^\/+/, ''); // Remove leading slashes
  
  // List of prefixes to strip
  const prefixes = [
    'public/elections/',
    'elections/public/',
    'public/',
    'elections/',
    'storage/v1/object/public/elections/',
    'storage/v1/object/authenticated/elections/'
  ];

  for (const prefix of prefixes) {
    if (cleanPath.toLowerCase().startsWith(prefix.toLowerCase())) {
      cleanPath = cleanPath.substring(prefix.length);
      cleanPath = cleanPath.replace(/^\/+/, ''); 
      break; 
    }
  }

  // Final double-slash cleanup
  cleanPath = cleanPath.replace(/\/+/g, '/');

  return `${supabaseUrl}/storage/v1/object/public/elections/${cleanPath}?t=${Date.now()}`;
}



