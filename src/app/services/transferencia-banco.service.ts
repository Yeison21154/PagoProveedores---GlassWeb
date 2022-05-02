import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { TransferenciaBanco, TransferenciaBancoDtl, Historial, Paginado, Paginar } from '../others/interfaces';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class TransferenciaBancoService {

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

  
  listar(oPaginar: Paginar): Observable<Paginado>{
    return this._http.post<Paginado>(`${this.apiService.api_url}/transferenciabancovale/listar`, oPaginar, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar_detalle(oTransferenciaBanco: TransferenciaBanco): Observable<TransferenciaBancoDtl[]>{
    return this._http.get<TransferenciaBancoDtl[]>(`${this.apiService.api_url}/transferenciabancovale/listardetalle/` + oTransferenciaBanco.coddocumento + `/` + oTransferenciaBanco.numdocumento, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar_historial(oTransferenciaBanco: TransferenciaBanco)
  {
    return this._http.get<Historial[]>(`${this.apiService.api_url}/transferenciabancovale/listarreferencia/`+ oTransferenciaBanco.coddocumento + `/` + oTransferenciaBanco.numdocumento, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  guardar(oTransferenciaBanco: TransferenciaBanco): Observable<TransferenciaBanco>{
    return this._http.post<TransferenciaBanco>(`${this.apiService.api_url}/transferenciabancovale/guardar`, oTransferenciaBanco, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  obtener(coddocumento: string, numdoc: string): Observable<TransferenciaBanco>{
    return this._http.get<TransferenciaBanco>(`${this.apiService.api_url}/transferenciabancovale/obtener/` + coddocumento + `/` + numdoc, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  eliminar(oTransferenciaBanco: TransferenciaBanco): Observable<TransferenciaBanco>{
    return this._http.get<TransferenciaBanco>(`${this.apiService.api_url}/transferenciabancovale/eliminar/`+ oTransferenciaBanco.coddocumento + `/` + oTransferenciaBanco.numdocumento + `/` + oTransferenciaBanco.codusuario, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }
  
  revisar(oTransferenciaBanco: TransferenciaBanco): Observable<TransferenciaBanco>{
    let body = new HttpParams();
    body = body.set('coddocumento', oTransferenciaBanco.coddocumento);
    body = body.set('numdocumento', oTransferenciaBanco.numdocumento);
    body = body.set('fecrecibido', oTransferenciaBanco.fecrecibido);
    body = body.set('codusuario', oTransferenciaBanco.codusuario);
    body = body.set('tokenGW', this.sToken);
    
    let httpOption2 = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'tokenGW': this.sToken
      }),
      params: body
    }
  
    return this._http.post<TransferenciaBanco>(`${this.apiService.api_url}/transferenciabancovale/revisar`, '', httpOption2)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  quitar_revisado(oTransferenciaBanco: TransferenciaBanco): Observable<TransferenciaBanco>{
    let body = new HttpParams();
    body = body.set('coddocumento', oTransferenciaBanco.coddocumento);
    body = body.set('numdocumento', oTransferenciaBanco.numdocumento);
    body = body.set('fecrecibido', oTransferenciaBanco.fecrecibido);
    body = body.set('codusuario', oTransferenciaBanco.codusuario);
    body = body.set('tokenGW', this.sToken);

    let httpOption2 = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'tokenGW': this.sToken
      }),
      params: body
    }
    return this._http.post<TransferenciaBanco>(`${this.apiService.api_url}/transferenciabancovale/quitarrevisado`, '', httpOption2)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  anular(oTransferenciaBanco: TransferenciaBanco): Observable<TransferenciaBanco>{
    let body = new HttpParams();
    body = body.set('coddocumento', oTransferenciaBanco.coddocumento);
    body = body.set('numdocumento', oTransferenciaBanco.numdocumento);
    body = body.set('codsucursal', oTransferenciaBanco.codsucursal);
    body = body.set('codusuario', oTransferenciaBanco.codusuario);
    body = body.set('tokenGW', this.sToken);
    
    let httpOption2 = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'tokenGW': this.sToken
      }),
      params: body
    }
    return this._http.post<TransferenciaBanco>(`${this.apiService.api_url}/transferenciabancovale/anular`, '', httpOption2)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  errorHandler(error: HttpErrorResponse){
    return throwError(error || "Server Error")
  }
}
