import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// import { FormGroup, FormControl } from '@angular/forms';
/*Models */
import { Invoice } from '../../models/invoices/invoice.model';
/*Services */
import { PageTitleService } from '../../services/page-title.service';
import { InvoicesService } from '../../services/invoices.service';

/*Pipes */
import { DatePipe } from '@angular/common';
import { MycurrencyPipe } from '../../pipes/custom.currency.pipe';
import { PercentPipe } from '@angular/common';

/*Router */
import { Router } from '@angular/router';

/* Datatable */
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


/* Components */
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../utils/delete-dialog/delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../utils/custom-snackbar/custom-snackbar.component';


/*DECLARE $ for jquery */
declare var $;



@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  pageTitle: string = ' Invoices';
  pageIcon: string =  'fa-file-invoice-dollar';

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // displayedColumns: string[] = [ 'id', 'CreationDate', 'DueDate', 'clientName', 'projectName', 'currency', 'subTotal', 'taxRate', 'totalAmounts', 'status', 'actions'];
  displayedColumns: string[] = [ 'id', 'CreationDate', 'clientName', 'projectName', 'totalAmounts', 'status', 'actions'];
  allDataArr: Invoice[] = [];
  dataSource: any;

  resultsLength: number = 0;
  resultsPerPage: number = 10;

  isOverdue: boolean = false;
  isCollected: boolean = false;
  
  // For loader
  isLoadingResults = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(
    private datePipe: DatePipe,
    private percentPipe: PercentPipe,
    private mycurrencyPipe: MycurrencyPipe,
    private router: Router,
    private pageTitleService: PageTitleService,
    private invoicesService: InvoicesService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar
    ) {
      this.pageTitleService.changeTitle(this.pageTitle);
      this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    // Load Data
    this.getInvoicesFromService();
  }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getInvoicesFromService(): void{
    this.invoicesService.getInvoices().subscribe( invoicesData => {
      // console.log(invoicesData.ViewAllInvoiceResult);
      this.allDataArr = [...invoicesData.ViewAllInvoiceResult];
      // setting data length
      this.resultsLength = this.allDataArr.length;
      // console.log(this.allDataArr);

      // Looping over search response items
      for ( const item of this.allDataArr ) {
        const formatedCreationDate = item.CreationDate !== null ? item.CreationDate.replace('/Date(', '').replace('+0000)/', '') : '--';
        const formatedDueDate = item.DueDate !== null ? item.DueDate.replace('/Date(', '').replace('+0000)/', '') : '--';
        item.CreationDate = this.datePipe.transform(formatedCreationDate, 'MMM d, y, h:mm a');
        item.DueDate = this.datePipe.transform(formatedDueDate, 'MMM d, y, h:mm a');
        item.taxRate = item.taxRate / 100;
        // checking if due date is expired
        new Date(item.DueDate) < new Date() ? this.isOverdue = true : this.isOverdue = false;
        // checking if collected
        item.status === 'Collected' ? this.isCollected = true : this.isCollected = false;
      }

      // Assign the data to the data source for the table to render
      this.dataSource = new MatTableDataSource(this.allDataArr);
      // Linking paginator and sorting to datatable
      if ( this.dataSource ) {
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }, 0);
      }
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // Hide Loader on data complete loading
      this.isLoadingResults = false;
    });
  }


  // UTILITY METHODS
  // Filtering datatable Event handler
  applyFilter(event: Event): void {
    // Getting filter element value
    const filterValue = (event.target as HTMLInputElement).value;
    // Start filtering
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.filteredData = this.allDataArr;
    // Always go to the first page while filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDeleteDialog(invoiceId): void{
    // Open dialog
    const dialogRef = this.matDialog.open(DeleteDialogComponent, {
      data: {
        id: invoiceId,
        type: 'invoice'
      },
      disableClose: true,
      id: `deleteInvoiceDialog${invoiceId}`,
      ariaDescribedBy: `deleteInvoiceDialog${invoiceId}`,
      ariaLabel: `deleteInvoiceDialog${invoiceId}`,
      ariaLabelledBy: `deleteInvoiceDialog${invoiceId}`,
      autoFocus: true
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

