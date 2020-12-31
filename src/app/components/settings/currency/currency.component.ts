import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

/*Models */
import { Currency } from '../../../models/common/currency.model';
/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { CurrencyService } from '../../../services/currency.service';
import { MatSnackBar } from '@angular/material/snack-bar';

/*Pipes */
import { MycurrencyPipe } from '../../../pipes/custom.currency.pipe';

/*Router */
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

/* Datatable */
import { MatTableDataSource } from '@angular/material/table';

/* Components */
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../utils/delete-dialog/delete-dialog.component';
import { CustomSnackbarComponent } from '../../utils/custom-snackbar/custom-snackbar.component';
import { fromEvent, Observable } from 'rxjs';

/*DECLARE $ for jquery */
declare var $;

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnInit, OnDestroy {
  // pageTitle: string = 'Currency';
  // pageIcon: string =  'fa-money-bill-alt';
  pageTitle: string = 'Settings';
  pageIcon: string = 'fa-cog';

  // For loader
  isLoadingResults = true;

  // Sticky
  isSticky = false;

  // Submit Button
  isSubmitting = false;

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  currencyForm: FormGroup;
  allDataArr: Currency[];

  displayedColumns: string[] = [ 'index', 'currency', 'egpValue', 'setAsDisabled'];
  currencyDataSource: any;
  deleteDialogRef: MatDialogRef<DeleteDialogComponent, any>;
  ///////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(
    private mycurrencyPipe: MycurrencyPipe,
    private activatedRoute: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private currencyService: CurrencyService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private matDialog: MatDialog
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
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // form
   this.currencyForm = this.fb.group({
    currencyItems: this.fb.array([], Validators.required)
  });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this.fillAllDD();

    // Load Details
    this.currencyService.getCurrencies().subscribe( currenciesData => {
      console.log(currenciesData.ViewAllCurrencyResult);
      // 1. filling invoiceItemsArr with my invoice items
      this.allDataArr = [...currenciesData.ViewAllCurrencyResult];
      // this.allDataArr.forEach((currency) => {
      //   console.log(currency);
      //   this.addCurrencyItem(currency);
      // });
      for ( let i = 0; i < this.allDataArr.length; i++ ) {
        this.addCurrencyItem(this.allDataArr[i]);
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
  }// end onInit


  ngOnDestroy(): void{
    this.snackBar.dismiss();
  }


  onSubmitHandler(): void{
    this.isSubmitting = true;
    const currencyDataArray = this.currencyForm.value.currencyItems;
    for(let i = 0; i < currencyDataArray.length; i++){
      const currencyObj = {
        id: this.allDataArr[i].CurrencyId,
        egpValue: currencyDataArray[i].egpValue ? currencyDataArray[i].egpValue : 1,
        disabled: currencyDataArray[i].setAsDisabled
      }
      this.currencyService.editCurrency(currencyObj).subscribe( response => {
        console.log(response);
      }, err => {
        console.log(err);
      },() => {
        //on complete
        this.isSubmitting = false;
        this.showNotification(
          5000,
          `Changes Saved`,
          `Refresh`, `none`,
          false,
          'primary'
        );
        setTimeout(() => {
          this.router.navigateByUrl(`/settings/currency`)
        }, 5000)
      });
    }
  }


  /* Retrieve Invoice Items from the Form */
  get currencyItemsForms(): FormArray{
    return this.currencyForm.get('currencyItems') as FormArray;
  }


  /* Add Existing Invoice Items */
  addCurrencyItem(item): void {
    const currencyItem = this.fb.group({
      id: [item.CurrencyId],
      name: item.Name,
      egpValue: [ item.Name ==="'EGP'" || item.Name ==="EGP" ? {value: item.ValueByEGP, disabled: true} : item.ValueByEGP, [Validators.min(0)]],
      // setAsDefault: [item.Default],
      setAsDisabled: [item.Disable]
    });
    this.currencyItemsForms.push(currencyItem);
    console.log(this.currencyForm.value.currencyItems);
    this.currencyDataSource = new MatTableDataSource(this.currencyForm.value.currencyItems);
  }


  /* Helper functions */
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
