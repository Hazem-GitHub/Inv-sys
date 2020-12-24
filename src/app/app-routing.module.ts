import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { InvoicesComponent } from './components/invoices/invoices.component';
import { CreateInvoiceComponent } from './components/invoices/create-invoice/create-invoice.component';
import { ViewInvoiceComponent } from './components/invoices/view-invoice/view-invoice.component';
import { EditInvoiceComponent } from './components/invoices/edit-invoice/edit-invoice.component';

import { ExpensesComponent } from './components/expenses/expenses.component';
import { CreateExpenseComponent } from './components/expenses/create-expense/create-expense.component';
import { ViewExpenseComponent } from './components/expenses/view-expense/view-expense.component';
import { EditExpenseComponent } from './components/expenses/edit-expense/edit-expense.component';

import { ClientsComponent } from './components/clients/clients.component';
import { CreateClientComponent } from './components/clients/create-client/create-client.component';
import { ViewClientComponent } from './components/clients/view-client/view-client.component';
import { EditClientComponent } from './components/clients/edit-client/edit-client.component';

import { TeamComponent } from './components/team/team.component';

import { SettingsComponent } from './components/settings/settings.component';
import { CurrencyComponent } from './components/settings/currency/currency.component';
import { TaxesComponent } from './components/settings/taxes/taxes.component';

import { LostComponent } from './components/lost/lost.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { NotificationsComponent } from './components/notifications/notifications.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'invoices', component: InvoicesComponent },
  { path: 'invoices/new', component: CreateInvoiceComponent },
  { path: 'invoices/view/:id', component: ViewInvoiceComponent },
  { path: 'invoices/edit/:id', component: EditInvoiceComponent },

  { path: 'expenses', component: ExpensesComponent },
  { path: 'expenses/new', component: CreateExpenseComponent },
  { path: 'expenses/view/:id', component: ViewExpenseComponent },
  { path: 'expenses/edit/:id', component: EditExpenseComponent },

  { path: 'clients', component: ClientsComponent },
  { path: 'clients/new', component: CreateClientComponent },
  { path: 'clients/view/:id', component: ViewClientComponent },
  { path: 'clients/edit/:id', component: EditClientComponent },

  { path: 'team', component: TeamComponent },

  { path: 'settings', component: SettingsComponent },
  { path: 'settings/currency', component: CurrencyComponent },
  { path: 'settings/taxes', component: TaxesComponent },
  
  { path: 'notifications', component: NotificationsComponent },
  { path: 'maintenance', component: MaintenanceComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: LostComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
