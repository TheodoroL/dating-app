import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [RouterLink, InputComponent, ButtonComponent, NgIf],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss'
})
export class ProfileDetailsComponent {
  avatarUrl: string = '';
}
