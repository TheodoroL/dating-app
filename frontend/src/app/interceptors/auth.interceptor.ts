import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Se existir token e a requisição for para o backend (localhost:8080), adiciona o header Authorization
  if (token && req.url.includes('localhost:8080')) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('🔐 Interceptor adicionando token na requisição:', req.url);
    return next(clonedRequest);
  }

  return next(req);
};
