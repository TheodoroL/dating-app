import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { MessageService, Conversation } from '../../services/message.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, BottomNavComponent, RouterLink],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  private messageService = inject(MessageService);
  private router = inject(Router);

  conversations: Conversation[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadConversations();
  }

  loadConversations() {
    this.isLoading = true;
    this.messageService.getConversations().subscribe({
      next: (response) => {
        console.log('📨 Conversas carregadas:', response);
        this.conversations = response.conversations || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar conversas:', err);
        this.isLoading = false;
      }
    });
  }

  getProfilePhoto(conversation: Conversation): string {
    let photoUrl = conversation.otherUser.profilePhoto;
    
    if (!photoUrl) return '';
    
    // Remove /uploads se já estiver presente
    if (photoUrl.startsWith('/uploads/')) {
      photoUrl = photoUrl.replace('/uploads/', '/');
    }
    
    return `http://localhost:8080/uploads${photoUrl}`;
  }

  getLastMessageText(conversation: Conversation): string {
    return conversation.lastMessage?.content || 'Novo match!';
  }

  getLastMessageTime(conversation: Conversation): string {
    if (!conversation.lastMessage) return '';
    
    const date = new Date(conversation.lastMessage.createdAt);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  getLastMessageDate(conversation: Conversation): string {
    if (!conversation.lastMessage) return '';
    
    const date = new Date(conversation.lastMessage.createdAt);
    return date.toLocaleDateString('pt-BR');
  }

  openConversation(conversation: Conversation) {
    console.log('💬 Abrindo conversa:', conversation.matchId);
    this.router.navigate(['/chat', conversation.matchId]);
  }
}
