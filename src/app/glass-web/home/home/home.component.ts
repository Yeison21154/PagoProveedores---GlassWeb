import { Component, OnInit, ViewChild } from '@angular/core';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Sucursal, DocumentoBat, Usuario } from 'src/app/others/interfaces';
import { Validators, FormBuilder } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
  
  constructor(private _sucursal: SucursalService,
    private _usuarios: UsuarioService,
    private formBuilder: FormBuilder) { }

  formSucursal = this.formBuilder.group({
    CodigoSucursal: ['', [Validators.required]]
  })

  isSubmit = false

  user: Usuario = this._usuarios.getUserLoggedIn();
  oSesionSurcursal = this._usuarios.getSucursal();
  
  
  isSetSucursal = true

  oSucursal: Sucursal = {
    CodigoSucursal: '',
    Descsucursal: '',
    Direccion: undefined,
    Tarea: undefined,
    Estado: undefined
  }

  

  lstSucursal:Sucursal[] = []

  ListarSucursal = this._sucursal.listar_usuarios_activos(this.user.CodUsuario).subscribe( response => {
    this.lstSucursal = response
  })


  GuardarSucursal()
  {
    if (this.formSucursal.valid)
    {
      this.oSucursal.Descsucursal = this.lstSucursal.filter(x=>x.CodigoSucursal==this.oSucursal.CodigoSucursal)[0].Descsucursal
      //alert(this.oSucursal.Descsucursal )
      this._usuarios.setSucursal(this.oSucursal)
      this.oSesionSurcursal = this.oSucursal
      this._usuarios.obtenerDocumentosBat(this.oSucursal).subscribe( 
        response => {
          let lstDocumentosBat: DocumentoBat[] = response
          if (lstDocumentosBat.length > 0)
          {
            this._usuarios.setDocumentosBat(lstDocumentosBat);
            this.isSetSucursal = false
            this.formSwal.title = "Éxito"
            this.formSwal.text = "Se ha registrado correctamente."
            this.formSwal.type = "success"
            this.formSwal.fire()
            //this.ngOnInit();
            location.reload();
          }
        }
       )
      

      
    }
    else
    {
      this.ErrorPorTexto("Complete los campos obligatorios")
      this.isSubmit = true;
    }
  }

  ngOnInit() {
    this.isSetSucursal = ( this.oSesionSurcursal != undefined && this.oSesionSurcursal != null ? false : true)
    this.oSucursal = ( this.oSesionSurcursal != undefined && this.oSesionSurcursal != null ? this.oSesionSurcursal : this.oSucursal)

    if (this.oSesionSurcursal == null  || this.oSesionSurcursal == undefined)
    {
      this.oSesionSurcursal =this.oSucursal
    }

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

}
