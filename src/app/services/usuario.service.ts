import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { TokenGW, Usuario, Cajero, Parametro, Sucursal, DocumentoBat } from '../others/interfaces';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Token } from '@angular/compiler/src/ml_parser/lexer';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private esLogeado;
  public oUsuarioLogeado :Usuario;
  public oSucursalLogueado : Sucursal;

  public oToken : TokenGW ={
    CodUsuario : "",
    CodigoSucursal : "",
    Usuario : "",
    Fecha : new Date(),
    Ip : "",
    Key : "",
    Sitio : ""
  }

  constructor(private _http: HttpClient,
    private apiService: ApiService) {
      this.esLogeado = false;
     }

    sToken : string = this.getTokenJson();

    httpOptionPost = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'tokenGW': this.sToken,
      })
    }

    httpOptionGet = {
      params : new HttpParams().append('tokenGW', this.sToken)
    }

    login(nombreUsuario: string, contra: string): Observable<Usuario>{
      let user = {
        usuario: nombreUsuario,
        clave: contra
      }
      console.log("this.httpOptionPost 1:");
      console.log(this.httpOptionPost);
      return this._http.post<Usuario>(`${this.apiService.api_url}/usuario/login`, user, this.httpOptionPost)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    obtenerParametro(periodo: number){
      this.sToken = this.getTokenJson();

      this.httpOptionGet = {
        params : new HttpParams().append('tokenGW', this.sToken)
      }

      console.log("this.httpOptionGet 2:");
      console.log(this.httpOptionGet);
      return this._http.get<Parametro>(`${this.apiService.api_url}/parametro/obtener/` + periodo, this.httpOptionGet)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    obtenerDocumentosBat(oSucursal: Sucursal)
    {
      this.sToken = this.getTokenJson();
      this.httpOptionGet = {
        params : new HttpParams().append('tokenGW', this.sToken)
      }
      console.log(this.httpOptionGet);
      return this._http.get<DocumentoBat[]>(`${this.apiService.api_url}/documento/cargardocumentosbat/` + oSucursal.CodigoSucursal, this.httpOptionGet)
      .pipe(
        catchError(this.errorHandler)
      )

    }

    setUserLoggedIn(user: Usuario) {
      this.esLogeado = true;
      this.oUsuarioLogeado = user;
      localStorage.setItem('UsuarioActual', JSON.stringify(user));

    }

    isUserLoggedIn()
    {
      return this.esLogeado;
    }

    getUserLoggedIn() {
      return JSON.parse(localStorage.getItem('UsuarioActual'));
    }

    // setCajero(oCajero: Cajero) {
    //   localStorage.setItem('CajeroActual', JSON.stringify(oCajero));
    // }

    // getCajero() {
    //   return JSON.parse(localStorage.getItem('CajeroActual'));
    // }

    setParametro(oParametro: Parametro) {
      localStorage.setItem('Parametro', JSON.stringify(oParametro));
    }

    getParametro() {
      return JSON.parse(localStorage.getItem('Parametro'));
    }

    setDocumentosBat(oDocumentoBat: DocumentoBat[]) {
      localStorage.setItem('DocumentoBat', JSON.stringify(oDocumentoBat));
    }

    getDocumentosBat() {
      return JSON.parse(localStorage.getItem('DocumentoBat'));
    }

    setSucursal(oSucursal: Sucursal)
    {
      localStorage.setItem('Sucursal', JSON.stringify(oSucursal));
    }

    getSucursal() {
      return JSON.parse(localStorage.getItem('Sucursal'));
    }

    getTokenJson(){
      this.oUsuarioLogeado = this.getUserLoggedIn();
      this.oSucursalLogueado = this.getSucursal();

      if (this.oUsuarioLogeado != null){
        this.oToken.CodUsuario = this.oUsuarioLogeado.CodUsuario;
        this.oToken.Usuario = this.oUsuarioLogeado.Usuario;
      }

      if (this.oSucursalLogueado != null)
        this.oToken.CodigoSucursal = this.oSucursalLogueado.CodigoSucursal;

      this.oToken.Fecha = new Date();
      this.oToken.Key = "";
      this.oToken.Ip = "";
      // this.oToken.Sitio = location.origin;
      this.oToken.Sitio = "";
      return JSON.stringify(this.oToken);
    }

    getToken(){
      this.oUsuarioLogeado = this.getUserLoggedIn();
      this.oSucursalLogueado = this.getSucursal();

      if (this.oUsuarioLogeado != null){
        this.oToken.CodUsuario = this.oUsuarioLogeado.CodUsuario;
        this.oToken.Usuario = this.oUsuarioLogeado.Usuario;
      }

      if (this.oSucursalLogueado != null)
        this.oToken.CodigoSucursal = this.oSucursalLogueado.CodigoSucursal;

      this.oToken.Fecha = new Date();
      this.oToken.Key = "";
      this.oToken.Ip = "";
      // this.oToken.Sitio = location.origin;
      this.oToken.Sitio = "";
      return this.oToken;
    }




    errorHandler(error: HttpErrorResponse){
      return throwError(error || "Server Error")
    }
}
