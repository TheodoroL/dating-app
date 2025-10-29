import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Like {
  id: string;
  likerId: string;
  likedId: string;
  createdAt: string;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  likeUser(userId: string): Observable<{ message: string; isMatch: boolean; match?: any }> {
    return this.http.post<{ message: string; isMatch: boolean; match?: any }>(
      `${this.apiUrl}/likes/${userId}`, 
      {}
    );
  }

  dislikeUser(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/likes/${userId}/dislike`, {});
  }

  getLikes(): Observable<Like[]> {
    return this.http.get<Like[]>(`${this.apiUrl}/likes`);
  }

  getSentLikes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/likes/sent`);
  }

  getReceivedLikes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/likes/received`);
  }

  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/matches`);
  }
}
