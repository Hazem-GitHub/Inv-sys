import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '../models/clients/client.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private http: HttpClient) { }
  // Get Clients List and get all clients
  getClients( serviceQuery?: string ): Observable<any> {
    let endpoint: string;
    if ( serviceQuery === 'list'){
      endpoint = `http://invoices.5d-agency.com/service1.svc/GetClient?`;
    }else{
      endpoint = `http://invoices.5d-agency.com/service1.svc/ViewAllClient?`;
    }
    return this.http.get<any>(endpoint);
  }
  // Get client types list
  getClientTypes(): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/GetClientType?`;
    return this.http.get<any>(endpoint);
  }
  getClientDetails(clientId: number): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/ViewClient?clientId=${ clientId }`;
    return this.http.get<any>(endpoint);
  }
  // Create New Client
  proceedClient(detailsObj: any): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/CreateClient?Name=${ detailsObj.Name}&Address=${detailsObj.Address }&Email=${ detailsObj.Email}&Phone=${detailsObj.Phone }&Fax=${ detailsObj.Fax}&Website=${detailsObj.Website }&TypeId=${detailsObj.TypeId }`;
    return this.http.get<any>(endpoint);
  }
  // Edit Client
  editClient(detailsObj: any, clientId: number): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/EditClient?ClientId=${ clientId }&Name=${ detailsObj.Name}&Address=${detailsObj.Address }&Email=${ detailsObj.Email}&Phone=${detailsObj.Phone }&Fax=${ detailsObj.Fax}&Website=${detailsObj.Website }&TypeId=${detailsObj.TypeId }`;
    return this.http.get<any>(endpoint);
  }
  // Delete Client
  deleteClient(clientId: number): Observable<any>{
    const endpoint = `http://invoices.5d-agency.com/service1.svc/DeleteClient?ClientId=${ clientId }`;
    return this.http.get<any>(endpoint);
  }
}
