import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as _moment from 'moment';

const moment =  _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

/*Models */
import { Expense, ExpenseType } from '../../../models/expenses/expense.model';
import { Invoice } from '../../../models/invoices/invoice.model';
import { Currency } from '../../../models/common/currency.model';
import { Status } from '../../../models/common/status.model';
import { Tax } from '../../../models/invoices/tax.model';
import { ClientShort } from '../../../models/clients/client.short.model';
/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { InvoicesService } from '../../../services/invoices.service';
import { ExpensesService } from '../../../services/expenses.service';
import { ClientsService } from '../../../services/clients.service';
import { CurrencyService } from '../../../services/currency.service';
import { StatusService } from '../../../services/status.service';
import { TaxRateService } from '../../../services/tax-rate.service';
import { InvoiceItem } from 'src/app/models/invoices/invoice-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';

/*Router */
import { Router } from '@angular/router';
import { CustomSnackbarComponent } from '../../utils/custom-snackbar/custom-snackbar.component';
import { MatTableDataSource } from '@angular/material/table';
import { fromEvent } from 'rxjs';



/*DECLARE $ for jquery */
declare var $;


@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})

export class CreateInvoiceComponent implements OnInit, OnDestroy {
  pageTitle: string = 'New invoice';
  pageIcon: string =  'fa-file-invoice-dollar';

  // Loader
  isCalculatingResults = true;
  
  isLoadingResults = true;

  // Submit Button
  isSubmitting = false;

  // events: string[] = [];

  newInvoiceForm: FormGroup;

  currentDate: Date = new Date();
  lastIssuedDate: Date;
  minDueDate: Date;

  clientsList: ClientShort[];
  currencyList: Currency[];
  defaultCurrencyArrayElement: Currency[];
  defaultCurrencyId: number;
  currentCurrencyValue: string;

  statusList: Status[];
  selectedStatusId: number;

  taxRateList: Tax[];
  defaultTaxRateArrayElement: Tax[];
  defaultTaxRateId: number;
  isTaxed: boolean = false;
  subTotalAmount: number;
  taxRateValue: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  taxName: string;

  displayedColumns: string[] = [ 'index', 'name', 'comments', 'unitPrice', 'quantity', 'actions'];
  invoiceItemsDataSource: any;


  clientsListObservable: any;
  currencyListObservable: any;
  statusListObservable: any;
  taxRateListObservable: any;
  taxRateObservable: any;
  valueChangesOnInitObservable: any;
  createNewInvoiceItemObservable: any;
  proceedInvoiceObservable: any;

  invoiceItemsArr: any[];
  createdInvoiceId: number;

  // sticky
  isSticky = false;

  // Expenses

  isCalculatingExpenseResults = false;

  includeExpenses: boolean = false;

  newExpenseForm: FormGroup;

  ExpensesTypesList: ExpenseType[];
  selectedExpenseTypeId: number;
  selectedExpenseTypeValue: string;

  totalExpenseAmount: number;

  expenseItemsArr: any[];
  createdExpenseId: number;

  displayedExpenseColumns: string[] = [ 'index', 'name', 'comments', 'unitPrice', 'quantity', 'vatAmounts', 'actions'];
  expenseItemsDataSource: any;

  expenseTypeList: any;
  currencyObservable: any;
  valueChangesExpensesOnInitObservable: any;
  proceedExpenseObservable: any;
  createNewExpenseItemObservable: any;

  constructor(
    private pageTitleService: PageTitleService,
    private invoicesService: InvoicesService,
    private expensesService: ExpensesService,
    private clientsService: ClientsService,
    private currencyService: CurrencyService,
    private statusService: StatusService,
    private taxRateService: TaxRateService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }


