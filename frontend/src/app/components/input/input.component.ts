import { Component, Input } from '@angular/core';

type TypeInput = "text" | "password" | "email" | "date";

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  @Input({alias : "typeInput", required: false}) typeInput: TypeInput = "text";
  @Input({alias:"placeholderInput", required: true}) placeholderInput: string = "";
}
