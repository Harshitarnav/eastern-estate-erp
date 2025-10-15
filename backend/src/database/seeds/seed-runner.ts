import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UserSeeder } from './users.seed';
import { DataSource } from 'typeorm';

/**
 * Seed Runner Script
 * 
 * This script runs all database seeds
 * Usage: npm run seed:users
 */

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🌱 Starting database seeding...\n');

    // Run User Seeder
    const userSeeder = new UserSeeder(dataSource);
    await userSeeder.run();

    console.log('\n✅ All seeds completed successfully!');
    console.log('You can now login with the sample accounts listed above.\n');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
