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
    const endpoint: string = `https://cors-anywhere.herokuapp.com/http://invoices.5d-agency.com/service1.svc/ViewAllTax?`;
    return this.http.get<any>(endpoint);
  }

  getTaxRate( taxId: number ): Observable<any> {
    const endpoint: string = `https://cors-anywhere.herokuapp.com/http://invoices.5d-agency.com/service1.svc/ViewTax?taxId=${ taxId }`;
    return this.http.get<any>(endpoint);
  }

  editTaxRate( tax: any ): Observable<any> {
    const endpoint: string = `https://cors-anywhere.herokuapp.com/http://invoices.5d-agency.com/service1.svc/EditTax?TaxId=${tax.taxId}&TaxName=${tax.taxName}&TaxRate=${tax.taxRate}&SetAsDefault=${tax.setAsDefault}`;
    return this.http.get<any>(endpoint);
  }
}