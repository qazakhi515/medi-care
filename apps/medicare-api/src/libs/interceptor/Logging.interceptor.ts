import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger();

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		//functional reactive prog func
		const recordTime = Date.now();
		const requestType = context.getType<GqlContextType>();
		this.logger.log(`Type ${requestType}`, 'REQUEST');

		if (requestType === 'http') {
			//dev if needed
		} else if (requestType === 'graphql') {
			//(1) Print Request
			const gqlContext = GqlExecutionContext.create(context);
			this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');

			// (2) Errors handing via graphql
			// (3) No errors giving Response below

			return next.handle().pipe(
				tap((context) => {
					const responseTime = Date.now() - recordTime;
					this.logger.log(`${this.stringify(context)} ${responseTime}ms /n/n`, 'RESPONSE');
				}),
			);
		}
	}
	private stringify(context: ExecutionContext): string {
		return JSON.stringify(context).slice(0, 75);
	}
}
