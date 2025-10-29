import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent {
  @Input() activeItem: string = 'home';

  constructor(private router: Router) {}

  onItemClick(item: string): void {
    this.activeItem = item;
    
    // Navegação baseada no item clicado
    switch(item) {
      case 'home':
        this.router.navigate(['/home']);
        break;
      case 'discover':
        this.router.navigate(['/lists']);
        break;
      case 'messages':
        this.router.navigate(['/messages']);
        break;
      case 'profile':
        this.router.navigate(['/profile']);
        break;
    }
  }
}
