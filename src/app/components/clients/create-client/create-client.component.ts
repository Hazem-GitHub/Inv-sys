import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { ClientsService } from '../../../services/clients.service';
import { MatSnackBar } from '@angular/material/snack-bar';

/*Router */
import { Router } from '@angular/router';

import { CustomSnackbarComponent } from '../../utils/custom-snackbar/custom-snackbar.component';

import { UIkit } from '../../../../../node_modules/uikit/dist/js/uikit';

/*DECLARE $ for jquery */
declare var $;


@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})

export class CreateClientComponent implements OnInit {
  pageTitle: string = 'Create new client';
  pageIcon: string =  'fa-user-tie';

  // For loader
  isLoadingResults = true;

  // Submit Button
  isSubmitting = false;

  createdClientId: number;
  // events: string[] = [];

  newClientForm: FormGroup;
  clientTypesList: any[];
  selectedType: number;


  constructor(
    private pageTitleService: PageTitleService,
    private clientsService: ClientsService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }


  ngOnInit(): void {
    // $('#submit-btn-container .loading-container').hide();
    // $('#totalsSpinner').hide();
    this.isLoadingResults = true;


    // form
    this.newClientForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      address: ['', Validators.maxLength(200)],
      email: ['', Validators.email],
      phone: ['', [Validators.required, Validators.pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)]],
      fax: ['', Validators.pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)],
      website: ['', Validators.maxLength(200)],
      typeId: ['', Validators.required]
    });

    this.clientsService.getClientTypes().subscribe(data => {
      this.clientTypesList = data.GetClientTypeResult;
    }, err => {
      // on error
      console.log(err);
      if( err.status !== 4 ) {
        UIkit.notification({
          message: err.statusText,
          status: 'warn',
          pos: 'bottom-center',
          timeout: 5000
        });
      
      }
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
    });

    setTimeout( () => {
      this.isLoadingResults = false;
    }, 1000);
  }


  /* Handlers */
  onSubmitHandler(): void {
    this.isSubmitting = true;
    const detailsObj = {
      Name: '',
      Address: '',
      Email: '',
      Phone: '',
      Fax: '',
      Website: '',
      TypeId: 0,
    };

    // filling detailsObj with form data to be send to proceedClient method in clients.service.ts

    detailsObj.Name = this.newClientForm.value.name;
    detailsObj.Address = this.newClientForm.value.address;
    detailsObj.Email = this.newClientForm.value.email;
    detailsObj.Phone = this.newClientForm.value.phone;
    detailsObj.Fax = this.newClientForm.value.fax;
    detailsObj.Website = this.newClientForm.value.website;
    detailsObj.TypeId = this.newClientForm.value.typeId;
    console.log(detailsObj);

    this.clientsService.proceedClient( detailsObj ).subscribe(data => {
      this.createdClientId = data.CreateClientResult;
    }, err => {
      // on error
      console.log(err);
      this.showNotification(15000, 'Error on creating client','Reload', 'none' , false, 'warn');
      // Hide loader
      this.isLoadingResults = false;
    }, () => {
      // on complete
      this.isSubmitting = false;
      this.showNotification(
        15000,
        `New Client with ID # ${ this.createdClientId } has been Created successfully`,
        `Review client`, `/clients/view/${this.createdClientId}`,
        true,
        'primary'
      );
    });

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

}

