import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { WorkspacesModule } from './modules/workspaces/workspaces.module'
import { FormsModule } from './modules/forms/forms.module'
import { ResponsesModule } from './modules/responses/responses.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { UploadsModule } from './modules/uploads/uploads.module'
import { NotificationsModule } from './modules/notifications/notifications.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    FormsModule,
    ResponsesModule,
    AnalyticsModule,
    UploadsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
