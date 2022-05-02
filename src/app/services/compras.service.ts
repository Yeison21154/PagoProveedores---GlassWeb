import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Compras, ComprasDtl, Historial, Paginar, Paginado, Usuario } from '../others/interfaces';
import { UsuarioService } from 'src/app/services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  constructor(private _http: HttpClient,
    private apiService: ApiService, private _usuarios: UsuarioService) {
      console.log(`${this.apiService.api_url}/compra/listar`);
     }


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


  guardar(oCompra: Compras): Observable<Compras>{
    debugger;
    return this._http.post<Compras>(`${this.apiService.api_url}/compra/guardar`, oCompra, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar(oPaginar: Paginar): Observable<Paginado>{
    return this._http.post<Paginado>(`${this.apiService.api_url}/compra/listar`, oPaginar, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar_historial(oCompras: Compras)
  {
    return this._http.get<Historial[]>(`${this.apiService.api_url}/compra/listarreferencia/`+ oCompras.CodDocumento + `/` + oCompras.NumeroDoc + `/` + oCompras.CodProveedor, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  obtener(CodDocumento: string, NumeroDoc: string, CodProveedor: string): Observable<Compras>{
    return this._http.get<Compras>(`${this.apiService.api_url}/compra/obtener/` + CodDocumento +`/` + NumeroDoc +`/`+ CodProveedor, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listar_detalle(oCompras: Compras): Observable<ComprasDtl[]>{
    return this._http.get<ComprasDtl[]>(`${this.apiService.api_url}/compra/listardetalle/`+ oCompras.CodDocumento + `/` + oCompras.NumeroDoc + `/` + oCompras.CodProveedor, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  actualizar_kardex(oCompra: Compras): Observable<Compras>{
    return this._http.post<Compras>(`${this.apiService.api_url}/compra/actualizarkardex`, oCompra, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  eliminar(oCompras: Compras): Observable<ComprasDtl[]>{
    return this._http.get<ComprasDtl[]>(`${this.apiService.api_url}/compra/eliminar/`+ oCompras.CodDocumento + `/` + oCompras.NumeroDoc + `/` + oCompras.CodProveedor, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  errorHandler(error: HttpErrorResponse){
    return throwError(error || "Server Error")
  }
}
