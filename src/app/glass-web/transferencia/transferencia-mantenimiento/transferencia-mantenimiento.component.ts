import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgbDateParserFormatter, NgbDatepickerI18n, NgbCalendar, NgbDateStruct, NgbModal, NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateCustomParserFormatter } from 'src/app/others/NgbDateCustomParserFormatter';
import { CustomDatepickerI18n } from 'src/app/others/NgbDatePickerES';
import { FormBuilder, Validators } from '@angular/forms';
import { Usuario, Sucursal, TipoCambio, Documento, Parametro, Banco, Cliente, CuentaXCobrar, DocumentoBat, CuentaContable, DetraccionVenta, Cajero, Menu, Permiso, TransferenciaBanco, TransferenciaBancoDtl } from 'src/app/others/interfaces';
import { UsuarioService } from 'src/app/services/usuario.service';
import { TipoCambioService } from 'src/app/services/tipo-cambio.service';
import { MonedaService } from 'src/app/services/moneda.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BancoService } from 'src/app/services/banco.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ClienteService } from 'src/app/services/cliente.service';
import { isNumber } from 'util';
import { formatNgbDateStruct, formatDateToNgbDateStruct, formatDateToNgbTimeStruct, formatNgbDateStructHHMMSS } from 'src/app/others/utilBootstrap';
import { TransferenciaBancoService } from 'src/app/services/transferencia-banco.service';
import { CajeroService } from 'src/app/services/cajero.service';

@Component({
  selector: 'app-transferencia-mantenimiento',
  templateUrl: './transferencia-mantenimiento.component.html',
  styleUrls: ['./transferencia-mantenimiento.component.css'],
  providers: [
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter},
    {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}
  ]
})
export class TransferenciaMantenimientoComponent implements OnInit {

  constructor(private calendar: NgbCalendar,
    private formBuilder: FormBuilder,
    private _usuarios: UsuarioService,
    private _documento: DocumentoService,
    private _cajero: CajeroService,
    private _tipocambio: TipoCambioService,
    private _banco: BancoService,
    private _transferencia: TransferenciaBancoService,
    private activerouter: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal) { }

  
    @ViewChild("txtBusquedaBanco", {static: false}) txtBusquedaBanco: HTMLElement;
    @ViewChild("deleteSwal", {static: false}) deleteSwal: SwalComponent;
    @ViewChild("anularSwal", {static: false}) anularSwal: SwalComponent;
    @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
    @ViewChild("ErrorFormHtml", {static: false}) formSwalHtml: SwalComponent;
    @ViewChild("tbDetalle", {static: false}) tbDetalle: DatatableComponent;
    @ViewChild("contentBanco", {static: false}) modalBanco: NgbModal;
    @ViewChild("contentCajero", {static: false}) modalCajero: NgbModal;

  //SESIONES
  user: Usuario = this._usuarios.getUserLoggedIn()
  oSucursalSeleccionado:Sucursal = this._usuarios.getSucursal()
  oParametro: Parametro = this._usuarios.getParametro()
  lstDocumentoBat:DocumentoBat[] = this._usuarios.getDocumentosBat()
  fecAc = new Date();
  FecActual:NgbDateStruct = this.calendar.getToday();
  HoraActual:NgbTimeStruct = {
    hour: this.fecAc.getHours(),
    minute: this.fecAc.getMinutes(),
    second: this.fecAc.getSeconds()
  }

  formTransferencia = this.formBuilder.group({
    CodCajero: ['', [Validators.required]],
    DescCajero: [''],
    CodOperacion: ['', [Validators.required]],
    Serie: ['', [Validators.required]],
    Nro: ['', [Validators.required]],
    fecEmision: ['', [Validators.required]],
    fecRegistro: ['', [Validators.required]],
    hora: ['', [Validators.required]],
    TC: ['', [Validators.required]],
    Comentario: [''],
    fecRecibido: ['', [Validators.required]],
    CodEstadoDocumento: [''],
    Impefectivomn: ['', [Validators.required]],
    Impefectivome: ['', [Validators.required]],
    Impechequemn: ['', [Validators.required]],
    Impechequeme: ['', [Validators.required]],
    Depoefectivomn: ['', [Validators.required]],
    Depoefectivome: ['', [Validators.required]],
    Depoechequemn: ['', [Validators.required]],
    Depoechequeme: ['', [Validators.required]]
  })

