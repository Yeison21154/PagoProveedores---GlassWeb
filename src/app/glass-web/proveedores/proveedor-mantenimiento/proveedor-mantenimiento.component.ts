import { Cliente, CuentaContable, CuentaXPagarCabs, Documento, lstPagoProveedor, Menu, Moneda, Paginar, Permiso, Proveedor, proveedorT, TipoCambio } from 'src/app/others/interfaces';
import { Banco, ChequeEmitido, DocumentoBat, Parametro, Sucursal, Usuario } from './../../../others/interfaces';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Renderer2, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { NgbDateParserFormatter, NgbDatepickerI18n, NgbCalendar, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { formatNgbDateStruct, formatDateToNgbDateStruct } from 'src/app/others/utilBootstrap';
import { BancoService } from 'src/app/services/banco.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { CustomDatepickerI18n } from 'src/app/others/NgbDatePickerES';
import { TipoCambioService } from 'src/app/services/tipo-cambio.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { MonedaService } from 'src/app/services/moneda.service';
import { unescapeIdentifier } from '@angular/compiler';
import { CobranzasService } from 'src/app/services/cobranzas.service';
import { NgbDateCustomParserFormatter } from 'src/app/others/NgbDateCustomParserFormatter';

@Component({
  selector: 'app-proveedor-mantenimiento',
  templateUrl: './proveedor-mantenimiento.component.html',
  styleUrls: ['./proveedor-mantenimiento.component.css'],
  providers:[
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter},
    {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}],
    encapsulation: ViewEncapsulation.None,
})
export class ProveedorMantenimientoComponent implements OnInit {

  constructor(private _fm:FormBuilder,
              private modalService: NgbModal,
              private _banco:BancoService,
              private _usuarios:UsuarioService,
              private _cobranza: CobranzasService,
              private calendar: NgbCalendar,
              private _moneda: MonedaService,
              private _tipocambio: TipoCambioService,
              private _servProveedor:ProveedorService,
              private _ruta: ActivatedRoute,
              private router: Router,
              private _render: Renderer2,
              private _documento:DocumentoService) { }

//----------------------------------------------------------------------------------------------------VARIABLES
  tipoBusquedaProveedor: string = 'CodProveedor';
  tipoBusquedaPago: string = 'NumeroDoc';
  tipoBusquedaMoneda: string = '1';
  nombrePag = 'Pago Proveedor';
  tipoBusquedaCtaContable: string = 'CodCuenta';
  tipoBusquedaBanco: string = '1';
  strBusqueda: string = '';
  strBusquedaProveedor: string = '';
  strBusquedaCtaContable: string = '';
  codProveedor: string = '';
  EsEnableAnular = true;
  ValorIGV: number = 0;
  NombreMenu: string = 'mnupagoproveedores'
  titulo;
  Modificar: boolean = true;

