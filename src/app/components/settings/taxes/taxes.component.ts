import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

/*Models */
import { Currency } from '../../../models/common/currency.model';
/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { TaxRateService } from '../../../services/tax-rate.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
import { Tax } from 'src/app/models/invoices/tax.model';

/*DECLARE $ for jquery */
declare var $;

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss']
})
export class TaxesComponent implements OnInit, OnDestroy {
  // pageTitle: string = 'Value Added Taxes (VAT)';
  // pageIcon: string =  'fa-receipt';
  pageTitle: string = 'Settings';
  pageIcon: string = 'fa-cog';

  // For loader
  isLoadingResults = true;
  // Submit Button
  isSubmitting = false;

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  taxForm: FormGroup;
  allDataArr: Tax[];

  displayedColumns: string[] = [ 'index', 'taxName', 'taxRate', 'setAsDefault'];
  taxDataSource: any;
  deleteDialogRef: MatDialogRef<DeleteDialogComponent, any>;
  ///////////////////////////////////////////////////////////////////////////////////////////////////

  constructor(
    private activatedRoute: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private taxRateService: TaxRateService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private matDialog: MatDialog
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
   }

  ngOnInit(): void {
    this.isLoadingResults = true;
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   // form
   this.taxForm = this.fb.group({
    taxItems: this.fb.array([], Validators.required)
  });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // this.fillAllDD();

    // Load Details
    this.taxRateService.getTaxRates().subscribe( taxesData => {
      console.log(taxesData.ViewAllTaxResult);
      // 1. filling invoiceItemsArr with my invoice items
      this.allDataArr = [...taxesData.ViewAllTaxResult];
      // this.allDataArr.forEach((tax) => {
      //   console.log(tax);
      //   this.addTaxItem(tax);
      // });
      for ( let i = 0; i < this.allDataArr.length; i++ ) {
        this.addTaxItem(this.allDataArr[i]);
      }
    }, err => {
      // on error
      console.log(err);
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
    const taxDataArray = [...this.taxForm.value.taxItems];
    console.log(taxDataArray);
    for(let i = 0; i < taxDataArray.length; i++){
      const taxObj = {
        taxId: this.allDataArr[i].TaxId,
        taxName: taxDataArray[i].taxName,
        taxRate: taxDataArray[i].taxRate,
        setAsDefault: taxDataArray[i].setAsDefault
      }
      this.taxRateService.editTaxRate(taxObj).subscribe( response => {
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
          this.router.navigateByUrl(`/settings/taxes`)
        }, 5000)
      });
    }
  }


  /* Set Default */
  setDefault(currentId) : void{
    for ( let i = 0; i < this.taxForm.value.taxItems.length; i++ ) {
      if ( this.taxForm.value.taxItems[i].taxId === currentId ) {
        this.taxForm.value.taxItems[i].setAsDefault = true;
      }else{
        this.taxForm.value.taxItems[i].setAsDefault = false;
      }
    }
    console.log(this.taxForm.value.taxItems);
    this.taxDataSource.SetAsDefault = new MatTableDataSource(this.taxForm.value.taxItems);
  }


  /* Retrieve Invoice Items from the Form */
  get taxItemsForms(): FormArray{
    return this.taxForm.get('taxItems') as FormArray;
  }


  /* Add Existing Invoice Items */
  addTaxItem(item): void {
    const taxItem = this.fb.group({
      taxId: [item.TaxId],
      taxName: [item.TaxName, [Validators.maxLength(50)]],
      taxRate: [ item.TaxRate, [Validators.min(0)]],
      setAsDefault: [item.SetAsDefault]
    });
    this.taxItemsForms.push(taxItem);
    // console.log(this.taxForm.value.taxItems);
    this.taxDataSource = new MatTableDataSource(this.taxForm.value.taxItems);
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
