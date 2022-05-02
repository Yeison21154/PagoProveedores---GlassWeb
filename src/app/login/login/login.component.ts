import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Usuario, Parametro } from 'src/app/others/interfaces';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
  @ViewChild("ErrorFormHtml", {static: false}) formSwalHtml: SwalComponent;
  constructor(
    private formBuilder: FormBuilder,
    private _usuarios: UsuarioService,
    private router: Router) { }
  oUsuario = {
    usuario : undefined,
    clave: undefined
  }
  

  isSubmit = false;
  EsDisableSubmit = false

  formLogin = this.formBuilder.group({
    usuario: ['', [Validators.required]],
    clave: ['', [Validators.required]]
  })

  Login(){
    this.EsDisableSubmit = true;
    if (this.formLogin.valid)
    {
      //this.ErrorPorHtml("OK");

      //let user2 = new ActiveXObject("WSCRIPT.Network");
      //console.log(user.UserName.toLowerCase());

      

      //this.ErrorPorHtml(user2.UserName.toLowerCase());

      let periodo: number = (new Date).getFullYear()
        this._usuarios.login(this.oUsuario.usuario, this.oUsuario.clave).subscribe( response => {
          let result = response
          console.log("this._usuarios.getToken 1:");
          console.log(this._usuarios.getToken());
          this._usuarios.setUserLoggedIn(result)
          console.log("this._usuarios.getToken 2:" )
          console.log(this._usuarios.getToken());

          this._usuarios.obtenerParametro(periodo).subscribe(
            response => {
              let oParametro: Parametro = response
              this._usuarios.setParametro(oParametro)
            },
            error => {
              this.ErrorGenerico();
            }
          )
          this.EsDisableSubmit = false;
          console.log(result);
        },
        error => {
          switch (error.status) {
            case 404:
            case 400:
              if (error.error != undefined)
              {
                let strMensaje = error.error.mensaje;
                if (error.error.detalles != null && error.error.detalles != undefined) 
                {
                  strMensaje += + "<br>";
                  error.error.detalles.forEach(i => {
                    strMensaje += i +"<br>"
                  });
                }
                this.ErrorPorHtml(strMensaje);
              }
              else
              {
                this.ErrorGenerico();
              }
              break;
            default:
              this.ErrorGenerico();
              break;
          }
          this.EsDisableSubmit = false;
          console.log(error)
        },
        () => {
          this.router.navigateByUrl('/GlassWeb');
          this.EsDisableSubmit = false;
        }
        )
    }
    else
    {
      this.ErrorPorTexto("Complete los campos obligatorios");
      this.isSubmit = true;
      this.EsDisableSubmit = false;
    }
  }


  ngOnInit() {
  }

  ErrorGenerico()
  {
    this.formSwal.title = "Error";
    this.formSwal.text = "Ha ocurrido un error inesperado, contacte con su administrador.";
    this.formSwal.type = "error";
    this.formSwal.fire();
  }

  ErrorPorTexto(txt)
  {
    this.formSwal.title = "Error";
    this.formSwal.text = txt;
    this.formSwal.type = "error";
    this.formSwal.fire();
  }

  ErrorPorHtml(html)
  {
    this.formSwalHtml.title = "Error";
    this.formSwalHtml.html = html
    this.formSwalHtml.type = "error";
    this.formSwalHtml.fire();
  }

}
