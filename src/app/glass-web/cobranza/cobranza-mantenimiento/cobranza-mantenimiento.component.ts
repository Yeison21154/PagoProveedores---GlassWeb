import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgbDateParserFormatter, NgbDatepickerI18n, NgbCalendar, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateCustomParserFormatter } from 'src/app/others/NgbDateCustomParserFormatter';
import { CustomDatepickerI18n } from 'src/app/others/NgbDatePickerES';
import { FormBuilder, Validators } from '@angular/forms';
import { Usuario, Sucursal, Cobranzas, TipoCambio, Documento, Moneda, CobranzasDtl, Parametro, Banco, Cliente, CuentaXCobrar, DocumentoBat, CuentaContable, DetraccionVenta, Cajero, Menu, Permiso, Paginar } from 'src/app/others/interfaces';
import { UsuarioService } from 'src/app/services/usuario.service';
import { TipoCambioService } from 'src/app/services/tipo-cambio.service';
import { MonedaService } from 'src/app/services/moneda.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BancoService } from 'src/app/services/banco.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ClienteService } from 'src/app/services/cliente.service';
import { CobranzasService } from 'src/app/services/cobranzas.service';
import { isNumber } from 'util';
import { formatNgbDateStruct, formatDateToNgbDateStruct } from 'src/app/others/utilBootstrap';

@Component({
  selector: 'app-cobranza-mantenimiento',
  templateUrl: './cobranza-mantenimiento.component.html',
  styleUrls: ['./cobranza-mantenimiento.component.css'],
  providers: [
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter},
    {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}
  ],
  encapsulation: ViewEncapsulation.None,
})
export class CobranzaMantenimientoComponent implements OnInit {

  constructor(private calendar: NgbCalendar,
    private formBuilder: FormBuilder,
    private _usuarios: UsuarioService,
    private _documento: DocumentoService,
    private _moneda: MonedaService,
    private _tipocambio: TipoCambioService,
    private _banco: BancoService,
    private _cobranza: CobranzasService,
    private _cliente: ClienteService,
    private activerouter: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal) { }

    @ViewChild("txtBusquedaBanco", {static: false}) txtBusquedaBanco: HTMLElement;
    @ViewChild("deleteSwal", {static: false}) deleteSwal: SwalComponent;
    @ViewChild("anularSwal", {static: false}) anularSwal: SwalComponent;
    @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
    @ViewChild("ErrorFormHtml", {static: false}) formSwalHtml: SwalComponent;
    @ViewChild("tbDetalle", {static: false}) tbDetalle: DatatableComponent;
    @ViewChild("contentCliente", {static: false}) modalCliente: NgbModal;
    @ViewChild("contentCobro", {static: false}) modalCobro: NgbModal;
    @ViewChild("contentMoneda", {static: false}) modalMoneda: NgbModal;
    @ViewChild("contentCtaContable", {static: false}) modalCtaContable: NgbModal;
    @ViewChild("contentDetraccion", {static: false}) modalDetraccion: NgbModal;

  pageCobro = {
    limit: 10,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };

