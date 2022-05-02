import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Banco } from '../others/interfaces';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class BancoService {

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

  listar_activos(codCajero: string): Observable<Banco[]>{
    return this._http.get<Banco[]>(`${this.apiService.api_url}/banco/listarcobranzaactivos/` + codCajero, this.httpOptionGet)
  }

  listar(): Observable<Banco[]>{
    return this._http.get<Banco[]>(`${this.apiService.api_url}/banco/listaractivos`, this.httpOptionGet)
  }

  listar_banco_origen(codCajero: string): Observable<Banco[]>{
    return this._http.get<Banco[]>(`${this.apiService.api_url}/banco/listartransferenciavaleactivos/` + codCajero, this.httpOptionGet)
  }
}
