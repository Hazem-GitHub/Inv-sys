import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Pipe({
    name: 'mycurrency',
})
export class MycurrencyPipe implements PipeTransform {
    transform(
        value: number,
        currencyCode: string,
        display:
            | 'code'
            | 'symbol'
            | 'symbol-narrow'
            | string
            | boolean = 'code',
        digitsInfo: string = '1.0-2',
        locale: string = 'en-US',
    ): string | null {
        return formatCurrency(
          value,
          locale,
          currencyCode + ' ',
        //   getCurrencySymbol(currencyCode, 'wide') + ' ',
          currencyCode,
          digitsInfo,
        );
    }
}