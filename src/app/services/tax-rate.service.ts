import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tax } from '../models/invoices/tax.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaxRateService {

  constructor(private http: HttpClient) { }

  getTaxRates( ): Observable<any> {
    const endpoint: string = `/api/ViewAllTax?`;
    return this.http.get<any>(endpoint);
  }

  getTaxRate( taxId: number ): Observable<any> {
    const endpoint: string = `/api/ViewTax?taxId=${ taxId }`;
    return this.http.get<any>(endpoint);
  }

  editTaxRate( tax: any ): Observable<any> {
    const endpoint: string = `/api/EditTax?TaxId=${tax.taxId}&TaxName=${tax.taxName}&TaxRate=${tax.taxRate}&SetAsDefault=${tax.setAsDefault}`;
    return this.http.get<any>(endpoint);
  }
}