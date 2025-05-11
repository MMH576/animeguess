import supabase from '@/lib/supabaseClient';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/storage/avatar - Upload a new avatar
export async function POST(request: NextRequest) {
  const auth = getAuth(request);
  
  // Check if user is authenticated
  if (!auth.userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      );
    }
    
    // Check file type (only allow specific image formats)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      );
    }
    
    // Check file size (limit to 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds the 2MB limit' },
        { status: 400 }
      );
    }
    
    // Convert file to arrayBuffer for upload
    const buffer = await file.arrayBuffer();
    
    // Create a safe file path for the user's avatar
    const fileExtension = file.type.split('/')[1];
    const safeExtension = fileExtension === 'jpeg' ? 'jpg' : 
                        (allowedTypes.includes(`image/${fileExtension}`) ? fileExtension : 'jpg');
    const filePath = `${auth.userId}/avatar.${safeExtension}`;
    
    // Upload file to Supabase Storage
    const { error } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true // Overwrite if exists
      });
      
    if (error) throw error;
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    // Update user profile with avatar URL
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: auth.userId,
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      });
      
    if (profileError) throw profileError;
    
    return NextResponse.json({
      success: true,
      avatarUrl: urlData.publicUrl
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

// GET /api/storage/avatar - Get user's avatar URL
export async function GET(request: NextRequest) {
  const auth = getAuth(request);
  
  // Check if user is authenticated
  if (!auth.userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Get user profile with avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', auth.userId)
      .single();
      
    if (error) {
      // If no profile exists yet, return empty avatar
      if (error.code === 'PGRST116') {
        return NextResponse.json({ avatarUrl: null });
      }
      throw error;
    }
    
    return NextResponse.json({
      avatarUrl: data?.avatar_url || null
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatar' },
      { status: 500 }
    );
  }
} 