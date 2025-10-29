import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { InputComponent } from '../../components/input/input.component';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, InputComponent, ButtonComponent],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss'
})
export class ProfileDetailsComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  avatarUrl: string = '';
  selectedFile: File | null = null;

  // Dados do formulário
  firstname = '';
  lastname = '';
  email = '';
  password = '';
  dob = '';
  gender: 'MALE' | 'FEMALE' | 'OTHER' = 'MALE';
  preference: 'MALE' | 'FEMALE' | 'OTHER' = 'FEMALE';

  isLoading = false;
  errorMessage = '';

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onRegister() {
    console.log('🔵 onRegister chamado');
    console.log('Dados do formulário:', {
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      dob: this.dob,
      gender: this.gender,
      preference: this.preference
    });

    if (!this.firstname || !this.lastname || !this.email || !this.password || !this.dob) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios';
      console.log('❌ Campos obrigatórios não preenchidos');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData = {
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      dob: this.dob,
      gender: this.gender,
      preference: this.preference
    };

    console.log('📤 Enviando dados para o backend:', userData);
    console.log('📷 Foto selecionada:', this.selectedFile ? 'Sim' : 'Não');

    const registerObservable = this.selectedFile
      ? this.authService.registerWithPhoto(userData, this.selectedFile)
      : this.authService.register(userData);

    registerObservable.subscribe({
      next: (user) => {
        console.log('✅ Usuário registrado com sucesso:', user);
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('❌ Erro completo no registro:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        
        let mensagemErro = 'Erro ao criar conta. Tente novamente.';
        
        if (error.status === 0) {
          mensagemErro = 'Erro de conexão. Verifique se o backend está rodando.';
        } else if (error.error?.message) {
          mensagemErro = error.error.message;
        } else if (error.message) {
          mensagemErro = error.message;
        }
        
        this.errorMessage = mensagemErro;
        this.isLoading = false;
      }
    });
  }
}
