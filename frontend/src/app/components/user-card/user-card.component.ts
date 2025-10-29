import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface User {
  id: number;
  name: string;
  age: number;
  distance: string;
  photoCount: number;
  isOnline: boolean;
  imageUrl?: string;
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
  @Input() user!: User;
}
