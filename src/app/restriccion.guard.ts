import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from './services/usuario.service';
import { HomeComponent } from './glass-web/home/home/home.component';
import { Menu, Permiso, Usuario } from './others/interfaces';

@Injectable({
  providedIn: 'root'
})
export class RestriccionGuard implements CanActivateChild {
  /**
   *
   */
  constructor(private router: Router,
    private _usuarios: UsuarioService
    ) {
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let oUser = this._usuarios.getUserLoggedIn();
    
    if (oUser != null && oUser != undefined) {
      console.log(state.url)
      if(state.url != '/GlassWeb/seleccion-sucursal')
      {
        let oSucursal = this._usuarios.getSucursal();
        if (oSucursal != null && oSucursal != undefined)
        {
          if(state.url.indexOf('compras')>0)
          {
            let EsValido = this.ValidarMenu("mnucompradirecta", oUser)
            return (EsValido ? true : this.router.parseUrl('/not-found'))
          }
          if(state.url.indexOf('cobranzas')>0)
          {
            let EsValido = this.ValidarMenu("mnuIngCobClientes", oUser)
            return (EsValido ? true : this.router.parseUrl('/not-found'))
          }
          if(state.url.indexOf('transferencia')>0)
          {
            let EsValido = this.ValidarMenu("mnuTranferenciaBanco", oUser)
            return (EsValido ? true : this.router.parseUrl('/not-found'))
          }
          return true;
        }
        else
        {
          return this.router.parseUrl('/GlassWeb/seleccion-sucursal');
        }
      }
      else
        return true;

      
      
    } else {
      return this.router.parseUrl('/login');
    }
      
      
  }



  ValidarMenu(nombreMenu: string, oUser: Usuario)
  {
    let EsValido = false;
    let lstMenus: Menu[] = oUser.Menus.filter(x => x.Nombre == nombreMenu);
    if (lstMenus.length > 0)
    {
      
      let lstPermisos: Permiso[] = oUser.Permisos.filter(x => x.Codigo == lstMenus[0].Codigo);
      if (lstPermisos.length > 0)
      {
        EsValido = (lstPermisos[0].acceso == 1 ? true : false);
      }
      // console.log(lstPermisos);
    }
    return EsValido;
  }
  
}
