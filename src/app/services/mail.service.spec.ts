import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MailService } from './mail.service';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from '../../environments/environment';

describe('MailService', () => {
  let service: MailService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MailService]
    });

    service = TestBed.inject(MailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('send()', () => {
    it('should send email successfully', fakeAsync(() => {
      const mockResponse: HttpResponse = {
        status: 200,
        data: {},
        headers: {},
        url: ''
      };

      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

      const email = 'test@example.com';
      const subject = 'Test Subject';
      const body = 'Test Body';

      let error: Error | undefined;
      service.send(email, subject, body)
        .catch(err => error = err);
      tick();

      expect(error).toBeUndefined();
      expect(CapacitorHttp.post).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/mail/send`,
        data: {
          Email: email,
          Subject: subject,
          Body: body
        },
        headers: { 'Content-Type': 'application/json' }
      });
    }));

    it('should throw error when response status is not 200', fakeAsync(() => {
      const mockResponse: HttpResponse = {
        status: 400,
        data: {},
        headers: {},
        url: ''
      };

      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

      let error: Error | undefined;
      service.send('test@example.com', 'Test Subject', 'Test Body')
        .catch(err => error = err);
      tick();

      expect(error).toBeDefined();
      expect(error?.message).toBe('Response Status 400');
    }));

    it('should handle request error', fakeAsync(() => {
      const mockError = new Error('Network error');
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.reject(mockError));

      let error: Error | undefined;
      service.send('test@example.com', 'Test Subject', 'Test Body')
        .catch(err => error = err);
      tick();

      expect(error).toBeDefined();
      expect(error?.message).toBe('Request error: Network error');
    }));

    it('should handle unknown error', fakeAsync(() => {
      const mockError = 'Unknown error';
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.reject(mockError));
      spyOn(console, 'log');

      let error: Error | undefined;
      service.send('test@example.com', 'Test Subject', 'Test Body')
        .catch(err => error = err);
      tick();

      expect(error).toBeDefined();
      expect(error?.message).toBe('Unknown error: Unknown error');
      expect(console.log).toHaveBeenCalledWith(mockError);
    }));
  });

  describe('sendWithToken()', () => {
    it('should send email with token successfully', fakeAsync(() => {
      const mockResponse: HttpResponse = {
        status: 200,
        data: 'token123',
        headers: {},
        url: ''
      };

      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

      const email = 'test@example.com';
      const subject = 'Test Subject';
      const body = 'Test Body';

      let result: string | undefined;
      let error: Error | undefined;
      service.sendWithToken(email, subject, body)
        .then(res => result = res)
        .catch(err => error = err);
      tick();

      expect(error).toBeUndefined();
      expect(result).toBe('token123');
      expect(CapacitorHttp.post).toHaveBeenCalledWith({
        url: `${environment.apiUrl}/mail/sendwithtoken`,
        data: {
          Email: email,
          Subject: subject,
          Body: body
        },
        headers: { 'Content-Type': 'application/json' }
      });
    }));

    it('should throw error when response status is not 200', fakeAsync(() => {
      const mockResponse: HttpResponse = {
        status: 400,
        data: {},
        headers: {},
        url: ''
      };

      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.resolve(mockResponse));

      let error: Error | undefined;
      service.sendWithToken('test@example.com', 'Test Subject', 'Test Body')
        .catch(err => error = err);
      tick();

      expect(error).toBeDefined();
      expect(error?.message).toBe('Response Status 400');
    }));

    it('should handle request error', fakeAsync(() => {
      const mockError = new Error('Network error');
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.reject(mockError));

      let error: Error | undefined;
      service.sendWithToken('test@example.com', 'Test Subject', 'Test Body')
        .catch(err => error = err);
      tick();

      expect(error).toBeDefined();
      expect(error?.message).toBe('Request error: Network error');
    }));

    it('should handle unknown error', fakeAsync(() => {
      const mockError = 'Unknown error';
      spyOn(CapacitorHttp, 'post').and.returnValue(Promise.reject(mockError));
      spyOn(console, 'log');

      let error: Error | undefined;
      service.sendWithToken('test@example.com', 'Test Subject', 'Test Body')
        .catch(err => error = err);
      tick();

      expect(error).toBeDefined();
      expect(error?.message).toBe('Unknown error: Unknown error');
      expect(console.log).toHaveBeenCalledWith(mockError);
    }));
  });
});
