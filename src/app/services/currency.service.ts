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
    const endpoint: string = `/api/ViewAllCurrency?`;
    return this.http.get<any>(endpoint);
  }

  // getCurrencyList( ): Observable<any> {
  //   const endpoint: string = `http://invoices.5d-agency.com/service1.svc/GetCurrency?`;
  //   return this.http.get<any>(endpoint);
  // }

  getCurrency( currencyId: number ): Observable<any> {
    const endpoint: string = `/api/ViewCurrency?currencyId=${ currencyId }`;
    return this.http.get<any>(endpoint);
  }

  editCurrency( currency: any ): Observable<any> {
    const endpoint: string = `/api/EditCurrencyValue?CurrencyId=${ currency.id }&ValueByEGP=${ currency.egpValue }&Disable=${ currency.disabled }`;
    return this.http.get<any>(endpoint);
  }
}
