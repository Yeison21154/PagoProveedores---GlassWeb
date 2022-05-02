import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { Sucursal } from 'src/app/others/interfaces';

@Component({
  selector: 'app-menu-header',
  templateUrl: './menu-header.component.html',
  styleUrls: ['./menu-header.component.css']
})
export class MenuHeaderComponent implements OnInit {

  constructor(private _usuarios: UsuarioService,
    private router: Router) { }

    
    oSesionSurcursal:  Sucursal = {
      CodigoSucursal: '',
      Descsucursal: '',
      Direccion: undefined,
      Tarea: undefined,
      Estado: undefined
    }

  user = this._usuarios.getUserLoggedIn();
  sucursal1 = this._usuarios.getSucursal();
  
 

  ngOnInit() {
    //alert('hol');
    if (this.sucursal1 != null)
    {
      this.oSesionSurcursal.Descsucursal = this.sucursal1.Descsucursal;
    }
  }

  CerrarSesion()
  {
    this._usuarios.setUserLoggedIn(null);
    this._usuarios.setParametro(null);
    this._usuarios.setSucursal(null);
    this.router.navigateByUrl('/login');

  }

}
