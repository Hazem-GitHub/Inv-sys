import { Component, OnInit } from '@angular/core';

/*Models */
import { Expense } from '../../../models/expenses/expense.model';
/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { ExpensesService } from '../../../services/expenses.service';

/*Pipes */
import { DatePipe } from '@angular/common';
import { MycurrencyPipe } from '../../../pipes/custom.currency.pipe';
import { PercentPipe } from '@angular/common';

/*Router */
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

/* Datatable */
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../../utils/custom-snackbar/custom-snackbar.component';



/*DECLARE $ for jquery */
declare var $;


@Component({
  selector: 'app-view-expense',
  templateUrl: './view-expense.component.html',
  styleUrls: ['./view-expense.component.scss']
})
export class ViewExpenseComponent implements OnInit {

  pageTitle: string = 'View Expense';
  pageIcon: string =  'fa-file-dollar-sign';

  expenseId: string;
  allDataObj: Expense;
  displayedColumns: string[] = [ 'index', 'name', 'comments', 'unitPrice', 'quantity', 'vatAmounts', 'total' ];
  itemsDataSource: any;

  // For loader
  isLoadingResults = false;

  constructor(
    private datePipe: DatePipe,
    private percentPipe: PercentPipe,
    private mycurrencyPipe: MycurrencyPipe,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private expensesService: ExpensesService,
    private snackBar: MatSnackBar
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;

    // getting the invoice id from the route parameters map object
    this.activatedRoute.paramMap.subscribe(params => {
      this.expenseId = params.get('id');
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      
    });

    // Load Details
    this.getExpenseDetailsFromService( this.expenseId );
  }


  getExpenseDetailsFromService( expenseId ): void{
    this.expensesService.getExpenseDetails( expenseId ).subscribe( expenseDetails => {
      console.log(expenseDetails);
      this.allDataObj = expenseDetails.ViewExpenseByIdResult[0];
      const formatedCreationDate = this.allDataObj.CreationDate !== null ?
                                   this.allDataObj.CreationDate.replace('/Date(', '').replace('+0000)/', '') : '--';
      this.allDataObj.CreationDate = this.datePipe.transform(formatedCreationDate, 'MMM d, y, h:mm a');
    }, err => {
      // on error
      console.log(err);
      this.showNotification(15000, 'Error on loading data','Reload', 'none' , false, 'warn');
      // Hide loader
      this.isLoadingResults = false;
    }, () => {
      // on complete
      // Hide loader
      this.isLoadingResults = false;
      // Assign the data to the data source for the table to render
      this.itemsDataSource = new MatTableDataSource(this.allDataObj.ExpenseItem);
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
