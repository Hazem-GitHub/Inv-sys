import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Currency } from '../models/common/currency.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(private http: HttpClient) { }

  getCurrencies( ): Observable<any> {
    const endpoint: string = `https://cors-anywhere.herokuapp.com/http://invoices.5d-agency.com/service1.svc/ViewAllCurrency?`;
    return this.http.get<any>(endpoint);
  }

  getCurrency( currencyId: number ): Observable<any> {
    const endpoint: string = `https://cors-anywhere.herokuapp.com/http://invoices.5d-agency.com/service1.svc/ViewCurrency?currencyId=${ currencyId }`;
    return this.http.get<any>(endpoint);
  }
}
