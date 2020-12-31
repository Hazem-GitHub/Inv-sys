import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ProxyInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if ( request.url.includes('/api') ) {
      return next.handle(request.clone({
        url: request.url.replace('/api', 'https://cors-anywhere.herokuapp.com/http://invoices.5d-agency.com/service1.svc')
      }));
    }
    return next.handle(request);
  }
}
