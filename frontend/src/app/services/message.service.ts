import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Message {
  id: number;
  content: string;
  sentAt: string;
  sender: {
    id: string;
    name: string;
    photo: string | null;
  } | null;
  isCurrentUser: boolean;
}

export interface BackendMessage {
  id: number;
  content: string;
  senderId: string;
  createdAt: string;
}

export interface Conversation {
  matchId: number;
  otherUser: {
    id: string;
    firstname: string;
    lastname: string;
    age: number;
    profilePhoto: string | null;
  };
  lastMessage?: BackendMessage;
  unreadCount: number;
  matchedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getConversations(): Observable<{ conversations: Conversation[], total: number }> {
    return this.http.get<{ conversations: Conversation[], total: number }>(`${this.apiUrl}/matches/conversations`);
  }

  getMessages(matchId: number): Observable<{ messages: Message[], total: number }> {
    return this.http.get<{ messages: Message[], total: number }>(`${this.apiUrl}/matches/${matchId}/messages`);
  }

  sendMessage(matchId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/matches/${matchId}/messages`, { content });
  }
}
