import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Status } from '../models/common/status.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(private http: HttpClient) { }

  getStatus( ): Observable<any> {
    const endpoint: string = `/api/GetStatu?`;
    return this.http.get<any>(endpoint);
  }
}
