import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql'; 
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as util from 'util';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LoggingInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const recordTime = Date.now();
    const requestType = context.getType<GqlContextType>();

    if (requestType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const req = gqlContext.getContext().req;

      // Faqat kerakli qismlar log qilinadi — circular yo'q
      const { query, variables, operationName } = req.body;
      this.logger.log(
        this.safeLog({ query, variables, operationName }),
        'REQUEST',
      );
    }

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - recordTime;
        this.logger.log(`Response Time: ${responseTime}ms`, 'RESPONSE');
      }),
    );
  }

  private safeLog(obj: any): string {
    try {
      return util.inspect(obj, { depth: 3, colors: false });
    } catch (err) {
      return '[Unserializable object]';
    }
  }
}
