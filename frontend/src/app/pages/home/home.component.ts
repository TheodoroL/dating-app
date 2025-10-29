import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { MatchModalComponent } from '../../components/match-modal/match-modal.component';
import { UserService, UserProfile } from '../../services/user.service';
import { LikeService } from '../../services/like.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BottomNavComponent, MatchModalComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private userService = inject(UserService);
  private likeService = inject(LikeService);

  showMatchModal = false;
  matchedUserName = '';
  
  currentUser: UserProfile | null = null;
  users: UserProfile[] = [];
  currentIndex = 0;
  currentPhotoIndex = 0;
  isLoading = false;

  ngOnInit() {
    this.loadUsers();
  }

  get currentProfile(): UserProfile | null {
    return this.users[this.currentIndex] || null;
  }

  getProfilePhoto(): string {
    if (!this.currentProfile) return '';
    
    if (this.currentProfile.photos && this.currentProfile.photos.length > 0) {
      let photoUrl = this.currentProfile.photos[this.currentPhotoIndex]?.url || this.currentProfile.photos[0].url;
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
    
    // Se tiver profilePhoto, retorna ela
    if (this.currentProfile.profilePhoto) {
      let photoUrl = this.currentProfile.profilePhoto;
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
    
    // Fallback: retorna string vazia para usar o gradiente do CSS
    return '';
  }
  
  hasProfilePhoto(): boolean {
    if (!this.currentProfile) return false;
    return (this.currentProfile.photos && this.currentProfile.photos.length > 0) || !!this.currentProfile.profilePhoto;
  }

  getGenderIcon(): string {
    if (!this.currentProfile) return '';
    
    const gender = this.currentProfile.gender.toUpperCase();
    switch(gender) {
      case 'MALE': return '♂️';
      case 'FEMALE': return '♀️';
      default: return '⚧️';
    }
  }

  changePhoto(index: number): void {
    this.currentPhotoIndex = index;
  }

  previousProfile(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentPhotoIndex = 0;
    }
  }

  loadUsers() {
    this.isLoading = true;
    console.log('🔄 Carregando usuários...');
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('✅ Usuários carregados:', users);
        this.users = users;
        this.currentIndex = 0;
        this.currentPhotoIndex = 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar usuários:', err);
        this.isLoading = false;
      }
    });
  }

  onLike(): void {
    if (!this.currentProfile || this.isLoading) return;

    this.isLoading = true;
    console.log('❤️ Dando like em:', this.currentProfile.firstname);

    this.likeService.likeUser(this.currentProfile.id).subscribe({
      next: (response) => {
        console.log('✅ Like enviado:', response);
        this.isLoading = false;
        
        if (response.isMatch) {
          // É um match!
          this.matchedUserName = `${this.currentProfile!.firstname} ${this.currentProfile!.lastname}`;
          this.showMatchModal = true;
        } else {
          // Não deu match, avançar para próximo perfil
          this.nextProfile();
        }
      },
      error: (err) => {
        console.error('❌ Erro ao dar like:', err);
        this.isLoading = false;
        this.nextProfile();
      }
    });
  }

  onDislike(): void {
    if (!this.currentProfile || this.isLoading) return;

    this.isLoading = true;
    console.log('✕ Pulando perfil:', this.currentProfile.firstname);

    this.likeService.dislikeUser(this.currentProfile.id).subscribe({
      next: () => {
        console.log('✅ Dislike registrado');
        this.isLoading = false;
        this.nextProfile();
      },
      error: (err) => {
        console.error('❌ Erro ao dar dislike:', err);
        this.isLoading = false;
        this.nextProfile();
      }
    });
  }

  nextProfile(): void {
    this.currentPhotoIndex = 0;
    this.currentIndex++;
    
    // Se chegou ao fim da lista, recarregar
    if (this.currentIndex >= this.users.length) {
      console.log('📋 Fim da lista, recarregando...');
      this.currentIndex = 0;
      this.loadUsers();
    }
  }

  onModalClosed(): void {
    this.showMatchModal = false;
    this.nextProfile();
  }
}
