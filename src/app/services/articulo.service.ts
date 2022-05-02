import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable, throwError, of } from 'rxjs';
import { Articulo, Paginar, Paginado } from '../others/interfaces';
import { catchError, retry } from 'rxjs/operators';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class ArticuloService {

  constructor(private _http: HttpClient, 
    private apiService: ApiService, private _usuarios: UsuarioService) { }

  sToken : string = this._usuarios.getTokenJson();

  httpOptionPost = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'tokenGW': this.sToken,
    })
  }

  httpOptionGet = {
    params : new HttpParams().append('tokenGW', this.sToken)
  }

  listar_activos(oPaginar: Paginar): Observable<Paginado>{
    return this._http.post<Paginado>(`${this.apiService.api_url}/articulo/listarcompraactivos`, oPaginar, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  errorHandler(error: HttpErrorResponse){
    return throwError(error || "Server Error")
  }
}
