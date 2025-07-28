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
      // uploads: false,
      autoSchemaFile: true,
      installSubscriptionHandlers: true, // 
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql', // frontenddagi ws://localhost:3007/graphql 
          onConnect: (connectionParams) => {
            console.log(' GraphQL WS Connected');
            const token = connectionParams?.Authorization?.split(' ')[1];
            return { token }; // contextda token ishlatish uchun
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
