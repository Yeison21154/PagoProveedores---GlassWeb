import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Sucursal, Usuario } from '../others/interfaces';
import { ApiService } from './api.service';
import { UsuarioService } from 'src/app/services/usuario.service';
//import { Sucursal, DocumentoBat, Usuario } from 'src/app/others/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {

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

    
  listar_activos(): Observable<Sucursal[]>{
    return this._http.get<Sucursal[]>(`${this.apiService.api_url}/sucursal/listaractivos`, this.httpOptionGet)
  }

  listar_usuarios_activos(codsuario: string): Observable<Sucursal[]>{
    return this._http.get<Sucursal[]>(`${this.apiService.api_url}/sucursal/listarusuariosactivos/` + codsuario, this.httpOptionGet)
  }
}
