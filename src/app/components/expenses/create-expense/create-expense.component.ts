import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

/*Models */
import { Expense, ExpenseType } from '../../../models/expenses/expense.model';
import { Currency } from '../../../models/common/currency.model';
import { ClientShort } from '../../../models/clients/client.short.model';
/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { ExpensesService } from '../../../services/expenses.service';
import { ClientsService } from '../../../services/clients.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { CurrencyService } from '../../../services/currency.service';
import { ExpenseItem } from 'src/app/models/expenses/expense-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';

/*Router */
import { Router } from '@angular/router';
import { CustomSnackbarComponent } from '../../utils/custom-snackbar/custom-snackbar.component';

/* Datatable */
import { MatTableDataSource } from '@angular/material/table';
import { fromEvent } from 'rxjs';


/*DECLARE $ for jquery */
declare var $;


@Component({
  selector: 'app-create-expense',
  templateUrl: './create-expense.component.html',
  styleUrls: ['./create-expense.component.scss'],
})

export class CreateExpenseComponent implements OnInit, OnDestroy {
  pageTitle: string = 'Create new expense';
  pageIcon: string =  'fa-dollar-sign';

  // For loader
  isLoadingResults = true;
  isCalculatingResults = true;

  // sticky
  isSticky = false;

  // Submit Button
  isSubmitting = false;

  // events: string[] = [];

  newExpenseForm: FormGroup;

  currentDate: Date = new Date();

  clientsList: ClientShort[];

  currencyList: Currency[];
  defaultCurrencyArrayElement: Currency[];
  defaultCurrencyId: number;
  currentCurrencyValue: string;

  ExpensesTypesList: ExpenseType[];
  selectedExpenseTypeId: number;
  selectedExpenseTypeValue: string;

  totalAmount: number;

  expenseItemsArr: any[];
  createdExpenseId: number;

  displayedColumns: string[] = [ 'index', 'name', 'comments', 'unitPrice', 'quantity', 'vatAmounts', 'actions'];
  expenseItemsDataSource: any;

  clientsListObservable: any;
  currencyListObservable: any;
  expenseTypeList: any;
  currencyObservable: any;
  valueChangesOnInitObservable: any;
  proceedExpenseObservable: any;
  createNewExpenseItemObservable: any;



  constructor(
    private pageTitleService: PageTitleService,
    private expensesService: ExpensesService,
    private clientsService: ClientsService,
    private currencyService: CurrencyService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router
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
    
    // $('#submit-btn-container .loading-container').hide();
    // $('#totalsSpinner').hide();
    this.isLoadingResults = true;


    // form
    this.newExpenseForm = this.fb.group({
      expenseType: ['', Validators.required],
      client: ['', Validators.required],
      expenseDescription: ['', Validators.maxLength(500)],
      currency: ['', Validators.required],
      expenseItems: this.fb.array([], Validators.required)
    });

    this.fillAllDD();

    this.valueChangesOnInitObservable = this.newExpenseForm.valueChanges.subscribe(formData => {
      // console.log(formData);
      // this.isCalculatingResults = true;
      this.totalAmount = this.calcExpenseSubTotal(formData.expenseItems);
      if ( this.newExpenseForm.value.expenseItems.length > 0 && this.newExpenseForm.value.currency ) {

        this.currencyObservable = this.currencyService.getCurrency(this.newExpenseForm.value.currency).subscribe(data => {
          this.currentCurrencyValue = data.ViewCurrencyResult[0].Name;
        }, err => {
          // on error
          console.log(err);
        }, () => {
          // on complete
          // $('.loading-container .spinnerContainer').hide();
          this.isCalculatingResults = false;
          this.isLoadingResults = false;
          this.currencyObservable.unsubscribe();
        });

      }

      // Change Description to Comments
      // change UnitPrice to Salary
      // Set Quantity to 1 and hide it
      // this.selectedExpenseTypeValue = this.newExpenseForm.value.
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      this.valueChangesOnInitObservable.unsubscribe();
    });
    // console.log(this.newExpenseForm.valid);
    // Add one invoice item by default
    this.addExpenseItem();
  }// end of OnInit

  ngOnDestroy(): void{
    this.snackBar.dismiss();
  }


  fillAllDD(): void{
    // get clients list
    this.clientsListObservable = this.clientsService.getClients('list').subscribe(data => {
      // console.log(data.GetClientResult);
      // $('.loading-container .spinnerContainer').show();
      this.clientsList = data.GetClientResult;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      this.clientsListObservable.unsubscribe();
    });


    // get currency list
    this.currencyListObservable = this.currencyService.getCurrencies().subscribe(data => {
      // console.log(data.ViewAllCurrencyResult);
      // $('.loading-container .spinnerContainer').show();
      this.currencyList = data.ViewAllCurrencyResult;
      this.defaultCurrencyArrayElement = this.currencyList.filter( currency => {
        if ( currency.Default === true ){
          return currency.CurrencyId;
        }
      });
      this.defaultCurrencyId = this.defaultCurrencyArrayElement[0].CurrencyId;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      this.currencyListObservable.unsubscribe();
    });


    // get expense types list
    this.expenseTypeList = this.expensesService.getExpensesTypes().subscribe(data => {
      // $('.loading-container .spinnerContainer').show();
      // console.log(data.GetStatuResult);
      this.ExpensesTypesList = data.GetExpenseTypeResult;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      this.expenseTypeList.unsubscribe();
    });
  }

