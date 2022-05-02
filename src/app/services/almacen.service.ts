import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Almacen } from '../others/interfaces';
import { UsuarioService } from 'src/app/services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {

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

  listar(): Observable<Almacen[]>{
    return this._http.get<Almacen[]>(`${this.apiService.api_url}/almacen/listar`, this.httpOptionGet)
  }
  listar_activos(codSucursal: string): Observable<Almacen[]>{
    return this._http.get<Almacen[]>(`${this.apiService.api_url}/almacen/listaractivos/` + codSucursal, this.httpOptionGet)
  }
}
