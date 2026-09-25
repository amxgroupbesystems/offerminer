import dotenv from 'dotenv';

// Load .env.local first
dotenv.config({ path: '.env.local' });
// Load .env as fallback
dotenv.config();
