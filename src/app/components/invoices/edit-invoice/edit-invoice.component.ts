import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Invoice } from '../../../models/invoices/invoice.model';
import { Currency } from '../../../models/common/currency.model';
import { Status } from '../../../models/common/status.model';
import { Tax } from '../../../models/invoices/tax.model';
import { ClientShort } from '../../../models/clients/client.short.model';
/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { InvoicesService } from '../../../services/invoices.service';
import { ClientsService } from '../../../services/clients.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { CurrencyService } from '../../../services/currency.service';
import { StatusService } from '../../../services/status.service';
import { TaxRateService } from '../../../services/tax-rate.service';
import { InvoiceItem } from 'src/app/models/invoices/invoice-item.model';
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
import { Observable } from 'rxjs';

/*DECLARE $ for jquery */
declare var $;

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class EditInvoiceComponent implements OnInit, OnDestroy {
  pageTitle: string = 'Edit Invoice';
  pageIcon: string =  'fa-file-invoice-dollar';

  invoiceId: number;

  // For loader
  isLoadingResults = true;
  isCalculatingResults = true;

  // Submit Button
  isSubmitting = false;

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // events: string[] = [];

  editInvoiceForm: FormGroup;

  currentDate: Date = new Date();
  minDueDate: Date;

  clientsList: ClientShort[];
  currencyList: Currency[];
  currentCurrencyValue: string;

  statusList: Status[];
  selectedStatusId: number;

  taxRateList: Tax[];
  isTaxed: boolean = false;
  subTotalAmount: number;
  taxRateValue: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  taxName: string;

  invoiceItemsArr: any[];

  allDataArr: Invoice[];
  allDataObj: Invoice;

  oldItemsArr: InvoiceItem[];
  newItemsArr: InvoiceItem[];

  displayedColumns: string[] = [ 'index', 'id', 'name', 'comments', 'unitPrice', 'quantity', 'actions'];
  invoiceItemsDataSource: any;

  routerParamsObservable: any;
  clientsListObservable: any;
  currencyListObservable: any;
  statusListObservable: any;
  taxListObservable: any;
  currencyObservable: any;
  taxRateObservable: any;
  invoiceDetailsObservable: any;
  valueChangesOnInitObservable: any;
  editInvoiceObservable: any;
  editOldInvoiceItemObservable: any;
  createNewInvoiceItemObservable: any;

  isOverdue: boolean = false;


  deleteDialogRef: MatDialogRef<DeleteDialogComponent, any>;
  ///////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(
    private datePipe: DatePipe,
    private percentPipe: PercentPipe,
    private mycurrencyPipe: MycurrencyPipe,
    private activatedRoute: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private clientsService: ClientsService,
    private currencyService: CurrencyService,
    private statusService: StatusService,
    private taxRateService: TaxRateService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private invoicesService: InvoicesService,
    private matDialog: MatDialog
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
   }

  ngOnInit(): void {
    this.isLoadingResults = true;

    // getting the invoice id from the route parameters map object
    this.routerParamsObservable = this.activatedRoute.paramMap.subscribe(params => {
      this.invoiceId = Number(params.get('id'));
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // form
    // this.editInvoiceForm = this.fb.group({
    //   dueDate: [this.allDataObj.DueDate, Validators.required],
    //   client: [this.allDataObj.clientId, Validators.required],
    //   projectName: [this.allDataObj.projectName, Validators.required],
    //   projectDescription: [this.allDataObj.projectDescription],
    //   paymentMethod: [this.allDataObj.paymentMethodId, Validators.required],
    //   currency: [this.allDataObj.currencyId, Validators.required],
    //   status: [this.allDataObj.statusId, Validators.required],
    //   taxes: [this.allDataObj.taxes, Validators.required],
    //   taxRate: [this.allDataObj.taxRate],
    //   invoiceItems: this.fb.array([], Validators.required)
    // });
    this.editInvoiceForm = this.fb.group({
      dueDate: ['', Validators.required],
      client: ['', Validators.required],
      projectName: ['', [Validators.required, Validators.maxLength(50)]],
      projectDescription: ['', Validators.maxLength(500)],
      paymentMethod: ['', Validators.required],
      currency: ['', Validators.required],
      status: ['', Validators.required],
      taxes: ['', Validators.required],
      taxRate: [''],
      paidAmount: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(this.totalAmount ? this.totalAmount : 0)
        ]
      ],
      invoiceItems: this.fb.array([], Validators.required)
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.fillAllDD();

    // Load Details
    // this.getInvoiceDetailsFromService(this.invoiceId);

    this.invoiceDetailsObservable = this.invoicesService.getInvoiceDetails( this.invoiceId ).subscribe( invoiceDetails => {
      this.allDataArr = [...invoiceDetails.ViewInvoiceByIdResult];
      this.allDataObj = this.allDataArr[0];
      // console.log(this.allDataObj);

      // const formatedCreationDate = this.allDataObj.CreationDate !== null ?
      //                             this.allDataObj.CreationDate.replace('/Date(', '').replace('+0000)/', '') : '--';
      const formatedDueDate = this.allDataObj.DueDate !== null ?
                              this.allDataObj.DueDate.replace('/Date(', '').replace('+0000)/', '') : '--';
      // this.allDataObj.CreationDate = this.datePipe.transform(formatedCreationDate, 'MMM d, y, h:mm a');
      this.allDataObj.DueDate = this.datePipe.transform(formatedDueDate, 'MMM d, y, h:mm a');
      // this.allDataObj.taxRate = this.allDataObj.taxRate / 100;
      this.isTaxed = this.allDataObj.taxes;
      this.selectedStatusId = this.allDataObj.statusId;
      
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      this.editInvoiceForm.controls.dueDate.setValue(new Date(this.allDataObj.DueDate));
      this.editInvoiceForm.controls.client.setValue(this.allDataObj.clientId);
      this.editInvoiceForm.controls.projectName.setValue(this.allDataObj.projectName);
      this.editInvoiceForm.controls.projectDescription.setValue(this.allDataObj.projectDescription);
      this.editInvoiceForm.controls.paymentMethod.setValue(this.allDataObj.paymentMethodId);
      this.editInvoiceForm.controls.currency.setValue(this.allDataObj.currencyId);
      this.editInvoiceForm.controls.status.setValue(this.allDataObj.statusId);
      this.editInvoiceForm.controls.taxes.setValue(this.allDataObj.taxes);
      this.editInvoiceForm.controls.taxRate.setValue(this.allDataObj.taxId);
      this.editInvoiceForm.controls.paidAmount.setValue(this.allDataObj.paidAmounts);
      // Checking if Overdue 
      new Date(this.allDataObj.DueDate) < new Date() ? this.isOverdue = true : this.isOverdue = false;
      // console.log(this.editInvoiceForm.controls);
      // Create Items
      for ( const item of this.allDataObj.InvoiceItem ) {
        this.addExistingInvoiceItem(item);
      }

      this.isCalculatingResults = true;
      this.subTotalAmount = this.calcInvoiceSubTotal(this.editInvoiceForm.value.invoiceItems);
      if ( this.editInvoiceForm.value.taxRate ) {
        // if(this.editInvoiceForm.value.taxRate) {}
        this.taxRateObservable = this.taxRateService.getTaxRate(this.editInvoiceForm.value.taxRate).subscribe( data => {
        this.taxRateValue = data.ViewTaxResult[0].TaxRate;
        this.taxName = data.ViewTaxResult[0].TaxName;
        }, err => {
          // on error
          console.log(err);
        }, () => {
          // on complete
          if ( this.editInvoiceForm.value.taxes ) {
            this.totalAmount = this.subTotalAmount * ( 1 + ( this.taxRateValue / 100 ));
            this.isTaxed = true;
          }else{
            this.totalAmount = this.subTotalAmount;
            this.isTaxed = false;
          }

          this.paidAmount = this.editInvoiceForm.value.paidAmount;
          this.dueAmount = this.totalAmount - this.paidAmount;

          this.currencyObservable = this.currencyService.getCurrency(this.editInvoiceForm.value.currency).subscribe(data => {
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
          this.taxRateObservable.unsubscribe();
        });
      }
      this.invoiceDetailsObservable.unsubscribe();
    });
    // Listen to form changes
    this.valueChangesOnInitObservable = this.editInvoiceForm.valueChanges.subscribe(formData => {
      // console.log(formData);
      this.isCalculatingResults = true;
      // console.log(this.editInvoiceForm.value.invoiceItems);
      this.subTotalAmount = this.calcInvoiceSubTotal(formData.invoiceItems);
      this.selectedStatusId = formData.status;
      if ( this.editInvoiceForm.value.taxRate ) {
        // if(this.editInvoiceForm.value.taxRate) {}
        this.taxRateObservable = this.taxRateService.getTaxRate(this.editInvoiceForm.value.taxRate).subscribe( data => {
        this.taxRateValue = data.ViewTaxResult[0].TaxRate;
        this.taxName = data.ViewTaxResult[0].TaxName;
        }, err => {
          // on error
          console.log(err);
        }, () => {
          // on complete
          if ( this.editInvoiceForm.value.taxes ) {
            this.totalAmount = this.subTotalAmount * ( 1 + ( this.taxRateValue / 100 ));
            this.isTaxed = true;
          }else{
            this.totalAmount = this.subTotalAmount;
            this.isTaxed = false;
          }
          this.paidAmount = formData.paidAmount;
          this.dueAmount = this.totalAmount - this.paidAmount;

          this.editInvoiceForm.controls.paidAmount.setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(this.totalAmount)
          ]);
          // in order to take effect
          this.editInvoiceForm.controls.paidAmount.updateValueAndValidity({onlySelf: true, emitEvent: false});
          this.editInvoiceForm.updateValueAndValidity({onlySelf: true, emitEvent: false});
          if (this.editInvoiceForm.value.currency) {
            this.currencyObservable = this.currencyService.getCurrency(this.editInvoiceForm.value.currency).subscribe(data => {
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
          
          this.taxRateObservable.unsubscribe();
        });
      }
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      this.valueChangesOnInitObservable.unsubscribe();
    });
    // console.log(this.editInvoiceForm.value.invoiceItems);
    this.invoiceItemsDataSource = new MatTableDataSource(this.editInvoiceForm.value.invoiceItems);
  }// end onInit


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
    this.taxListObservable = this.taxRateService.getTaxRates().subscribe(data => {
      // $('.loading-container .spinnerContainer').show();
      this.taxRateList = data.ViewAllTaxResult;
      // this.defaultTaxRateArrayElement = this.taxRateList.filter( taxRate => {
      //   if ( taxRate.SetAsDefault === true ){
      //     return taxRate.TaxId;
      //   }
      // });
      // this.defaultTaxRateId = this.defaultTaxRateArrayElement[0].TaxId;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      this.taxListObservable.unsubscribe();
    });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /* Handlers */
  onSubmitHandler(): void {
    // $('#submit-btn-container .loading-container').show();
    this.isSubmitting = true;
    const detailsObj = {
      InvoiceId: 0,
      DueDate: '',
      ClientId: 0,
      ProjectName: '',
      Description: '',
      PaymentMethodId: 0,
      CurrencyId: 0,
      StatusId: 0,
      Taxed: false,
      TaxId: 0,
    };

    const totalsObj = {
      TotalAmount: 0,
      PaidAmount: 0,
      DueAmount: 0,
      SubTotal: 0,
    };
    // 1. filling invoiceItemsArr with my invoice items
    this.invoiceItemsArr = [...this.editInvoiceForm.value.invoiceItems];

    // 2. filling detailsObj with form data to be send to proceedInvoice method in invoices.service.ts

    detailsObj.InvoiceId =  this.invoiceId;
    detailsObj.DueDate =  moment(this.editInvoiceForm.value.dueDate).format('MM/DD/YYYY');
    detailsObj.ClientId = this.editInvoiceForm.value.client;
    detailsObj.ProjectName = this.editInvoiceForm.value.projectName;
    detailsObj.Description = this.editInvoiceForm.value.projectDescription;
    detailsObj.PaymentMethodId = this.editInvoiceForm.value.paymentMethod;
    detailsObj.CurrencyId = this.editInvoiceForm.value.currency;
    detailsObj.StatusId = this.editInvoiceForm.value.status;
    detailsObj.Taxed = this.editInvoiceForm.value.taxes;
    detailsObj.TaxId = this.editInvoiceForm.value.taxRate || 0;

    // totalsObj.PaidAmount = this.editInvoiceForm.value.paidAmount;
    // 3. calculate Subtotals:
    totalsObj.SubTotal = this.calcInvoiceSubTotal(this.editInvoiceForm.value.invoiceItems);
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
      if ( this.editInvoiceForm.value.taxes ) {
        totalsObj.TotalAmount =  ( 1 + ( this.taxRateValue / 100 ) ) * totalsObj.SubTotal;
      }else{
        totalsObj.TotalAmount =  totalsObj.SubTotal;
      }
      this.totalAmount = totalsObj.TotalAmount;
      // // 7. Paid amout should be a field on the form therefor it won't be calculated it will be set by the user
      totalsObj.PaidAmount = this.editInvoiceForm.value.paidAmount;
      // 6. calculate Due: due = total;
      totalsObj.DueAmount = totalsObj.TotalAmount - totalsObj.PaidAmount;
      // // 6. calculate Due: due = total - paid;
      // totalsObj.DueAmount = totalsObj.TotalAmount - totalsObj.PaidAmount;
      // 7. calculate Paid: Paid = total - due;
      // totalsObj.PaidAmount = totalsObj.TotalAmount - totalsObj.DueAmount;
      // 8. subscribe to: editInvoice
      // console.log(detailsObj);
      // console.log(totalsObj);
      this.editInvoiceObservable = this.invoicesService.editInvoice( detailsObj, totalsObj ).subscribe(data => {
        // console.log(data.EditInvoiceResult);
      }, err => {
        // on error
        console.log(err);
      }, () => {
        // on complete
        // $('.loading-container .spinnerContainer').hide();
        // 9. get invoiceId and pass it to subscribe to: createInvoiceItem
        // loop through items to store Each item into array if new or old
        this.oldItemsArr = [];
        this.newItemsArr = [];
        for ( const invoiceItem of this.invoiceItemsArr ) {
          if ( invoiceItem.id ) {
            this.oldItemsArr.push( invoiceItem );
            continue;
          }else {
            this.newItemsArr.push( invoiceItem );
            continue;
          }
        }

        // Edit old items
        // console.log('Old items array', this.oldItemsArr);
        if (this.oldItemsArr.length > 0) {
          for ( const oldInvoiceItem of this.oldItemsArr ) {
            this.editOldInvoiceItemObservable = this.invoicesService.editInvoiceItem(oldInvoiceItem)
            .subscribe(result => {
              // console.log('Edited invoice item result', result);
            }, err => {
              // on error
              console.log(err);
            }, () => {
              // on complete
              // $('.loading-container .spinnerContainer').hide();
              this.editOldInvoiceItemObservable.unsubscribe();
            });
          }
        }
        // Create new items
        // console.log('New items array', this.newItemsArr);
        if (this.newItemsArr.length > 0) {
          for ( const newInvoiceItem of this.newItemsArr ) {
            this.createNewInvoiceItemObservable = this.invoicesService.createInvoiceItem(newInvoiceItem, this.invoiceId)
            .subscribe(result => {
              // console.log('created invoice item result', result);
            }, err => {
              // on error
              console.log(err);
            }, () => {
              // on complete
              // $('.loading-container .spinnerContainer').hide();
              this.createNewInvoiceItemObservable.unsubscribe();
            });
          }
        }
        this.isSubmitting = false;
        this.showNotification(
          15000,
          `Invoice with ID # ${ this.invoiceId } has been Edited successfully`,
          `Review invoice`, `/invoices/view/${this.invoiceId}`,
          true,
          'primary'
        );
        this.editInvoiceObservable.unsubscribe();
      });
      this.taxRateObservable.unsubscribe();
    });

  }// end onSubmitHandler



  /* Retrieve Invoice Items from the Form */
  get invoiceItemsForms(): FormArray{
    return this.editInvoiceForm.get('invoiceItems') as FormArray;
  }


  /* Add Existing Invoice Items */
  addExistingInvoiceItem(item): void {
    const invoiceItem = this.fb.group({
      id: [item.id],
      itemName: [item.itemName, [Validators.required, Validators.maxLength(50)]],
      itemDescription: [item.itemDescription, Validators.maxLength(500)],
      unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]]
    });
    this.invoiceItemsForms.push(invoiceItem);
    console.log(this.editInvoiceForm.value.invoiceItems);
    this.invoiceItemsDataSource = new MatTableDataSource(this.editInvoiceForm.value.invoiceItems);
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
    console.log(this.editInvoiceForm.value.invoiceItems);
    this.invoiceItemsDataSource = new MatTableDataSource(this.editInvoiceForm.value.invoiceItems);
  }


  /* Remove Existing Invoice Items on Click Remove item button */
  removeExistingInvoiceItem(i: number, itemId?: number): void {
    // Delete Item from Invoice Items using its id
    this.openDeleteDialog(itemId);
    this.deleteDialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        this.invoiceItemsForms.removeAt(i);
        console.log(this.editInvoiceForm.value.invoiceItems);
        this.invoiceItemsDataSource = new MatTableDataSource(this.editInvoiceForm.value.invoiceItems);
      }
    });
  }
  /* Remove Existing Invoice Items on Click Remove item button */
  removeInvoiceItem(i: number): void {
    this.invoiceItemsForms.removeAt(i);
    console.log(this.editInvoiceForm.value.invoiceItems);
    this.invoiceItemsDataSource = new MatTableDataSource(this.editInvoiceForm.value.invoiceItems);
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

  /* Helper functions */
  // addDatepickerEvent(type: string, event: MatDatepickerInputEvent<Date>): void {
  //   this.events.push(`${type}: ${event.value}`);
  // }
  getSum(total: number, current: number): number {
    return total + current;
  }

  // // Show notification on snackbar
  // showNotification(message: string, action: string): void {
  //   const snackBarRef = this.snackBar.open(message, action, {
  //     duration: 6000
  //   });
  //   // const snackBarRef = this.snackBar.open(message, action);
  //   snackBarRef.onAction().subscribe(() => {
  //     this.router.navigateByUrl(`/invoices/view/${this.invoiceId}`);
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


   openDeleteDialog(invoiceItemId): void{
    // Open dialog
    const dialogRef = this.matDialog.open(DeleteDialogComponent, {
      data: {
        id: invoiceItemId,
        type: 'invoice-item'
      },
      disableClose: true,
      id: `deleteInvoiceItemDialog${invoiceItemId}`,
      ariaDescribedBy: `deleteInvoiceItemDialog${invoiceItemId}`,
      ariaLabel: `deleteInvoiceItemDialog${invoiceItemId}`,
      ariaLabelledBy: `deleteInvoiceItemDialog${invoiceItemId}`,
      autoFocus: true
    });
    this.deleteDialogRef = dialogRef;
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}