  oTransferencia: TransferenciaBanco = {
    coddocumento: "",
    numdocumento: undefined,
    documento: undefined,
    seriedoc: undefined,
    nrodoc: undefined,
    codusuario: this.user.CodUsuario,
    codcajero: this.user.Cajero.CodCajero,
    desccajero: undefined,
    fecemision: undefined,
    dFecEmision: this.FecActual,
    codmoneda: undefined,
    valortc: undefined,
    totalmn: undefined,
    totalme: undefined,
    estadodoc: 4,
    comentario: undefined,
    fecregistro: undefined,
    dFecRegistro: this.FecActual,
    codsucursal: this.oSucursalSeleccionado.CodigoSucursal,
    codigosucursal: undefined,
    fecrecibido: undefined,
    dFecRecibido: this.FecActual,
    hora: undefined,
    dHora: this.HoraActual,
    impefectivomn: 0,
    impefectivome: 0,
    impechequemn: 0,
    impechequeme: 0,
    depoefectivomn: 0,
    depoefectivome: 0,
    depoechequemn: 0,
    depoechequeme: 0,
    Opcion: 0,
    descestado: undefined,
    ListaDetalle: [],
    Cajero: {
      CodCajero: this.user.Cajero.CodCajero,
      DescCajero: this.user.Cajero.DescCajero
    }
  }

  oTransferenciaDtl: TransferenciaBancoDtl = {
    codbanco: undefined,
    codbancodestino: undefined,
    codbancoorigen: undefined,
    codcajero: undefined,
    coddocumento: undefined,
    codmonedadestino: undefined,
    codmonedaorigen: undefined,
    descbanco: undefined,
    descbancoorigen: undefined,
    descbancodestino: undefined,
    desccajero: undefined,
    descmonedadestino: undefined,
    descmonedaorigen: undefined,
    glosa: undefined,
    item: undefined,
    monto: undefined,
    montome: undefined,
    montomn: undefined,
    nrodoc: undefined,
    numdocumento: undefined,
    operacion: undefined,
    seriedoc: undefined
  }

  //LISTAS
  lstDocumento:Documento[] = []
  lstBanco: Banco[] = []
  lstCajero: Cajero[] = []

  //TEMPORALES
  lstDetalleTransferencia: TransferenciaBancoDtl[] = []
  lstTempBanco: Banco[] = []
  lstTempCajero: Cajero[] = []


  ListarDocumento = this._documento.listar_transferencia_banco_activos(this.oSucursalSeleccionado.CodigoSucursal).subscribe( response => {
    this.lstDocumento = response
  })

  ListarCajero = this._cajero.listar().subscribe( response => {
    this.lstCajero = response
    this.lstTempCajero = response
  })

  ObtenerTC = this._tipocambio.obtener(this.FecActual.day + '/' + this.FecActual.month + '/' + this.FecActual.year).subscribe( response =>{
    this.oTipoCambio = response
    this.oTransferencia.valortc = this.oTipoCambio.ValorCompra
  })

  