  pageCliente = {
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

  codCliente: string = ''
  strBusqueda: string = ''
  strBusquedaCliente: string = ''
  strBusquedaCtaContable: string = ''

  formCobranza = this.formBuilder.group({
    CodBanco: ['', [Validators.required]],
    DescBanco: [''],
    CodCajero: ['', [Validators.required]],
    DescCajero: [''],
    CodOperacion: ['', [Validators.required]],
    Serie: ['', [Validators.required]],
    Nro: ['', [Validators.required]],
    OperacionConstancia: [''],
    fecEmision: ['', [Validators.required]],
    Numero: [''],
    CodMoneda: [''],
    TC: ['', [Validators.required]],
    TotalPagar: ['', [Validators.required]],
    Glosa: [''],
    fecCobrado: ['', [Validators.required]],
    CodEstadoDocumento: [''],
    Saldo: ['', [Validators.required]],
    TotalMN: ['', [Validators.required]],
    TotalME: ['', [Validators.required]]
  })

  //SESIONES
  user: Usuario = this._usuarios.getUserLoggedIn()
  oSucursalSeleccionado:Sucursal = this._usuarios.getSucursal()
  oParametro: Parametro = this._usuarios.getParametro()
  lstDocumentoBat:DocumentoBat[] = this._usuarios.getDocumentosBat()

  FecActual:NgbDateStruct = this.calendar.getToday();

  oCobranzas: Cobranzas = {
    CodBanco : undefined,
    DescBanco: undefined,
    NumDocumento: undefined,
    Documento: undefined,
    DescDocumento: undefined,
    CodCajero: this.user.Cajero.CodCajero,
    DescCajero: undefined,
    CodDocumento: undefined,
    CodOperacion: "",
    SerieDoc: undefined,
    NroDoc: undefined,
    NumeroDoc: undefined,
    OperacionConstancia: undefined,
    FechaEmision: undefined,
    dFecEmision: this.FecActual,
    FecRegistro: undefined,
    comentarioDoc: undefined,
    Numero: undefined,
    DescMoneda: undefined,
    CodMoneda: "MO001",
    ValorTC: 0,
    TotalPagar: 0,
    FechaCobrado: undefined,
    dFecCobrado: this.FecActual,
    Glosa: "",
    EstadoDoc: 4,
    Saldo: undefined,
    TotalME: 0,
    TotalMN: 0,
    CodUsuario: undefined,
    CodigoSucursal: undefined,
    Opcion: 0,
    ListaDetalle: [],
    Banco: {
      CodBanco: undefined,
      CodMoneda: undefined,
      DescBanco: undefined,
      DescMoneda: undefined
    },
    Cajero: {
      CodCajero: this.user.Cajero.CodCajero,
      DescCajero: this.user.Cajero.DescCajero
    }
  }

  oCobranzasDtl: CobranzasDtl = {
    tipoDocumento: undefined,
    NumItem: undefined,
    CodCliente: undefined,
    nomCliente: undefined,
    CodDocumento: undefined,
    DescDocumento: undefined,
    DocumentoDet: undefined,
    Serie: undefined,
    Nro: undefined,
    NumeroDoc: undefined,
    ValorTC: undefined,
    CodMoneda: undefined,
    DescMoneda: undefined,
    Saldo: undefined,
    TotalDet: undefined,
    TotalMN: undefined,
    TotalME: undefined,
    CodDetraccion: undefined,
    Monto: undefined,
    Codctacontable: undefined,
    DescPlanContable: undefined,
    comentarioDet: undefined,
    MueveSaldoBanco: undefined,
    Mostrar: undefined,
    LetraDescto: undefined,
    CodRef: undefined,
    NroLetra: undefined
  }


  //LISTAS
  lstDocumento:Documento[] = []
  lstMoneda: Moneda[] = []
  lstBanco: Banco[] = []
  lstCliente: Cliente[] = []
  lstCobro: CuentaXCobrar[] = []
  lstCtaContable: CuentaContable[] = []
  lstDetraccion: DetraccionVenta[] = []

  //TEMPORALES
  lstDetalleCobranza: CobranzasDtl[] = []
  lstTempBanco: Banco[] = []
  lstTempCliente: Cliente[] = []
  lstTempCobro: CuentaXCobrar[] = []
  lstTempMoneda: Moneda[] = []
  lstTempCtaContable: CuentaContable[] = []
  lstTempDetraccion: DetraccionVenta[] = []



  ListarDocumento = this._documento.listar_cobranzas_activos(this.oSucursalSeleccionado.CodigoSucursal).subscribe( response => {
    this.lstDocumento = response
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
  }
  )

  ListarMoneda = this._moneda.listar_activos().subscribe( response => {
    this.lstMoneda = response
    this.lstTempMoneda = response
  })

  ListarBanco = this._banco.listar_activos(this.user.Cajero.CodCajero).subscribe( response => {
    this.lstBanco = response
    this.lstTempBanco = response
  })

  ObtenerTC = this._tipocambio.obtener(this.FecActual.day + '/' + this.FecActual.month + '/' + this.FecActual.year).subscribe( response =>{
    this.oTipoCambio = response
    if (this.oCobranzas.CodMoneda== "MO001"){
      this.oCobranzas.ValorTC = this.oTipoCambio.ValorVenta
    }else{
      this.oCobranzas.ValorTC = this.oTipoCambio.ValorCompra
    }

  })



  //VARIABLES
  nombrePag = 'Nueva Cobranza'
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
  isSubmit = false
  EsDisableSubmit = false
  EsEnableAnular = true
  ValorIGV: number = 0
  tipoBusquedaBanco: string = '1'
  tipoBusquedaCliente: string = 'CodCliente'
  tipoBusquedaCobro: string = 'NumeroDoc'
  tipoBusquedaMoneda: string = '1'
  tipoBusquedaCtaContable: string = 'CodCuenta'
  tipoBusquedaDetraccion: string = '1'
  editing = {}
  currentRowDtl: number = undefined
  NombreMenu: string = 'mnuIngCobClientes'
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
          this.oCobranzas.SerieDoc = this.zeroFill(e.target.value, 3)
          break;
        case '2':
          this.oCobranzas.NroDoc = this.zeroFill(e.target.value, 7)
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

  //Metodos Cobranzas
  SeleccionarTipoOperacion()
  {
    if(this.oCobranzas.Opcion == 0)
    {
      if (this.oCobranzas.CodOperacion != undefined && this.oCobranzas.CodOperacion != "")
      {
        let oDoc: Documento = this.lstDocumento.filter(x => x.CodDocumento == this.oCobranzas.CodOperacion)[0]
        this.oCobranzas.SerieDoc = oDoc.Serie
        this.oCobranzas.NroDoc = oDoc.Numero
      }
      else
      {
        this.oCobranzas.SerieDoc = undefined
        this.oCobranzas.NroDoc = undefined
      }
    }
  }

  //Modal Banco
  AbrirModalBanco(content, event)
  {
    event.preventDefault();
    this.lstBanco = [...this.lstTempBanco];
    this.open(content, 'lg');
    console.log(this.txtBusquedaBanco);
    // this.txtBusquedaProveedor.nativeElement.focus();
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
    this.oCobranzas.CodBanco = value.CodBanco;
    this.oCobranzas.Banco.DescBanco = value.DescBanco;
    this.oCobranzas.CodMoneda = value.CodMoneda;
    this.lstDetalleCobranza = this.ListaInicialCobranza();
    this._cobranza.listar_detraccion(this.oCobranzas.CodBanco).subscribe( response => {
      this.lstDetraccion = response
      this.lstTempDetraccion = response
    })
    this.CalcularTotales();
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

  //MODAL CLIENTE
  onSortCliente(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string })
  {
    this.pageCliente.orderDir = sortInfo.sorts[0].dir;
    this.pageCliente.orderBy = sortInfo.sorts[0].prop;
    this.pageCliente.offset = 0;
    this.ListarCliente();
  }

  setPageCliente(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.pageCliente.offset = pageInfo.offset;
    this.ListarCliente();
  }

  ListarCliente()
  {
    let oPaginar: Paginar = {
      ColumnSort: this.pageCliente.orderBy,
      CurrentPage: this.pageCliente.offset + 1,
      PageSize: this.pageCliente.limit,
      TypeSort: this.pageCliente.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }

    if(this.strBusquedaCliente != '' && this.strBusquedaCliente != undefined)
    {
      oPaginar.ColumnFilters.push(this.tipoBusquedaCliente);
      oPaginar.ValueFilters.push(this.strBusquedaCliente);
    }
    debugger;
    this._cliente.listar_activos(oPaginar).subscribe( response => {
      this.lstCliente = response.Results
      this.lstTempCliente = response.Results
      this.lstCliente = [...this.lstCliente]
      this.lstTempCliente = [...this.lstTempCliente];
      this.pageCliente.count = response.RowCount
    })
  }

  AbrirModalCliente(content, event?)
  {
    if (event != null || event != undefined)
      event.preventDefault();
    this.lstCliente = [...this.lstTempCliente];
    this.open(content, 'lg');
  }

  SeleccionarCliente(event, value)
  {
    event.preventDefault();
    if (this.currentRowDtl != undefined)
    {
      this.lstDetalleCobranza[this.currentRowDtl].CodCliente = value.CodCliente
      this.lstDetalleCobranza[this.currentRowDtl].nomCliente = value.nomCliente
      if (this.lstDetalleCobranza[this.currentRowDtl].CodDocumento == "Documento")
      {
        this.lstDetalleCobranza[this.currentRowDtl].CodDocumento = undefined
        this.lstDetalleCobranza[this.currentRowDtl].DescDocumento = undefined
        this.lstDetalleCobranza[this.currentRowDtl].NumeroDoc = undefined
        this.lstDetalleCobranza[this.currentRowDtl].Serie = undefined
        this.lstDetalleCobranza[this.currentRowDtl].Nro = undefined
        this.lstDetalleCobranza[this.currentRowDtl].CodMoneda = undefined
        this.lstDetalleCobranza[this.currentRowDtl].DescMoneda = undefined
        this.lstDetalleCobranza[this.currentRowDtl].TotalMN = undefined
        this.lstDetalleCobranza[this.currentRowDtl].TotalME = undefined
        this.lstDetalleCobranza[this.currentRowDtl].TotalDet = undefined
      }
      this.lstDetalleCobranza = [...this.lstDetalleCobranza]
    }

    this.modalService.dismissAll();
  }

  BuscarCliente(event) {
    this.strBusquedaCliente = event.target.value.toLowerCase();
    this.pageCliente.offset = 0;
    this.ListarCliente()
  }

  onSortCobro(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string })
  {
    this.pageCobro.orderDir = sortInfo.sorts[0].dir;
    this.pageCobro.orderBy = sortInfo.sorts[0].prop;
    this.pageCobro.offset = 0;
    this.ListarCobro();
  }

