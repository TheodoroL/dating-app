import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  dob: string;
  password: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  preference: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  dob: string;
  gender: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Tentar recuperar usuário do localStorage ao iniciar
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(credentials: LoginRequest): Observable<{ message: string }> {
    console.log('🌐 AuthService.login - URL:', `${this.apiUrl}/auth/login`);
    console.log('🌐 AuthService.login - Dados:', { email: credentials.email, password: '***' });
    
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/login`, credentials, {
      observe: 'response'
    }).pipe(
      tap(response => {
        console.log('📦 Resposta completa do backend:', response);
        
        // O backend retorna o token JWT no header Authorization
        const authHeader = response.headers.get('Authorization');
        console.log('🔑 Header Authorization:', authHeader || 'não encontrado');
        
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          console.log('💾 Salvando token no localStorage');
          this.setToken(token);
        } else {
          console.error('❌ Token não encontrado no header Authorization');
        }
      }),
      tap((response: HttpResponse<{ message: string }>) => {
        console.log('📄 Body da resposta:', response.body);
      }),
      // Extrai apenas o body da resposta
      map((response: HttpResponse<{ message: string }>) => response.body!)
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    console.log('🌐 AuthService.register - URL:', `${this.apiUrl}/auth/register`);
    console.log('🌐 AuthService.register - Dados:', userData);
    return this.http.post<User>(`${this.apiUrl}/auth/register`, userData);
  }

  registerWithPhoto(userData: RegisterRequest, photo: File): Observable<User> {
    console.log('🌐 AuthService.registerWithPhoto - URL:', `${this.apiUrl}/auth/register`);
    console.log('🌐 AuthService.registerWithPhoto - Dados:', userData);
    console.log('🌐 AuthService.registerWithPhoto - Foto:', photo.name, photo.size, 'bytes');
    
    const formData = new FormData();
    formData.append('firstname', userData.firstname);
    formData.append('lastname', userData.lastname);
    formData.append('email', userData.email);
    formData.append('dob', userData.dob);
    formData.append('password', userData.password);
    formData.append('gender', userData.gender);
    formData.append('preference', userData.preference);
    formData.append('photo', photo);

    return this.http.post<User>(`${this.apiUrl}/auth/register`, formData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
