import { TestBed } from '@angular/core/testing';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AuthenticationService } from '../services/authentication.service';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let authService: jasmine.SpyObj<AuthenticationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthenticationService', ['getAccessToken', 'isPublicEndpoint']);

    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: AuthenticationService, useValue: spy }
      ]
    });

    interceptor = TestBed.inject(AuthInterceptor);
    authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should skip authentication for public endpoints', () => {
    const request = new HttpRequest('GET', '/authentication/login');
    const nextHandler: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => of()
    };

    authService.isPublicEndpoint.and.returnValue(true);
    spyOn(nextHandler, 'handle').and.callThrough();

    interceptor.intercept(request, nextHandler).subscribe();

    expect(authService.getAccessToken).not.toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalledWith(request);
  });

  it('should add auth token to non-public endpoints', () => {
    const request = new HttpRequest('GET', '/api/data');
    const nextHandler: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => of()
    };
    const mockToken = 'test-token';

    authService.isPublicEndpoint.and.returnValue(false);
    authService.getAccessToken.and.returnValue(Promise.resolve(mockToken));
    spyOn(nextHandler, 'handle').and.callThrough();

    interceptor.intercept(request, nextHandler).subscribe();

    expect(authService.getAccessToken).toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalledWith(
      request.clone({
        setHeaders: {
          Authorization: `Bearer ${mockToken}`
        }
      })
    );
  });

  it('should not add auth header when token is not available', () => {
    const request = new HttpRequest('GET', '/api/data');
    const nextHandler: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => of()
    };

    authService.isPublicEndpoint.and.returnValue(false);
    authService.getAccessToken.and.returnValue(Promise.resolve(null));
    spyOn(nextHandler, 'handle').and.callThrough();

    interceptor.intercept(request, nextHandler).subscribe();

    expect(authService.getAccessToken).toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalledWith(request);
  });
});
