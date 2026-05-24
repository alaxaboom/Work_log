import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { WorkLogsModule } from './work-logs/work-logs.module';
import { WorkTypesModule } from './work-types/work-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    WorkTypesModule,
    WorkLogsModule,
  ],
})
export class AppModule {}
