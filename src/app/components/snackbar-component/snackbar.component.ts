import {
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snackbar-component',
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss',
})
export class SnackbarComponent {
  @ViewChild('snackbar') snackbar!: TemplateRef<HTMLElement>;
  public viewContainer = inject(ViewContainerRef);
  public timer!: ReturnType<typeof setTimeout> | null;

  show() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.viewContainer.clear();
      this.timer = null;
      return;
    }
    this.viewContainer.createEmbeddedView(this.snackbar);
    this.timer = setTimeout(() => {
      this.hide();
    }, 1500);
  }

  hide() {
    this.timer = null;
    this.viewContainer.clear();
  }
}
