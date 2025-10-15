"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../../app.module");
const users_seed_1 = require("./users.seed");
const typeorm_1 = require("typeorm");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const dataSource = app.get(typeorm_1.DataSource);
    try {
        console.log('🌱 Starting database seeding...\n');
        const userSeeder = new users_seed_1.UserSeeder(dataSource);
        await userSeeder.run();
        console.log('\n✅ All seeds completed successfully!');
        console.log('You can now login with the sample accounts listed above.\n');
    }
    catch (error) {
        console.error('❌ Error running seeds:', error);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed-runner.js.map