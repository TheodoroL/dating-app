import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { InputComponent } from '../../components/input/input.component';
import { ButtonComponent } from '../../components/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, InputComponent, ButtonComponent, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  onLogin() {
    console.log('🔵 onLogin chamado');
    console.log('Email:', this.email);
    console.log('Password:', this.password ? '***' : '(vazio)');

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('✅ Login realizado com sucesso:', response);
        
        // Verificar se o token foi salvo
        const token = this.authService.getToken();
        console.log('🔑 Token salvo:', token ? 'Sim' : 'Não');
        
        if (token) {
          console.log('🏠 Redirecionando para /home');
          this.router.navigate(['/home']);
        } else {
          console.error('❌ Token não foi salvo!');
          this.errorMessage = 'Erro ao salvar credenciais. Tente novamente.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('❌ Erro no login:', error);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);
        
        // Pegar a mensagem de erro do backend
        let mensagemErro = 'Erro ao fazer login. Tente novamente.';
        
        if (error.status === 0) {
          mensagemErro = 'Erro de conexão. Verifique se o backend está rodando.';
        } else if (error.status === 401) {
          mensagemErro = error.error?.message || 'Email ou senha inválidos';
        } else if (error.status === 404) {
          mensagemErro = error.error?.message || 'Usuário não encontrado';
        } else if (error.error?.message) {
          mensagemErro = error.error.message;
        }
        
        this.errorMessage = mensagemErro;
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
