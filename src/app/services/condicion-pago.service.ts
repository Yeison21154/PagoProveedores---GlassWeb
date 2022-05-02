import { Injectable, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { CondicionPago } from '../others/interfaces';
import { ApiService } from './api.service';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class CondicionPagoService {

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
  

  listar(): Observable<CondicionPago[]>{
    return this._http.get<CondicionPago[]>(`${this.apiService.api_url}/condicionpago/listar`, this.httpOptionGet)
  }

  listar_activos(): Observable<CondicionPago[]>{
    return this._http.get<CondicionPago[]>(`${this.apiService.api_url}/condicionpago/listaractivos`, this.httpOptionGet)
  }
}
