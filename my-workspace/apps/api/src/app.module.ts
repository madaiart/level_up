import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { TodosModule } from './todos/todos.module';
import { UserModule } from './user/user.module';

import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

@Module({
  imports: [
    UserModule,
    HealthModule,
    TodosModule,
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      isGlobal: true,
      validationSchema: z.object({
        NODE_ENV: z.enum(['development', 'production', 'test']),
        PORT: z.coerce.number().default(3000),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
