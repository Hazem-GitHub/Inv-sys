import { Component, OnInit, ViewChild } from '@angular/core';
/*Models */
import { Client } from '../../models/clients/client.model';
/*Services */
import { PageTitleService } from '../../services/page-title.service';
import { ClientsService } from '../../services/clients.service';

/* Datatable */
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

/* Components */
import {MatDialog} from '@angular/material/dialog';
import { DeleteDialogComponent } from '../utils/delete-dialog/delete-dialog.component';

/*Router */
import { Router } from '@angular/router';

/*DECLARE $ for jquery */
declare var $;

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  pageTitle: string = 'Clients';
  pageIcon: string =  'fa-user-tie';


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    displayedColumns: string[] = [ 'ClientId', 'type', 'name', 'email', 'phone', 'actions' ];
    allDataArr: Client[] = [];
    dataSource: any;

    resultsLength: number = 0;
    resultsPerPage: number = 10;
    // For loader
    isLoadingResults = false;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // dataTable: any;
  // dtOptions: DataTables.Settings = {};
  // clients: Client[];
  // @ViewChild('dataTable', {static: false}) table;

  constructor(
    private router: Router,
    private pageTitleService: PageTitleService,
    private clientsService: ClientsService,
    private matDialog: MatDialog
  ) {
    this.pageTitleService.changeTitle(this.pageTitle);
    this.pageTitleService.changeIcon(this.pageIcon);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    // Load Data
    this.getClientsFromService();
    
  }

//   getClientsFromService(): void{
//     this.clientsService.getClients().subscribe( data => {
//       // console.log(data.ViewAllClientResult);
//       this.clients = data.ViewAllClientResult;
//       this.dtOptions = {
//         data: this.clients,
//         pagingType: 'full',
//         pageLength: 10,
//         lengthChange: true,
//         lengthMenu: [ 10, 50, 100 ],
//         stateSave: false,
//         rowId: 'id',
//         ordering: true,
//         order: [[ 0, 'desc' ]],
//         columns: [
//           {
//             title: 'ID',
//             data: 'ClientId'
//           },
//           {
//             title: 'Type',
//             data: 'ClientType',
//             orderable: false
//           },
//           {
//             title: 'Name',
//             data: 'Name' 
//           },
//           {
//             title: 'Phone',
//             data: 'Phone',
//             orderable: false
//           },
//           {
//             title: 'Email',
//             data: 'Email',
//             orderable: false
//           },
//           {
//             title: 'Actions',
//             data: null ,
//             orderable: false,
//             render: ( actionsData, type, row, meta ) => {
//               // return `<a class="uk-icon-button"><i class="fas fa-ellipsis-h"></i><span uk-icon="icon: triangle-down; ratio: 1"></span></a>
//               // <div uk-dropdown uk-drop="mode: click">
//               //     <ul class="uk-iconnav">
//               //         <li><a href="/clients/view/${actionsData.ClientId}" [routerLink]="['/clients/view/${actionsData.ClientId}']" data-clientId="${actionsData.ClientId}" class='view-invoice-btn uk-text-center'><i class="far fa-eye"></i><br/>View</a></li>
//               //         <li><a href="/clients/edit/${actionsData.ClientId}" [routerLink]="['/clients/edit/${actionsData.ClientId}']" data-clientId="${actionsData.ClientId}"  class='edit-invoice-btn uk-text-center'><i class="far fa-edit"></i><br/>Edit</a></li>
//               //         <li><a href="/clients/delete/${actionsData.ClientId}" [routerLink]="['/clients/delete/${actionsData.ClientId}']" data-clientId="${actionsData.ClientId}"  class='delete-invoice-btn uk-text-center'><i class="far fa-trash-alt"></i><br/>Delete</a></li>
//               //     </ul>
//               // </div>
//               // `;
//               return `<ul class="uk-iconnav">
//               <li><a mat-raised-button href="/clients/view/${actionsData.ClientId}" [routerLink]="['/clients/view/${actionsData.ClientId}']" data-clientId="${actionsData.ClientId}" class='view-invoice-btn uk-text-center'><i class="far fa-eye"></i> View</a></li>
//               <li><a mat-raised-button href="/clients/edit/${actionsData.ClientId}" [routerLink]="['/clients/edit/${actionsData.ClientId}']" data-clientId="${actionsData.ClientId}"  class='edit-invoice-btn uk-text-center'><i class="far fa-edit"></i> Edit</a></li>
//               <li><a mat-raised-button href="/clients/delete/${actionsData.ClientId}" [routerLink]="['/clients/delete/${actionsData.ClientId}']" data-clientId="${actionsData.ClientId}"  class='delete-invoice-btn uk-text-center'><i class="far fa-trash-alt"></i> Delete</a></li>
//               </ul>`;
//             }
//           }
//         ]
//       };
//     }, err => {
//       // on error
//     }, () => {
//       // on complete
//       this.dataTable = $(this.table.nativeElement);
//       this.dataTable.DataTable(this.dtOptions);
//       $('.table-container .spinnerContainer').hide();
//     });
//   }

// }



  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getClientsFromService(): void{
    const clientsObservable = this.clientsService.getClients().subscribe( clientsData => {
      // console.log(clientsData.ViewAllClientResult);
      this.allDataArr = [...clientsData.ViewAllClientResult];
      // setting data length
      this.resultsLength = this.allDataArr.length;
      // console.log(this.allDataArr);

      // // Looping over search response items
      // for ( const item of this.allDataArr ) {
      //   const formatedCreationDate = item.CreationDate !== null ? item.CreationDate.replace('/Date(', '').replace('+0000)/', '') : '--';
      //   item.CreationDate = this.datePipe.transform(formatedCreationDate, 'MMM d, y, h:mm a');
      // }

      // Assign the data to the data source for the table to render
      this.dataSource = new MatTableDataSource(this.allDataArr);
      // Linking paginator and sorting to datatable
      if ( this.dataSource ) {
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }, 0);
      }

    }, err => {
      // on error
      console.log(err);
    }, () => {
      // on complete
      // Hide loader
      this.isLoadingResults = false;
      clientsObservable.unsubscribe();
    });
  }


  // UTILITY METHODS
  // Filtering datatable Event handler
  applyFilter(event: Event): void {
    // Getting filter element value
    const filterValue = (event.target as HTMLInputElement).value;
    // Start filtering
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.filteredData = this.allDataArr;
    // Always go to the first page while filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  openDeleteDialog(expenseId): void{
    // Open dialog
    const dialogRef = this.matDialog.open(DeleteDialogComponent, {
      data: {
        id: expenseId,
        type: 'client'
      },
      disableClose: true,
      id: `deleteClientDialog${expenseId}`,
      ariaDescribedBy: `deleteClientDialog${expenseId}`,
      ariaLabel: `deleteClientDialog${expenseId}`,
      ariaLabelledBy: `deleteClientDialog${expenseId}`,
      autoFocus: true
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
