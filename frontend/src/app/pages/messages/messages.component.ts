import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

interface Match {
  id: number;
  name: string;
  message: string;
  time: string;
  date: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, BottomNavComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
  matches: Match[] = [
    { id: 1, name: 'Ruby Ramon', message: 'Found from matches proposal', time: '11:30 AM', date: '20.04.2021' },
    { id: 2, name: 'Sara Christin', message: 'I send you a Vibe', time: '11:13 AM', date: '20.04.2021' },
    { id: 3, name: 'Myley Corbyn', message: 'Liked this person', time: '10:42 PM', date: '20.04.2021' },
    { id: 4, name: 'Sansa Ben', message: 'New Proposal accepted', time: '10:26 AM', date: '20.04.2021' },
    { id: 5, name: 'Belle Benson', message: 'Responded to your request', time: '10:07 AM', date: '27.04.2021' },
    { id: 6, name: 'Maria Kurova', message: 'New Match', time: '09:45 AM', date: '27.04.2021' },
  ];
}
