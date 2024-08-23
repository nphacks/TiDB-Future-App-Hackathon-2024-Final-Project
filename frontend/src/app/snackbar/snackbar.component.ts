import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent implements OnInit {
  @Input() message: string | null = null;

  ngOnInit(): void {
    if (this.message) {
      this.show();
    }
  }

  show(): void {
    const snackbar = document.querySelector('.snackbar');
    if (snackbar) {
      snackbar.classList.add('show');
      setTimeout(() => snackbar.classList.remove('show'), 3000); // Hide after 3 seconds
    }
  }
}
