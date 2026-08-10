// ============================================
// No-Cache Interceptor
// ============================================

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';

/**
 * Marks responses as uncacheable.
 *
 * Applied to the public content API: the website must observe a record the
 * moment it is published, so no browser, proxy or CDN may serve an earlier copy.
 *
 * Express still attaches its default weak ETag, which is harmless here — it is
 * computed from the body of the current response, so a conditional request can
 * only be answered 304 when the content genuinely has not changed, never from a
 * stale validator. (It cannot be dropped from an interceptor anyway: Express
 * generates it later, inside `res.send`.)
 */
@Injectable()
export class NoCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return next.handle();
  }
}
