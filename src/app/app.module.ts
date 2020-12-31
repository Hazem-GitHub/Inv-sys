import { BrowserModule } from '@angular/platform-browser';
import { NgModule, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { TopNavComponent } from './components/layout/top-nav/top-nav.component';
import { SideNavComponent } from './components/layout/side-nav/side-nav.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { InvoicesComponent } from './components/invoices/invoices.component';
import { CreateInvoiceComponent } from './components/invoices/create-invoice/create-invoice.component';
import { ViewInvoiceComponent } from './components/invoices/view-invoice/view-invoice.component';
import { EditInvoiceComponent } from './components/invoices/edit-invoice/edit-invoice.component';

import { ExpensesComponent } from './components/expenses/expenses.component';
import { CreateExpenseComponent } from './components/expenses/create-expense/create-expense.component';
import { EditExpenseComponent } from './components/expenses/edit-expense/edit-expense.component';


import { ClientsComponent } from './components/clients/clients.component';
import { CreateClientComponent } from './components/clients/create-client/create-client.component';

import { TeamComponent } from './components/team/team.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LostComponent } from './components/lost/lost.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

import { PageTitleService } from './services/page-title.service';

import { DatePipe } from '@angular/common';
import { PercentPipe } from '@angular/common';
import {MycurrencyPipe} from './pipes/custom.currency.pipe';
import { EditClientComponent } from './components/clients/edit-client/edit-client.component';
import { DeleteDialogComponent } from './components/utils/delete-dialog/delete-dialog.component';
import { CustomSnackbarComponent } from './components/utils/custom-snackbar/custom-snackbar.component';
import { ViewExpenseComponent } from './components/expenses/view-expense/view-expense.component';
import { ViewClientComponent } from './components/clients/view-client/view-client.component';
import { CurrencyComponent } from './components/settings/currency/currency.component';
import { TaxesComponent } from './components/settings/taxes/taxes.component';


// Interceptors
import { ProxyInterceptor } from './interceptors/proxy.interceptor';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TopNavComponent,
    SideNavComponent,
    DashboardComponent,
    InvoicesComponent,
    ExpensesComponent,
    ClientsComponent,
    TeamComponent,
    SettingsComponent,
    LostComponent,
    MaintenanceComponent,
    NotificationsComponent,
    MycurrencyPipe,
    CreateInvoiceComponent,
    CreateClientComponent,
    CreateExpenseComponent,
    ViewInvoiceComponent,
    EditInvoiceComponent,
    EditExpenseComponent,
    EditClientComponent,
    DeleteDialogComponent,
    CustomSnackbarComponent,
    ViewExpenseComponent,
    ViewClientComponent,
    CurrencyComponent,
    TaxesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    DataTablesModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [
    PageTitleService,
    DatePipe,
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EGP' },
    MycurrencyPipe,
    PercentPipe,

    // Interceptors
    { provide: HTTP_INTERCEPTORS, useClass: ProxyInterceptor, multi: true}
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
