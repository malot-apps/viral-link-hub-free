import { createApp } from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  // Connect to MongoDB with auto-seed
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`[VIRAL LINK HUB] Backend Express server running on port ${PORT}`);
    console.log(`[VIRAL LINK HUB] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

bootstrap().catch((err) => {
  console.error('[VIRAL LINK HUB] Fatal startup error:', err);
  process.exit(1);
});
