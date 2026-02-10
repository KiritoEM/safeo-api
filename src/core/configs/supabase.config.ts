import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_PUBLISHEABLE_KEY,
  serviceRoleKey: process.env.SUPABASE_SECRET_KEY,
}));
