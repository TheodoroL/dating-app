import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { UserService, UserProfile } from '../../services/user.service';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, BottomNavComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  user: UserProfile | null = null;
  isLoading = false;

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar perfil:', err);
        this.isLoading = false;
      }
    });
  }

  getProfilePhoto(): string {
    if (!this.user?.profilePhoto) return '';
    
    let photoUrl = this.user.profilePhoto;
    
    // Remove /uploads se já estiver presente
    if (photoUrl.startsWith('/uploads/')) {
      photoUrl = photoUrl.replace('/uploads/', '/');
    }
    
    return `${environment.apiUrl}/uploads${photoUrl}`;
  }

  getMemberSince(): string {
    if (!this.user?.memberSince) return '';
    
    const date = new Date(this.user.memberSince);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  getGenderLabel(): string {
    if (!this.user?.gender) return '';
    
    const labels: Record<string, string> = {
      'MALE': 'Masculino',
      'FEMALE': 'Feminino',
      'OTHER': 'Outro'
    };
    
    return labels[this.user.gender] || this.user.gender;
  }

  getPreferenceLabel(): string {
    if (!this.user?.preference) return '';
    
    const labels: Record<string, string> = {
      'MALE': 'Homens',
      'FEMALE': 'Mulheres',
      'OTHER': 'Todos'
    };
    
    return labels[this.user.preference] || this.user.preference;
  }

  logout() {
    if (confirm('Tem certeza que deseja sair?')) {
      this.authService.logout();
    }
  }

  editProfile() {
    // TODO: Implementar edição de perfil
    alert('Funcionalidade de edição em desenvolvimento!');
  }
}
