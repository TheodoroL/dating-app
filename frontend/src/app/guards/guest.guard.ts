import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se já estiver autenticado, redireciona para home
  if (authService.isAuthenticated) {
    router.navigate(['/home']);
    return false;
  }

  // Caso contrário, permite acesso à página (login/registro)
  return true;
};
