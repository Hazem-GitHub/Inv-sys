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
import { CurrencyService } from '../../../services/currency.service';
import { ExpenseItem } from 'src/app/models/expenses/expense-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';

/*Pipes */
import { DatePipe } from '@angular/common';
import { MycurrencyPipe } from '../../../pipes/custom.currency.pipe';
import { PercentPipe } from '@angular/common';

/*Router */
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

/* Datatable */
import { MatTableDataSource } from '@angular/material/table';

/* Components */
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../utils/delete-dialog/delete-dialog.component';
import { CustomSnackbarComponent } from '../../utils/custom-snackbar/custom-snackbar.component';
import { analyzeAndValidateNgModules } from '@angular/compiler';

/*DECLARE $ for jquery */
declare var $;


@Component({
  selector: 'app-edit-expense',
  templateUrl: './edit-expense.component.html',
  styleUrls: ['./edit-expense.component.scss']
})
export class EditExpenseComponent implements OnInit, OnDestroy {

  pageTitle: string = 'Edit Expense';
  pageIcon: string =  'fa-dollar-sign';

  expenseId: number;

  // For loader
  isLoadingResults = true;
  isCalculatingResults = true;

  // Submit Button
  isSubmitting = false;

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // events: string[] = [];

  editExpenseForm: FormGroup;

  currentDate: Date = new Date();

  clientsList: ClientShort[];
  currencyList: Currency[];
  currentCurrencyValue: string;

  totalAmount: number;
  subTotalAmount: number;

  expenseItemsArr: any[];
  ExpensesTypesList: ExpenseType[];
  selectedExpenseTypeId: number;
  selectedExpenseTypeValue: string;

  allDataArr: Expense[];
  allDataObj: Expense;

  oldItemsArr: ExpenseItem[];
  newItemsArr: ExpenseItem[];

  displayedColumns: string[] = [ 'index', 'id', 'name', 'comments', 'unitPrice', 'quantity', 'vatAmounts', 'actions'];
  expenseItemsDataSource: any;

  routerParamsObservable: any;

  clientsListObservable: any;
  currencyListObservable: any;
  expenseTypeListObservable: any;

  currencyObservable: any;
  expenseDetailsObservable: any;
  valueChangesOnInitObservable: any;
  editExpenseObservable: any;
  editOldExpenseItemObservable: any;
  createNewExpenseItemObservable: any;

  deleteDialogRef: MatDialogRef<DeleteDialogComponent, any>;