  ngOnInit(): void {

    this.invoicesService.getLastIssuedDate().subscribe((lastIssued) => {
      this.lastIssuedDate = lastIssued;
    }, (err) => {
      // on error
      console.log(err);
    }, () => {

    });

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

    // form
    this.newInvoiceForm = this.fb.group({
      createDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      client: ['', Validators.required],
      projectName: ['', [Validators.required, Validators.maxLength(50)]],
      projectDescription: ['', Validators.maxLength(500)],
      paymentMethod: ['', Validators.required],
      currency: ['', Validators.required],
      status: ['', Validators.required],
      taxes: ['', Validators.required],
      taxRate: [''],
      paidAmount: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(this.totalAmount)
        ]
      ],
      invoiceItems: this.fb.array([], Validators.required)
    });

    this.fillAllDD();

    this.valueChangesOnInitObservable = this.newInvoiceForm.valueChanges.subscribe(formData => {
      // console.log(formData);
      
      if ( this.newInvoiceForm.value.invoiceItems.length > 0 && this.newInvoiceForm.value.currency ) {
        this.isCalculatingResults = true;
        this.subTotalAmount = this.calcInvoiceSubTotal(formData.invoiceItems);
        if ( this.newInvoiceForm.value.taxRate ) {
          // if(this.newInvoiceForm.value.taxRate) {}
          this.taxRateObservable = this.taxRateService.getTaxRate(this.newInvoiceForm.value.taxRate).subscribe( data => {
          this.taxRateValue = data.ViewTaxResult[0].TaxRate;
          this.taxName = data.ViewTaxResult[0].TaxName;
          }, err => {
            // on error
            console.log(err);
          }, () => {
            // on complete
            if ( this.newInvoiceForm.value.taxes ) {
              this.totalAmount = this.subTotalAmount * ( 1 + ( this.taxRateValue / 100 ));
              this.isTaxed = true;
            }else{
              this.totalAmount = this.subTotalAmount;
              this.isTaxed = false;
            }
            this.paidAmount = formData.paidAmount;
            this.dueAmount = this.totalAmount - this.paidAmount;
  
            this.newInvoiceForm.controls.paidAmount.setValidators([
              Validators.required,
              Validators.min(0),
              Validators.max(this.totalAmount)
            ]);
            // in order to take effect
            this.newInvoiceForm.controls.paidAmount.updateValueAndValidity({onlySelf: true, emitEvent: false});
            this.newInvoiceForm.updateValueAndValidity({onlySelf: true, emitEvent: false});
            if (this.newInvoiceForm.value.currency) {
              console.log(this.newInvoiceForm.value.currency);
              this.currencyService.getCurrency(this.newInvoiceForm.value.currency).subscribe(data => {
                this.currentCurrencyValue = data.ViewCurrencyResult[0].Name;
              }, err => {
                // on error
                console.log(err);
              }, () => {
                // on complete
                // $('.loading-container .spinnerContainer').hide();
                this.isCalculatingResults = false;
              });
            }
          });
        }else{
          this.totalAmount = this.subTotalAmount;
          this.isTaxed = false;
          this.paidAmount = formData.paidAmount;
          this.dueAmount = this.totalAmount - this.paidAmount;
  
          this.newInvoiceForm.controls.paidAmount.setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(this.totalAmount)
          ]);
          // in order to take effect
          this.newInvoiceForm.controls.paidAmount.updateValueAndValidity({onlySelf: true, emitEvent: false});
          this.newInvoiceForm.updateValueAndValidity({onlySelf: true, emitEvent: false});
          console.log(this.newInvoiceForm.value.currency);
          if (this.newInvoiceForm.value.currency) {
            this.currencyService.getCurrency(this.newInvoiceForm.value.currency).subscribe(data => {
              this.currentCurrencyValue = data.ViewCurrencyResult[0].Name;
            }, err => {
              // on error
              console.log(err);
            }, () => {
              // on complete
              // $('.loading-container .spinnerContainer').hide();
              this.isCalculatingResults = false;
            });
          }
          
        }
      }
      
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      this.valueChangesOnInitObservable.unsubscribe();
    });
    // Add one invoice item by default
    this.addInvoiceItem();
    this.isLoadingResults = false;
    this.invoiceItemsDataSource = new MatTableDataSource(this.newInvoiceForm.value.invoiceItems);



    // Expenses
    // form
    this.newExpenseForm = this.fb.group({
      expenseType: ['', Validators.required],
      // client: ['', Validators.required],
      expenseDescription: ['', Validators.maxLength(500)],
      // currency: ['', Validators.required],
      expenseItems: this.fb.array([], Validators.required)
    });

    this.valueChangesExpensesOnInitObservable = this.newExpenseForm.valueChanges.subscribe(formData => {
      // console.log(formData);
      
      if ( this.newExpenseForm.value.expenseItems.length > 0 && this.newInvoiceForm.value.currency ) {
        this.isCalculatingExpenseResults = true;
        this.totalExpenseAmount = this.calcExpenseSubTotal(formData.expenseItems);
        this.currencyObservable = this.currencyService.getCurrency(this.newInvoiceForm.value.currency).subscribe(data => {
          this.currentCurrencyValue = data.ViewCurrencyResult[0].Name;
        }, err => {
          // on error
          console.log(err);
        }, () => {
          // on complete
          // $('.loading-container .spinnerContainer').hide();
          this.isCalculatingExpenseResults = false;
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
      this.valueChangesExpensesOnInitObservable.unsubscribe();
    });
    // console.log(this.newExpenseForm.valid);
    // Add one invoice item by default
    this.addExpenseItem();


  }// End of OnInit

  ngOnDestroy(): void{
    this.snackBar.dismiss();
  }

  // Initialize reactive form groups

  // fill dropdowns with data (Taxes, Currency, Status, Client)
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


    // get status list
    this.statusListObservable = this.statusService.getStatus().subscribe(data => {
      // $('.loading-container .spinnerContainer').show();
      // console.log(data.GetStatuResult);
      this.statusList = data.GetStatuResult;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      this.selectedStatusId = 2;
      this.statusListObservable.unsubscribe();
    });


    // get tax rate list
    this.taxRateListObservable = this.taxRateService.getTaxRates().subscribe(data => {
      // $('.loading-container .spinnerContainer').show();
      this.taxRateList = data.ViewAllTaxResult;
      this.defaultTaxRateArrayElement = this.taxRateList.filter( taxRate => {
        if ( taxRate.SetAsDefault === true ){
          return taxRate.TaxId;
        }
      });
      this.defaultTaxRateId = this.defaultTaxRateArrayElement[0].TaxId;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      this.taxRateListObservable.unsubscribe();
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
      CreateDate: '',
      DueDate: '',
      ClientId: 0,
      ProjectName: '',
      Description: '',
      PaymentMethodId: 0,
      CurrencyId: 0,
      StatusId: 0,
      Taxed: false,
      TaxId: 0
    };

    const totalsObj = {
      TotalAmount: 0,
      PaidAmount: 0,
      DueAmount: 0,
      SubTotal: 0,
    };

    
    // 1. filling invoiceItemsArr with my invoice items
    this.invoiceItemsArr = [...this.newInvoiceForm.value.invoiceItems];
    

    // 2. filling detailsObj with form data to be send to proceedInvoice method in invoices.service.ts

    detailsObj.CreateDate =  moment(this.newInvoiceForm.value.createDate).format('MM/DD/YYYY');
    detailsObj.DueDate =  moment(this.newInvoiceForm.value.dueDate).format('MM/DD/YYYY');
    detailsObj.ClientId = this.newInvoiceForm.value.client;
    detailsObj.ProjectName = this.newInvoiceForm.value.projectName;
    detailsObj.Description = this.newInvoiceForm.value.projectDescription;
    detailsObj.PaymentMethodId = this.newInvoiceForm.value.paymentMethod;
    detailsObj.CurrencyId = this.newInvoiceForm.value.currency;
    detailsObj.StatusId = this.newInvoiceForm.value.status;
    detailsObj.Taxed = this.newInvoiceForm.value.taxes;
    detailsObj.TaxId = this.newInvoiceForm.value.taxRate || 0;

 

    // totalsObj.PaidAmount = this.newInvoiceForm.value.paidAmount;

    // 3. calculate Subtotals:
    totalsObj.SubTotal = this.calcInvoiceSubTotal(this.newInvoiceForm.value.invoiceItems);
    totalsObj.SubTotal = totalsObj.SubTotal;
    this.subTotalAmount = totalsObj.SubTotal;
    

    // 4. subscribe to: getTaxRate VALUE
    this.taxRateObservable = this.taxRateService.getTaxRate(detailsObj.TaxId).subscribe( data => {
      this.taxRateValue = data.ViewTaxResult[0].TaxRate;
      this.taxName = data.ViewTaxResult[0].TaxName;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // 5. calculate Totals: (if NOT taxed) => total = subtotal; OR (if taxed) => total = (1 + (tax percentage value / 100)) * subtotal;
      if ( this.newInvoiceForm.value.taxes ) {
        totalsObj.TotalAmount =  ( 1 + ( this.taxRateValue / 100 ) ) * totalsObj.SubTotal;
      }else{
        totalsObj.TotalAmount =  totalsObj.SubTotal;
      }
      this.totalAmount = totalsObj.TotalAmount;
      // // 7. Paid amout should be a field on the form therefor it won't be calculated it will be set by the user
      totalsObj.PaidAmount = this.newInvoiceForm.value.paidAmount;
      // 6. calculate Due: due = total;
      totalsObj.DueAmount = totalsObj.TotalAmount - totalsObj.PaidAmount;
      // // 6. calculate Due: due = total - paid;
      // totalsObj.DueAmount = totalsObj.TotalAmount - totalsObj.PaidAmount;
      // 7. calculate Paid: Paid = total - due;
      // totalsObj.PaidAmount = totalsObj.TotalAmount - totalsObj.DueAmount;
      // 8. subscribe to: proceedInvoice
      // console.log(detailsObj);
      // console.log(totalsObj);
      this.proceedInvoiceObservable = this.invoicesService.proceedInvoice( detailsObj, totalsObj ).subscribe(data => {
        this.createdInvoiceId = data.CreateInvoiceResult;
      }, err => {
        // on error
        console.log(err);
        this.showNotification(15000, 'Error on creating invoice','Reload', 'none' , false, 'warn');
        // Hide loader
        this.isSubmitting = false;
      }, () => {
        // on complete
        // $('.loading-container .spinnerContainer').hide();
        // get invoiceId and pass it to subscribe to: createInvoiceItem
        // loop through items
        for (const invoiceItem of this.invoiceItemsArr) {
          const createNewInvoiceItemObservable = this.invoicesService.createInvoiceItem(invoiceItem, this.createdInvoiceId)
          .subscribe(result => {
            // console.log(result);
          }, err => {
            // on error
            console.log(err);
            this.createNewInvoiceItemObservable.unsubscribe();
            this.showNotification(15000, 'Error on creating invoice','Reload', 'none' , false, 'warn');
            // Hide loader
            this.isSubmitting = false;
          }, () => {
            // on complete
            // $('.loading-container .spinnerContainer').hide();
            this.createNewInvoiceItemObservable.unsubscribe();
          });
        }

        // subscribe to: proceedExpense
        // console.log(detailsObj);
        // console.log(totalsObj);
        if (this.includeExpenses) {

          const detailsExpensesObj = {
            InvoiceId: this.createdInvoiceId,
            ClientId: 0,
            TypeId: 0,
            Description: '',
            CurrencyId: 0
          };
      
          const totalsExpensesObj = {
            TotalAmount: 0,
          };
          // filling expenseItemsArr with my expense items
          this.expenseItemsArr = [...this.newExpenseForm.value.expenseItems];
          // filling detailsObj with form data to be send to proceedExpense method in expenses.service.ts
      
          detailsExpensesObj.ClientId = this.newInvoiceForm.value.client;
          detailsExpensesObj.TypeId = this.newExpenseForm.value.expenseType;
          detailsExpensesObj.Description = this.newExpenseForm.value.expenseDescription;
          detailsExpensesObj.CurrencyId = this.newInvoiceForm.value.currency;
          // calculate Subtotals:
          totalsExpensesObj.TotalAmount = this.calcExpenseSubTotal(this.newExpenseForm.value.expenseItems);
          this.totalExpenseAmount =  totalsExpensesObj.TotalAmount;


          this.proceedExpenseObservable = this.expensesService.proceedExpense( detailsExpensesObj, totalsExpensesObj ).subscribe(data => {
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
            
            
            // get expenseId and pass it to subscribe to: CreateExpenseItem
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
  
            this.isSubmitting = false;
            this.showNotification(
              15000,
              `New invoice with ID # ${ this.createdInvoiceId } has been Created successfully`,
              `Review invoice`, `/invoices/view/${this.createdInvoiceId}`,
              true,
              'primary'
            );
            this.proceedExpenseObservable.unsubscribe();
            this.proceedInvoiceObservable.unsubscribe();
            
          });
        }else{
          this.isSubmitting = false;
          this.showNotification(
            15000,
            `New invoice with ID # ${ this.createdInvoiceId } has been Created successfully`,
            `Review invoice`, `/invoices/view/${this.createdInvoiceId}`,
            true,
            'primary'
          );
          this.proceedInvoiceObservable.unsubscribe();
        }
        
        
      });
      this.taxRateObservable.unsubscribe();
    });

  }


  /* Retrieve Invoice Items from the Form */
  get invoiceItemsForms(): FormArray{
    return this.newInvoiceForm.get('invoiceItems') as FormArray;
  }

  /* Retrieve Expense Items from the Form */
  get expenseItemsForms(): FormArray{
    return this.newExpenseForm.get('expenseItems') as FormArray;
  }


  /* Add Invoice Items on Click Add item button */
  addInvoiceItem(): void {
    const invoiceItem = this.fb.group({
      itemName: ['', [Validators.required, Validators.maxLength(50)]],
      itemDescription: ['', Validators.maxLength(500)],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.invoiceItemsForms.push(invoiceItem);
    this.invoiceItemsDataSource = new MatTableDataSource(this.newInvoiceForm.value.invoiceItems);
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


  /* Remove Invoice Items on Click Remove item button */
  removeInvoiceItem(i): void {
    this.invoiceItemsForms.removeAt(i);
    this.invoiceItemsDataSource = new MatTableDataSource(this.newInvoiceForm.value.invoiceItems);
  }

  /* Remove expense Items on Click Remove item button */
  removeExpenseItem(i): void {
    this.expenseItemsForms.removeAt(i);
    console.log(this.newExpenseForm.value.expenseItems);
    this.expenseItemsDataSource = new MatTableDataSource(this.newExpenseForm.value.expenseItems);
  }

  // Calculating SUBTOTAL from items
  calcInvoiceSubTotal(invoiceItems: any[]): number{
    let calculatedValue: number = 0;
    let quantity: number = 0;
    let unitPrice: number = 0;
    let total: number = 0;
    const subTotalArr: any[] = [];
    // looping over items to get subtotal amount
    for ( const item of invoiceItems){
      quantity = item.quantity;
      unitPrice = item.unitPrice;
      total = quantity * unitPrice;
      subTotalArr.push(total);
    }
    calculatedValue = subTotalArr.reduce(this.getSum, 0);
    return calculatedValue;
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


  expensesIncluded() {
    this.includeExpenses = !this.includeExpenses;
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
  //     this.router.navigateByUrl(`/invoices/view/${this.createdInvoiceId}`);
  //   });
  //   // snackBarRef.afterDismissed().subscribe(() => {
  //   //   this.router.navigateByUrl(`/invoices`);
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
