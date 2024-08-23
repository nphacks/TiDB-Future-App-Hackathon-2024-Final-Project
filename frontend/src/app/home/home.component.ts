import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('moveUp', [
      state('initial', style({ transform: 'translate(0, 0)' })),
      state('moved', style({ transform: 'translate(0, -25vh)' })), // Adjusted for full viewport height
      transition('initial <=> moved', animate('500ms ease-in-out'))
    ])
  ]
})
export class HomeComponent {
  moveState = 'initial';
  isLoading = true;

  ngOnInit() {
    this.simulateLoading()
  }

  simulateLoading() {
    setTimeout(() => this.isLoading = false, 3000); // Hide after 3 seconds
  }

  animateMove() {
    this.moveState = this.moveState === 'initial' ? 'moved' : 'initial';
  }
}
