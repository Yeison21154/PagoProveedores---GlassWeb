import { ChequeEmitido, ObtenerDocumentoPago, proveedorT } from './../others/interfaces';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable, throwError, of } from 'rxjs';
import { Proveedor, Paginar, Paginado, cuentaDetalle, ResDetalle } from '../others/interfaces';
import { catchError, retry } from 'rxjs/operators';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

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
    return this._http.post<Paginado>(`${this.apiService.api_url}/proveedor/listaractivos`, oPaginar, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  listarProveedorPendiente(oPaginar: Paginar):Observable<Paginado>{
    return this._http.post<Paginado>(`${this.apiService.api_url}/Proveedor/ListarProveedor`,oPaginar,this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }
  ListarDetalle(detalle:cuentaDetalle):Observable<ResDetalle[]>{
    return this._http.get<ResDetalle[]>(`${this.apiService.api_url}/Proveedor/listardetalle/${detalle.CodDocDet}/${detalle.numDocDet}`,this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    );
  }
  ObtenerPagarDet(detalle:cuentaDetalle):Observable<ResDetalle>{
    return this._http.get<ResDetalle>(`${this.apiService.api_url}/Proveedor/obtener/${detalle.CodDocDet}/${detalle.numDocDet}`,this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }
  eliminar(oProveedor: cuentaDetalle): Observable<cuentaDetalle>{
    return this._http.get<cuentaDetalle>(`${this.apiService.api_url}/Proveedor/eliminar/`+ oProveedor.CodDocDet + `/` + oProveedor.numDocDet, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }
  anular(oProveedor:proveedorT): Observable<proveedorT>{
    return this._http.get<proveedorT>(`${this.apiService.api_url}/Proveedor/anular/`+ oProveedor.CodDocDet + `/` + oProveedor.numDocDet, this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }
  ListarChequeEmitido(codBanco:string):Observable<ChequeEmitido[]>{
    return this._http.get<ChequeEmitido[]>(`${this.apiService.api_url}/cheque/listarcheque/${codBanco}`,this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }
  listar_Pagos_pendiente(oPaginar: Paginar): Observable<Paginado>{
    return this._http.post<Paginado>(`${this.apiService.api_url}/proveedor/listarPagopendiente`, oPaginar, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }
  guardar(oProveedor: proveedorT): Observable<proveedorT>{
    return this._http.post<proveedorT>(`${this.apiService.api_url}/Proveedor/guardar`, oProveedor, this.httpOptionPost)
    .pipe(
      catchError(this.errorHandler)
    )
  }
  ObtenerDocumento(codDet:string): Observable<proveedorT>{
    return this._http.get<proveedorT>(`${this.apiService.api_url}/Proveedor/obtenerDocumento/${codDet}`,this.httpOptionGet)
    .pipe(
      catchError(this.errorHandler)
    )
  }
  errorHandler(error: HttpErrorResponse){
    return throwError(error || "Server Error")
  }
}
