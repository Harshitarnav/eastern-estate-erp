// ============================================
// upload.module.ts
// Save as: backend/src/common/upload/upload.module.ts
// ============================================


import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}


// ============================================
// Add to app.module.ts
// ============================================

/*
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadModule } from './common/upload/upload.module';
// ... other imports

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Serve static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    
    TypeOrmModule.forRoot({
      // ... database config
    }),
    
    UploadModule,
    // ... other modules
  ],
})
export class AppModule {}
*/

// ============================================
// Install Required Packages
// ============================================

/*
npm install --save @nestjs/platform-express multer
npm install --save-dev @types/multer
npm install --save uuid
npm install --save-dev @types/uuid
*/

// ============================================
// Create Upload Directories
// ============================================

/*
mkdir -p uploads/properties
mkdir -p uploads/documents
mkdir -p uploads/kyc
mkdir -p uploads/receipts
mkdir -p uploads/avatars
mkdir -p uploads/temp
*/

// ============================================
// Add to .gitignore
// ============================================

/*
uploads/*
!uploads/.gitkeep
*/

// ============================================
// Environment Variables (.env)
// ============================================

/*
APP_URL=http://localhost:3001
*/

// ============================================
// CORS Configuration (main.ts)
// ============================================

/*
// In your main.ts file
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3000'], // Your frontend URL
    credentials: true,
  });
  
  await app.listen(3001);
}
bootstrap();
*/