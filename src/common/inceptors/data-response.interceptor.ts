import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';

@Injectable()
export class DataResponseInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('BEFORE...');

    const apiVersion = this.configService.get('app.apiVersion');
    return next.handle().pipe(
      map((data) => {
        return { 'api version': apiVersion, data };
      }),
    );
  }
}