  setPageCobro(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.pageCobro.offset = pageInfo.offset;
    this.ListarCobro();
  }

  ListarCobro()
  {
    let oPaginar: Paginar = {
      ColumnSort: this.pageCobro.orderBy,
      CurrentPage: this.pageCobro.offset + 1,
      PageSize: this.pageCobro.limit,
      TypeSort: this.pageCobro.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }

    if(this.codCliente != '' && this.codCliente != undefined)
    {
      oPaginar.ColumnFilters.push('CodCliente');
      oPaginar.ValueFilters.push(this.codCliente);
    }

    if(this.strBusqueda != '' && this.strBusqueda != undefined)
    {
      oPaginar.ColumnFilters.push(this.tipoBusquedaCobro);
      oPaginar.ValueFilters.push(this.strBusqueda);
    }
    this._cobranza.listar_cobro_activos(oPaginar).subscribe( response => {
      this.lstCobro = response.Results
      this.lstTempCobro = response.Results
      this.lstCobro = [...this.lstCobro]
      this.lstTempCobro = [...this.lstTempCobro];
      this.pageCobro.count = response.RowCount
    })
  }

  //MODAL COBRO
  AbrirModalCobro(content, CodCliente , event?)
  {
    if (event != null || event != undefined)
      event.preventDefault();

    let oPaginar: Paginar = {
      ColumnSort: this.pageCobro.orderBy,
      CurrentPage: this.pageCobro.offset + 1,
      PageSize: this.pageCobro.limit,
      TypeSort: this.pageCobro.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }
    this.codCliente = CodCliente;
    if(CodCliente != '' && CodCliente != undefined)
    {
      oPaginar.ColumnFilters.push('CodCliente');
      oPaginar.ValueFilters.push(CodCliente);
    }
    this._cobranza.listar_cobro_activos(oPaginar).subscribe( response => {
      this.lstCobro = response.Results
      this.lstTempCobro = response.Results
      this.lstCobro = [...this.lstTempCobro]
      this.pageCobro.count = response.RowCount
      this.open(content, 'lg')
    })

  }

  SeleccionarCobro(event, value)
  {
    event.preventDefault();
    if (this.currentRowDtl != undefined)
    {
      if (this.oCobranzas.ValorTC == undefined ||
        this.oCobranzas.ValorTC == 0)
        {
          this.ErrorPorTexto("Debe ingresar una TC númerica mayor que 0")
          return false;
        }
      this.lstDetalleCobranza[this.currentRowDtl].CodCliente = value.CodCliente
      this.lstDetalleCobranza[this.currentRowDtl].nomCliente = value.nomCliente
      this.lstDetalleCobranza[this.currentRowDtl].CodDocumento = value.CodDocumento
      this.lstDetalleCobranza[this.currentRowDtl].DescDocumento = value.DescDocumento
      this.lstDetalleCobranza[this.currentRowDtl].NumeroDoc = value.NumeroDoc
      let nroSerie = value.NumeroDoc.split('-')
      this.lstDetalleCobranza[this.currentRowDtl].Serie = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
      this.lstDetalleCobranza[this.currentRowDtl].Nro = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
      this.lstDetalleCobranza[this.currentRowDtl].CodMoneda = value.CodMoneda
      this.lstDetalleCobranza[this.currentRowDtl].DescMoneda = value.DescMoneda
      this.lstDetalleCobranza[this.currentRowDtl].ValorTC = (this.oCobranzas.ValorTC != undefined ? this.oCobranzas.ValorTC : 0)
      this.lstDetalleCobranza[this.currentRowDtl].Saldo = value.Saldo
      let total = this.ConvertirTotalMNME(value.Saldo, value.CodMoneda)
      this.lstDetalleCobranza[this.currentRowDtl].TotalMN = ( value.CodMoneda == "MO001"  ? value.Saldo : total)
      //CAMBIAR TC
      this.lstDetalleCobranza[this.currentRowDtl].TotalME = ( value.CodMoneda == "MO002" ? value.Saldo : total)
      this.lstDetalleCobranza[this.currentRowDtl].TotalDet = this.lstDetalleCobranza[this.currentRowDtl].TotalMN
      this.lstDetalleCobranza = [...this.lstDetalleCobranza]
      this.CalcularTotales()
    }

    this.modalService.dismissAll();
  }

  BuscarCobro(event) {
    this.strBusqueda = event.target.value.toLowerCase();
    this.pageCobro.offset = 0;
    this.ListarCobro()
  }

  //MODAL MONEDA
  AbrirModalMoneda(content, event?)
  {
    if (event != null || event != undefined)
      event.preventDefault();
    this.lstMoneda = [...this.lstTempMoneda];
    this.open(content, 'lg');
  }

