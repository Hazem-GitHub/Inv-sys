import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// import { FormGroup, FormControl } from '@angular/forms';
/*Models */
import { Expense } from '../../models/expenses/expense.model';
/*Services */
import { PageTitleService } from '../../services/page-title.service';
import { ExpensesService } from '../../services/expenses.service';

/*Pipes */
import { DatePipe } from '@angular/common';
import { MycurrencyPipe } from '../../pipes/custom.currency.pipe';
import { PercentPipe } from '@angular/common';

/* Datatable */
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

/*Router */
import { Router } from '@angular/router';

/* Components */
import {MatDialog} from '@angular/material/dialog';
import { DeleteDialogComponent } from '../utils/delete-dialog/delete-dialog.component';
import { fromEvent } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../utils/custom-snackbar/custom-snackbar.component';


/*DECLARE $ for jquery */
declare var $;


@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit {
  pageTitle: string = 'Expenses';
  pageIcon: string =  'fa-dollar-sign';

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // displayedColumns: string[] = [ 'id', 'CreationDate', 'typeName', 'clientName', 'Description', 'currency', 'TotalAmount', 'actions' ];
    displayedColumns: string[] = [ 'id', 'CreationDate', 'typeName', 'clientName', 'TotalAmount', 'actions' ];
    allDataArr: Expense[] = [];
    dataSource: any;

    resultsLength: number = 0;
    resultsPerPage: number = 10;
    // For loader
    isLoadingResults = false;

    // sticky
    isSticky = false;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // expenses: Expense[];

  // @ViewChild('dataTable', {static: false}) table;
  // datatableElement: any;
  // dtOptions: DataTables.Settings = {};


  constructor(
    private datePipe: DatePipe,
    private percentPipe: PercentPipe,
    private mycurrencyPipe: MycurrencyPipe,
    private router: Router,
    private pageTitleService: PageTitleService,
    private expensesService: ExpensesService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    // Handling on Init
    if ( globalThis.innerWidth < 1200 ) {
      this.isSticky = true;
    }else{
      this.isSticky = false;
    }
    // Handling on window resize Event
    // make actions column sticky
    const windowResize = fromEvent(globalThis,'resize');
    windowResize.subscribe( event => {
      if ( globalThis.innerWidth < 1200 ) {
        this.isSticky = true;
      }else{
        this.isSticky = false;
      }
    });

    this.isLoadingResults = true;
    // Load Data
    this.getExpensesFromService();
  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getExpensesFromService(): void{
    this.expensesService.getExpenses().subscribe( expensesData => {
      // console.log(invoicesData.ViewAllExpenseResult);
      this.allDataArr = [...expensesData.ViewAllExpenseResult];
      // setting data length
      this.resultsLength = this.allDataArr.length;
      console.log(this.allDataArr);

      // Looping over search response items
      for ( const item of this.allDataArr ) {
        const formatedCreationDate = item.CreationDate !== null ? item.CreationDate.replace('/Date(', '').replace('+0000)/', '') : '--';
        item.CreationDate = this.datePipe.transform(formatedCreationDate, 'MMM d, y, h:mm a');
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
      this.showNotification(15000, 'Error on loading data','Reload', 'none' , false, 'warn');
      // Hide loader
      this.isLoadingResults = false;
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


  openDeleteDialog(expenseId): void{
    // Open dialog
    const dialogRef = this.matDialog.open(DeleteDialogComponent, {
      data: {
        id: expenseId,
        type: 'expense'
      },
      disableClose: true,
      id: `deleteExpenseDialog${expenseId}`,
      ariaDescribedBy: `deleteExpenseDialog${expenseId}`,
      ariaLabel: `deleteExpenseDialog${expenseId}`,
      ariaLabelledBy: `deleteExpenseDialog${expenseId}`,
      autoFocus: true
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  // Show notification on snackbar
  showNotification(duration: number, message: string, action: string, route: string, isCloseBtn: boolean, color: string): void {
    const snackBarRef = this.snackBar.openFromComponent(CustomSnackbarComponent, {
      duration,
      data: {
        message,
        action,
        route,
        isCloseBtn,
        color,
        snack: this.snackBar
      },
    });
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

