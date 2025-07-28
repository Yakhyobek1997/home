import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { SocketModule } from './socket/socket.module';
import { GraphQLError } from 'graphql';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
      // GraphQL subscriptions qo'shildi
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
          onConnect: (connectionParams: Record<string, any>) => {
            const auth = connectionParams?.Authorization;
            const token = auth?.startsWith('Bearer ')
              ? auth.split(' ')[1]
              : null;
            return { token };
          },
        },
      },
      formatError: (error: GraphQLError) => {
        const extensions = error.extensions as Record<string, any>;
        return {
          message:
            extensions?.exception?.response?.message ||
            extensions?.response?.message ||
            error.message ||
            'Unknown error',
          code: extensions?.code || 'INTERNAL_SERVER_ERROR',
          path: error.path,
        };
      },
    }),
    ComponentsModule,
    DatabaseModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}


