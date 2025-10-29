import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, Message, Conversation } from '../../services/message.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss'
})
export class ConversationComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  matchId: number = 0;
  messages: Message[] = [];
  newMessage: string = '';
  isLoading = false;
  isSending = false;
  otherUser: any = null;
  
  private pollSubscription?: Subscription;
  private shouldScrollToBottom = false;

  ngOnInit() {
    const matchIdParam = this.route.snapshot.paramMap.get('matchId');
    this.matchId = matchIdParam ? Number(matchIdParam) : 0;
    
    if (!this.matchId) {
      this.router.navigate(['/messages']);
      return;
    }

    this.loadMessages();
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadMessages() {
    this.isLoading = true;
    this.messageService.getMessages(this.matchId).subscribe({
      next: (response) => {
        console.log('📨 Mensagens carregadas:', response);
        this.messages = response.messages || [];
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar mensagens:', err);
        this.isLoading = false;
      }
    });
  }

  startPolling() {
    // Atualizar mensagens a cada 3 segundos
    this.pollSubscription = interval(3000).subscribe(() => {
      this.loadMessages();
    });
  }

  stopPolling() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isSending) return;

    this.isSending = true;
    const messageContent = this.newMessage.trim();
    this.newMessage = '';

    this.messageService.sendMessage(this.matchId, messageContent).subscribe({
      next: (response) => {
        console.log('✅ Mensagem enviada:', response);
        // Recarregar todas as mensagens para pegar a formatação correta do backend
        this.loadMessages();
        this.isSending = false;
      },
      error: (err) => {
        console.error('❌ Erro ao enviar mensagem:', err);
        this.newMessage = messageContent; // Restaurar mensagem em caso de erro
        this.isSending = false;
      }
    });
  }

  scrollToBottom() {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Erro ao rolar para o fim:', err);
    }
  }

  goBack() {
    this.router.navigate(['/messages']);
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  isMyMessage(message: Message): boolean {
    return message.isCurrentUser;
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
