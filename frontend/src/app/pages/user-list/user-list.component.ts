import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserCardComponent, User } from '../../components/user-card/user-card.component';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { UserService, UserProfile } from '../../services/user.service';
import { LikeService } from '../../services/like.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent, BottomNavComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private likeService = inject(LikeService);
  private router = inject(Router);

  activeTab: string = 'all';
  users: User[] = [];
  allUsers: UserProfile[] = [];
  likedByUsers: User[] = [];
  sentLikes: User[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadUsers();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    
    // Carregar dados sob demanda
    if (tab === 'received' && this.likedByUsers.length === 0) {
      this.loadReceivedLikes();
    } else if (tab === 'sent' && this.sentLikes.length === 0) {
      this.loadSentLikes();
    }
  }

  loadUsers() {
    this.isLoading = true;
    console.log('🔄 Carregando usuários para descoberta...');
    
    this.userService.getUsers().subscribe({
      next: (users: UserProfile[]) => {
        console.log('✅ Usuários carregados:', users);
        this.allUsers = users;
        this.users = this.mapUsersToCardFormat(users);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar usuários:', err);
        this.isLoading = false;
      }
    });
  }

  loadReceivedLikes() {
    console.log('💙 Carregando usuários que curtiram você...');
    this.isLoading = true;
    
    this.likeService.getReceivedLikes().subscribe({
      next: (response: any) => {
        console.log('✅ Resposta de likes recebidos:', response);
        // A resposta é { likes: [...], total: number }
        const likes = response.likes || [];
        console.log('💙 Likes recebidos:', likes.length);
        // Extrair os usuários dos likes e mapear
        const users = likes.map((like: any) => like.user).filter((user: any) => user != null);
        this.likedByUsers = this.mapUsersToCardFormat(users);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('❌ Erro ao carregar likes recebidos:', err);
        this.isLoading = false;
      }
    });
  }

  loadSentLikes() {
    console.log('❤️ Carregando usuários que você curtiu...');
    this.isLoading = true;
    
    this.likeService.getSentLikes().subscribe({
      next: (response: any) => {
        console.log('✅ Resposta de likes enviados:', response);
        // A resposta é { likes: [...], total: number }
        const likes = response.likes || [];
        console.log('❤️ Likes enviados:', likes.length);
        // Extrair os usuários dos likes e mapear
        const users = likes.map((like: any) => like.user).filter((user: any) => user != null);
        this.sentLikes = this.mapUsersToCardFormat(users);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('❌ Erro ao carregar likes enviados:', err);
        this.isLoading = false;
      }
    });
  }

  mapUsersToCardFormat(users: any[]): User[] {
    return users.map(user => {
      // Calcular idade se tiver dob, caso contrário usar age se disponível
      let age = user.age || 0;
      if (user.dob && !user.age) {
        const birthDate = new Date(user.dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        age: age,
        distance: '~ km away', // Distância pode ser calculada futuramente
        photoCount: user.photos?.length || 0,
        isOnline: Math.random() > 0.5, // Simulado - pode ser implementado com WebSocket
        photo: this.getProfilePhoto(user),
        gender: user.gender
      };
    });
  }

  getProfilePhoto(user: UserProfile): string {
    if (user.photos && user.photos.length > 0) {
      let photoUrl = user.photos[0].url;
      // Se a URL já for completa (http/https), retorna diretamente
      if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
        return photoUrl;
      }
      // Remove /uploads se já existir no início
      if (photoUrl.startsWith('/uploads/')) {
        photoUrl = photoUrl.replace('/uploads/', '/');
      }
      // Constrói a URL do backend
      return `http://localhost:8080/uploads${photoUrl}`;
    }
    
    if (user.profilePhoto) {
      let photoUrl = user.profilePhoto;
      if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
        return photoUrl;
      }
      // Remove /uploads se já existir no início
      if (photoUrl.startsWith('/uploads/')) {
        photoUrl = photoUrl.replace('/uploads/', '/');
      }
      return `http://localhost:8080/uploads${photoUrl}`;
    }
    
    return '';
  }

  get filteredUsers(): User[] {
    switch (this.activeTab) {
      case 'received':
        return this.likedByUsers;
      case 'sent':
        return this.sentLikes;
      case 'all':
      default:
        return this.users;
    }
  }

  onUserClick(user: User): void {
    console.log('👤 Usuário clicado:', user);
    // Navegar para página de detalhes do perfil
    this.router.navigate(['/profile', user.id]);
  }

  // Método auxiliar para dar like em um usuário
  likeUser(userId: string, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Evitar que o click no card seja acionado
    }

    console.log('❤️ Curtindo usuário:', userId);
    this.likeService.likeUser(userId).subscribe({
      next: (response) => {
        console.log('✅ Like enviado:', response);
        if (response.isMatch) {
          alert('🎉 É um match!');
        }
        // Recarregar os likes enviados se estiver nessa tab
        if (this.activeTab === 'sent') {
          this.loadSentLikes();
        }
      },
      error: (err) => {
        console.error('❌ Erro ao curtir usuário:', err);
      }
    });
  }

  // Método auxiliar para dar dislike em um usuário
  dislikeUser(userId: string, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Evitar que o click no card seja acionado
    }

    console.log('💔 Rejeitando usuário:', userId);
    this.likeService.dislikeUser(userId).subscribe({
      next: (response) => {
        console.log('✅ Dislike enviado:', response);
        // Remover o usuário da lista
        this.users = this.users.filter(u => u.id !== userId);
      },
      error: (err) => {
        console.error('❌ Erro ao rejeitar usuário:', err);
      }
    });
  }
}
