import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'to12Hour',
  standalone: true,
})
export class To12HourPipe implements PipeTransform {
  transform(time24: string): string {
    const [h, m, s] = time24.split(':');
    const date = new Date();
    date.setHours(+h, +m, +s);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