  //VARIABLES
  nombrePag = 'Nueva Transferencia Banco'
  isVisualizar: boolean = false
  oTipoCambio: TipoCambio = {
    FechaTipoCambio: undefined,
    CodMoneda: undefined,
    ValorCompra: undefined,
    ValorVenta: undefined,
    Estado: undefined,
    ValorCompraSunat: undefined,
    ValorVentaSunat: undefined
  }
  nombreRevisar= 'Revisar'
  isSubmit = false
  EsDisableSubmit = false
  EsEnableAnular = true
  EsEnableRevisar = true
  ValorIGV: number = 0
  editing = {}
  esOrigen = true
  tipoBusquedaBanco: string = '1'
  tipoBusquedaCajero: string = '1'
  currentRowDtl: number = undefined
  NombreMenu: string = 'mnuTranferenciaBanco'
  //Util
  soloNumeros(e){
    
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
       //Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
       //Allow: Ctrl+C
        (e.keyCode == 67 && e.ctrlKey === true) ||
       //Allow: Ctrl+V
        (e.keyCode == 86 && e.ctrlKey === true) ||
       //Allow: Ctrl+X
        (e.keyCode == 88 && e.ctrlKey === true) ||
       //Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
         //let it happen, don't do anything
          return;
        }
      let ch = String.fromCharCode(e.keyCode);
      let regEx =  new RegExp('^[0-9]+([.][0-9]{1,2})?$');    
      if(regEx.test(ch))
        return;
      else
        e.preventDefault();
  }

  soloEnteros(e)
  {
    var key = window.event ? e.which : e.keyCode;
    if (key < 48 || key > 57) {
        e.preventDefault();
    }
  }

  mayus(e) {
    e.target.value = e.target.value.toUpperCase()
  }

  AgregarCeros(e, SerieNumero)
  {
    const nro = Number(e.target.value);
    if (!isNaN(nro) && e.target.value != "")
    {
      switch (SerieNumero) {
        case '1':
          this.oTransferencia.seriedoc = this.zeroFill(e.target.value, 3)
          break;
        case '2':
          this.oTransferencia.nrodoc = this.zeroFill(e.target.value, 7)
          break;
        default:
          break;
      }
    }

  }
  
  zeroFill( number, width )
  {
    width -= number.toString().length;
    if ( width > 0 )
    {
      return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + ""; // siempre devuelve tipo cadena
  }

  //Metodos Transferencia
  SeleccionarTipoOperacion()
  {
    if(this.oTransferencia.Opcion == 0)
    {
      if (this.oTransferencia.coddocumento != undefined && this.oTransferencia.coddocumento != "")
      {
        let oDoc: Documento = this.lstDocumento.filter(x => x.CodDocumento == this.oTransferencia.coddocumento)[0]
        this.oTransferencia.seriedoc = oDoc.Serie
        this.oTransferencia.nrodoc = oDoc.Numero
      }
      else
      {
        this.oTransferencia.seriedoc = undefined
        this.oTransferencia.nrodoc = undefined
      }
    }
  }

  //Modal Banco
  AbrirModalBanco(content, event?)
  {
    if (event != null || event != undefined)
      event.preventDefault(); 
    if(this.esOrigen)
    {
      this._banco.listar_banco_origen(this.oTransferencia.codcajero).subscribe( response => {
        this.lstBanco = response
        this.lstTempBanco = response
        this.lstBanco = [...this.lstTempBanco];
        this.open(content, 'lg')
      })
    }
    else
    {
      this._banco.listar().subscribe( response => {
        this.lstBanco = response
        this.lstTempBanco = response
        this.lstBanco = [...this.lstTempBanco];
        this.open(content, 'lg')
      })
    }
  } 

  open(content, size) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: size 
    });
  }

  SeleccionarBanco(event, value)
  {
    event.preventDefault();
    if (this.currentRowDtl != undefined)
    {
      if (this.lstDetalleTransferencia[this.currentRowDtl].item == undefined)
      {
        const lstDtl = this.lstDetalleTransferencia.filter(x => x.item == undefined)
        let i = this.lstDetalleTransferencia.length - lstDtl.length
        let NroItem = this.currentRowDtl + 1
        this.lstDetalleTransferencia[this.currentRowDtl].item = NroItem
      }
      if(this.esOrigen)
      {
        this.lstDetalleTransferencia[this.currentRowDtl].codbancoorigen = value.CodBanco
        this.lstDetalleTransferencia[this.currentRowDtl].descbancoorigen = value.DescBanco
        this.lstDetalleTransferencia[this.currentRowDtl].codmonedaorigen = value.CodMoneda
        this.lstDetalleTransferencia[this.currentRowDtl].descmonedaorigen = value.DescMoneda
      }
      else
      {
        this.lstDetalleTransferencia[this.currentRowDtl].codbancodestino = value.CodBanco
        this.lstDetalleTransferencia[this.currentRowDtl].descbancodestino = value.DescBanco
        this.lstDetalleTransferencia[this.currentRowDtl].codmonedadestino = value.CodMoneda
        this.lstDetalleTransferencia[this.currentRowDtl].descmonedadestino = value.DescMoneda
      }
      this.lstDetalleTransferencia = [...this.lstDetalleTransferencia]
    }
    this.modalService.dismissAll();
  }

  BuscarBanco(event) {
    const val = event.target.value.toLowerCase();
    let temp = this.lstTempBanco;
    switch (this.tipoBusquedaBanco) {
      case "0":
        temp = this.lstTempBanco.filter(function(d) {
          return d.CodBanco.toLowerCase().indexOf(val) !== -1 || !val;
        });
        break;
      case "1":
        temp = this.lstTempBanco.filter(function(d) {
          return d.DescBanco.toLowerCase().indexOf(val) !== -1 || !val;
        });
        break;
      case "2":
        temp = this.lstTempBanco.filter(function(d) {
          return d.DescMoneda.toLowerCase().indexOf(val) !== -1 || !val;
        });
        break;
      default:
        break;
    }
    this.lstBanco = [...temp];
  }

  //Modal Cajero
  AbrirModalCajero(content, event?)
  {
    if (event != null || event != undefined)
      event.preventDefault(); 
      this.lstCajero = [...this.lstTempCajero];
      this.open(content, 'lg');
  } 

  SeleccionarCajero(event, value)
  {
    event.preventDefault();
    if (this.currentRowDtl != undefined)
    {
      if (this.lstDetalleTransferencia[this.currentRowDtl].item == undefined)
      {
        const lstDtl = this.lstDetalleTransferencia.filter(x => x.item == undefined)
        let i = this.lstDetalleTransferencia.length - lstDtl.length
        let NroItem = this.currentRowDtl + 1
        this.lstDetalleTransferencia[this.currentRowDtl].item = NroItem
      }
      this.lstDetalleTransferencia[this.currentRowDtl].codcajero = value.CodCajero
      this.lstDetalleTransferencia[this.currentRowDtl].desccajero = value.DescCajero
      this.lstDetalleTransferencia = [...this.lstDetalleTransferencia]
    }
    this.modalService.dismissAll();
  }

  BuscarCajero(event) {
    const val = event.target.value.toLowerCase();
    let temp = this.lstTempCajero;
    switch (this.tipoBusquedaCajero) {
      case "0":
        temp = this.lstTempCajero.filter(function(d) {
          return d.CodCajero.toLowerCase().indexOf(val) !== -1 || !val;
        });
        break;
      case "1":
        temp = this.lstTempCajero.filter(function(d) {
          return d.DescCajero.toLowerCase().indexOf(val) !== -1 || !val;
        });
        break;
      default:
        break;
    }
    this.lstCajero = [...temp];
  }

  AgregarDetallePorDefecto()
  {
    const lstTemp = this.lstDetalleTransferencia
      lstTemp.push({
        codbanco: undefined,
        codbancodestino: undefined,
        codbancoorigen: undefined,
        codcajero: undefined,
        coddocumento: undefined,
        codmonedadestino: undefined,
        codmonedaorigen: undefined,
        descbanco: undefined,
        descbancoorigen: undefined,
        descbancodestino: undefined,
        desccajero: undefined,
        descmonedadestino: undefined,
        descmonedaorigen: undefined,
        glosa: undefined,
        item: undefined,
        monto: undefined,
        montome: undefined,
        montomn: undefined,
        nrodoc: undefined,
        numdocumento: undefined,
        operacion: undefined,
        seriedoc: undefined
      })
    
      this.lstDetalleTransferencia = [...lstTemp]; 
  }

  ListaInicialTransferencia()
  {
    const lstTemp = [];
    for (let index = 0; index < 10; index++) {
      
      const d = index + 1
      lstTemp.push( {
        codbanco: undefined,
        codbancodestino: undefined,
        codbancoorigen: undefined,
        codcajero: undefined,
        coddocumento: undefined,
        codmonedadestino: undefined,
        codmonedaorigen: undefined,
        descbanco: undefined,
        descbancoorigen: undefined,
        descbancodestino: undefined,
        desccajero: undefined,
        descmonedadestino: undefined,
        descmonedaorigen: undefined,
        glosa: undefined,
        item: undefined,
        monto: undefined,
        montome: undefined,
        montomn: undefined,
        nrodoc: undefined,
        numdocumento: undefined,
        operacion: undefined,
        seriedoc: undefined
      })
      
    }
    return lstTemp;
  }

  CalcularTotales()
  {
    if (!this.isVisualizar)
    {
      let impefectivomn = 0;
      let impefectivome = 0;
      this.lstDetalleTransferencia.filter(x => x.item != undefined).forEach(obj => {
        let monto = (obj.monto != undefined ? obj.monto : 0)
        if (obj.codmonedaorigen == "MO001")
          impefectivomn += monto
        else
          impefectivome += monto
      });
      this.oTransferencia.impefectivomn = Number(impefectivomn.toFixed(2))
      this.oTransferencia.impefectivome = Number(impefectivome.toFixed(2))
      this.lstDetalleTransferencia = [...this.lstDetalleTransferencia]
      console.log('Calcular Totales: ' + this.lstDetalleTransferencia)
      this.oTransferencia.ListaDetalle = this.lstDetalleTransferencia.filter(x => x.item != undefined)
    }
  }

  EliminarFila(rowIndex){
    console.log(rowIndex)
    this.lstDetalleTransferencia.splice(rowIndex, 1)
    let i = 1
    this.lstDetalleTransferencia.filter(x => x.item != undefined).forEach(obj => {
      obj.item = i
      i++
    });
    this.lstDetalleTransferencia = [...this.lstDetalleTransferencia]
    if (this.lstDetalleTransferencia.filter(x => x.item == undefined).length == 0)
    {
      this.AgregarDetallePorDefecto()
    }
    this.oTransferencia.ListaDetalle = this.lstDetalleTransferencia.filter(x => x.item != undefined)
  }

  SeleccionarDetalle(event){
    (event.type === 'dblclick') && event.cellElement.blur();
    const rowIndex = this.tbDetalle.bodyComponent.getRowIndex(event.row);
    switch (event.type) {
      case 'dblclick':
        if(!this.isVisualizar)
        {
          switch (event.column.prop) {
            case "item":
              this.deleteSwal.fire().then(result => {
                if (result.value) {
                  this.EliminarFila(rowIndex)
                } 
              })
              break;
            case "monto":
              this.editing[rowIndex + '-monto'] = true
              break;
            case "descbancoorigen":
              this.currentRowDtl = rowIndex;
              this.esOrigen = true;
              this.AbrirModalBanco(this.modalBanco)
              break;
            case "descbancodestino":
              this.currentRowDtl = rowIndex;
              this.esOrigen = false;
              this.AbrirModalBanco(this.modalBanco)
              break;
            case "operacion":
              this.editing[rowIndex + '-operacion'] = true
              break;
            case "glosa":
              this.editing[rowIndex + '-glosa'] = true
              break;
            case "desccajero":
              this.currentRowDtl = rowIndex;
              this.AbrirModalCajero(this.modalCajero)
              break;
            default:
              break;
          }
      }
        break;
      default:
        break;
    }
  }

  ActualizarFila(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex)
    console.log(this.editing);
    if (this.lstDetalleTransferencia[rowIndex].item == undefined)
    {
      const lstDtl = this.lstDetalleTransferencia.filter(x => x.item == undefined)
      let i = this.lstDetalleTransferencia.length - lstDtl.length
      let NroItem = rowIndex + 1
      this.lstDetalleTransferencia[rowIndex].item = NroItem
    }
    this.editing[rowIndex + '-' + cell] = false
    let val = event.target.value != undefined && event.target.value != '' ? event.target.value : undefined
    if (Number(val))
      val = event.target.value != undefined && event.target.value != '' ? Number(event.target.value) : undefined
    this.lstDetalleTransferencia[rowIndex][cell] = val
    this.lstDetalleTransferencia = [...this.lstDetalleTransferencia]
    
    if (this.lstDetalleTransferencia.filter(x => x.item == undefined).length == 0)
    {
      this.AgregarDetallePorDefecto()
    }
    this.oTransferencia.ListaDetalle = this.lstDetalleTransferencia.filter(x => x.item != undefined)
    this.CalcularTotales()
  }

  PermisosUsuario(nombrePermiso: string)
  {
    
    let lstMenus: Menu[] = this.user.Menus.filter(x => x.Nombre == this.NombreMenu);
    
    if (lstMenus.length > 0)
    {
      
      let lstPermisos: Permiso[] = this.user.Permisos.filter(x => x.Codigo == lstMenus[0].Codigo);
      console.log(lstPermisos);
      if (lstPermisos.length > 0)
      {
        switch (nombrePermiso) {
          case "escritura":
            this.EsDisableSubmit = (lstPermisos[0].escritura == 1 ? false : true);
            break;
          case "actualiza":
            this.EsDisableSubmit = (lstPermisos[0].Actualiza == 1 ? false : true);
            break;
          case "anular":
            this.EsEnableAnular = (lstPermisos[0].Anular == 1 ? false : true);
            break;
          case "aprobar":
            this.EsEnableRevisar = (lstPermisos[0].Aprobar == 1 ? false : true);
            break;
          default:
            break;
        }
      }
    }
  }

  AnularTransferencia()
  {
    this.anularSwal.text = "Se anulará la transferencia de banco."
    this.anularSwal.fire().then(result => {
      if (result.value) {
        this._transferencia.anular(this.oTransferencia).subscribe(
          response => {
            this.formSwal.title = "Éxito";
            this.formSwal.text = "Se ha anulado correctamente.";
            this.formSwal.type = "success";
            this.formSwal.fire().then(result => {
              this.router.navigateByUrl(this.router.url);
            });
          },
          error => {
            switch (error.status) {
              case 400:
              case 404:
                if (error.error != undefined)
                {
                  this.ErrorPorTexto(error.error.mensaje)
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
            console.log(error)
          }
        ) 
        
      } 
    })
  }
  
  RevisarTransferencia()
  {
    this.anularSwal.text = (this.oTransferencia.estadodoc == 4 ? "Se enviará a revisar la transferencia de banco." : "Se enviará a quitar el revisado de la transferencia de banco.")
    this.anularSwal.fire().then(result => {
      if (result.value) {
        this.oTransferencia.fecrecibido = (this.oTransferencia.dFecRecibido != undefined ? formatNgbDateStruct(this.oTransferencia.dFecRecibido) : undefined)
        if (this.oTransferencia.estadodoc == 4){
          this._transferencia.revisar(this.oTransferencia).subscribe(
            response => {
              this.formSwal.title = "Éxito";
              this.formSwal.text = "Se ha revisado correctamente.";
              this.formSwal.type = "success";
              this.formSwal.fire().then(result => {
                this.router.navigateByUrl(this.router.url);
              });
            },
            error => {
              switch (error.status) {
                case 400:
                case 404:
                  if (error.error != undefined)
                  {
                    this.ErrorPorTexto(error.error.mensaje)
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
              console.log(error)
            }
          )
        }
        else
        {
          this._transferencia.quitar_revisado(this.oTransferencia).subscribe(
            response => {
              this.formSwal.title = "Éxito";
              this.formSwal.text = "Se ha quitado el revisado correctamente.";
              this.formSwal.type = "success";
              this.formSwal.fire().then(result => {
                this.router.navigateByUrl(this.router.url);
              });
            },
            error => {
              switch (error.status) {
                case 400:
                case 404:
                  if (error.error != undefined)
                  {
                    this.ErrorPorTexto(error.error.mensaje)
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
              console.log(error)
            }
          )
        }
         
        
      } 
    })
  }

  GuardarTransferenciaBanco()
  {
    debugger;
    this.EsDisableSubmit = true;
    if (this.formTransferencia.valid)
    {
      if (this.oTransferencia.ListaDetalle.length > 0)
      {
        for (const prop in this.editing) {
          if(this.editing[prop])
          {
            this.EsDisableSubmit = false;
            return this.ErrorPorTexto("Verifique que todos los campos editables del detalle se encuentren deshabilitado.");
          }
            
        }
        if (this.oTransferencia.ListaDetalle.filter(x => x.monto == undefined
            || x.codbancoorigen == undefined
            || x.codcajero == undefined
            || x.codmonedaorigen == undefined
            || x.codbancodestino == undefined
            || x.codmonedadestino == undefined
              ).length > 0)
        {
          this.EsDisableSubmit = false;
          return this.ErrorPorTexto("Debe agregar todas la columnas del detalle obligatoriamente (con excepción de Operación y Glosa)");
        }
        this.oTransferencia.numdocumento = (this.oTransferencia.nrodoc != undefined && this.oTransferencia.seriedoc != undefined ? this.oTransferencia.seriedoc + '-' + this.oTransferencia.nrodoc : undefined)
        this.oTransferencia.fecemision = (this.oTransferencia.dFecEmision != undefined ? formatNgbDateStruct(this.oTransferencia.dFecEmision) : undefined)
        this.oTransferencia.fecrecibido = (this.oTransferencia.dFecRecibido != undefined ? formatNgbDateStruct(this.oTransferencia.dFecRecibido) : undefined)
        this.oTransferencia.fecregistro = (this.oTransferencia.dFecRegistro != undefined ? formatNgbDateStruct(this.oTransferencia.dFecRegistro) : undefined)
        this.oTransferencia.hora = (this.oTransferencia.dHora != undefined ? formatNgbDateStructHHMMSS(this.FecActual, this.oTransferencia.dHora) : undefined)
        let result = {}
        debugger;
        console.log(this.oTransferencia);
        this._transferencia.guardar(this.oTransferencia).subscribe( response => {
          result = response
          this.formSwal.title = "Éxito";
          this.formSwal.text = "Se ha registrado correctamente.";
          this.formSwal.type = "success";
          this.formSwal.fire().then(result => {
            this.router.navigateByUrl('/GlassWeb/transferencia-banco');
          });
          this.EsDisableSubmit = false;
          console.log(result);
        },
        error => {
          switch (error.status) {
            case 400:
            case 404:
              if (error.error != undefined)
              {
                let strMensaje = "<h3 style='font-weight: bold;'>" + error.error.mensaje + "</h3>";
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
        })
        
        
      }
      else
      {
        this.ErrorPorTexto("Debe agregar el detalle de la transferencia de banco");
        this.EsDisableSubmit = false;
      }
      
    }
    else
    {
      this.ErrorPorTexto("Complete los campos obligatorios");
      this.isSubmit = true;
      this.EsDisableSubmit = false;
    }
      
  }

  ngOnInit() {
    console.log(this.user)
    const lstTemp = this.ListaInicialTransferencia();
    this.ValorIGV = this.oParametro.valorigv;
    let date=new Date();
    
    this.activerouter.url.subscribe(j => {
    
      if (j[0].path == "obtener")
      {
        this.PermisosUsuario("anular");
        this.PermisosUsuario("actualiza");
        this.PermisosUsuario("aprobar");
        const codDoc = j[1].path
        const nroDoc = j[2].path
        this.formTransferencia.disable();
        this._documento.listar_transferencia_banco().subscribe( response => {
          this.lstDocumento = response
          console.log(response);
        })

        this._transferencia.obtener(codDoc, nroDoc).subscribe( response => {
          this.isVisualizar = true;
          this.nombrePag = "Visualización de Transferencia de Banco"
          this.oTransferencia = response
          //this.EsDisableSubmit = (this.oTransferencia.estadodoc == 4 ? false : true)
          let nroSerie = response.numdocumento.split('-')
          this.oTransferencia.seriedoc = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
          this.oTransferencia.nrodoc = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
          this.oTransferencia.dFecRecibido = (this.oTransferencia.fecrecibido != undefined && this.oTransferencia.fecrecibido != null ? formatDateToNgbDateStruct(new Date(this.oTransferencia.fecrecibido)) : undefined)
          this.oTransferencia.dFecRegistro = (this.oTransferencia.fecregistro != undefined && this.oTransferencia.fecregistro != null ? formatDateToNgbDateStruct(new Date(this.oTransferencia.fecregistro)) : undefined)
          this.oTransferencia.dFecEmision = (this.oTransferencia.fecemision != undefined && this.oTransferencia.fecemision != null ? formatDateToNgbDateStruct(new Date(this.oTransferencia.fecemision)) : undefined)
          this.oTransferencia.dHora = (this.oTransferencia.hora != undefined && this.oTransferencia.hora != null ? formatDateToNgbTimeStruct(new Date(this.oTransferencia.hora)) : undefined)
          this.oTransferencia.Opcion = 1

          let oCajero :Cajero= {
            CodCajero: this.user.Cajero.CodCajero,
            DescCajero: this.user.Cajero.DescCajero
          }
          oCajero.CodCajero = this.oTransferencia.codcajero;
          oCajero.DescCajero = this.oTransferencia.desccajero;
          this.oTransferencia.codusuario = this.user.CodUsuario;
          this.oTransferencia.Cajero = oCajero;
          this.nombreRevisar = (this.oTransferencia.estadodoc == 4 ? 'Revisar' : 'Quitar el Revisado')

          const lst = this.oTransferencia.ListaDetalle;
          this.lstDetalleTransferencia = [...lst]
          console.log(response)
          if (this.oTransferencia.estadodoc == 4)
          {
            this.formTransferencia.controls['fecEmision']['enable']();
            this.formTransferencia.controls['fecRegistro']['enable']();
            this.formTransferencia.controls['fecRecibido']['enable']();
            this.formTransferencia.controls['hora']['enable']();
            this.formTransferencia.controls['Comentario']['enable']();
          }
        },
        error => {
          switch (error.status) {
            case 400:
            case 404:
              if (error.error != undefined)
              {
                let strMensaje = error.error.mensaje;
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
        })
      }
      else
      {
        this.PermisosUsuario("escritura");
        this.oTransferencia.Opcion = 0
        this.lstDetalleTransferencia = [...lstTemp];
      }
    })
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
