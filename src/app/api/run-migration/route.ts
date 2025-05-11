import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient';

// This endpoint is for running migrations
// GET /api/run-migration
export async function GET() {
  try {
    // Get server-side Supabase client
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    // First, check if the column already exists to avoid errors
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'scores')
      .eq('column_name', 'username');

    if (checkError) {
      console.error('Error checking column existence:', checkError);
      return NextResponse.json(
        { error: 'Failed to check if column exists', details: checkError.message },
        { status: 500 }
      );
    }

    // If username column doesn't exist, let's try to add it
    if (!columns || columns.length === 0) {
      // Let's try a simpler approach - create a temp function that executes our migration
      // Note: This requires elevated permissions
      const functionName = `add_username_column_${Date.now()}`;
      
      // 1. Create a temporary function
      const { error: funcError } = await supabase.rpc('create_temp_function', {
        function_name: functionName,
        function_body: `
          BEGIN
            ALTER TABLE IF EXISTS public.scores 
            ADD COLUMN IF NOT EXISTS username TEXT;
            RETURN TRUE;
          END;
        `
      });

      if (funcError) {
        console.error('Error creating migration function:', funcError);
        return NextResponse.json(
          { error: 'Failed to create migration function', details: funcError.message },
          { status: 500 }
        );
      }

      // 2. Execute the temp function
      const { data, error: execError } = await supabase.rpc(functionName);

      if (execError) {
        console.error('Error executing migration function:', execError);
        return NextResponse.json(
          { error: 'Failed to execute migration', details: execError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Migration executed successfully',
        columnAdded: true,
        data
      });
    } else {
      // Column already exists
      return NextResponse.json({
        success: true,
        message: 'Username column already exists',
        columnAdded: false
      });
    }
  } catch (error) {
    console.error('Error in migration endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 