  /* Handlers */
  onSubmitHandler(): void {
    // $('#submit-btn-container .loading-container').show();
    this.isSubmitting = true;
    const detailsObj = {
      ClientId: 0,
      TypeId: '',
      Description: '',
      CurrencyId: 0
    };

    const totalsObj = {
      TotalAmount: 0,
    };
    // 1. filling expenseItemsArr with my expense items
    this.expenseItemsArr = [...this.newExpenseForm.value.expenseItems];

    // 2. filling detailsObj with form data to be send to proceedExpense method in expenses.service.ts

    detailsObj.ClientId = this.newExpenseForm.value.client;
    detailsObj.TypeId = this.newExpenseForm.value.expenseType;
    detailsObj.Description = this.newExpenseForm.value.expenseDescription;
    detailsObj.CurrencyId = this.newExpenseForm.value.currency;

    // 3. calculate Subtotals:
    totalsObj.TotalAmount = this.calcExpenseSubTotal(this.newExpenseForm.value.expenseItems);
    this.totalAmount =  totalsObj.TotalAmount;


    // 4. subscribe to: proceedExpense
    // console.log(detailsObj);
    // console.log(totalsObj);
    this.proceedExpenseObservable = this.expensesService.proceedExpense( detailsObj, totalsObj ).subscribe(data => {
      this.createdExpenseId = data.CreateExpenseResult;
    }, err => {
      // on error
      console.log(err);
      this.showNotification(15000, 'Error on creating expense','Reload', 'none' , false, 'warn');
      // Hide loader
      this.isSubmitting = false;
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      // 9. get expenseId and pass it to subscribe to: CreateExpenseItem
      // loop through items
      for (const expenseItem of this.expenseItemsArr) {
        this.createNewExpenseItemObservable = this.expensesService.createExpenseItem(expenseItem, this.createdExpenseId)
        .subscribe(result => {
          // console.log(result);
        }, err => {
          // on error
          console.log(err);
          this.showNotification(15000, 'Error on creating expense','Reload', 'none' , false, 'warn');
          // Hide loader
          this.isSubmitting = false;
        }, () => {
          // on complete
          // $('.loading-container .spinnerContainer').hide();
          this.createNewExpenseItemObservable.unsubscribe();
        });
      }
      // setTimeout( () => {
      //   // $('#submit-btn-container .loading-container').hide();
      //   this.isSubmitting = false;
      // }, 1000);
      // setTimeout( () => {
      //   this.showNotification(`New expense with ID number ${ this.createdExpenseId } has been created successfully`, `Review expense`);
      // }, 1000);
      this.isSubmitting = false;
      this.showNotification(
        15000,
        `New Expense with ID # ${ this.createdExpenseId } has been Created successfully`,
        `Review expense`, `/expenses/view/${this.createdExpenseId}`,
        true,
        'primary'
      );
      this.proceedExpenseObservable.unsubscribe();
    });

  }


  /* Retrieve Expense Items from the Form */
  get expenseItemsForms(): FormArray{
    return this.newExpenseForm.get('expenseItems') as FormArray;
  }


  /* Add Expense Items on Click Add item button */
  addExpenseItem(): void {
    const expenseItem = this.fb.group({
      itemName: ['', [Validators.required, Validators.maxLength(50)]],
      itemDescription: ['', Validators.maxLength(500)],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      vat: [0, Validators.min(0)]
    });
    this.expenseItemsForms.push(expenseItem);
    console.log(this.newExpenseForm.value.expenseItems);
    this.expenseItemsDataSource = new MatTableDataSource(this.newExpenseForm.value.expenseItems);
  }


  /* Remove expense Items on Click Remove item button */
  removeExpenseItem(i): void {
    this.expenseItemsForms.removeAt(i);
    console.log(this.newExpenseForm.value.expenseItems);
    this.expenseItemsDataSource = new MatTableDataSource(this.newExpenseForm.value.expenseItems);
  }

  // Calculating SUBTOTAL from items
  calcExpenseSubTotal(expenseItems: any[]): number{
    let calculatedValue: number = 0;
    let quantity: number = 0;
    let unitPrice: number = 0;
    let vatValue: number = 0;
    let total: number = 0;
    const subTotalArr: any[] = [];
    // looping over items to get subtotal amount
    for ( const item of expenseItems){
      quantity = item.quantity;
      unitPrice = item.unitPrice;
      vatValue = item.vat;
      total = vatValue + (quantity * unitPrice);
      subTotalArr.push(total);
    }
    calculatedValue = subTotalArr.reduce(this.getSum, 0);
    return calculatedValue;
  }

  /* Helper functions */
  // addDatepickerEvent(type: string, event: MatDatepickerInputEvent<Date>): void {
  //   this.events.push(`${type}: ${event.value}`);
  // }
  getSum(total: number, current: number): number {
    return total + current;
  }
  // showNotification(message: string, action: string): void {
  //   const snackBarRef = this.snackBar.open(message, action, {
  //     duration: 6000
  //   });
  //   // const snackBarRef = this.snackBar.open(message, action);
  //   snackBarRef.onAction().subscribe(() => {
  //     this.router.navigateByUrl(`/expenses/view/${this.createdExpenseId}`);
  //   });
  //   // snackBarRef.afterDismissed().subscribe(() => {
  //   //   this.router.navigateByUrl(`/expenses`);
  //   // });
  // }

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
