import { Component, OnInit } from '@angular/core';

/*Models */
import { Invoice } from '../../../models/invoices/invoice.model';
/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { InvoicesService } from '../../../services/invoices.service';

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



/*DECLARE $ for jquery */
declare var $;

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.scss']
})
export class ViewInvoiceComponent implements OnInit {
  pageTitle: string = 'View Invoice';
  pageIcon: string =  'fa-file-invoice-dollar';

  invoiceId: string;
  allDataObj: Invoice;
  displayedColumns: string[] = [ 'id', 'name', 'comments', 'unitPrice', 'quantity', 'total' ];
  itemsDataSource: any;
  isOverdue: boolean = false;
  isCollected: boolean = false;

  // For loader
  isLoadingResults = false;

  constructor(
    private datePipe: DatePipe,
    private percentPipe: PercentPipe,
    private mycurrencyPipe: MycurrencyPipe,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private invoicesService: InvoicesService
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;

    // getting the invoice id from the route parameters map object
    this.activatedRoute.paramMap.subscribe(params => {
      this.invoiceId = params.get('id');
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      
    });

    // Load Details
    this.getInvoiceDetailsFromService( this.invoiceId );
  }


  getInvoiceDetailsFromService( invoiceId ): void{
    this.invoicesService.getInvoiceDetails( invoiceId ).subscribe( invoiceDetails => {
      console.log(invoiceDetails);
      this.allDataObj = invoiceDetails.ViewInvoiceByIdResult[0];
      const formatedCreationDate = this.allDataObj.CreationDate !== null ?
                                   this.allDataObj.CreationDate.replace('/Date(', '').replace('+0000)/', '') : '--';
      const formatedDueDate = this.allDataObj.DueDate !== null ?
                              this.allDataObj.DueDate.replace('/Date(', '').replace('+0000)/', '') : '--';
      this.allDataObj.CreationDate = this.datePipe.transform(formatedCreationDate, 'MMM d, y, h:mm a');
      this.allDataObj.DueDate = this.datePipe.transform(formatedDueDate, 'MMM d, y, h:mm a');
      this.allDataObj.taxRate = this.allDataObj.taxRate / 100;
      // checking if due date is expired
      new Date(this.allDataObj.DueDate) < new Date() ? this.isOverdue = true : this.isOverdue = false;
      // checking if collected
      this.allDataObj.status === 'Collected' ? this.isCollected = true : this.isCollected = false;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // Hide loader
      this.isLoadingResults = false;
      // Assign the data to the data source for the table to render
      this.itemsDataSource = new MatTableDataSource(this.allDataObj.InvoiceItem);
    });
  }

}
