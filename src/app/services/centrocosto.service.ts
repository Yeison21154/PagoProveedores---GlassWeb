import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { CentroCosto } from '../others/interfaces';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class CentrocostoService {

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
  
  listar_activos(): Observable<CentroCosto[]>{
    return this._http.get<CentroCosto[]>(`${this.apiService.api_url}/centrocosto/listaractivos`, this.httpOptionGet)
  }
}
