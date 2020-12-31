import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Invoice } from '../models/invoices/invoice.model';
import { Observable } from 'rxjs';
// import { TaxRateService } from '../services/tax-rate.service';
import * as _moment from 'moment';

const moment =  _moment;


@Injectable({
  providedIn: 'root'
})
export class InvoicesService {

  constructor(private http: HttpClient) { }
  // Get ALL Invoices
  getInvoices(): Observable<any> {
    const endpoint = `/api/ViewAllInvoice?`;
    return this.http.get<any>(endpoint);
  }
  // View Invoice
  getInvoiceDetails(invoiceId): Observable<any> {
    const endpoint = `/api/ViewInvoiceById?invoiceId=${ invoiceId }`;
    return this.http.get<any>(endpoint);
  }
  // Create Invoice
  proceedInvoice(detailsObj: any, totalsObj: any): Observable<any>{
    const endpoint = `/api/CreateInvoice?ClientId=${ detailsObj.ClientId}&ProjectName=${detailsObj.ProjectName }&Description=${ detailsObj.Description}&PaymentMethodId=${detailsObj.PaymentMethodId }&CurrencyId=${ detailsObj.CurrencyId}&StatusId=${detailsObj.StatusId }&Taxed=${detailsObj.Taxed }&TaxId=${detailsObj.TaxId}&TotalAmount=${totalsObj.TotalAmount }&PaidAmount=${totalsObj.PaidAmount }&DueAmount=${ totalsObj.DueAmount}&SubTotal=${ totalsObj.SubTotal}&DueDate=${ detailsObj.DueDate }`;
    return this.http.get<any>(endpoint);
  }
  // Create Invoice Items
  createInvoiceItem(item: any, invoiceId: number): Observable<any>{
    const endpoint = `/api/CreateItem?InvoiceId=${ invoiceId }&Name=${ item.itemName }&Description=${ item.itemDescription }&UnitPrice=${ item.unitPrice }&Quantity=${ item.quantity }&TotalPrice=${ item.quantity * item.unitPrice }`;
    return this.http.get<any>(endpoint);
  }
  // Edit Invoice
  editInvoice(detailsObj: any, totalsObj: any): Observable<any>{
    const endpoint = `/api/EditInvoice?InvoiceId=${ detailsObj.InvoiceId }&DueDate=${ detailsObj.DueDate }&ClientId=${ detailsObj.ClientId }&ProjectName=${ detailsObj.ProjectName }&Description=${ detailsObj.Description }&PaymentMethodId=${ detailsObj.PaymentMethodId }&CurrencyId=${ detailsObj.CurrencyId }&StatusId=${ detailsObj.StatusId }&Taxed=${ detailsObj.Taxed }&TaxId=${ detailsObj.TaxId }&PaidAmount=${ totalsObj.PaidAmount }&DueAmount=${ totalsObj.DueAmount }&SubTotal=${ totalsObj.SubTotal }&TotalAmount=${totalsObj.TotalAmount }`;
    return this.http.get<any>(endpoint);
  }
  // Edit Invoice Items
  editInvoiceItem(item: any): Observable<any>{
    const endpoint = `/api/EditItems?ItemId=${ item.id }&Description=${ item.itemDescription }&UnitPrice=${ item.unitPrice }&Quantity=${ item.quantity }&Name=${ item.itemName }&TotalPrice=${ item.quantity * item.unitPrice }`;
    return this.http.get<any>(endpoint);
  }
  // Delete Invoice Item
  deleteInvoiceItem(itemId: number): Observable<any>{
    const endpoint = `/api/DeleteItem?ItemId=${ itemId }`;
    return this.http.get<any>(endpoint);
  }
  // Delete Invoice
  deleteInvoice(invoiceId: number): Observable<any>{
    const endpoint = `/api/DeleteInvoice?InvoiceId=${ invoiceId }`;
    return this.http.get<any>(endpoint);
  }

}
