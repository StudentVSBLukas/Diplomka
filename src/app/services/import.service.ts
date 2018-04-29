import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class ImportService {

  server_url;

  constructor(private http: HttpClient) {
    this.server_url = 'assets/priklady/';
  }

  nacistPriklady(): Observable<string[]> {
    return this.http.get<string[]>(this.server_url + 'list.php');
  }

  nacistPriklad(priklad: string): Observable<any> {
    return this.http.get(this.server_url + priklad);
  }
}
