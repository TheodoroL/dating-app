import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCardComponent, User } from '../../components/user-card/user-card.component';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent, BottomNavComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  activeTab: string = 'all';

  users: User[] = [
    { id: 1, name: 'Belle Benson', age: 28, distance: '1.5 km away', photoCount: 55, isOnline: true },
    { id: 2, name: 'Ruby Diaz', age: 33, distance: '1.2 km away', photoCount: 81, isOnline: false },
    { id: 3, name: 'Myley Corbyn', age: 25, distance: '1.8 km away', photoCount: 68, isOnline: true },
    { id: 4, name: 'Tony Z', age: 25, distance: '2 km away', photoCount: 70, isOnline: false },
    { id: 5, name: 'Belle Benson', age: 28, distance: '1.5 km away', photoCount: 55, isOnline: false },
    { id: 6, name: 'Belle Benson', age: 28, distance: '1.5 km away', photoCount: 55, isOnline: true },
  ];

  get filteredUsers(): User[] {
    if (this.activeTab === 'online') {
      return this.users.filter(user => user.isOnline);
    }
    return this.users;
  }

  onUserClick(user: User): void {
    console.log('User clicked:', user);
  }
}