  user: Usuario = this._usuarios.getUserLoggedIn();
  oSucursalSeleccionado:Sucursal = this._usuarios.getSucursal();
  oParametro: Parametro = this._usuarios.getParametro();
  FecActual:NgbDateStruct = this.calendar.getToday();
  isVisualizar = false;
  isSubmit = false;
  ocultar = false;
  currentRowDtl: number = undefined
  oTipoCambio: TipoCambio = {
    FechaTipoCambio: undefined,
    CodMoneda: undefined,
    ValorCompra: undefined,
    ValorVenta: undefined,
    Estado: undefined,
    ValorCompraSunat: undefined,
    ValorVentaSunat: undefined
  }
  //----------------------------------------------------------------------------------------------------LISTAS
  lstDocumentoBat:DocumentoBat[] = this._usuarios.getDocumentosBat();
  lstBanco: Banco[] = [];
  lstOperacion:Documento[] = [];
  lstCheque: ChequeEmitido[] = [];
  lstTempBanco: Banco[] = [];
  lstProveedor: Proveedor[] = [];
  lstTempProveedor: Proveedor[] = [];
  lstMoneda: Moneda[] = [];
  lstTempMoneda: Moneda[] = [];
  lstDetallePago:lstPagoProveedor[]=[];
  editing = {};
  lstPago: CuentaXPagarCabs[] = [];
  lstTempPago: CuentaXPagarCabs[] = [];
  lstCtaContable: CuentaContable[] = [];
  lstTempCtaContable: CuentaContable[] = [];
//-------------------------------------------------------------------------------------------------------VIEWS
  @ViewChild("tbDetalle", {static: false}) tbDetalle: DatatableComponent;
  @ViewChild("deleteSwal", {static: false}) deleteSwal: SwalComponent;
  @ViewChild("contentProveedor", {static: false}) modalProveedor: NgbModal;
  @ViewChild("anularSwal", {static:false}) anularSwal: SwalComponent;
  @ViewChild("contentPago", {static: false}) modalPago: NgbModal;
  @ViewChild("ErrorFormHtml", {static: false}) formSwalHtml: SwalComponent;
  @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
  @ViewChild("contentMoneda",{static:false}) modalMoneda: NgbModal;
  @ViewChild("contentCtaContable", {static: false}) modalCtaContable: NgbModal;
  @ViewChild("btnBanco",{static:false}) btnBanco:ElementRef;
//----------------------------------------------------------------------------------------------------DATOS A ENVIAR o SOLICITAR
  oProveedor:proveedorT = {
    numero:undefined,
    Serie:undefined,
    CodClaseDoc:"",
    EstadoDet:undefined,
    DescDocumento:undefined,
    Cheque:{
      CodBanco:undefined,
      DescBanco:undefined,
      CodCheque:undefined,
      NumeroCheque:undefined,
      NomProveedor:undefined,
      FecEmision:undefined,
      Fecuso:undefined,
      TotalDoc:undefined,
      DescMoneda:undefined,
      comentarioDoc:undefined,
      EstadoDoc:undefined,
    },
    Banco: {
      CodBanco: undefined,
      CodMoneda: undefined,
      DescBanco: undefined,
      DescMoneda: undefined
    },
    Cajero: {
      CodCajero: this.user.Cajero.CodCajero,
      DescCajero: this.user.Cajero.DescCajero
    },
    Opcion: 0,
    comentarioDet:undefined,
    numDocDet:undefined,
    dFecEmision:this.FecActual,
    dFecRegistro:this.FecActual,
    FecEmision: undefined,
    FecRegistro:undefined,
    ValorTC: 0,
    DescMoneda:undefined,
    CodMoneda: "MO001",
    TotalME: 0,
    TotalMN: 0,
    TotalDoc:0,
    CodDocDet:undefined,
    Saldo: undefined,
    TotalPagar: 0,
    ListaDetalle:[],
  };
  pageProveedor = {
    limit: 10,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };
  pagePago = {
    limit: 10,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };
  pageCtaContable = {
    limit: 10,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };
  //----------------------------------------------------------------------------------------------------ANGULAR FORMS
  ngOnInit() {
    this.ObtenerTC
    let date=new Date();
    this.UsuarioPermisos('escritura');
    this.UsuarioPermisos('actualiza');
    this.UsuarioPermisos('anular');
    const lstTemp = this.ListaInicialPago();
    this.ValorIGV = this.oParametro.valorigv;
    this.setPageProveedor({ offset: 0 });
    for(let index = 0; index < 10; index++){
      const d = index +1;
      lstTemp.push({
        tipoDocumento:undefined,
        NumItem:undefined,
        CodProveedor:undefined,
        TotalPagar:undefined,
        nomProveedor:undefined,
        NumeroDoc:undefined,
        CodDocumento:undefined,
        DescDocumento:undefined,
        Serie:undefined,
        Nro:undefined,
        ValorTC:undefined,
        CodMoneda:undefined,
        DescMoneda:undefined,
        numDocDet:undefined,
        TotalMN:undefined,
        TotalME:undefined,
        TotalDet:undefined,
        Codctacontable:undefined,
        DescPlanContable:undefined,
        Descripcion:undefined,
        FecCobrado:undefined,
        FecRegistro:undefined,
        Mostrar:undefined
      })
    }
    this._ruta.url.subscribe(j => {
      if(j[0].path == "obtener"){
        this.UsuarioPermisos("anular");
        this.UsuarioPermisos("actualiza");
        console.log(this.Modificar)
        this.nombrePag = "Visualización de Pago Proveedor"
        this.Modificar = false;
        const codDocDet = j[1].path;
        console.log(this.oProveedor.Cheque)
        this._documento.listar().subscribe( response => {
          this.lstOperacion = response
        })
        this._servProveedor.ObtenerDocumento(codDocDet).subscribe(resul=>{

          console.log(this.oProveedor)
          this.oProveedor.Opcion = 1;
          this.oProveedor.ValorTC = resul.ValorTC;
          this.oProveedor.Banco = resul.Banco;
          this.oProveedor.Banco.DescMoneda = resul.DescMoneda;
          this.lstDetallePago = resul.ListaDetalle;
          this.pageProveedor.count = resul.ListaDetalle.length;
          this.lstDetallePago.forEach(x =>{
            let serieDoc = x.NumeroDoc.split("-");
            x.Serie = (serieDoc[0] != undefined && serieDoc[0] != null ? serieDoc[0] : undefined);
            x.Nro = (serieDoc[1] != undefined && serieDoc[1] != null ? serieDoc[1] : undefined);
            x.TotalME = Number((x.TotalDet / x.ValorTC).toFixed(2));
            x.TotalMN = x.TotalDet;
            this.oProveedor.TotalME = x.TotalME;
            this.oProveedor.TotalMN = x.TotalMN;
            //this.lstDetallePago[rowIndex].TotalMN = Number((val * this.oProveedor.ValorTC).toFixed(2))
          })
          if(resul.Cheque != null){
            this.oProveedor.Cheque = resul.Cheque;
          }
          this.oProveedor.numDocDet = resul.numDocDet;
          this.oProveedor.Cajero = resul.Cajero;
          this.oProveedor.comentarioDet = resul.comentarioDet;
          let nroSerie = resul.numDocDet.split('-');
          this.oProveedor.Serie = nroSerie[0];
          this.oProveedor.numero = nroSerie[1];
          this.oProveedor.EstadoDet = resul.EstadoDet;
          this.oProveedor.CodClaseDoc = resul.CodDocDet;
          this.oProveedor.TotalPagar = resul.TotalDoc;
          this.oProveedor.CodDocDet = resul.CodDocDet;
          this.oProveedor.FecEmision = resul.ListaDetalle[0].FecCobrado;
          this.oProveedor.dFecEmision = (this.oProveedor.FecEmision != undefined && this.oProveedor.FecEmision != null ? formatDateToNgbDateStruct(new Date(this.oProveedor.FecEmision)) : undefined)
          this.oProveedor.FecRegistro = resul.ListaDetalle[0].FecRegistro;
          this.oProveedor.dFecRegistro = (this.oProveedor.FecRegistro != undefined && this.oProveedor.FecRegistro != null ? formatDateToNgbDateStruct(new Date(this.oProveedor.FecRegistro)): this.FecActual)
          this.formProveedor.disable();
          this._render.setAttribute(this.btnBanco.nativeElement,"disabled","true");
          this.formProveedor.controls['FecEmision']['enable']();
          this.formProveedor.controls['FecRegistro']['enable']();
          this.formProveedor.controls['comentarioDet']['enable']();
          this.CalcularTotales();
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
      } else
      {
        this.UsuarioPermisos("escritura");
        this.EsEnableAnular = true;
      }
    });

  }

  formProveedor = this._fm.group({
    CodBanco:['',Validators.required],
    CodCajero:['',Validators.required],
    NomCajero:['',[Validators.required]],
    CodClaseDoc:['', Validators.required],
    Serie:['', Validators.required],
    Nro:['', Validators.required],
    FecEmision:['', Validators.required],
    FecRegistro:['',Validators.required],
    DescMoneda:['',Validators.required],
    ValorTC:['',Validators.required],
    NomBanco:['',Validators.required],
    TotalPagar:['',Validators.required],
    Glosa:[''],
    NomCheque:[''],
    CodCheque:[''],
    comentarioDet:[''],
    TotalMN: [''],
    TotalME: [''],
    chechk:[false],
    EstadoDet: ['0']
  });
  isChe = this.formProveedor.get('chechk').value;
  Validar(){
    if(!this.isChe){
      this.oProveedor.Cheque.CodBanco = ""
      this.oProveedor.Cheque.DescBanco = ""
      this.oProveedor.Cheque.CodCheque = ""
      this.oProveedor.Cheque.NumeroCheque = ""
      this.oProveedor.Cheque.NomProveedor = ""
      this.oProveedor.Cheque.FecEmision = ""
      this.oProveedor.Cheque.Fecuso = ""
      this.oProveedor.Cheque.TotalDoc = 0
      this.oProveedor.Cheque.DescMoneda = ""
      this.oProveedor.Cheque.comentarioDoc = ""
      this.oProveedor.Cheque.EstadoDoc = 0
    }
  }
  //----------------------------------------------------------------------------------------------------LISTAR
  ListarBanco(){
    return this._banco.listar_activos(this.user.Cajero.CodCajero).subscribe( response => {
      this.lstBanco = response
      this.lstTempBanco = response
    })
  }
  ListarOperacionPro = this._documento.ListarProveedor(this.oSucursalSeleccionado.CodigoSucursal).subscribe(res=>{
    this.lstOperacion = res;
  })
  ListarCheques(){
    return this._servProveedor.ListarChequeEmitido(this.oProveedor.Banco.CodBanco).subscribe(res=>{
     this.lstCheque = res
   })
  }
  ListarMoneda = this._moneda.listar_activos().subscribe( response => {
    this.lstMoneda = response
    this.lstTempMoneda = response
  })
  ListarProveedor()
  {
    let oPaginar: Paginar = {
      ColumnSort: this.pageProveedor.orderBy,
      CurrentPage: this.pageProveedor.offset + 1,
      PageSize: this.pageProveedor.limit,
      TypeSort: this.pageProveedor.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }
    console.log(this.strBusquedaProveedor);
    console.log(this.tipoBusquedaProveedor);

    if(this.strBusquedaProveedor != '' && this.strBusquedaProveedor != undefined)
    {
      oPaginar.ColumnFilters.push(this.tipoBusquedaProveedor);
      oPaginar.ValueFilters.push(this.strBusquedaProveedor);
    }
    //debugger;
    this._servProveedor.listar_activos(oPaginar).subscribe( response => {
      console.log(response);
      this.lstProveedor = response.Results
      this.lstTempProveedor = response.Results
      this.lstProveedor = [...this.lstProveedor]
      this.lstTempProveedor = [...this.lstTempProveedor];
      this.pageProveedor.count = response.RowCount
    })
  }
  ListarPago()
  {
    let oPaginar: Paginar = {
      ColumnSort: this.pagePago.orderBy,
      CurrentPage: this.pagePago.offset + 1,
      PageSize: this.pagePago.limit,
      TypeSort: this.pagePago.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }
    if(this.codProveedor != '' && this.codProveedor != undefined)
    {
      oPaginar.ColumnFilters.push('codProveedor');
      oPaginar.ValueFilters.push(this.codProveedor);
    }
    if(this.strBusqueda != '' && this.strBusqueda != undefined)
    {
      oPaginar.ColumnFilters.push(this.tipoBusquedaPago);
      oPaginar.ValueFilters.push(this.strBusqueda);
    }
    this._servProveedor.listar_Pagos_pendiente(oPaginar).subscribe( response => {
      this.lstPago = response.Results
      this.lstTempPago = response.Results
      this.lstPago = [...this.lstPago]
      this.lstTempPago = [...this.lstTempPago];
      this.pagePago.count = response.RowCount
    })
  }
  ListarCtaContable()
  {
    let oPaginar: Paginar = {
      ColumnSort: this.pageCtaContable.orderBy,
      CurrentPage: this.pageCtaContable.offset + 1,
      PageSize: this.pageCtaContable.limit,
      TypeSort: this.pageCtaContable.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }

    oPaginar.ColumnFilters.push('periodo');
    oPaginar.ValueFilters.push(this.FecActual.year + '');

    if(this.strBusquedaCtaContable != '' && this.strBusquedaCtaContable != undefined)
    {
      oPaginar.ColumnFilters.push(this.tipoBusquedaCtaContable);
      oPaginar.ValueFilters.push(this.strBusquedaCtaContable);
    }
    //debugger;
    this._cobranza.listar_plan_contable(oPaginar).subscribe( response => {
      this.lstCtaContable = response.Results
      this.lstTempCtaContable = response.Results
      this.lstCtaContable = [...this.lstCtaContable]
      this.lstTempCtaContable = [...this.lstTempCtaContable];
      this.pageCtaContable.count = response.RowCount
    })
  }
  //----------------------------------------------------------------------------------------------------MODAL
  AbrirModalBanco(contentBanco,event)
  {
    this.ListarBanco();
    this.lstBanco = [...this.lstTempBanco];
    event.preventDefault();
    this.open(contentBanco, 'lg');
  }
  AbrirModalCheque(content,event){
    this.ListarCheques();
    this.lstCheque = [...this.lstCheque];
    event.preventDefault();
    this.open(content,'lg')
  }
  AbrirModalProveedor(content, event?)
  {
    this.ListarProveedor();
    if (event != null || event != undefined)
      event.preventDefault();
    this.lstProveedor = [...this.lstTempProveedor];
    this.open(content, 'lg');
  }
  AbrirModalMoneda(content, event?)
  {
    if (event != null || event != undefined)
      event.preventDefault();
    this.lstMoneda = [...this.lstTempMoneda];
    this.open(content, 'lg');
  }
  AbrirModalPago(content, codProveedor , event?)
  {
    if (event != null || event != undefined)
      event.preventDefault();

    let oPaginar: Paginar = {
      ColumnSort: this.pagePago.orderBy,
      CurrentPage: this.pagePago.offset + 1,
      PageSize: this.pagePago.limit,
      TypeSort: this.pagePago.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }
    this.codProveedor = codProveedor;
    if(codProveedor != '' && codProveedor != undefined)
    {
      oPaginar.ColumnFilters.push('codProveedor');
      oPaginar.ValueFilters.push(codProveedor);
    }
    this._servProveedor.listar_Pagos_pendiente(oPaginar).subscribe( response => {
      this.lstPago = response.Results
      this.lstTempPago = response.Results
      this.lstPago = [...this.lstTempPago]
      this.pagePago.count = response.RowCount
      this.open(content, 'lg')
    })
  }
  AbrirModalCtaContable(content, event?)
  {
    this.ListarCtaContable();
    if (event != null || event != undefined)
      event.preventDefault();
    this.lstCtaContable = [...this.lstTempCtaContable];
    this.open(content, 'xl');
  }
  open(content, size) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: size
    });
  }
  //----------------------------------------------------------------------------------------------------PAGINADOS
  onSortProveedor(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string })
  {
    this.pageProveedor.orderDir = sortInfo.sorts[0].dir;
    this.pageProveedor.orderBy = sortInfo.sorts[0].prop;
    this.pageProveedor.offset = 0;
    this.ListarProveedor();
  }
  setPageProveedor(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.pageProveedor.offset = pageInfo.offset;
    this.ListarProveedor();
  }
  onSortPago(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string })
  {
    this.pagePago.orderDir = sortInfo.sorts[0].dir;
    this.pagePago.orderBy = sortInfo.sorts[0].prop;
    this.pagePago.offset = 0;
    this.ListarPago();
  }
  setPagePago(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.pagePago.offset = pageInfo.offset;
    this.ListarPago();
  }
  onSortCtaContable(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string })
  {
    this.pageCtaContable.orderDir = sortInfo.sorts[0].dir;
    this.pageCtaContable.orderBy = sortInfo.sorts[0].prop;
    this.pageCtaContable.offset = 0;
    this.ListarCtaContable();
  }
  setPageCtaContable(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.pageCtaContable.offset = pageInfo.offset;
    this.ListarCtaContable();
  }
  //----------------------------------------------------------------------------------------------------BUSQUEDA
  BuscarProveedor(event) {
    this.strBusquedaProveedor = event.target.value.toLowerCase();
    this.pageProveedor.offset = 0;
    this.ListarProveedor();
  }
  BuscarPago(event) {
    this.strBusqueda = event.target.value.toLowerCase();
    this.pagePago.offset = 0;
    this.ListarPago()
  }
  BuscarCtaContable(event) {
    this.strBusquedaCtaContable = event.target.value.toLowerCase();
    this.pageCtaContable.offset = 0;
    this.ListarCtaContable()
  }
  //----------------------------------------------------------------------------------------------------SELECCION
  SeleccionarProveedor(event, value)
 {
   event.preventDefault();
   if (this.currentRowDtl != undefined)
   {
     this.lstDetallePago[this.currentRowDtl].CodProveedor = value.CodProveedor
     this.lstDetallePago[this.currentRowDtl].nomProveedor = value.NomProveedor
     if (this.lstDetallePago[this.currentRowDtl].CodDocumento == "Documento")
     {
       this.lstDetallePago[this.currentRowDtl].CodDocumento = undefined
       this.lstDetallePago[this.currentRowDtl].DescDocumento = undefined
       this.lstDetallePago[this.currentRowDtl].NumeroDoc = undefined
       this.lstDetallePago[this.currentRowDtl].Serie = undefined
       this.lstDetallePago[this.currentRowDtl].Nro = undefined
       this.lstDetallePago[this.currentRowDtl].CodMoneda = undefined
       this.lstDetallePago[this.currentRowDtl].DescMoneda = undefined
       this.lstDetallePago[this.currentRowDtl].TotalMN = undefined
       this.lstDetallePago[this.currentRowDtl].TotalME = undefined
       this.lstDetallePago[this.currentRowDtl].TotalDet = undefined
     }
     this.lstDetallePago = [...this.lstDetallePago]
   }
   this.modalService.dismissAll();
 }
  SeleccionarBanco(event, Valor){
    event.preventDefault();
    this.lstDetallePago = this.ListaInicialPago();
    this.oProveedor.Banco.CodBanco = Valor.CodBanco;
    this.oProveedor.Banco = Valor;
    this.modalService.dismissAll();
  }
  SeleccionarCheque(event,value){
    event.preventDefault();
    this.oProveedor.Cheque = value
    this.oProveedor.TotalDoc = this.oProveedor.Cheque.TotalDoc;
    this.oProveedor.TotalPagar = this.oProveedor.Cheque.TotalDoc;
    this.modalService.dismissAll();
  }
  SeleccionarMoneda(event, value)
  {
    event.preventDefault();
    this.lstDetallePago[this.currentRowDtl].CodMoneda = value.CodMoneda
    this.lstDetallePago[this.currentRowDtl].DescMoneda = value.DescMoneda
    this.lstDetallePago = [...this.lstDetallePago]
    this.CalcularTotales()
    this.modalService.dismissAll();
  }
  SeleccionarTipoOperacion()
  {
    if(this.oProveedor.Opcion == 0 )
    {
      if (this.oProveedor.CodClaseDoc != undefined && this.oProveedor.CodClaseDoc != "")
      {
        let oDoc: Documento = this.lstOperacion.filter(x => x.CodDocumento == this.oProveedor.CodClaseDoc)[0]
          this.oProveedor.Serie = oDoc.Serie
          this.oProveedor.numero = oDoc.Numero
          this.oProveedor.CodDocDet = oDoc.CodDocumento;
          this.oProveedor.numDocDet = oDoc.Serie+"-"+oDoc.Numero
      }
      else
      {
        this.oProveedor.Serie = undefined
        this.oProveedor.numero = undefined
      }
    }
  }
  SeleccionarPago(event,valor){
    event.preventDefault();
    if(this.currentRowDtl != undefined){
      if(this.oProveedor.ValorTC == undefined || this.oProveedor.ValorTC == 0){
        this.ErrorPorTexto("Debe ingresar una TC númerica mayor que 0")
          return false;
      }
      this.lstDetallePago[this.currentRowDtl].CodProveedor = valor.CodProveedor
      this.lstDetallePago[this.currentRowDtl].nomProveedor = valor.nomProveedor
      this.lstDetallePago[this.currentRowDtl].NumeroDoc = valor.NumeroDoc
      this.lstDetallePago[this.currentRowDtl].CodDocumento = valor.CodDocumento
      this.lstDetallePago[this.currentRowDtl].DescDocumento = valor.DescDocumento
      this.lstDetallePago[this.currentRowDtl].CodMoneda = valor.CodMoneda
      this.lstDetallePago[this.currentRowDtl].DescMoneda = valor.DescMoneda
      let nroSerie = valor.NumeroDoc.split('-')
      this.lstDetallePago[this.currentRowDtl].Serie = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
      this.lstDetallePago[this.currentRowDtl].Nro = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
      this.lstDetallePago[this.currentRowDtl].ValorTC = (this.oProveedor.ValorTC != undefined ? this.oProveedor.ValorTC : 0)
      let total = this.ConvertirTotalMNME(valor.Saldo, valor.CodMoneda)
      this.lstDetallePago[this.currentRowDtl].TotalMN = ( valor.CodMoneda == "MO001"  ? valor.Saldo : total)
      this.lstDetallePago[this.currentRowDtl].TotalME = ( valor.CodMoneda == "MO002" ? valor.Saldo : total)
      this.lstDetallePago[this.currentRowDtl].TotalDet = this.lstDetallePago[this.currentRowDtl].TotalMN
      this.lstDetallePago = [...this.lstDetallePago]
      this.CalcularTotales()
    }
    this.modalService.dismissAll();
  }
  SeleccionarCtaContable(event, value)
  {
    event.preventDefault();
    this.lstDetallePago[this.currentRowDtl].Codctacontable = value.CodCuenta
    this.lstDetallePago[this.currentRowDtl].DescPlanContable = value.DescCuenta
    this.lstDetallePago = [...this.lstDetallePago]
    this.modalService.dismissAll();
  }
  //----------------------------------------------------------------------------------------------------EVENTOS
  zeroFill( number, width )
  {
    width -= number.toString().length;
    if ( width > 0 )
    {
      return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + ""; // siempre devuelve tipo cadena
  }
  ObtenerTC = this._tipocambio.obtener(this.FecActual.day + '/' + this.FecActual.month + '/' + this.FecActual.year).subscribe( response =>{
    this.oTipoCambio = response
    console.log(this.oTipoCambio);
    if(this.Modificar == true){
      if (this.oProveedor.CodMoneda== "MO001"){
        this.oProveedor.ValorTC = this.oTipoCambio.ValorVenta
      }else{
        this.oProveedor.ValorTC = this.oTipoCambio.ValorCompra
      }
    }
  });

  ObtenerTipoCambio()
  {
    //debugger
    this._tipocambio.obtener(this.oProveedor.dFecEmision.day + '/' + this.oProveedor.dFecEmision.month + '/' + this.oProveedor.dFecEmision.year).subscribe( response =>{
      this.oTipoCambio = response
      //debugger;
      if (!this.ocultar)
      {
        if (this.oProveedor.CodMoneda== "MO001"){
          this.oProveedor.ValorTC = this.oTipoCambio.ValorVenta
        }else{
          this.oProveedor.ValorTC = this.oTipoCambio.ValorCompra
        }
      }
    })
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
  BuscarMoneda(event) {
    const val = event.target.value.toLowerCase();
    let temp = this.lstTempMoneda;
    switch (this.tipoBusquedaMoneda) {
      case "0":
        temp = this.lstTempMoneda.filter(function(d) {
          return d.CodMoneda.toLowerCase().indexOf(val) !== -1 || !val;
        });
        break;
      case "1":
        temp = this.lstTempMoneda.filter(function(d) {
          return d.DescMoneda.toLowerCase().indexOf(val) !== -1 || !val;
        });
        break;
      default:
        break;
    }
    this.lstMoneda = [...temp];
  }
  ListaInicialPago()
  {
    const lstTemp = [];
    for (let index = 0; index < 10; index++) {

      const d = index + 1
      lstTemp.push({
        tipoDocumento: undefined,
        NumItem: undefined,
        CodProveedor: undefined,
        nomProveedor: undefined,
        CodDocumento: undefined,
        DescDocumento: undefined,
        Serie: undefined,
        Nro: undefined,
        ValorTC: undefined,
        CodMoneda: undefined,
        DescMoneda: undefined,
        TotalMN: undefined,
        TotalME: undefined,
        Codctacontable: undefined,
        DescPlanContable: undefined,
      })

    }
    return lstTemp;
  }

  EliminarFila(rowIndex){
    console.log(rowIndex)
    this.lstDetallePago.splice(rowIndex, 1)
    let i = 1
    this.lstDetallePago.filter(x => x.NumItem != undefined).forEach(obj => {
      obj.NumItem = i
      i++
    });
    this.lstDetallePago = [...this.lstDetallePago]
    if (this.lstDetallePago.filter(x => x.NumItem == undefined).length == 0)
    {
      this.AgregarDetallePorDefecto()
    }
    this.oProveedor.ListaDetalle = this.lstDetallePago.filter(x => x.NumItem != undefined)
    this.CalcularTotales();
  }
  AgregarDetallePorDefecto()
  {
    const lstTemp = this.lstDetallePago
      lstTemp.push({
        tipoDocumento:undefined,
        NumItem:undefined,
        CodProveedor:undefined,
        nomProveedor:undefined,
        NumeroDoc:undefined,
        CodDocumento:undefined,
        DescDocumento:undefined,
        Serie:undefined,
        Nro:undefined,
        ValorTC:undefined,
        CodMoneda:undefined,
        DescMoneda:undefined,
        TotalMN:undefined,
        TotalME:undefined,
        TotalDet:undefined,
        numDocDet:undefined,
        Codctacontable:undefined,
        DescPlanContable:undefined,
        Descripcion:undefined,
        FecRegistro:undefined,
        TotalDoc:undefined,
        FecCobrado:undefined,
        Mostrar:undefined,
      })

      this.lstDetallePago = [...lstTemp];
  }

  ActualizarFila(event, cell, rowIndex) {
    console.log(rowIndex)
    console.log(cell);
    console.log(this.editing);
    this.editing[rowIndex + '-' + cell] = false
    let val = event.target.value != undefined && event.target.value != '' ? event.target.value : undefined;
    if (Number(val))
      val = event.target.value != undefined && event.target.value != '' ? Number(event.target.value) : undefined
    this.lstDetallePago[rowIndex][cell] = val
    switch (cell) {
      case "tipoDocumento":
          this.lstDetallePago[rowIndex].tipoDocumento = (val != undefined && val != "" ? val : "Documento")
          if (this.lstDetallePago[rowIndex].NumItem == undefined)
          {
            const lstDtl = this.lstDetallePago.filter(x => x.NumItem == undefined)
            let i = this.lstDetallePago.length - lstDtl.length
            let NroItem = rowIndex + 1
            this.lstDetallePago[rowIndex].NumItem = NroItem
          }
          switch (val) {
            case "Documento":
              this.lstDetallePago[rowIndex].CodProveedor = undefined
              this.lstDetallePago[rowIndex].nomProveedor = undefined
              this.lstDetallePago[rowIndex].CodDocumento = undefined
              this.lstDetallePago[rowIndex].DescDocumento = undefined
              this.lstDetallePago[rowIndex].Serie = undefined
              this.lstDetallePago[rowIndex].Nro = undefined
              this.lstDetallePago[rowIndex].ValorTC = (this.oProveedor.ValorTC != undefined ? this.oProveedor.ValorTC : 0)
              this.lstDetallePago[rowIndex].CodMoneda = undefined
              this.lstDetallePago[rowIndex].DescMoneda = undefined
              this.lstDetallePago[rowIndex].TotalMN = undefined
              this.lstDetallePago[rowIndex].TotalME = undefined
              this.lstDetallePago[rowIndex].Codctacontable = undefined
              this.lstDetallePago[rowIndex].DescPlanContable = undefined
              break;
            case "Diversos":
              this.lstDetallePago[rowIndex].ValorTC = (this.oProveedor.ValorTC != undefined ? this.oProveedor.ValorTC : 0)
              let lstDiverso = this.lstDocumentoBat.filter(x => x.Grupo.toUpperCase() == "INVENTARIO" && x.Clave.toUpperCase() == "SDIV");
              let codDocumentoDiv =  (lstDiverso.length > 0 ? lstDiverso[0].Valor :"DIV");
              this.lstDetallePago[rowIndex].CodDocumento = codDocumentoDiv;
              this.lstDetallePago[rowIndex].DescDocumento = "DIVERSO"
              this._documento.Buscarporcodigoactivopdiv(this.lstDetallePago[rowIndex].CodDocumento,'PAGO').subscribe(pago=>{
                this.lstDetallePago[rowIndex].Serie = pago.Serie
                this.lstDetallePago[rowIndex].Nro = pago.Numero
                this.lstDetallePago[rowIndex].NumeroDoc = pago.Serie + "-" + pago.Numero

                this.lstDetallePago.forEach(y=>{
                  if(y.CodDocumento == codDocumentoDiv){
                    let numItem2 = y.NumItem;
                    console.log(codDocumentoDiv)
                    if(y.NumItem == 1)
                      numItem2 =0
                      y.Nro =  this.zeroFill((parseInt(pago.Numero) + numItem2),7);
                      y.NumeroDoc = y.Serie + "-" + y.Nro
                  }
                })
              })
              this.lstDetallePago[rowIndex].CodProveedor = undefined
              this.lstDetallePago[rowIndex].nomProveedor = undefined
              this.lstDetallePago[rowIndex].CodMoneda = undefined
              this.lstDetallePago[rowIndex].DescMoneda = undefined
              this.lstDetallePago[rowIndex].TotalMN = undefined
              this.lstDetallePago[rowIndex].TotalME = undefined
              this.lstDetallePago[rowIndex].Codctacontable = undefined
              this.lstDetallePago[rowIndex].DescPlanContable= undefined
              break;
              case "Anticipo":
              this.lstDetallePago[rowIndex].ValorTC = (this.oProveedor.ValorTC != undefined ? this.oProveedor.ValorTC : 0)
              let lstAnticipo = this.lstDocumentoBat.filter(x => x.Grupo.toUpperCase() == "COMPRA" && x.Clave.toUpperCase() == "SATP");
              let CodDocumentoAtp =  (lstAnticipo.length > 0 ? lstAnticipo[0].Valor :"ATP");
              this.lstDetallePago[rowIndex].CodDocumento = CodDocumentoAtp;
              this.lstDetallePago[rowIndex].DescDocumento = "ANTICIPO"
              this._documento.Buscarporcodigoactivopdiv(this.lstDetallePago[rowIndex].CodDocumento,'PAGO').subscribe(pago=>{
                this.lstDetallePago[rowIndex].Serie = pago.Serie
                this.lstDetallePago[rowIndex].Nro = pago.Numero
                this.lstDetallePago[rowIndex].NumeroDoc = pago.Serie + "-" + pago.Numero

                this.lstDetallePago.forEach(y=>{
                  if(y.CodDocumento == CodDocumentoAtp){
                    let numItem2 = y.NumItem;
                    if(y.NumItem == 1)
                      numItem2 =0
                      y.Nro =  this.zeroFill((parseInt(pago.Numero) + numItem2),7);
                      y.NumeroDoc = y.Serie + "-" + y.Nro
                  }
                })
              })
              this.lstDetallePago[rowIndex].CodProveedor = undefined
              this.lstDetallePago[rowIndex].nomProveedor = undefined
              this.lstDetallePago[rowIndex].CodMoneda = undefined
              this.lstDetallePago[rowIndex].DescMoneda = undefined
              this.lstDetallePago[rowIndex].TotalMN = undefined
              this.lstDetallePago[rowIndex].TotalME = undefined
              this.lstDetallePago[rowIndex].Codctacontable = undefined
              this.lstDetallePago[rowIndex].DescPlanContable = undefined
              break;
              default:
              break;
          }
        break;
        case "TotalMN":
          let tmCodMon = this.lstDetallePago[rowIndex].CodMoneda;
          let tmSaldo = val;
          let total = this.ConvertirTotalMNME(tmSaldo, "MO001");
          let totalMN = ( tmCodMon == "MO001" ? tmSaldo : total)
          this.lstDetallePago[rowIndex].TotalME = Number((val / this.oProveedor.ValorTC).toFixed(2))
        break;
        case "TotalME":
          let tmCodMonME = this.lstDetallePago[rowIndex].CodMoneda;
          let tmSaldoME = val;
          let totalM = this.ConvertirTotalMNME(tmSaldoME, "MO002");
          let totalME = ( tmCodMonME == "MO002" ? tmSaldoME : totalM)
          this.lstDetallePago[rowIndex].TotalMN = Number((val * this.oProveedor.ValorTC).toFixed(2))
        break;
        case "ValorTC":
           let tmCodMonMVT = this.lstDetallePago[rowIndex].CodMoneda;
           let tmSaldoMVT = val;
           console.log(tmSaldoMVT)
           if(tmCodMonMVT == "MO002"){
             this.convertirTC(val,tmCodMonMVT,rowIndex);
             return this.lstDetallePago[rowIndex].ValorTC = Number((val).toFixed(2));
            }else{
              this.convertirTC(val,tmCodMonMVT,rowIndex);
              return this.lstDetallePago[rowIndex].ValorTC = Number((val).toFixed(2));
            }
        break;
        default:
        break;
    }
    this.lstDetallePago = [...this.lstDetallePago]
    if (this.lstDetallePago.filter(x => x.NumItem == undefined).length == 0)
    {
      this.AgregarDetallePorDefecto()
    }
    this.oProveedor.ListaDetalle = this.lstDetallePago.filter(x => x.NumItem != undefined)
    this.CalcularTotales();
  }

  convertirTC(val,tmCodMonMVT,rowIndex){
    if(tmCodMonMVT == "MO002"){
      this.lstDetallePago[rowIndex].TotalMN = Number((val * this.lstDetallePago[rowIndex].TotalME).toFixed(2));
      this.CalcularTotales();
     }else{
      this.lstDetallePago[rowIndex].TotalME = Number((this.lstDetallePago[rowIndex].TotalMN / val).toFixed(2));
      this.CalcularTotales();
    }
  }
//------------------FALTA VERIFICAR EL CAMBIO DE LA TABLA
  SeleccionarDetalle(event){
    if(this.Modificar){
    (event.type === 'dblclick') && event.cellElement.blur();
    const rowIndex = this.tbDetalle.bodyComponent.getRowIndex(event.row);
    switch (event.type) {
      case 'click':
        if(!this.ocultar && this.oProveedor.Banco.CodBanco != undefined)
        {
          switch (event.column.prop) {
            case "tipoDocumento":
                this.editing[rowIndex + '-tipoDocumento'] = true
              break;

            default:
              break;
          }
        }
        break;
      case 'dblclick':
        if(!this.ocultar && this.oProveedor.Banco.CodBanco != undefined)
        {
          if (event.row.NumItem != undefined)
          {
            switch (event.column.prop) {
              case "NumItem":
                this.deleteSwal.fire().then(result => {
                  if (result.value) {
                    this.EliminarFila(rowIndex)
                  }
                })
              break;
              case "CodDocumento":
                if(event.row.tipoDocumento == "Documento"){
                  this.currentRowDtl = rowIndex;
                  this.AbrirModalPago(this.modalPago,(event.row.codProveedor != undefined ? event.row.codProveedor : ""));
                }
              break;
              case "CodProveedor":
              this.currentRowDtl = rowIndex;
              this.AbrirModalProveedor(this.modalProveedor)
              break;
              case "CodMoneda":
              if(event.row.tipoDocumento != "Documento" && event.row.CodProveedor){
                this.currentRowDtl = rowIndex;
                this.AbrirModalMoneda(this.modalMoneda)
              }
            break;
            case "TotalMN":
            if(event.row.CodDocumento != undefined)
            {
              if(this.oProveedor.ValorTC == undefined || this.oProveedor.ValorTC == 0)
              {
                this.ErrorPorTexto("Debe ingresar una TC númerica mayor que 0")
                    return false;
              }
              this.editing[rowIndex + '-TotalMN'] = true;
            }
            break;
            case "ValorTC":
              if(event.row.CodDocuemnto != undefined){
                if(this.oProveedor.ValorTC == undefined || this.oProveedor.ValorTC == 0)
              {
                this.ErrorPorTexto("Debe ingresar una TC númerica mayor que 0")
                    return false;
              }
              this.editing[rowIndex + '-ValorTC'] = true;
              }
            break;
            case "TotalME":
                if (event.row.CodDocumento != undefined)
                {
                  if (this.oProveedor.ValorTC == undefined ||
                    this.oProveedor.ValorTC == 0)
                  {
                    this.ErrorPorTexto("Debe ingresar una TC númerica mayor que 0")
                    return false;
                  }
                  this.editing[rowIndex + '-TotalME'] = true
                }
                break;
            case "Codctacontable":
                if(event.row.tipoDocumento != "Documento"){
                  this.currentRowDtl = rowIndex;
                  this.AbrirModalCtaContable(this.modalCtaContable)
                }
            break;
            case "Mostrar":
              if(event.row.Mostrar == "X")
              {
                this.lstDetallePago[rowIndex].Mostrar = undefined
              }
              else
              {
                this.lstDetallePago[rowIndex].Mostrar = "X"
              }
              break;
            default:
              break;
            }
          }
        }
        break;
      default:
        break;
    }
  }
  }
  ConvertirTotalMNME(Saldo, CodMoneda)
  {
    //debugger;
    let total = 0
    switch (this.oProveedor.CodMoneda) {
      case "MO001":
        if (CodMoneda == "MO002")
          total =  Number((Saldo * this.oProveedor.ValorTC).toFixed(2))
        if (CodMoneda == "MO001")
          total =  Number((Saldo / this.oProveedor.ValorTC).toFixed(2))
        break;
      case "MO002":
        if (CodMoneda == "MO001")
          total =  Number((Saldo / this.oProveedor.ValorTC).toFixed(2))
        if (CodMoneda == "MO002")
          total =  Number((Saldo * this.oProveedor.ValorTC).toFixed(2))
        break;
      default:
        break;
    }
    return total;
  }
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
  CalcularTotales()
  {
    if (!this.ocultar)
    {
      this.oProveedor.TotalMN = 0;
      this.oProveedor.TotalME = 0;

      this.lstDetallePago.filter(x => x.NumItem != undefined).forEach(obj => {
        obj.ValorTC = (this.oProveedor.ValorTC != undefined ? this.oProveedor.ValorTC : 0)
        let totalMN = (obj.TotalMN != undefined ? obj.TotalMN : 0)
        let totalME = (obj.TotalME != undefined ? obj.TotalME : 0)
        this.oProveedor.TotalMN = (this.oProveedor.TotalMN != undefined ? Number((this.oProveedor.TotalMN + totalMN).toFixed(2)) : 0)
        this.oProveedor.TotalME = (this.oProveedor.TotalME != undefined ? Number((this.oProveedor.TotalME + totalME).toFixed(2)) : 0)
        obj.TotalDet = obj.TotalMN
      });

      if (this.oProveedor.CodMoneda == "MO001"){
        this.oProveedor.Saldo = (this.oProveedor.TotalPagar != undefined && this.oProveedor.TotalMN != undefined ? Number((this.oProveedor.TotalMN).toFixed(2)) : 0)
      }
      else
      {
        this.oProveedor.Saldo = (this.oProveedor.TotalPagar != undefined && this.oProveedor.TotalME != undefined ? Number((this.oProveedor.TotalPagar - this.oProveedor.TotalME).toFixed(2)) : 0)
      }
      this.lstDetallePago = [...this.lstDetallePago]
      console.log('Calcular Totales: ' + this.lstDetallePago)
      this.oProveedor.ListaDetalle = this.lstDetallePago.filter(x => x.NumItem != undefined)
    }
  }
  AnularProveedor(){
    this.anularSwal.fire().then(res =>{
      if (res.value) {
      this._servProveedor.anular(this.oProveedor).subscribe(resp=>{
          this.formSwal.title = "Éxito";
          this.formSwal.text = "Se ha anulado correctamente.";
          this.formSwal.type = "success";
          this.formSwal.fire().then(result => {
            this.router.navigateByUrl('/GlassWeb/proveedor');
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
      })
    }
    })
  }
  UsuarioPermisos(permiso:string){
    let lstMenu: Menu[] = this.user.Menus.filter(x => x.Nombre = this.NombreMenu);
    if(lstMenu.length > 0){
      let lstPermisos: Permiso[] = this.user.Permisos.filter( x => x.Codigo == lstMenu[0].Codigo);
      if(lstPermisos.length > 0){
        console.log(lstPermisos)
        switch(permiso){
          case "escritura":
            this.ocultar = (lstPermisos[0].escritura == 1 ? false : true);
            this.Modificar = (lstPermisos[0].Actualiza == 1 ? true : false);
          break;
          case "actualiza":
            this.ocultar = (lstPermisos[0].Actualiza == 1 ? false : true);
            this.Modificar = (lstPermisos[0].Actualiza == 1 ? false : true);
          break;
          case "anular":
            this.EsEnableAnular = (lstPermisos[0].Anular == 1 ? false : true);
          break;
          default:
          break;
        }

      }
    }
  }

  GuardarPagoProveedor(){
    console.log(this.oProveedor)
    if(this.formProveedor.valid || this.formProveedor.disabled){
      if(this.oProveedor.ListaDetalle.length > 0){
        for(const prop in this.editing){
          if(this.editing[prop])
          return this.ErrorPorTexto("Verifique que todos los campos editables del detalle se encuentren deshabilitado.");
        }
        if(this.oProveedor.TotalPagar <= 0)
          return this.ErrorPorTexto("El Total a Pagar debeSer Mayor a 0")
        this.oProveedor.numDocDet = (this.oProveedor.numero != undefined && this.oProveedor.Serie != undefined ? this.oProveedor.Serie + '-' + this.oProveedor.numero : undefined)
        this.oProveedor.FecEmision = (this.oProveedor.dFecEmision != undefined ? formatNgbDateStruct(this.oProveedor.dFecEmision) : undefined)
        this.oProveedor.FecRegistro = (this.oProveedor.dFecRegistro != undefined ? formatNgbDateStruct(this.oProveedor.dFecRegistro) : undefined)
        let result ={}
        console.log(this.oProveedor);
        this._servProveedor.guardar(this.oProveedor).subscribe(response =>{
          result = response;
          this.formSwal.title = "Éxito";
          this.formSwal.text = "Se ha registrado correctamente.";
          this.formSwal.type = "success";
          this.formSwal.fire().then(result => {
            this.router.navigateByUrl('/GlassWeb/proveedor');
          });
          this.ocultar = false;
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
                  strMensaje +=  "<br>";
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
          this.ocultar = false;
          console.log(error)
        })
        }else{
          this.ErrorPorTexto("Debe Agregar Tipos de Documentos")
          this.isVisualizar = false;
        }

    } else
    {
      this.ErrorPorTexto("Complete los campos obligatorios");
      this.isVisualizar = true;
    }
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
  ErrorGenerico()
  {
    this.formSwal.title = "Error";
    this.formSwal.text = "Ha ocurrido un error inesperado, contacte con su administrador.";
    this.formSwal.type = "error";
    this.formSwal.fire();
  }
}
