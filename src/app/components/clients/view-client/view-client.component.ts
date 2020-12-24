import { Component, OnInit } from '@angular/core';

/*Models */
import { Client } from '../../../models/clients/client.model';
/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { ClientsService } from '../../../services/clients.service';

/*Pipes */
import { DatePipe } from '@angular/common';
import { MycurrencyPipe } from '../../../pipes/custom.currency.pipe';
import { PercentPipe } from '@angular/common';

/*Router */
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

/*DECLARE $ for jquery */
declare var $;

@Component({
  selector: 'app-view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.scss']
})
export class ViewClientComponent implements OnInit {

  pageTitle: string = 'View Client';
  pageIcon: string =  'fa-user-tie';

  clientId: string;
  allDataObj: Client;

  // For loader
  isLoadingResults = false;

  constructor(
    private datePipe: DatePipe,
    private percentPipe: PercentPipe,
    private mycurrencyPipe: MycurrencyPipe,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private clientsService: ClientsService
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;

    // getting the invoice id from the route parameters map object
    this.activatedRoute.paramMap.subscribe(params => {
      this.clientId = params.get('id');
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      
    });

    // Load Details
    this.getClientDetailsFromService( this.clientId );
  }


  getClientDetailsFromService( clientId ): void{
    this.clientsService.getClientDetails( clientId ).subscribe( clientDetails => {
      console.log(clientDetails);
      this.allDataObj = clientDetails.ViewClientResult[0];
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // Hide loader
      this.isLoadingResults = false;
    });
  }
}
