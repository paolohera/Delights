import { supabase } from '../supabase.js';

/**
 * Extract file path from Supabase Storage URL
 */
export const extractFilePathFromUrl = (url) => {
  if (!url || !url.includes('storage/v1/object/public/product-images/')) {
    return null;
  }
  
  try {
    const urlParts = url.split('product-images/');
    return urlParts[1] || null;
  } catch (error) {
    console.error('Error extracting file path:', error);
    return null;
  }
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImageFromStorage = async (imageUrl) => {
  try {
    const filePath = extractFilePathFromUrl(imageUrl);
    
    if (!filePath) {
      console.log('Not a Supabase storage URL or no file path found');
      return { success: false, message: 'Invalid image URL' };
    }
    
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);
    
    if (error) throw error;
    
    return { success: true, message: 'Image deleted from storage' };
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get public URL for product image
 */
export const getProductImageUrl = (path) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
};