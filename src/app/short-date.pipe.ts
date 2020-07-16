import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortDate'
})
export class ShortDatePipe implements PipeTransform {

  // Formats ISO date string like '2020-05-05' into '05.05.2020'
  transform(value: string): string {

    return value.substr(8, 2) + '.' + value.substr(5, 2) + '.' + value.substr(0, 4);
  }

}
