import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

/*Models */
import { Client } from '../../../models/clients/client.model';

/*Services */
import { PageTitleService } from '../../../services/page-title.service';
import { ClientsService } from '../../../services/clients.service';
import { MatSnackBar } from '@angular/material/snack-bar';

/*Router */
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';



/*DECLARE $ for jquery */
declare var $;


@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss']
})

export class EditClientComponent implements OnInit {
  pageTitle: string = 'Edit client';
  pageIcon: string =  'fa-user-tie';

  clientId: number;

  // For loader
  isLoadingResults = true;

  // Submit Button
  isSubmitting = false;

  // events: string[] = [];

  editClientForm: FormGroup;
  clientTypesList: any[];
  selectedType: number;

  allDataArr: Client[];
  allDataObj: Client;


  constructor(
    private pageTitleService: PageTitleService,
    private clientsService: ClientsService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }


  ngOnInit(): void {
    // $('#submit-btn-container .loading-container').hide();
    // $('#totalsSpinner').hide();
    this.isLoadingResults = true;

    // getting the expense id from the route parameters map object
    const routerParamsObservable = this.activatedRoute.paramMap.subscribe(params => {
      this.clientId = Number(params.get('id'));
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      routerParamsObservable.unsubscribe();
    });

    // form
    this.editClientForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      address: ['', Validators.maxLength(200)],
      email: ['', Validators.email],
      phone: ['', [Validators.required, Validators.pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)]],
      fax: ['', Validators.pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)],
      website: ['', Validators.maxLength(200)],
      typeId: ['', Validators.required]
    });

    // Get client types list
    const clientTypeObservbale = this.clientsService.getClientTypes().subscribe(data => {
      this.clientTypesList = data.GetClientTypeResult;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      clientTypeObservbale.unsubscribe();
    });



    // Load Details
    const clientDetailsObservable = this.clientsService.getClientDetails( this.clientId ).subscribe( clientDetails => {
      this.allDataArr = [...clientDetails.ViewClientResult];
      this.allDataObj = this.allDataArr[0];
      console.log(this.allDataObj);
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      this.editClientForm.controls.name.setValue(this.allDataObj.Name);
      this.editClientForm.controls.address.setValue(this.allDataObj.Address);
      this.editClientForm.controls.email.setValue(this.allDataObj.Email);
      this.editClientForm.controls.phone.setValue(this.allDataObj.Phone);
      this.editClientForm.controls.website.setValue(this.allDataObj.Website);
      this.editClientForm.controls.typeId.setValue(this.allDataObj.ClientTypeId);
      console.log(this.editClientForm.controls);

      clientDetailsObservable.unsubscribe();
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

    detailsObj.Name = this.editClientForm.value.name;
    detailsObj.Address = this.editClientForm.value.address;
    detailsObj.Email = this.editClientForm.value.email;
    detailsObj.Phone = this.editClientForm.value.phone;
    detailsObj.Fax = this.editClientForm.value.fax;
    detailsObj.Website = this.editClientForm.value.website;
    detailsObj.TypeId = this.editClientForm.value.typeId;
    console.log(detailsObj);

    this.clientsService.editClient( detailsObj, this.clientId ).subscribe(data => {
      this.clientId = data.CreateClientResult;
    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // $('.loading-container .spinnerContainer').hide();
      // loop through items
      setTimeout( () => {
        this.isSubmitting = false;
      }, 1000);
      setTimeout( () => {
        this.showNotification(`Client with ID number ${ this.clientId } has been Edited successfully`, `Review client`);
      }, 1000);
    });

  }

   /* Helper functions */

   showNotification(message: string, action: string): void {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 6000
    });
    // const snackBarRef = this.snackBar.open(message, action);
    snackBarRef.onAction().subscribe(() => {
      this.router.navigateByUrl(`/clients/view/${this.clientId}`);
    });
    // snackBarRef.afterDismissed().subscribe(() => {
    //   this.router.navigateByUrl(`/invoices`);
    // });
  }

}

