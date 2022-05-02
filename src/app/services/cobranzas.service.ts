import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Cobranzas, CuentaXCobrar, Historial, CuentaContable, DetraccionVenta, CobranzasDtl, Paginar, Paginado } from '../others/interfaces';
import { UsuarioService } from './usuario.service';


@Injectable({
  providedIn: 'root'
})
export class CobranzasService {

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

  guardar(oCobranza: Cobranzas): Observable<Cobranzas>{
    return this._http.post<Cobranzas>(`${this.apiService.api_url}/cobro/guardar`, oCobranza, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar(oPaginar: Paginar): Observable<Paginado>{
    return this._http.post<Paginado>(`${this.apiService.api_url}/cobro/listar`, oPaginar, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  obtener(codopera: string, numdoc: string): Observable<Cobranzas>{
    return this._http.get<Cobranzas>(`${this.apiService.api_url}/cobro/obtener/` + codopera + `/` + numdoc, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar_detalle(oCobranza: Cobranzas): Observable<CobranzasDtl[]>{
    return this._http.get<CobranzasDtl[]>(`${this.apiService.api_url}/cobro/listardetalle/` + oCobranza.CodOperacion + `/` + oCobranza.NumDocumento, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar_cobro_activos(oPaginar: Paginar): Observable<Paginado>{
    return this._http.post<Paginado>(`${this.apiService.api_url}/cobro/listarcobropendiente`, oPaginar, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  eliminar(oCobranza: Cobranzas): Observable<Cobranzas>{
    return this._http.get<Cobranzas>(`${this.apiService.api_url}/cobro/eliminar/`+ oCobranza.CodOperacion + `/` + oCobranza.NumDocumento + `/` + oCobranza.CodUsuario, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  anular(oCobranza: Cobranzas): Observable<Cobranzas>{
    return this._http.get<Cobranzas>(`${this.apiService.api_url}/cobro/anular/`+ oCobranza.CodOperacion + `/` + oCobranza.NumDocumento + `/` + oCobranza.CodUsuario, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar_historial(oCobranza: Cobranzas)
  {
    return this._http.get<Historial[]>(`${this.apiService.api_url}/cobro/listarreferencia/`+ oCobranza.CodOperacion + `/` + oCobranza.NumDocumento, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar_plan_contable(oPaginar: Paginar): Observable<Paginado>{
    return this._http.post<Paginado>(`${this.apiService.api_url}/plancontable/listarcobro`, oPaginar, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar_detraccion(CodBanco: string)
  {
    return this._http.get<DetraccionVenta[]>(`${this.apiService.api_url}/detraccionventa/listarcobropendiente/`+ CodBanco, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }


  errorHandler(error: HttpErrorResponse){
    return throwError(error || "Server Error")
  }
}
