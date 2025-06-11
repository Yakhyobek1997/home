import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger();

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const recordTime = Date.now();
    const requestType = context.getType<GqlContextType>();

    if (requestType === 'http') {
      // HTTP uchun logika kerak bo'lsa shu yerda yozing
      return next.handle();
    }

    if (requestType === 'graphql') {
      // (1) Print Request
      const gqlContext = GqlExecutionContext.create(context);
      this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');

      // (2) Errors handing via GraphQL
      // (3) No Errors, giving Response below
      return next.handle().pipe(
        tap((context) => {
          const responseTime = Date.now() - recordTime;
          this.logger.log(`${this.stringify(context)} = ${responseTime}ms \n\n`, 'RESPONSE');
        }),
      );
    }

    // Har doim Observable qaytarilsin!
    return next.handle();
  }

  private stringify(obj: any): string {
    return JSON.stringify(obj).slice(0, 75);
  }
}

