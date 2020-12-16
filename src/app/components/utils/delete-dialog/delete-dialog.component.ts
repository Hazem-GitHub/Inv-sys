import { Component, Inject, OnInit, Optional } from '@angular/core';
import { InvoicesService } from '../../../services/invoices.service';
import { ExpensesService } from '../../../services/expenses.service';
import { ClientsService } from '../../../services/clients.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent implements OnInit {

  fromPage: any;

  constructor(
    private invoicesService: InvoicesService,
    private expensesService: ExpensesService,
    private clientsService: ClientsService,
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.fromPage = data;
  }

  ngOnInit(): void {
  }
  /* Handlers */
  // DeleteInvoice
  deleteHandler(itemId, itemType): void{
    switch (itemType){
      case 'invoice': {
        const deleteInvoiceObservable = this.invoicesService.deleteInvoice(itemId).subscribe( result => {
          console.log(result);
        }, err => {
          // on error
          console.log(err);
          this.closeDialog(false);
        }, () => {
          // on complete
          this.closeDialog(true);
          deleteInvoiceObservable.unsubscribe();
        });
        break;
      }
      case 'invoice-item': {
        const deleteInvoiceItemObservable = this.invoicesService.deleteInvoice(itemId).subscribe( result => {
          console.log(result);
        }, err => {
          // on error
          console.log(err);
          this.closeDialog(false);
        }, () => {
          // on complete
          this.closeDialog(true);
          deleteInvoiceItemObservable.unsubscribe();
        });
        break;
      }
      case 'expense': {
        const deleteExpenseObservable = this.expensesService.deleteExpense(itemId).subscribe( result => {
          console.log(result);
        }, err => {
          // on error
          console.log(err);
          this.closeDialog(false);
        }, () => {
          // on complete
          this.closeDialog(true);
          deleteExpenseObservable.unsubscribe();
        });
        break;
      }
      case 'expense-item': {
        const deleteExpenseItemObservable = this.expensesService.deleteExpenseItem(itemId).subscribe( result => {
          console.log(result);
        }, err => {
          // on error
          console.log(err);
          this.closeDialog(false);
        }, () => {
          // on complete
          this.closeDialog(true);
          deleteExpenseItemObservable.unsubscribe();
        });
        break;
      }
      case 'client': {
        const deleteClientObservable = this.clientsService.deleteClient(itemId).subscribe( result => {
          console.log(result);
        }, err => {
          // on error
          console.log(err);
          this.closeDialog(false);
        }, () => {
          // on complete
          this.closeDialog(true);
          deleteClientObservable.unsubscribe();
        });
        break;
      }
      default: {
        this.closeDialog(false);
        break;
      }
    }
  }


  closeDialog(isDeleted): void {
    this.dialogRef.close(isDeleted);
  }
}
