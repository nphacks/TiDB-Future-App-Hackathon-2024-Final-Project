// date-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | null | undefined, format: string = 'short'): string {
    if (!value) return ''; 

    const date = new Date(value);

    if (isNaN(date.getTime())) return 'Invalid date';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format.includes('month') ? 'long' : 'numeric',
      day: 'numeric'
    };

    if (format === 'short') {
      options.month = 'short';
    } else if (format === 'full') {
      options.weekday = 'long';
      options.month = 'long';
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}
