import { Directive, ElementRef, Input } from '@angular/core';
import { Usuario, Menu, Permiso } from '../others/interfaces';
import { UsuarioService } from '../services/usuario.service';

@Directive({
  selector: '[appPermisos]'
})
export class PermisosDirective {

  @Input() nombreMenu: string;
  @Input() nombrePermiso: string;

  user: Usuario = this._usuarios.getUserLoggedIn()

  constructor(
    private el: ElementRef,
    private _usuarios: UsuarioService) {

  }

  ngOnInit() {
    let lstMenus: Menu[] = this.user.Menus.filter(x => x.Nombre == this.nombreMenu);
     console.log(lstMenus);
    if (lstMenus.length > 0)
    {

      let lstPermisos: Permiso[] = this.user.Permisos.filter(x => x.Codigo == lstMenus[0].Codigo);
      if (lstPermisos.length > 0)
      {
        switch (this.nombrePermiso) {
          case "escritura":
            this.el.nativeElement.disabled = (lstPermisos[0].escritura == 1 ? false : true);
            break;
          case "lectura":
            this.el.nativeElement.disabled = (lstPermisos[0].lectura == 1 ? false : true);
            break;
          case "eliminar":
            this.el.nativeElement.disabled = (lstPermisos[0].Eliminar == 1 ? false : true);
            break;
          case "imprimir":
            this.el.nativeElement.disabled = (lstPermisos[0].Imprimir == 1 ? false : true);
            break;
          default:
            break;
        }
      }
      // console.log(lstPermisos);
    }
  }

}
