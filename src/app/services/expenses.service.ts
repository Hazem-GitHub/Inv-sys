import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Expense } from '../models/expenses/expense.model';
import { Observable } from 'rxjs';
import * as _moment from 'moment';

const moment =  _moment;


@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  constructor(private http: HttpClient) { }
  // Get Expenses types
  getExpensesTypes( ): Observable<any> {
    const endpoint: string = `http://invoices.5d-agency.com/service1.svc/GetExpenseType?`;
    return this.http.get<any>(endpoint);
  }
  // get Expense Details
  getExpenseDetails(expenseId): Observable<any> {
    const endpoint = `http://invoices.5d-agency.com/service1.svc/ViewExpenseById?expenseId=${ expenseId }`;
    return this.http.get<any>(endpoint);
  }
  // View All Expenses
  getExpenses(): Observable<any> {
    const endpoint = `http://invoices.5d-agency.com/service1.svc/ViewAllExpense?`;
    return this.http.get<any>(endpoint);
  }
  // Create Expense
  proceedExpense(detailsObj: any, totalsObj: any): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/CreateExpense?ClientId=${ detailsObj.ClientId}&TypeId=${detailsObj.TypeId }&Description=${ detailsObj.Description}&CurrencyId=${ detailsObj.CurrencyId}&TotalAmount=${totalsObj.TotalAmount }`;
    return this.http.get<any>(endpoint);
  }
  // Create Expense Item
  createExpenseItem(item: any, expenseId: number): Observable<any>{
      const endpoint = `http://invoices.5d-agency.com/service1.svc/CreateExpenseItem?ExpenseId=${ expenseId }&Name=${ item.itemName }&Description=${item.itemDescription}&UnitPrice=${ item.unitPrice }&VAT=${ item.vat }&Quantity=${ item.quantity }&Total=${ item.quantity * item.unitPrice }`;
      return this.http.get<any>(endpoint);
  }

  // Edit Expense
  editExpense(detailsObj: any, totalsObj: any): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/EditExpense?ExpenseId=${detailsObj.ExpenseId}&ClientId=${detailsObj.ClientId}&TypeId=${detailsObj.ExpenseTypeId}&Description=${detailsObj.Description}&CurrencyId=${detailsObj.CurrencyId}&TotalAmount=${totalsObj.TotalAmount}`;
    return this.http.get<any>(endpoint);
  }
  // Edit Expense Items
  editExpenseItem(item: any): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/EditExpenseItems?ItemId=${ item.id }&Name=${ item.itemName }&Description=${ item.itemDescription }&UnitPrice=${ item.unitPrice }&VAT=${ item.vat }&Quantity=${ item.quantity }&Total=${ item.quantity * item.unitPrice }`;
    return this.http.get<any>(endpoint);
  }
  // Delete Expense Item
  deleteExpenseItem(itemId: number): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/DeleteExpenseItem?ItemId=${ itemId }`;
    return this.http.get<any>(endpoint);
  }
  // Delete Expense
  deleteExpense(expenseId: number): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/DeleteExpense?ExpenseId=${ expenseId }`;
    return this.http.get<any>(endpoint);
  }
}
