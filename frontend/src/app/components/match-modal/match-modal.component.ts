import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-match-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-modal.component.html',
  styleUrl: './match-modal.component.scss'
})
export class MatchModalComponent {
  @Input() isVisible: boolean = false;
  @Input() userName: string = 'Belle';
  @Output() closed = new EventEmitter<void>();

  constructor(private router: Router) {}

  onClose(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  onKeepDating(): void {
    this.onClose();
    this.router.navigate(['/messages']);
  }
}