  SeleccionarMoneda(event, value)
  {
    event.preventDefault();
    this.lstDetalleCobranza[this.currentRowDtl].CodMoneda = value.CodMoneda
    this.lstDetalleCobranza[this.currentRowDtl].DescMoneda = value.DescMoneda
    this.lstDetalleCobranza = [...this.lstDetalleCobranza]
    this.CalcularTotales()
    this.modalService.dismissAll();
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

  //MODAL CUENTA CONTABLE
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
    debugger;
    this._cobranza.listar_plan_contable(oPaginar).subscribe( response => {
      this.lstCtaContable = response.Results
      this.lstTempCtaContable = response.Results
      this.lstCtaContable = [...this.lstCtaContable]
      this.lstTempCtaContable = [...this.lstTempCtaContable];
      this.pageCtaContable.count = response.RowCount
    })
  }

  AbrirModalCtaContable(content, event?)
  {
    if (event != null || event != undefined)
      event.preventDefault();
    this.lstCtaContable = [...this.lstTempCtaContable];
    this.open(content, 'xl');
  }

  SeleccionarCtaContable(event, value)
  {
    event.preventDefault();
    this.lstDetalleCobranza[this.currentRowDtl].Codctacontable = value.CodCuenta
    this.lstDetalleCobranza[this.currentRowDtl].DescPlanContable = value.DescCuenta
    this.lstDetalleCobranza = [...this.lstDetalleCobranza]
    this.modalService.dismissAll();
  }

  BuscarCtaContable(event) {
    this.strBusquedaCtaContable = event.target.value.toLowerCase();
    this.pageCtaContable.offset = 0;
    this.ListarCtaContable()
  }

  //MODAL DETRACCION
  AbrirModalDetraccion(content, event?)
  {
    if (event != null || event != undefined)
      event.preventDefault();
    if (this.oCobranzas.CodBanco == undefined)
    {
      this.ErrorPorTexto("Debe Seleccionar un Banco");
      return false;
    }
    this.lstDetraccion = [...this.lstTempDetraccion];
    this.open(content, 'xl');
  }

  SeleccionarDetraccion(event, value)
  {
    event.preventDefault();
    this.lstDetalleCobranza = this.ListaInicialCobranza();
    this.lstDetalleCobranza = [...this.lstDetalleCobranza];
    this.modalService.dismissAll();
  }

  BuscarDetraccion(event) {
    const val = event.target.value.toLowerCase();
    let temp = this.lstTempDetraccion;
    switch (this.tipoBusquedaDetraccion) {
      case "0":
        temp = this.lstTempDetraccion.filter(function(d) {
          return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
        });
        break;
      case "1":
        temp = this.lstTempDetraccion.filter(function(d) {
          return d.NroConstancia.toLowerCase().indexOf(val) !== -1 || !val;
        });
        break;
      case "2":
        temp = this.lstTempDetraccion.filter(function(d) {
          return d.NomCliente.toString().indexOf(val) !== -1 || !val;
        });
        break;
      case "3":
        temp = this.lstTempDetraccion.filter(function(d) {
          return d.NumeroDoc.toString().indexOf(val) !== -1 || !val;
        });
        break;
      default:
        break;
    }
    this.lstDetraccion = [...temp];
  }

  RestaurarListaCobranzaDtl()
  {
    this.activerouter.url.subscribe(j => {

      if (j[0].path != "obtener")
      {
        const val = this.oCobranzas.CodBanco
        // let temp = this.lstTempBanco;
        if (val != undefined && val != "")
        {
          let temp = this.lstTempBanco.filter(x => x.CodBanco == val);
          this.oCobranzas.Banco.DescBanco = (temp.length > 0 ? temp[0].DescBanco : undefined);
          this.oCobranzas.CodMoneda = (temp.length > 0 ? temp[0].CodMoneda : undefined);
        }
        else
        {
          this.oCobranzas.Banco.DescBanco = undefined
          this.oCobranzas.CodMoneda = undefined
        }
        const lst = this.ListaInicialCobranza()
        this.lstDetalleCobranza = [...lst]
        this.oCobranzas.ListaDetalle = this.lstDetalleCobranza.filter(x => x.NumItem != undefined)
          }
    })

  }

  ListaInicialCobranza()
  {
    const lstTemp = [];
    for (let index = 0; index < 10; index++) {

      const d = index + 1
      lstTemp.push({
        tipoDocumento: undefined,
        NumItem: undefined,
        CodCliente: undefined,
        nomCliente: undefined,
        CodDocumento: undefined,
        DescDocumento: undefined,
        DocumentoDet: undefined,
        Serie: undefined,
        Nro: undefined,
        ValorTC: undefined,
        CodMoneda: undefined,
        DescMoneda: undefined,
        TotalMN: undefined,
        TotalME: undefined,
        Detraccion: undefined,
        Monto: undefined,
        Codctacontable: undefined,
        DescPlanContable: undefined,
        NoMost: undefined,
        LetraDescto: undefined,
        CodRef: undefined,
        NroLetra: undefined
      })

    }
    return lstTemp;
  }


