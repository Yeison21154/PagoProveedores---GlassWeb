import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { Usuario, Menu, Permiso } from 'src/app/others/interfaces';
declare var CargarMetisMenu;
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private _usuarios: UsuarioService,
    private router: Router) { }
  @ViewChild('MenuCompras', {static: true, read: ElementRef}) menuCompra;
  @ViewChild('MenuCT', {static: true, read: ElementRef}) menuCT;
  @ViewChild('MenuCobranzas', {static: true, read: ElementRef}) menuCobranza;
  @ViewChild('MenuCobranzasNuevo', {static: true, read: ElementRef}) menuCobranzaNuevo;
  @ViewChild('MenuTransferencia', {static: true, read: ElementRef}) menuTransferencia;
  @ViewChild('menuProveedor', {static: true, read: ElementRef}) menuProveedor;

  user = this._usuarios.getUserLoggedIn();
  NombreMobile:string = 'GW'
  ngOnInit() {

    console.log(this.menuCompra)

    CargarMetisMenu();
    let oUsuario:Usuario = this.user;
    let nombres = oUsuario.Nombres.split(' ')
    if (nombres.length == 2)
    {
      this.NombreMobile = '';
      nombres.forEach(i => {
        this.NombreMobile += (i != '' ? i.substr(0, 1).toUpperCase() : '');
      });
    }

    //MENU COMPRA
    let EsValidoCompra = this.ValidarMenu("mnucompradirecta")
    this.menuCompra.nativeElement.style.display = (EsValidoCompra ? 'block' : 'none')

    //COBRANZAS
    let EsValidoCobranza = this.ValidarMenu("mnuIngCobClientes")
    let EsValidoCobranzaEscritura = this.ValidarMenuEscritura("mnuIngCobClientes")

    if (EsValidoCobranzaEscritura)
    {
      this.menuCobranzaNuevo.nativeElement.style.display = (EsValidoCobranzaEscritura ? 'block' : 'none')
      this.menuCobranza.nativeElement.style.display =   'none'
    }
    else
    {
      this.menuCobranzaNuevo.nativeElement.style.display =   'none'
      this.menuCobranza.nativeElement.style.display = (EsValidoCobranza ? 'block' : 'none')
    }

    //MENU PROVEEDOR -programado por - YA
    let esValidoMenuProveedor = this.ValidarMenu("mnupagoproveedores");
    this.menuProveedor.nativeElement.style.display = (esValidoMenuProveedor ? 'block' : 'none');


    //TRANSFERENCIAS BANCOS
    let EsValidoTransferecia = this.ValidarMenu("mnuTranferenciaBanco")
    this.menuTransferencia.nativeElement.style.display = (EsValidoTransferecia ? 'block' : 'none')

    //CABECERA COBRANZAS Y TRANSFERENCIAS
    this.menuCT.nativeElement.style.display = (EsValidoTransferecia || EsValidoCobranza ? 'block' : 'none')
  }

  ValidarMenu(nombreMenu: string)
  {
    let EsValido = false;
    let lstMenus: Menu[] = this.user.Menus.filter(x => x.Nombre == nombreMenu);
    if (lstMenus.length > 0)
    {

      let lstPermisos: Permiso[] = this.user.Permisos.filter(x => x.Codigo == lstMenus[0].Codigo);
      if (lstPermisos.length > 0)
      {
        EsValido = (lstPermisos[0].acceso == 1 ? true : false);
      }
      // console.log(lstPermisos);
    }
    return EsValido;
  }

  ValidarMenuEscritura(nombreMenu: string)
  {
    let EsValido = false;
    let lstMenus: Menu[] = this.user.Menus.filter(x => x.Nombre == nombreMenu);
    if (lstMenus.length > 0)
    {

      let lstPermisos: Permiso[] = this.user.Permisos.filter(x => x.Codigo == lstMenus[0].Codigo);
      if (lstPermisos.length > 0)
      {
        EsValido = (lstPermisos[0].escritura == 1 ? true : false);
      }
      // console.log(lstPermisos);
    }
    return EsValido;
  }

  CerrarSesion()
  {
    this._usuarios.setUserLoggedIn(null);
    this._usuarios.setParametro(null);
    this._usuarios.setSucursal(null);
    this.router.navigateByUrl('/login');

  }

}
