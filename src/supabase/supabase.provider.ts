import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export const supabaseProvider = [
  {
    provide: 'Supabase_client',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return createClient(
        configService.get<string>('supabase.url') as string,
        configService.get<string>('supabase.key') as string,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: false,
            detectSessionInUrl: false,
          },
          db: {
            schema: 'public',
          },
        },
      );
    },
  },
];