  SeleccionarDetalle(event){
    (event.type === 'dblclick') && event.cellElement.blur();
    const rowIndex = this.tbDetalle.bodyComponent.getRowIndex(event.row);
    switch (event.type) {
      case 'click':
        // let editKeys = Object.keys(this.editing);
        // editKeys.forEach(x => {
        //   this.editing[x.toString()] = false
        // })
        if(!this.isVisualizar && this.oCobranzas.CodBanco != undefined)
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
        if(!this.isVisualizar && this.oCobranzas.CodBanco != undefined)
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
              case "CodCliente":
                this.currentRowDtl = rowIndex;
                this.AbrirModalCliente(this.modalCliente)
                break;
              case "CodDocumento":
                if (event.row.tipoDocumento == "Documento")
                {
                  this.currentRowDtl = rowIndex;
                  this.AbrirModalCobro(this.modalCobro, (event.row.CodCliente != undefined ? event.row.CodCliente : ""))
                }
                break;
              case "TotalMN":
                if (event.row.CodDocumento != undefined)
                {
                  if (this.oCobranzas.ValorTC == undefined ||
                    this.oCobranzas.ValorTC == 0)
                  {
                    this.ErrorPorTexto("Debe ingresar una TC númerica mayor que 0")
                    return false;
                  }
                  this.editing[rowIndex + '-TotalMN'] = true
                }
                break;
              case "TotalME":
                if (event.row.CodDocumento != undefined)
                {
                  if (this.oCobranzas.ValorTC == undefined ||
                    this.oCobranzas.ValorTC == 0)
                  {
                    this.ErrorPorTexto("Debe ingresar una TC númerica mayor que 0")
                    return false;
                  }
                  this.editing[rowIndex + '-TotalME'] = true
                }
                break;
              case "CodMoneda":
                if (event.row.tipoDocumento != "Documento" && event.row.CodCliente != undefined)
                {
                  this.currentRowDtl = rowIndex;
                  this.AbrirModalMoneda(this.modalMoneda)
                }
                break;
              case "Codctacontable":
                if (event.row.tipoDocumento != "Documento")
                {
                  this.currentRowDtl = rowIndex;
                  this.AbrirModalCtaContable(this.modalCtaContable)
                }
                break;
              case "DescPlanContable":
                if (event.row.tipoDocumento != "Documento")
                {
                  this.currentRowDtl = rowIndex;
                  this.AbrirModalCtaContable(this.modalCtaContable)
                }
                break;
              case "CodDetraccion":
                this.editing[rowIndex + '-CodDetraccion'] = true
                break;
              case "Monto":
                this.editing[rowIndex + '-Monto'] = true
                break;
              case "Mostrar":
                if(event.row.Mostrar == "X")
                {
                  this.lstDetalleCobranza[rowIndex].Mostrar = undefined
                }
                else
                {
                  this.lstDetalleCobranza[rowIndex].Mostrar = "X"
                }
                break;
              case "LetraDescto":
                if (event.row.tipoDocumento != "Documento")
                {
                  if(event.row.LetraDescto == "X")
                  {
                    this.lstDetalleCobranza[rowIndex].LetraDescto = undefined
                  }
                  else
                  {
                    this.lstDetalleCobranza[rowIndex].LetraDescto = "X"
                  }
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

  ActualizarFila(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex)
    console.log(this.editing);
    this.editing[rowIndex + '-' + cell] = false
    let val = event.target.value != undefined && event.target.value != '' ? event.target.value : undefined
    if (Number(val))
      val = event.target.value != undefined && event.target.value != '' ? Number(event.target.value) : undefined
    this.lstDetalleCobranza[rowIndex][cell] = val
    switch (cell) {
      case "tipoDocumento":
          this.lstDetalleCobranza[rowIndex].tipoDocumento = (val != undefined && val != "" ? val : "Documento")
          if (this.lstDetalleCobranza[rowIndex].NumItem == undefined)
          {
            const lstDtl = this.lstDetalleCobranza.filter(x => x.NumItem == undefined)
            let i = this.lstDetalleCobranza.length - lstDtl.length
            let NroItem = rowIndex + 1
            this.lstDetalleCobranza[rowIndex].NumItem = NroItem
          }
          switch (val) {
            case "Documento":
              // this.lstDetalleCobranza[rowIndex].ValorTC = this.oCobranzas.ValorTC;
              this.lstDetalleCobranza[rowIndex].CodCliente = undefined
              this.lstDetalleCobranza[rowIndex].nomCliente = undefined
              this.lstDetalleCobranza[rowIndex].CodDocumento = undefined
              this.lstDetalleCobranza[rowIndex].DescDocumento = undefined
              this.lstDetalleCobranza[rowIndex].DocumentoDet = undefined;
              this.lstDetalleCobranza[rowIndex].NumeroDoc = undefined
              this.lstDetalleCobranza[rowIndex].Serie = undefined
              this.lstDetalleCobranza[rowIndex].Nro = undefined
              this.lstDetalleCobranza[rowIndex].CodMoneda = undefined
              this.lstDetalleCobranza[rowIndex].DescMoneda = undefined
              this.lstDetalleCobranza[rowIndex].ValorTC = (this.oCobranzas.ValorTC != undefined ? this.oCobranzas.ValorTC : 0)
              this.lstDetalleCobranza[rowIndex].Saldo = undefined
              this.lstDetalleCobranza[rowIndex].TotalMN = undefined
              this.lstDetalleCobranza[rowIndex].TotalME = undefined
              this.lstDetalleCobranza[rowIndex].TotalDet = undefined
              break;
            case "Diversos":
              this.lstDetalleCobranza[rowIndex].ValorTC = (this.oCobranzas.ValorTC != undefined ? this.oCobranzas.ValorTC : 0)
              let lstDiversos = this.lstDocumentoBat.filter(x => x.Grupo.toUpperCase() == "INVENTARIO" && x.Clave.toUpperCase() == "SDIV");
              let codDocumentoDiv =  (lstDiversos.length > 0 ? lstDiversos[0].Valor :"DIV");
              this.lstDetalleCobranza[rowIndex].CodDocumento =codDocumentoDiv;
              this.lstDetalleCobranza[rowIndex].DescDocumento = "DIVERSO";

              this._documento.BuscarPorCodigoAtpDiv(this.lstDetalleCobranza[rowIndex].CodDocumento, 'COBRO').subscribe( response => {
                this.lstDetalleCobranza[rowIndex].Serie = response.Serie
                this.lstDetalleCobranza[rowIndex].Nro = response.Numero
                this.lstDetalleCobranza[rowIndex].NumeroDoc = response.Serie + "-" + response.Numero

                this.lstDetalleCobranza.forEach(obj =>{
                  if (obj.CodDocumento == codDocumentoDiv)
                  {
                    let nItem2 = obj.NumItem;
                    if (obj.NumItem==1)
                      nItem2=0

                    obj.Nro =  this.zeroFill((parseInt(response.Numero) + nItem2),7);
                    obj.NumeroDoc = obj.Serie + "-" + obj.Nro;
                  }
                })

              })
              this.lstDetalleCobranza[rowIndex].CodCliente = undefined
              this.lstDetalleCobranza[rowIndex].nomCliente = undefined
              this.lstDetalleCobranza[rowIndex].CodMoneda = undefined
              this.lstDetalleCobranza[rowIndex].DescMoneda = undefined
              this.lstDetalleCobranza[rowIndex].Saldo = undefined
              this.lstDetalleCobranza[rowIndex].TotalMN = undefined
              this.lstDetalleCobranza[rowIndex].TotalME = undefined
              this.lstDetalleCobranza[rowIndex].TotalDet = undefined


              break;
            case "Anticipo":
              this.lstDetalleCobranza[rowIndex].ValorTC = (this.oCobranzas.ValorTC != undefined ? this.oCobranzas.ValorTC : 0)
              let lstAnticipos = this.lstDocumentoBat.filter(x => x.Grupo.toUpperCase() == "COMPRA" && x.Clave.toUpperCase() == "SATP");
              let CodDocumentoAtp = (lstAnticipos.length > 0 ? lstAnticipos[0].Valor :"ATP");
              this.lstDetalleCobranza[rowIndex].CodDocumento = CodDocumentoAtp;
              this.lstDetalleCobranza[rowIndex].DescDocumento = "ANTICIPO";
              this._documento.BuscarPorCodigoAtpDiv(this.lstDetalleCobranza[rowIndex].CodDocumento, 'COBRO').subscribe( response => {
                this.lstDetalleCobranza[rowIndex].Serie = response.Serie
                this.lstDetalleCobranza[rowIndex].Nro = response.Numero
                this.lstDetalleCobranza[rowIndex].NumeroDoc = response.Serie + "-"  + response.Numero

                this.lstDetalleCobranza.forEach(obj =>{
                  if (obj.CodDocumento == CodDocumentoAtp)
                  {
                    let nItem2 = obj.NumItem;
                    if (obj.NumItem==1)
                      nItem2=0

                    obj.Nro =  this.zeroFill((parseInt(response.Numero) + nItem2),7);
                    obj.NumeroDoc = obj.Serie + "-" + obj.Nro;
                  }
                })


              })
              this.lstDetalleCobranza[rowIndex].CodCliente = undefined
              this.lstDetalleCobranza[rowIndex].nomCliente = undefined
              this.lstDetalleCobranza[rowIndex].CodMoneda = undefined
              this.lstDetalleCobranza[rowIndex].DescMoneda = undefined
              this.lstDetalleCobranza[rowIndex].Saldo = undefined
              this.lstDetalleCobranza[rowIndex].TotalMN = undefined
              this.lstDetalleCobranza[rowIndex].TotalME = undefined
              this.lstDetalleCobranza[rowIndex].TotalDet = undefined
              break;
            default:
              break;
          }

        break;
      case "TotalMN":
          // switch (this.oCobranzas.CodMoneda) {
          //   case "MO001":
          //     this.lstDetalleCobranza[rowIndex].TotalME = Number((val / this.oCobranzas.ValorTC).toFixed(2))
          //     break;
          //   case "MO002":
          //     this.lstDetalleCobranza[rowIndex].TotalME = Number((val * this.oCobranzas.ValorTC).toFixed(2))
          //     break;
          //   default:
          //     break;
          // }
          let tmCodMon = this.lstDetalleCobranza[rowIndex].CodMoneda;
          let tmSaldo = val;
          let total = this.ConvertirTotalMNME(tmSaldo, "MO001");
          let totalMN = ( tmCodMon == "MO001" ? tmSaldo : total)
          // this.lstDetalleCobranza[this.currentRowDtl].TotalME = ( this.oCobranzas.CodMoneda == value.CodMoneda ? value.Saldo : total)
          if(Number(totalMN) > Number(this.lstDetalleCobranza[rowIndex].Saldo))
          {
            this.ErrorPorTexto("Se ha superado el límite de saldo establecido: " + this.lstDetalleCobranza[rowIndex].Saldo)
            this.editing[rowIndex + '-' + cell] = true;
            return false;
          }


          this.lstDetalleCobranza[rowIndex].TotalME = Number((val / this.oCobranzas.ValorTC).toFixed(2))
        break;
      case "TotalME":
          // switch (this.oCobranzas.CodMoneda) {
          //   case "MO001":
          //     this.lstDetalleCobranza[rowIndex].TotalMN = Number((val * this.oCobranzas.ValorTC).toFixed(2))
          //     break;
          //   case "MO002":
          //     this.lstDetalleCobranza[rowIndex].TotalMN = Number((val / this.oCobranzas.ValorTC).toFixed(2))
          //     break;
          //   default:
          //     break;
          // }

          let tmCodMonME = this.lstDetalleCobranza[rowIndex].CodMoneda;
          let tmSaldoME = val;
          let totalM = this.ConvertirTotalMNME(tmSaldoME, "MO002");
          let totalME = ( tmCodMonME == "MO002" ? tmSaldoME : totalM)
          // this.lstDetalleCobranza[this.currentRowDtl].TotalME = ( this.oCobranzas.CodMoneda == value.CodMoneda ? value.Saldo : total)
          if(Number(totalME) > Number(this.lstDetalleCobranza[rowIndex].Saldo))
          {
            this.ErrorPorTexto("Se ha superado el límite de saldo establecido: " + this.lstDetalleCobranza[rowIndex].Saldo)
            this.editing[rowIndex + '-' + cell] = true;
            return false;
          }
          this.lstDetalleCobranza[rowIndex].TotalMN = Number((val * this.oCobranzas.ValorTC).toFixed(2))
        break;
      default:
        break;

    }
    this.lstDetalleCobranza = [...this.lstDetalleCobranza]
    if (this.lstDetalleCobranza.filter(x => x.NumItem == undefined).length == 0)
    {
      this.AgregarDetallePorDefecto()
    }
    this.oCobranzas.ListaDetalle = this.lstDetalleCobranza.filter(x => x.NumItem != undefined)
    this.CalcularTotales()
  }

  EliminarFila(rowIndex){
    console.log(rowIndex)
    this.lstDetalleCobranza.splice(rowIndex, 1)
    let i = 1
    this.lstDetalleCobranza.filter(x => x.NumItem != undefined).forEach(obj => {
      obj.NumItem = i
      i++
    });
    this.lstDetalleCobranza = [...this.lstDetalleCobranza]
    if (this.lstDetalleCobranza.filter(x => x.NumItem == undefined).length == 0)
    {
      this.AgregarDetallePorDefecto()
    }
    this.oCobranzas.ListaDetalle = this.lstDetalleCobranza.filter(x => x.NumItem != undefined)
  }

  AgregarDetallePorDefecto()
  {
    const lstTemp = this.lstDetalleCobranza
      lstTemp.push({
        tipoDocumento: undefined,
        NumItem: undefined,
        CodCliente: undefined,
        nomCliente: undefined,
        CodDocumento: undefined,
        DescDocumento: undefined,
        DocumentoDet: undefined,
        Serie: undefined,
        Nro: undefined,
        NumeroDoc: undefined,
        ValorTC: undefined,
        CodMoneda: undefined,
        DescMoneda: undefined,
        Saldo: undefined,
        TotalDet: undefined,
        TotalMN: undefined,
        TotalME: undefined,
        comentarioDet: undefined,
        CodDetraccion: undefined,
        Monto: undefined,
        Codctacontable: undefined,
        DescPlanContable: undefined,
        Mostrar: undefined,
        MueveSaldoBanco: undefined,
        LetraDescto: undefined,
        CodRef: undefined,
        NroLetra: undefined
      })

      this.lstDetalleCobranza = [...lstTemp];
  }

  ConvertirTotalMNME(Saldo, CodMoneda)
  {
    debugger;
    let total = 0
    switch (this.oCobranzas.CodMoneda) {
      case "MO001":
        if (CodMoneda == "MO002")
          total =  Number((Saldo * this.oCobranzas.ValorTC).toFixed(2))
        if (CodMoneda == "MO001")
          total =  Number((Saldo / this.oCobranzas.ValorTC).toFixed(2))
        break;
      case "MO002":
        if (CodMoneda == "MO001")
          total =  Number((Saldo / this.oCobranzas.ValorTC).toFixed(2))
        if (CodMoneda == "MO002")
          total =  Number((Saldo * this.oCobranzas.ValorTC).toFixed(2))
        break;
      default:
        break;
    }
    return total;
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
            debugger;
            this.EsEnableAnular = (lstPermisos[0].Anular == 1 ? false : true);
            break;
          default:
            break;
        }
      }
    }
  }


  CalcularTotales()
  {
    if (!this.isVisualizar)
    {
      this.oCobranzas.TotalMN = 0;
      this.oCobranzas.TotalME = 0;

      this.lstDetalleCobranza.filter(x => x.NumItem != undefined).forEach(obj => {
        obj.ValorTC = (this.oCobranzas.ValorTC != undefined ? this.oCobranzas.ValorTC : 0)
        let totalMN = (obj.TotalMN != undefined ? obj.TotalMN : 0)
        let totalME = (obj.TotalME != undefined ? obj.TotalME : 0)
        this.oCobranzas.TotalMN = (this.oCobranzas.TotalMN != undefined ? Number((this.oCobranzas.TotalMN + totalMN).toFixed(2)) : 0)
        this.oCobranzas.TotalME = (this.oCobranzas.TotalME != undefined ? Number((this.oCobranzas.TotalME + totalME).toFixed(2)) : 0)
        obj.TotalDet = obj.TotalMN
      });

      if (this.oCobranzas.CodMoneda == "MO001"){
        this.oCobranzas.Saldo = (this.oCobranzas.TotalPagar != undefined && this.oCobranzas.TotalMN != undefined ? Number((this.oCobranzas.TotalPagar - this.oCobranzas.TotalMN).toFixed(2)) : 0)
      }
      else
      {
        this.oCobranzas.Saldo = (this.oCobranzas.TotalPagar != undefined && this.oCobranzas.TotalME != undefined ? Number((this.oCobranzas.TotalPagar - this.oCobranzas.TotalME).toFixed(2)) : 0)
      }


      this.lstDetalleCobranza = [...this.lstDetalleCobranza]
      console.log('Calcular Totales: ' + this.lstDetalleCobranza)
      this.oCobranzas.ListaDetalle = this.lstDetalleCobranza.filter(x => x.NumItem != undefined)
    }


  }

  ObtenerTipoCambio()
  {
    debugger
    this._tipocambio.obtener(this.oCobranzas.dFecEmision.day + '/' + this.oCobranzas.dFecEmision.month + '/' + this.oCobranzas.dFecEmision.year).subscribe( response =>{
      this.oTipoCambio = response
      debugger;
      if (!this.isVisualizar)
      {
        if (this.oCobranzas.CodMoneda== "MO001"){
          this.oCobranzas.ValorTC = this.oTipoCambio.ValorVenta
        }else{
          this.oCobranzas.ValorTC = this.oTipoCambio.ValorCompra
        }
      }


    })

    /* if (!this.isVisualizar)
    {
      this.oCobranzas.TotalMN = 0;
      this.oCobranzas.TotalME = 0;

      this.lstDetalleCobranza.filter(x => x.NumItem != undefined).forEach(obj => {
        obj.ValorTC = (this.oCobranzas.ValorTC != undefined ? this.oCobranzas.ValorTC : 0)
        let totalMN = (obj.TotalMN != undefined ? obj.TotalMN : 0)
        let totalME = (obj.TotalME != undefined ? obj.TotalME : 0)
        this.oCobranzas.TotalMN = (this.oCobranzas.TotalMN != undefined ? Number((this.oCobranzas.TotalMN + totalMN).toFixed(2)) : 0)
        this.oCobranzas.TotalME = (this.oCobranzas.TotalME != undefined ? Number((this.oCobranzas.TotalME + totalME).toFixed(2)) : 0)
        obj.TotalDet = obj.TotalMN
      });
      this.oCobranzas.Saldo = (this.oCobranzas.TotalPagar != undefined && this.oCobranzas.TotalMN != undefined ? Number((this.oCobranzas.TotalPagar - this.oCobranzas.TotalMN).toFixed(2)) : 0)
      this.lstDetalleCobranza = [...this.lstDetalleCobranza]
      console.log('Calcular Totales: ' + this.lstDetalleCobranza)
      this.oCobranzas.ListaDetalle = this.lstDetalleCobranza.filter(x => x.NumItem != undefined)
    } */


  }

  AnularCobranza()
  {
    this.anularSwal.fire().then(result => {
      if (result.value) {
        this._cobranza.anular(this.oCobranzas).subscribe(
          response => {
            this.formSwal.title = "Éxito";
            this.formSwal.text = "Se ha anulado correctamente.";
            this.formSwal.type = "success";
            this.formSwal.fire().then(result => {
              this.router.navigateByUrl('/GlassWeb/cobranzas');
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
  GuardarCobranza()
  {

    this.EsDisableSubmit = true;
    if (this.formCobranza.valid)
    {
      if (this.oCobranzas.ListaDetalle.length > 0)
      {
        for (const prop in this.editing) {
          if(this.editing[prop])
            return this.ErrorPorTexto("Verifique que todos los campos editables del detalle se encuentren deshabilitado.");
        }
        this.oCobranzas.NumDocumento = (this.oCobranzas.NroDoc != undefined && this.oCobranzas.SerieDoc != undefined ? this.oCobranzas.SerieDoc + '-' + this.oCobranzas.NroDoc : undefined)
        this.oCobranzas.FechaEmision = (this.oCobranzas.dFecEmision != undefined ? formatNgbDateStruct(this.oCobranzas.dFecEmision) : undefined)
        this.oCobranzas.FechaCobrado = (this.oCobranzas.dFecCobrado != undefined ? formatNgbDateStruct(this.oCobranzas.dFecCobrado) : undefined)
        let result = {}
        console.log(this.oCobranzas);
        this._cobranza.guardar(this.oCobranzas).subscribe( response => {
          result = response
          this.formSwal.title = "Éxito";
          this.formSwal.text = "Se ha registrado correctamente.";
          this.formSwal.type = "success";
          this.formSwal.fire().then(result => {
            this.router.navigateByUrl('/GlassWeb/cobranzas');
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
          this.EsDisableSubmit = false;
          console.log(error)
        })


      }
      else
      {
        this.ErrorPorTexto("Debe agregar tipos de documentos");
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
    const lstTemp = this.ListaInicialCobranza();
    this.oCobranzas.CodUsuario = this.user.CodUsuario;
    this.ValorIGV = this.oParametro.valorigv;
    this.setPageCliente({ offset: 0 });
    this.setPageCtaContable({ offset: 0 });
    let date=new Date();

    this.activerouter.url.subscribe(j => {

      if (j[0].path == "obtener")
      {
        this.PermisosUsuario("anular");
        this.PermisosUsuario("actualiza");
        const codDoc = j[1].path
        const nroDoc = j[2].path
        this.formCobranza.disable();
        this._documento.listar().subscribe( response => {
          this.lstDocumento = response
        })

        this._cobranza.obtener(codDoc, nroDoc).subscribe( response => {
          this.isVisualizar = true;
          this.nombrePag = "Visualización de Cobranza"
          this.oCobranzas = response
          let nroSerie = response.NumDocumento.split('-')
          this.oCobranzas.SerieDoc = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
          this.oCobranzas.NroDoc = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
          this.oCobranzas.dFecCobrado = (this.oCobranzas.FechaCobrado != undefined && this.oCobranzas.FechaCobrado != null ? formatDateToNgbDateStruct(new Date(this.oCobranzas.FechaCobrado)) : undefined)
          this.oCobranzas.dFecEmision = (this.oCobranzas.FechaEmision != undefined && this.oCobranzas.FechaEmision != null ? formatDateToNgbDateStruct(new Date(this.oCobranzas.FechaEmision)) : undefined)
          this.oCobranzas.Opcion = 1
          let oBanco :Banco= {
            CodBanco: undefined,
            CodMoneda: undefined,
            DescBanco: undefined,
            DescMoneda: undefined
          }
          oBanco.CodBanco = this.oCobranzas.CodBanco;
          oBanco.DescBanco = this.oCobranzas.DescBanco;
          oBanco.CodMoneda = this.oCobranzas.CodMoneda;

          this.oCobranzas.Banco = oBanco;

          let oCajero :Cajero= {
            CodCajero: this.user.Cajero.CodCajero,
            DescCajero: this.user.Cajero.DescCajero
          }
          oCajero.CodCajero = this.oCobranzas.CodCajero;
          oCajero.DescCajero = this.oCobranzas.DescCajero;

          this.oCobranzas.Cajero = oCajero;

          this.oCobranzas.ListaDetalle.forEach(i => {
            let nroSerieDtl = i.NumeroDoc.split('-')
            i.Serie = (nroSerieDtl[0] != undefined && nroSerieDtl[0] != null ? nroSerieDtl[0] : undefined)
            i.Nro = (nroSerieDtl[1] != undefined && nroSerieDtl[1] != null ? nroSerieDtl[1] : undefined)
            i.TotalMN = i.TotalDet;
            i.TotalME = Number((i.TotalDet / i.ValorTC).toFixed(2));
            // if (this.oCobranzas.CodMoneda == "MO001")
            // {
            //   switch (i.CodMoneda) {
            //     case "MO001":
            //       i.TotalMN = i.TotalDet;
            //       i.TotalME = Number((i.TotalDet / i.ValorTC).toFixed(2));
            //       break;
            //     case "MO002":
            //       i.TotalMN = Number((i.TotalDet * i.ValorTC).toFixed(2))
            //       i.TotalME = i.TotalDet;
            //       break;
            //     default:
            //       break;
            //   }
            // }
            // else
            // {
            //   i.TotalMN = i.TotalDet;
            //   i.TotalME = Number((i.TotalDet * i.ValorTC).toFixed(2))
            //   switch (i.CodMoneda) {
            //     case "MO001":
            //       i.TotalMN = Number((i.TotalDet / this.oCobranzas.ValorTC).toFixed(2))
            //       i.TotalME = i.TotalDet;
            //       break;
            //     case "MO002":
            //       i.TotalMN = i.TotalDet;
            //       i.TotalME = Number((i.TotalDet * this.oCobranzas.ValorTC).toFixed(2))
            //       break;
            //     default:
            //       break;
            //   }
            // }
          });

          const lst = this.oCobranzas.ListaDetalle;
          this.lstDetalleCobranza = [...lst]
          console.log(response)

          this.formCobranza.controls['fecEmision']['enable']();
          //this.formCobranza.controls['fecCobrado']['enable']();
          this.formCobranza.controls['OperacionConstancia']['enable']();
          this.formCobranza.controls['Glosa']['enable']();
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
        this.oCobranzas.Opcion = 0
        this.lstDetalleCobranza = [...lstTemp];
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
