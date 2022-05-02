import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { ApiService } from './api.service';
import { Documento } from '../others/interfaces';
import { Observable } from 'rxjs';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

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


  listar_activos(codSucursal): Observable<Documento[]>{
    return this._http.get<Documento[]>(`${this.apiService.api_url}/documento/listarcompradirectaactivos/`+ codSucursal, this.httpOptionGet)
  }

  listar_cobranzas_activos(codSucursal): Observable<Documento[]>{
    return this._http.get<Documento[]>(`${this.apiService.api_url}/documento/listarcobranzaactivos/`+ codSucursal, this.httpOptionGet)
  }

  listar(): Observable<Documento[]>{
    return this._http.get<Documento[]>(`${this.apiService.api_url}/documento/listar`, this.httpOptionGet)
  }

  listar_transferencia_banco_activos(codSucursal): Observable<Documento[]>{
    return this._http.get<Documento[]>(`${this.apiService.api_url}/documento/listartransferenciabancoactivos/`+ codSucursal, this.httpOptionGet)
  }

  listar_transferencia_banco(): Observable<Documento[]>{
    return this._http.get<Documento[]>(`${this.apiService.api_url}/documento/listartransferenciabanco`, this.httpOptionGet)
  }
  BuscarPorCodigo(codDocumento): Observable<Documento>{
    return this._http.get<Documento>(`${this.apiService.api_url}/documento/buscarporcodigoactivo/` + codDocumento, this.httpOptionGet)
  }

  BuscarPorCodigoAtpDiv(codDocumento, modulo): Observable<Documento>{
    return this._http.get<Documento>(`${this.apiService.api_url}/documento/buscarporcodigoactivoatpdiv/` + codDocumento  + `/` + modulo, this.httpOptionGet)
  }
  Buscarporcodigoactivopdiv(codDocumento, modulo): Observable<Documento>{
    return this._http.get<Documento>(`${this.apiService.api_url}/documento/buscarporcodigoactivopdiv/` + codDocumento  + `/` + modulo, this.httpOptionGet)
  }
  ListarProveedor(sucursal): Observable<Documento[]>{
    return this._http.get<Documento[]>(`${this.apiService.api_url}/documento/ListarOperacionProveedor/${sucursal}`,this.httpOptionGet)
  }
}
