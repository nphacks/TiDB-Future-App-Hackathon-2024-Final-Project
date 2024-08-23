import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {
  @Input() message: string = '';
  isVisible: boolean = false;

  showSnackbar(): void {
    this.isVisible = true;
  }

  closeSnackbar(): void {
    this.isVisible = false;
  }
}