  constructor(
    private datePipe: DatePipe,
    private percentPipe: PercentPipe,
    private mycurrencyPipe: MycurrencyPipe,
    private activatedRoute: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private clientsService: ClientsService,
    private currencyService: CurrencyService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private expensesService: ExpensesService,
    private matDialog: MatDialog
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;

    // getting the expense id from the route parameters map object
    this.routerParamsObservable = this.activatedRoute.paramMap.subscribe(params => {
      this.expenseId = Number(params.get('id'));
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // form
    this.editExpenseForm = this.fb.group({
      expenseType: ['', Validators.required],
      client: ['', Validators.required],
      expenseDescription: ['', Validators.maxLength(500)],
      currency: ['', Validators.required],
      expenseItems: this.fb.array([], Validators.required)
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.fillAllDD();


    // Load Details
    // this.getExpenseDetailsFromService(this.expenseId);

    this.expenseDetailsObservable = this.expensesService.getExpenseDetails( this.expenseId ).subscribe( expenseDetails => {
      this.allDataArr = [...expenseDetails.ViewExpenseByIdResult];
      this.allDataObj = this.allDataArr[0];
      // console.log(this.allDataObj);
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      this.editExpenseForm.controls.expenseType.setValue(this.allDataObj.typeId);
      this.editExpenseForm.controls.client.setValue(this.allDataObj.clientId);
      this.editExpenseForm.controls.expenseDescription.setValue(this.allDataObj.Description);
      this.editExpenseForm.controls.currency.setValue(this.allDataObj.currencyId);
      // console.log(this.editExpenseForm.controls);
      // Create Items
      for ( const item of this.allDataObj.ExpenseItem ) {
        this.addExistingExpenseItem(item);
      }

      this.isCalculatingResults = true;
      this.subTotalAmount = this.calcExpenseSubTotal(this.editExpenseForm.value.expenseItems);
      this.totalAmount = this.subTotalAmount;

      this.currencyObservable = this.currencyService.getCurrency(this.editExpenseForm.value.currency).subscribe(data => {
        this.currentCurrencyValue = data.ViewCurrencyResult[0].Name;
      }, err => {
        // on error
        console.log(err);
      }, () => {
        // on complete
        // $('.loading-container .spinnerContainer').hide();
        this.isCalculatingResults = false;
        this.currencyObservable.unsubscribe();
      });
      this.expenseDetailsObservable.unsubscribe();
    });
    // Listen to form changes
    this.valueChangesOnInitObservable = this.editExpenseForm.valueChanges.subscribe(formData => {
      // console.log(formData);
      if ( this.editExpenseForm.value.expenseItems.length > 0 ) {
        this.isCalculatingResults = true;
        // console.log(this.editExpenseForm.value.expenseItems);

        this.subTotalAmount = this.calcExpenseSubTotal(this.editExpenseForm.value.expenseItems);
        this.totalAmount = this.subTotalAmount;

        this.currencyObservable = this.currencyService.getCurrency(this.editExpenseForm.value.currency).subscribe(data => {
          this.currentCurrencyValue = data.ViewCurrencyResult[0].Name;
        }, err => {
          // on error
          console.log(err);
        }, () => {
          // on complete
          // $('.loading-container .spinnerContainer').hide();
          this.isCalculatingResults = false;
          // Hide loader
          this.isLoadingResults = false;
          this.currencyObservable.unsubscribe();
        });
      }
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      this.valueChangesOnInitObservable.unsubscribe();
    });
  }// End onInit

  ngOnDestroy(): void{
    this.snackBar.dismiss();
    this.routerParamsObservable.unsubscribe();
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
      // this.defaultCurrencyArrayElement = this.currencyList.filter( currency => {
      //   if ( currency.SetAsDefault === true ){
      //     return currency.CurrencyId;
      //   }
      // });
      // this.defaultCurrencyId = this.defaultCurrencyArrayElement[0].CurrencyId;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      this.currencyListObservable.unsubscribe();
    });


    // get expense types list
    this.expenseTypeListObservable = this.expensesService.getExpensesTypes().subscribe(data => {
      // $('.loading-container .spinnerContainer').show();
      // console.log(data.GetStatuResult);
      this.ExpensesTypesList = data.GetExpenseTypeResult;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      this.expenseTypeListObservable.unsubscribe();
    });
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /* Handlers */
  onSubmitHandler(): void {
    // $('#submit-btn-container .loading-container').show();
    this.isSubmitting = true;
    const detailsObj = {
      ExpenseId: 0,
      ExpenseTypeId: 0,
      ClientId: 0,
      Description: '',
      CurrencyId: 0,
    };

    const totalsObj = {
      TotalAmount: 0,
    };
    // 1. filling expenseItemsArr with my expense items
    this.expenseItemsArr = [...this.editExpenseForm.value.expenseItems];

    // 2. filling detailsObj with form data to be send to proceedExpense method in expenses.service.ts

    detailsObj.ExpenseId =  this.expenseId;
    detailsObj.ExpenseTypeId = this.editExpenseForm.value.expenseType;
    detailsObj.ClientId = this.editExpenseForm.value.client;
    detailsObj.Description = this.editExpenseForm.value.expenseDescription;
    detailsObj.CurrencyId = this.editExpenseForm.value.currency;

    // totalsObj.PaidAmount = this.editExpenseForm.value.paidAmount;
    // 3. calculate Subtotals:
    this.subTotalAmount = this.calcExpenseSubTotal(this.editExpenseForm.value.expenseItems);
    totalsObj.TotalAmount = this.subTotalAmount;
    this.totalAmount = totalsObj.TotalAmount;
    // console.log(detailsObj, totalsObj);

    this.editExpenseObservable = this.expensesService.editExpense( detailsObj, totalsObj ).subscribe(data => {
      // console.log(data.EditExpenseResult);
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      // 9. get expenseId and pass it to subscribe to: createExpenseItem
      // loop through items to store Each item into array if new or old
      this.oldItemsArr = [];
      this.newItemsArr = [];
      for ( const expenseItem of this.expenseItemsArr ) {
        if ( expenseItem.id ) {
          this.oldItemsArr.push( expenseItem );
          continue;
        }else {
          this.newItemsArr.push( expenseItem );
          continue;
        }
      }
      
      // Edit old items
      // console.log('Old items array', this.oldItemsArr);
      if (this.oldItemsArr.length > 0) {
        for ( const oldExpenseItem of this.oldItemsArr ) {
          this.editOldExpenseItemObservable = this.expensesService.editExpenseItem(oldExpenseItem)
          .subscribe(result => {
            // console.log('Edited Expense item result', result);
          }, err => {
            // on error
            console.log(err);
          }, () => {
            // on complete
            // $('.loading-container .spinnerContainer').hide();
            this.editOldExpenseItemObservable.unsubscribe();
          });
        }
      }
      // Create new items
      // console.log('New items array', this.newItemsArr);
      if (this.newItemsArr.length > 0) {
        for ( const newExpenseItem of this.newItemsArr ) {
          this.createNewExpenseItemObservable = this.expensesService.createExpenseItem(newExpenseItem, this.expenseId)
          .subscribe(result => {
            // console.log('created Expense item result', result);
          }, err => {
            // on error
            console.log(err);
          }, () => {
            // on complete
            // $('.loading-container .spinnerContainer').hide();
            this.createNewExpenseItemObservable.unsubscribe();
          });
        }
      }
      // setTimeout( () => {
      //   // $('#submit-btn-container .loading-container').hide();
      //   this.isSubmitting = false;
      // }, 1000);
      // setTimeout( () => {
      //   this.showNotification(`Expense with ID number ${ this.expenseId } has been Edited successfully`, `Review expense`);
      // }, 1000);
      this.isSubmitting = false;
      this.showNotification(
        15000,
        `Expense with ID # ${ this.expenseId } has been Edited successfully`,
        `Review expense`, `/expenses/view/${this.expenseId}`,
        true,
        'primary'
      );
      this.editExpenseObservable.unsubscribe();
    });

  }// end onSubmitHandler



  /* Retrieve Expense Items from the Form */
  get expenseItemsForms(): FormArray{
    return this.editExpenseForm.get('expenseItems') as FormArray;
  }


  /* Add Existing Expense Items */
  addExistingExpenseItem(item): void {
    // console.log(item);
    const expenseItem = this.fb.group({
      id: [item.id],
      itemName: [item.itemName, [Validators.required, Validators.maxLength(50)]],
      itemDescription: [item.itemDescription, Validators.maxLength(500)],
      unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]],
      vat: [item.vat, Validators.min(0)]
    });
    this.expenseItemsForms.push(expenseItem);
    console.log(this.editExpenseForm.value.expenseItems);
    this.expenseItemsDataSource = new MatTableDataSource(this.editExpenseForm.value.expenseItems);
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
    console.log(this.editExpenseForm.value.expenseItems);
    this.expenseItemsDataSource = new MatTableDataSource(this.editExpenseForm.value.expenseItems);
  }


  /* Remove Existing Expense Items on Click Remove item button */
  removeExistingExpenseItem(i: number, itemId?: number): void {
    // Delete Item from Expense Items using its id
    this.openDeleteDialog(itemId);
    this.deleteDialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        this.expenseItemsForms.removeAt(i);
        console.log(this.editExpenseForm.value.expenseItems);
      this.expenseItemsDataSource = new MatTableDataSource(this.editExpenseForm.value.expenseItems);
      }
    });
  }
  /* Remove Existing Expense Items on Click Remove item button */
  removeExpenseItem(i: number): void {
    this.expenseItemsForms.removeAt(i);
    console.log(this.editExpenseForm.value.expenseItems);
    this.expenseItemsDataSource = new MatTableDataSource(this.editExpenseForm.value.expenseItems);
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
  //     this.router.navigateByUrl(`/expenses/view/${this.expenseId}`);
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

  openDeleteDialog(expenseItemId): void{
    // Open dialog
    const dialogRef = this.matDialog.open(DeleteDialogComponent, {
      data: {
        id: expenseItemId,
        type: 'expense-item'
      },
      disableClose: true,
      id: `deleteExpenseItemDialog${expenseItemId}`,
      ariaDescribedBy: `deleteExpenseItemDialog${expenseItemId}`,
      ariaLabel: `deleteExpenseItemDialog${expenseItemId}`,
      ariaLabelledBy: `deleteExpenseItemDialog${expenseItemId}`,
      autoFocus: true
    });
    this.deleteDialogRef = dialogRef;
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}

