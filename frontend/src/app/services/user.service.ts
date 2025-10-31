import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface UserProfile {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  age?: number;
  gender: string;
  preference?: string;
  bio?: string;
  photos?: Photo[];
  profilePhoto?: string | null;
  memberSince?: string;
}

export interface Photo {
  id: number;
  url: string;
  profilePhoto: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<any>(`${this.apiUrl}/users/discover`).pipe(
      map((response: any) => {
        return response.users || [];
      })
    );
  }

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<{ user: UserProfile }>(`${this.apiUrl}/users/me`).pipe(
      map((response) => {
        return response.user;
      })
    );
  }

  getUserById(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/${id}`);
  }

  updateProfile(id: string, data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/${id}`, data);
  }

  uploadPhoto(userId: string, photo: File): Observable<Photo> {
    const formData = new FormData();
    formData.append('photo', photo);
    return this.http.post<Photo>(`${this.apiUrl}/users/${userId}/photos`, formData);
  }

  deletePhoto(photoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/photos/${photoId}`);
  }
}
