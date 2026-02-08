import { Module } from '@nestjs/common';
import { supabaseProvider } from './supabase.provider';
import { SupabaseService } from './supabase.service';

@Module({
    providers: [...supabaseProvider, SupabaseService],
    exports: [...supabaseProvider, SupabaseService]
})
export class SupabaseModule { }
