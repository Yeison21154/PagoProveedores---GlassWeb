import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { formatNgbDateStruct, formatDateToNgbDateStruct } from 'src/app/others/utilBootstrap';
import { isNumber } from 'util';
import { TipoCambio, ComprasDtl, Articulo, Referencia, Proveedor, Almacen, Moneda, CentroCosto, Documento, Sucursal, CondicionPago, Compras, Usuario, Parametro, Menu, Permiso, Paginar } from 'src/app/others/interfaces';
import { Validators, FormBuilder } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgbModal, NgbDatepickerI18n, NgbDateParserFormatter, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ComprasService } from 'src/app/services/compras.service';
import { TipoCambioService } from 'src/app/services/tipo-cambio.service';
import { ArticuloService } from 'src/app/services/articulo.service';
import { AlmacenService } from 'src/app/services/almacen.service';
import { MonedaService } from 'src/app/services/moneda.service';
import { CentrocostoService } from 'src/app/services/centrocosto.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { CondicionPagoService } from 'src/app/services/condicion-pago.service';
import { NgbDateCustomParserFormatter } from 'src/app/others/NgbDateCustomParserFormatter';
import { CustomDatepickerI18n } from 'src/app/others/NgbDatePickerES';
import { UsuarioService } from 'src/app/services/usuario.service';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-compras-mantenimiento',
  templateUrl: './compras-mantenimiento.component.html',
  styleUrls: ['./compras-mantenimiento.component.css'],
  providers: [
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter},
    {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ComprasMantenimientoComponent implements OnInit {


  constructor(
    private _condicionPago: CondicionPagoService,
    private _sucursal: SucursalService,
    private _documento: DocumentoService,
    private _proveedor: ProveedorService,
    private _centrocosto: CentrocostoService,
    private _moneda: MonedaService,
    private _almacen: AlmacenService,
    private _articulo: ArticuloService,
    private _tipocambio: TipoCambioService,
    private _compras: ComprasService,
    private _usuarios: UsuarioService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private calendar: NgbCalendar,
    private activerouter: ActivatedRoute,
    private router: Router
    ) { }
    @ViewChild("deleteSwal", {static: false}) deleteSwal: SwalComponent;
    @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
    @ViewChild("contentArticulo", {static: false}) modalArticulo: NgbModal;
    @ViewChild("tbDetalle", {static: false}) tbDetalle: DatatableComponent;
    @ViewChild("ErrorFormHtml", {static: false}) formSwalHtml: SwalComponent;
    @ViewChild("txtBusquedaProveedor", {static: false}) txtBusquedaProveedor: HTMLElement;

  pageArticulo = {
    limit: 10,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };

  pageProveedor = {
    limit: 10,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };

  formCompra = this.formBuilder.group({
    CodAlmacen: ['', [Validators.required]],
    fecEmision: ['', [Validators.required]],
    fecRegistro: ['', [Validators.required]],
    CodProveedor: ['', [Validators.required]],
    NomProveedor: [''],
    RucProveedor: [''],
    CodCondPago: ['', [Validators.required]],
    CodigoSucursal: ['', [Validators.required]],
    Codccosto: ['', [Validators.required]],
    CodDocumento: ['', [Validators.required]],
    Serie: ['', [Validators.required]],
    Nro: ['', [Validators.required]],
    CodMoneda: [''],
    TC: ['', [Validators.required]],
    fecKardex: [''],
    fecContable: ['', [Validators.required]],
    IncluyeIGV: ['', [Validators.required]],
    fecVencimiento: ['', [Validators.required]],
    CodTipoDocRef: [''],
    fecDoc: [''],
    SerieNroRef: [''],
    MueveAlmacen: [''],
    Comentario: [''],
    CodEstadoDocumento: [''],
    Afecto: [''],
    IGV: [''],
    Total: [''],
    Percepcion: ['', [Validators.required]],
    FISE: ['', [Validators.required]],
    TotalDocumento: ['']
  })

  user: Usuario = this._usuarios.getUserLoggedIn()

  oSucursalSeleccionado:Sucursal = this._usuarios.getSucursal()

  isSubmit = false

  oComprasDtl: ComprasDtl = {
    NumItem: undefined,
    CodDocumento: undefined,
    NumeroDoc: undefined,
    CodProveedor: undefined,
    CodArticulo: undefined,
    DescArticulo: undefined,
    cantidad: undefined,
    preccompra: undefined,
    dscTotasa: undefined,
    dsctovalor: undefined,
    RecargoTasa: undefined,
    RecargoValor: undefined,
    netoDet: undefined,
    ivaDet: undefined,
    TotalDet: undefined,
    comentarioDet: undefined,
    Codigoum: undefined,
    DescUnidadMedida: undefined,
    Codigoumalternativa: undefined,
    PrecCosto: undefined,
    oArticulo: {
      CodArticulo: undefined,
      DescArticuloVta: undefined,
      CodFamilia: undefined,
      DescFamilia: undefined,
      CodSubFamilia: undefined,
      DescSubFamilia: undefined,
      CodUnidadMedida: undefined,
      DescUnidadMedida: undefined,
      PrecCostoMN: undefined,
      PrecCostoME: undefined,
      CodProveedor: undefined,
      CodMoneda: undefined
    }
  }

  FecActual:NgbDateStruct = this.calendar.getToday();

  oCompras: Compras = {
    Documento: undefined,
    CodDocumento: "",
    SerieDoc: undefined,
    NroDoc: undefined,
    NumeroDoc: undefined,
    CodProveedor: "",
    NomProveedor: undefined,
    Codcondpago: "",
    Codsucursal: this.oSucursalSeleccionado.CodigoSucursal,
    Codccosto: "",
    dFecEmision: this.FecActual,
    FecEmision: undefined,
    dFecentrega: this.FecActual,
    Fecentrega: undefined,
    CodMoneda: "MO001",
    ValorTC: 0,
    dscTotasa: undefined,
    dsctovalor: undefined,
    RecargoTasa: undefined,
    RecargoValor: undefined,
    neto: undefined,
    iva: undefined,
    TotalDoc: undefined,
    comentarioDoc: undefined,
    EstadoDoc: 1,
    CodAlmacen: "",
    DescAlmacen: undefined,
    inaFecto: undefined,
    dFecRegistro: this.FecActual,
    FecRegistro: undefined,
    CodUsuario: undefined,
    Percepcion: 0,
    NvoTotalDoc: undefined,
    dFecContable: this.FecActual,
    FecContable: undefined,
    ReferenciaDoc: undefined,
    dFecRef: this.FecActual,
    FecRef: undefined,
    DocRef: "00",
    Fise: 0,
    MueveAlmacen: "0",
    CodDocumentoReferencia: undefined,
    numDocReferencia: undefined,
    OfCodDocumento: undefined,
    OfNumeroDoc: undefined,
    cue: "",
    Hora: undefined,
    IncluyeIGV: 1,
    Proveedor: {
        CodProveedor: '',
        NomProveedor: '',
        RucProveedor: '',
        NombreComercial: undefined,
        ContactoNombre: undefined,
        DirProveedor: undefined
      },
    dFecKardex: this.FecActual,
    FecKardex: undefined,
    Opcion: 0,
    DescCCosto: undefined,
    DescCondPago: undefined,
    DescDocumento: undefined,
    DescMoneda: undefined,
    ListaDetalle: []
  }

  lstCondicionPago:CondicionPago[] = []
  lstSucursal:Sucursal[] = []
  lstDocumento:Documento[] = []
  lstProveedor:Proveedor[] = []
  lstCentroCosto:CentroCosto[] = []
  lstMoneda: Moneda[] = []
  lstAlmacen: Almacen[] = []
  lstArticulo: Articulo[] = []
  lstDtlReferencia: Referencia[] = []

  //Temporales
  lstTempProveedor:Proveedor[] = []
  lstTempDtlReferencia: Referencia[] = []
  lstTempArticulo: Articulo[] = []
  lstDetalleCompra: ComprasDtl[] = []

  //Variables
  nombrePag = 'Nueva Compra'
  editing = {}
  tipoBusquedaProveedor: string = 'NomProveedor'
  tipoBusquedaArticulo: string = 'DescArticuloVta'
  strBusquedaArticulo: string = ''
  strBusquedaProveedor: string = ''
  oTipoCambio: TipoCambio = {
    FechaTipoCambio: undefined,
    CodMoneda: undefined,
    ValorCompra: undefined,
    ValorVenta: undefined,
    Estado: undefined,
    ValorCompraSunat: undefined,
    ValorVentaSunat: undefined
  }
  EsDisableSubmit = false
  oParametro: Parametro = this._usuarios.getParametro()
  ValorIGV: number = 0
  isDocRefRequerid: boolean = false
  isNinguno: boolean = true
  isVisualizar: boolean = false
  nombreMenu: string = 'mnucompradirecta'
  // fecTipoCambioActual = '5/6/2014'


  ListarCondicionPago = this._condicionPago.listar_activos().subscribe( response => {
    this.lstCondicionPago = response
  })

  ListarSucursal = this._sucursal.listar_activos().subscribe( response => {
    this.lstSucursal = response
  })

  ListarDocumento = this._documento.listar_activos("SU001").subscribe( response => {
    this.lstDocumento = response
  })

  ListarCentroCosto = this._centrocosto.listar_activos().subscribe( response => {
    this.lstCentroCosto = response
  })

  ListarMoneda = this._moneda.listar_activos().subscribe( response => {
    this.lstMoneda = response
  })

  ListarAlmacen = this._almacen.listar_activos(this.oSucursalSeleccionado.CodigoSucursal).subscribe( response => {
    this.lstAlmacen = response
  })

  ObtenerTC = this._tipocambio.obtener(this.FecActual.day + '/' + this.FecActual.month + '/' + this.FecActual.year).subscribe( response =>{
    this.oTipoCambio = response
    if (this.oTipoCambio != null){
      this.oCompras.ValorTC = this.oTipoCambio.ValorCompra
    }

  })



  //Modal Proveedor
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

    if(this.strBusquedaProveedor != '' && this.strBusquedaProveedor != undefined)
    {
      oPaginar.ColumnFilters.push(this.tipoBusquedaProveedor);
      oPaginar.ValueFilters.push(this.strBusquedaProveedor);
    }
    debugger;
    this._proveedor.listar_activos(oPaginar).subscribe( response => {
      this.lstProveedor = response.Results
      this.lstTempProveedor = response.Results
      this.lstProveedor = [...this.lstProveedor]
      this.lstTempProveedor = [...this.lstTempProveedor];
      this.pageProveedor.count = response.RowCount
    })
  }

  AbrirModalProveedor(content, event)
  {
    event.preventDefault();
    this.lstProveedor = [...this.lstTempProveedor];
    this.open(content);
    console.log(this.txtBusquedaProveedor);
    // this.txtBusquedaProveedor.nativeElement.focus();
  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl'
    });
  }

  SeleccionarProveedor(event, value)
  {
    event.preventDefault();
    this.oCompras.CodProveedor = value.CodProveedor;
    this.oCompras.Proveedor.NomProveedor = value.NomProveedor;
    this.oCompras.Proveedor.RucProveedor = value.RucProveedor;
    this.modalService.dismissAll();
  }

  BuscarProveedor(event) {
    this.strBusquedaProveedor = event.target.value.toLowerCase();
    this.pageProveedor.offset = 0;
    this.ListarProveedor()
  }

  //MODAL ARTICULO
  onSortArticulo(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string })
  {
    this.pageArticulo.orderDir = sortInfo.sorts[0].dir;
    this.pageArticulo.orderBy = sortInfo.sorts[0].prop;
    this.pageArticulo.offset = 0;
    this.ListarArticulo();
  }

  setPageArticulo(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.pageArticulo.offset = pageInfo.offset;
    this.ListarArticulo();
  }

  ListarArticulo()
  {
    let oPaginar: Paginar = {
      ColumnSort: this.pageArticulo.orderBy,
      CurrentPage: this.pageArticulo.offset + 1,
      PageSize: this.pageArticulo.limit,
      TypeSort: this.pageArticulo.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }

    if(this.strBusquedaArticulo != '' && this.strBusquedaArticulo != undefined)
    {
      oPaginar.ColumnFilters.push(this.tipoBusquedaArticulo);
      oPaginar.ValueFilters.push(this.strBusquedaArticulo);
    }
    debugger;
    this._articulo.listar_activos(oPaginar).subscribe( response => {
      this.lstArticulo = response.Results
      this.lstTempArticulo = response.Results
      this.lstArticulo = [...this.lstArticulo]
      this.lstTempArticulo = [...this.lstTempArticulo];
      this.pageArticulo.count = response.RowCount
    })
  }

  AbrirModalArticulo(content, event?)
  {
    if (event != null || event != undefined)
      event.preventDefault();
    this.lstArticulo = [...this.lstTempArticulo];
    this.open(content);
  }

  BuscarArticulo(event)
  {
    this.strBusquedaArticulo = event.target.value.toLowerCase();
    this.pageArticulo.offset = 0;
    this.ListarArticulo()
  }

  SeleccionarArticulo(event, value)
  {
    event.preventDefault();
    if (this.oCompras.ValorTC == undefined ||
      this.oCompras.ValorTC == 0)
      {
        this.ErrorPorTexto("Debe ingresar una TC númerica mayor que 0")
        return false;
      }
    // const esArticuloSeleccionado = this.lstDetalleCompra.filter(x => x.CodArticulo == value.CodArticulo).length > 0;
    // if (esArticuloSeleccionado)
    // {
    //   this.ErrorPorTexto("El artículo ya se encuentra seleccionado.");
    //   return false;
    // }
    const lstDtl = this.lstDetalleCompra.filter(x => x.NumItem == undefined)
    let i = this.lstDetalleCompra.length - lstDtl.length
    let NroItem = i + 1
    this.lstDetalleCompra[i].NumItem = NroItem
    this.lstDetalleCompra[i].CodArticulo = value.CodArticulo
    this.lstDetalleCompra[i].Codigoum = value.CodUnidadMedida
    this.lstDetalleCompra[i].oArticulo.CodArticulo = value.CodArticulo
    this.lstDetalleCompra[i].oArticulo.DescArticuloVta = value.DescArticuloVta
    this.lstDetalleCompra[i].oArticulo.DescUnidadMedida = value.DescUnidadMedida
    this.lstDetalleCompra[i].oArticulo.PrecCostoMN = value.PrecCostoMN
    this.lstDetalleCompra[i].oArticulo.PrecCostoME = value.PrecCostoME
    //CONVERTIR TC si ES DIFERENTE A LA MONEDA SELECCIONADA
    const strMoneda = this.oCompras.CodMoneda;
    switch (strMoneda) {
      case "MO001":
        this.lstDetalleCompra[i].preccompra = (strMoneda == value.CodMoneda ? value.PrecCostoMN : Number((this.oCompras.ValorTC * value.PrecCostoME).toFixed(2)))
        break;
      case "MO002":
          this.lstDetalleCompra[i].preccompra = (strMoneda == value.CodMoneda ? value.PrecCostoME : Number((value.PrecCostoMN / this.oCompras.ValorTC).toFixed(2)))
        break;
      default:
        break;
    }

    this.lstDetalleCompra = [...this.lstDetalleCompra]
    if (this.lstDetalleCompra.filter(x => x.NumItem == undefined).length == 0)
    {
      this.AgregarDetallePorDefecto()
    }
    this.oCompras.ListaDetalle = this.lstDetalleCompra.filter(x => x.NumItem != undefined)
    this.modalService.dismissAll();
  }

  ngOnInit() {

    const lstTemp = this.oCompras.ListaDetalle;
    this.oCompras.CodUsuario = this.user.CodUsuario;
    this.ValorIGV = this.oParametro.valorigv;
    this.setPageArticulo({ offset: 0 });
    this.setPageProveedor({ offset: 0 });
    let date=new Date();
    for (let index = 0; index < 10; index++) {

      const d = index + 1
      lstTemp.push({
        NumItem: undefined,
        CodDocumento: undefined,
        NumeroDoc: undefined,
        CodProveedor: undefined,
        CodArticulo: undefined,
        DescArticulo: undefined,
        cantidad: undefined,
        preccompra: undefined,
        dscTotasa: undefined,
        dsctovalor: undefined,
        RecargoTasa: undefined,
        RecargoValor: undefined,
        netoDet: undefined,
        ivaDet: undefined,
        TotalDet: undefined,
        comentarioDet: undefined,
        Codigoum: undefined,
        DescUnidadMedida: undefined,
        Codigoumalternativa: undefined,
        PrecCosto: undefined,
        oArticulo: {
          CodArticulo: undefined,
          DescArticuloVta: undefined,
          CodFamilia: undefined,
          DescFamilia: undefined,
          CodSubFamilia: undefined,
          DescSubFamilia: undefined,
          CodUnidadMedida: undefined,
          DescUnidadMedida: undefined,
          PrecCostoMN: undefined,
          PrecCostoME: undefined,
          CodProveedor: undefined,
          CodMoneda: undefined
        }
      })

    }

    this.activerouter.url.subscribe(j => {

      if (j[0].path == "obtener")
      {
        this.PermisosUsuario("actualiza");
        const codDoc = j[1].path
        const nroDoc = j[2].path
        const codProv = j[3].path
        this._documento.listar().subscribe( response => {
          this.lstDocumento = response
        })
        this._condicionPago.listar().subscribe( response => {
          this.lstCondicionPago = response
        })
        this._almacen.listar().subscribe( response => {
          this.lstAlmacen = response
        })
        this._compras.obtener(codDoc, nroDoc, codProv).subscribe( response => {
          this.isVisualizar = true;
          this.nombrePag = "Visualización de Compra"
          this.oCompras = response
          let nroSerie = response.NumeroDoc.split('-')
          this.oCompras.SerieDoc = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
          this.oCompras.NroDoc = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
          this.oCompras.dFecContable = (this.oCompras.FecContable != undefined && this.oCompras.FecContable != null ? formatDateToNgbDateStruct(new Date(this.oCompras.FecContable)) : undefined)
          this.oCompras.dFecEmision = (this.oCompras.FecEmision != undefined && this.oCompras.FecEmision != null ? formatDateToNgbDateStruct(new Date(this.oCompras.FecEmision)) : undefined)
          this.oCompras.dFecKardex = (this.oCompras.FecKardex != undefined && this.oCompras.FecKardex != null ? formatDateToNgbDateStruct(new Date(this.oCompras.FecKardex)) : this.FecActual)
          this.oCompras.dFecRef = (this.oCompras.FecRef != undefined && this.oCompras.FecRef != null ? formatDateToNgbDateStruct(new Date(this.oCompras.FecRef)) : undefined)
          this.oCompras.dFecRegistro = (this.oCompras.FecRegistro != undefined && this.oCompras.FecRegistro != null ? formatDateToNgbDateStruct(new Date(this.oCompras.FecRegistro)) : undefined)
          this.oCompras.dFecentrega = (this.oCompras.Fecentrega != undefined && this.oCompras.Fecentrega != null ? formatDateToNgbDateStruct(new Date(this.oCompras.Fecentrega)) : undefined)
          this.oCompras.Opcion = 1
          this.oCompras.ListaDetalle.forEach(i => {
            let articulo:Articulo = {
              CodArticulo: undefined,
              DescArticuloVta: undefined,
              CodFamilia: undefined,
              DescFamilia: undefined,
              CodSubFamilia: undefined,
              DescSubFamilia: undefined,
              CodUnidadMedida: undefined,
              DescUnidadMedida: undefined,
              PrecCostoMN: undefined,
              PrecCostoME: undefined,
              CodProveedor: undefined,
              CodMoneda: undefined
            }
            articulo.DescArticuloVta = i.DescArticulo
            articulo.DescUnidadMedida = i.DescUnidadMedida
            articulo.CodArticulo = i.CodArticulo
            articulo.CodUnidadMedida = i.Codigoum
            i.oArticulo = articulo
          });
          const lst = this.oCompras.ListaDetalle;
          this.lstDetalleCompra = [...lst]
          console.log('obtener: '+ this.lstDetalleCompra)
          this.formCompra.disable();
          this.formCompra.controls['fecKardex']['enable']();
          this.formCompra.controls['fecContable']['enable']();
          this.formCompra.controls['fecVencimiento']['enable']();
          this.formCompra.controls['fecDoc']['enable']();
          this.formCompra.controls['fecEmision']['enable']();
          this.formCompra.controls['fecRegistro']['enable']();
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
        this.oCompras.Opcion = 0
        this.lstDetalleCompra = [...lstTemp];
        console.log('nuevo: '+ this.lstDetalleCompra)
      }
    })
  }

  ActualizarFila(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex)
    this.editing[rowIndex + '-' + cell] = false
    const val = event.target.value != undefined && event.target.value != '' ? Number(event.target.value) : undefined
    this.lstDetalleCompra[rowIndex][cell] = val
    const cantidad = (this.lstDetalleCompra[rowIndex]['cantidad'] != undefined ? Number(this.lstDetalleCompra[rowIndex]['cantidad']) : undefined)
    const precio = (this.lstDetalleCompra[rowIndex]['preccompra'] != undefined ? Number(this.lstDetalleCompra[rowIndex]['preccompra']) : undefined)
    const descuentoVal = (this.lstDetalleCompra[rowIndex]['preccompra'] != undefined ? Number(this.lstDetalleCompra[rowIndex]['preccompra']) : undefined)
    const recargoVal = (this.lstDetalleCompra[rowIndex]['preccompra'] != undefined ? Number(this.lstDetalleCompra[rowIndex]['preccompra']) : undefined)
    switch (cell) {
      case 'dscTotasa':
        this.lstDetalleCompra[rowIndex]['dsctovalor'] = (isNumber(val)  &&
                                                              isNumber(cantidad) &&
                                                              isNumber(precio) ? Number(((cantidad * precio) * (val / 100)).toFixed(2))
                                                              : undefined);


        break;
      case 'dsctovalor':
        this.lstDetalleCompra[rowIndex]['dscTotasa'] = (isNumber(val)  &&
                                                              isNumber(cantidad) &&
                                                              isNumber(precio) ? Number((val / (cantidad * precio) * 100).toFixed(3))
                                                              : undefined);
        break;
      case 'RecargoTasa':
        this.lstDetalleCompra[rowIndex]['RecargoValor'] = (isNumber(val)  &&
                                                              isNumber(cantidad) &&
                                                              isNumber(precio) ? Number(((cantidad * precio) * (val / 100)).toFixed(2))
                                                              : undefined);
        break;
      case 'RecargoValor':
        this.lstDetalleCompra[rowIndex]['RecargoTasa'] = (isNumber(val)  &&
                                                              isNumber(cantidad) &&
                                                              isNumber(precio) ? Number((val / (cantidad * precio) * 100).toFixed(2))
                                                              : undefined);
        break;
      case 'netoDet':
        let igv = (isNumber(val) ? val * this.ValorIGV : 0)
        let total = (isNumber(val) ? val + igv : 0)
        if (this.oCompras.IncluyeIGV == 0)
          total = (isNumber(val) ? val : 0)
        this.lstDetalleCompra[rowIndex]['preccompra'] = (isNumber(val)  &&
                                                              isNumber(cantidad) ? Number((total / cantidad).toFixed(2))
                                                              : undefined)
        break;
      case 'TotalDet':
        //CAMBIAR POR IGV PARAMETRIZADO
        let neto = (isNumber(val) ? val : 0)
        if (this.oCompras.IncluyeIGV == 0)
          neto = (isNumber(val) ? val / (1 +  this.ValorIGV) : 0)
        this.lstDetalleCompra[rowIndex]['preccompra'] = (isNumber(val)  &&
                                                              isNumber(cantidad) ? Number((neto / cantidad).toFixed(2))
                                                              : undefined)
        break;
      default:
        break;
    }
    this.lstDetalleCompra = [...this.lstDetalleCompra]
    this.oCompras.ListaDetalle = this.lstDetalleCompra.filter(x => x.NumItem != undefined)
    this.CalcularTotales()
  }

  EliminarFila(rowIndex){
    console.log(rowIndex)
    this.lstDetalleCompra.splice(rowIndex, 1)
    let i = 1
    this.lstDetalleCompra.filter(x => x.NumItem != undefined).forEach(obj => {
      obj.NumItem = i
      i++
    });
    this.lstDetalleCompra = [...this.lstDetalleCompra]
    if (this.lstDetalleCompra.filter(x => x.NumItem == undefined).length == 0)
    {
      this.AgregarDetallePorDefecto()
    }
    this.oCompras.ListaDetalle = this.lstDetalleCompra.filter(x => x.NumItem != undefined)
    this.CalcularTotales()
  }

  AgregarDetallePorDefecto()
  {
    const lstTemp = this.lstDetalleCompra
      lstTemp.push({
        NumItem: undefined,
        CodDocumento: undefined,
        NumeroDoc: undefined,
        CodProveedor: undefined,
        CodArticulo: undefined,
        DescArticulo: undefined,
        cantidad: undefined,
        preccompra: undefined,
        dscTotasa: undefined,
        dsctovalor: undefined,
        RecargoTasa: undefined,
        RecargoValor: undefined,
        netoDet: undefined,
        ivaDet: undefined,
        TotalDet: undefined,
        comentarioDet: undefined,
        Codigoum: undefined,
        DescUnidadMedida: undefined,
        Codigoumalternativa: undefined,
        PrecCosto: undefined,
        oArticulo: {
          CodArticulo: undefined,
          DescArticuloVta: undefined,
          CodFamilia: undefined,
          DescFamilia: undefined,
          CodSubFamilia: undefined,
          DescSubFamilia: undefined,
          CodUnidadMedida: undefined,
          DescUnidadMedida: undefined,
          PrecCostoMN: undefined,
          PrecCostoME: undefined,
          CodProveedor: undefined,
          CodMoneda: undefined
        }
      })

      this.lstDetalleCompra = [...lstTemp];
  }

  getHeight(row: any, index: number): number {
    return row.someHeight;
  }

  CalcularTotales()
  {
    if (!this.isVisualizar)
    {
      if (this.oCompras.IncluyeIGV == 1) {
        this.oCompras.neto = 0;
        this.oCompras.inaFecto = 0;
        this.oCompras.iva = 0;
        this.oCompras.TotalDoc = 0;
        this.lstDetalleCompra.filter(x => x.NumItem != undefined).forEach(obj => {
          const cantidad = (obj.cantidad != undefined ? Number(obj.cantidad) : 0)
          const precioUnit = (obj.preccompra != undefined ? Number(obj.preccompra) : 0)
          const descuentoPorc = (obj.dscTotasa != undefined && obj.dscTotasa >= 0 ? Number(obj.dscTotasa) : 0)
          const descuentoVal = (obj.dsctovalor != undefined && obj.dsctovalor >= 0 ? Number(obj.dsctovalor) : 0)
          const recargoPorc = (obj.RecargoTasa != undefined && obj.RecargoTasa >= 0 ? Number( obj.RecargoTasa) : 0)
          const recargoVal = (obj.RecargoValor != undefined && obj.RecargoValor >= 0 ? Number( obj.RecargoValor) : 0)

          // if (descuentoPorc != undefined)
          //   obj.dsctovalor = (isNumber(descuentoPorc)  &&
          //                           isNumber(cantidad) &&
          //                           isNumber(precioUnit) ? Number(((cantidad * precioUnit) * (descuentoPorc / 100)).toFixed(2))
          //                           : undefined);
          // if (descuentoVal != undefined)
          //   obj.dscTotasa = (isNumber(descuentoVal)  &&
          //                         isNumber(cantidad) &&
          //                         isNumber(precioUnit) ? ( cantidad > 0 &&
          //                                                   precioUnit > 0 ? Number((descuentoVal / (cantidad * precioUnit) * 100).toFixed(3)) : undefined)
          //                         : undefined);
          // if (recargoPorc != undefined)
          //   obj.RecargoValor = (isNumber(recargoPorc)  &&
          //                         isNumber(cantidad) &&
          //                         isNumber(precioUnit) ? Number(((cantidad * precioUnit) * (recargoPorc / 100)).toFixed(2))
          //                         : undefined);
          // if (recargoVal != undefined)
          //   obj.RecargoTasa = (isNumber(recargoVal)  &&
          //                       isNumber(cantidad) &&
          //                       isNumber(precioUnit) ? ( cantidad > 0 &&
          //                                                 precioUnit > 0 ? Number((recargoVal / (cantidad * precioUnit) * 100).toFixed(2)) : undefined)
          //                       : undefined);

          obj.TotalDet = Number(((cantidad * precioUnit) - descuentoVal + recargoVal).toFixed(2))
          //CAMBIAR IGV (0.18) A UN IGV PARAMETRIZADO
          obj.netoDet = Number((obj.TotalDet / (1 + this.ValorIGV)).toFixed(2))
          obj.ivaDet = Number((obj.TotalDet - obj.netoDet).toFixed(2))
          obj.PrecCosto = (obj.cantidad != undefined && obj.netoDet != undefined && Number(obj.cantidad) > 0 ? Number((obj.netoDet / Number(cantidad)).toFixed(2)) : 0)

          this.oCompras.neto = (this.oCompras.neto != undefined ? Number((this.oCompras.neto + obj.netoDet).toFixed(2)) : 0)
          this.oCompras.iva = (this.oCompras.iva != undefined ? Number((this.oCompras.iva + obj.ivaDet).toFixed(2)) : 0)
          this.oCompras.TotalDoc = (this.oCompras.TotalDoc != undefined ? Number((this.oCompras.TotalDoc + obj.TotalDet).toFixed(2)) : 0)
        });
        this.lstDetalleCompra = [...this.lstDetalleCompra]
        console.log('Calcular Totales: ' + this.lstDetalleCompra)
        this.oCompras.ListaDetalle = this.lstDetalleCompra.filter(x => x.NumItem != undefined)
        const percepcion = (this.oCompras.Percepcion != undefined ? Number(this.oCompras.Percepcion) : 0 )
        const fise = ( this.oCompras.Fise != undefined ? Number(this.oCompras.Fise) : 0)
        this.oCompras.NvoTotalDoc = Number((this.oCompras.TotalDoc + percepcion + fise).toFixed(2))
      }
      else {
        this.oCompras.neto = 0;
        this.oCompras.inaFecto = 0;
        this.oCompras.iva = 0;
        this.oCompras.TotalDoc = 0;
        this.lstDetalleCompra.filter(x => x.NumItem != undefined).forEach(obj => {
          const cantidad = (obj.cantidad != undefined ? Number(obj.cantidad) : 0)
          const precioUnit = (obj.preccompra != undefined ? Number(obj.preccompra) : 0)
          const descuentoPorc = (obj.dscTotasa != undefined && obj.dscTotasa >= 0 ? Number(obj.dscTotasa) : 0)
          const descuentoVal = (obj.dsctovalor != undefined && obj.dsctovalor >= 0 ? Number(obj.dsctovalor) : 0)
          const recargoPorc = (obj.RecargoTasa != undefined && obj.RecargoTasa >= 0 ? Number( obj.RecargoTasa) : 0)
          const recargoVal = (obj.RecargoValor != undefined && obj.RecargoValor >= 0 ? Number( obj.RecargoValor) : 0)
          // if (descuentoPorc != undefined)
          //   obj.dsctovalor = (isNumber(descuentoPorc)  &&
          //                           isNumber(cantidad) &&
          //                           isNumber(precioUnit) ? Number(((cantidad * precioUnit) * (descuentoPorc / 100)).toFixed(2))
          //                           : undefined);
          // if (descuentoVal != undefined)
          //   obj.dscTotasa = (isNumber(descuentoVal)  &&
          //                         isNumber(cantidad) &&
          //                         isNumber(precioUnit) ? ( cantidad > 0 &&
          //                                                   precioUnit > 0 ? Number((descuentoVal / (cantidad * precioUnit) * 100).toFixed(3)) : undefined)
          //                         : undefined);
          // if (recargoPorc != undefined)
          //   obj.RecargoValor = (isNumber(recargoPorc)  &&
          //                         isNumber(cantidad) &&
          //                         isNumber(precioUnit) ? Number(((cantidad * precioUnit) * (recargoPorc / 100)).toFixed(2))
          //                         : undefined);
          // if (recargoVal != undefined)
          //   obj.RecargoTasa = (isNumber(recargoVal)  &&
          //                       isNumber(cantidad) &&
          //                       isNumber(precioUnit) ? ( cantidad > 0 &&
          //                                                 precioUnit > 0 ? Number((recargoVal / (cantidad * precioUnit) * 100).toFixed(2)) : undefined)
          //                       : undefined);
          obj.netoDet = Number(((cantidad * precioUnit) - descuentoVal + recargoVal).toFixed(2))
          //CAMBIAR IGV (0.18) A UN IGV PARAMETRIZADO
          obj.ivaDet = Number((obj.netoDet * this.ValorIGV).toFixed(2))
          obj.TotalDet = Number((obj.netoDet + obj.ivaDet).toFixed(2))

          obj.PrecCosto = (obj.cantidad != undefined && obj.netoDet != undefined && Number(obj.cantidad) > 0 ? Number((obj.netoDet / Number(cantidad)).toFixed(2)) : 0)

          this.oCompras.neto = (this.oCompras.neto != undefined ? Number((this.oCompras.neto + obj.netoDet).toFixed(2)) : 0)
          this.oCompras.iva = (this.oCompras.iva != undefined ? Number((this.oCompras.iva + obj.ivaDet).toFixed(2)) : 0)
          this.oCompras.TotalDoc = (this.oCompras.TotalDoc != undefined ? Number((this.oCompras.TotalDoc + obj.TotalDet).toFixed(2)) : 0)
        });
        this.lstDetalleCompra = [...this.lstDetalleCompra]
        console.log('Calcular Totales: ' + this.lstDetalleCompra)
        this.oCompras.ListaDetalle = this.lstDetalleCompra.filter(x => x.NumItem != undefined)
        const percepcion = (this.oCompras.Percepcion != undefined ? Number(this.oCompras.Percepcion) : 0 )
        const fise = ( this.oCompras.Fise != undefined ? Number(this.oCompras.Fise) : 0)
        this.oCompras.NvoTotalDoc = Number((this.oCompras.TotalDoc + percepcion + fise).toFixed(2))
      }
    }


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

  soloEnteros(e)
  {
    var key = window.event ? e.which : e.keyCode;
    if (key < 48 || key > 57) {
        e.preventDefault();
    }
  }

  mayus(e) {
    this.oCompras.SerieDoc = e.target.value.toUpperCase()
  }

  AgregarCeros(e, SerieNumero)
  {
    const nro = Number(e.target.value);
    if (!isNaN(nro) && e.target.value != "")
    {
      switch (SerieNumero) {
        case '1':
          this.oCompras.SerieDoc = this.zeroFill(e.target.value, 4)
          break;
        case '2':
          this.oCompras.NroDoc = this.zeroFill(e.target.value, 8)
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

  ActualizarPrecios()
  {
    if (!this.isVisualizar)
    {
      this.lstDetalleCompra.filter(x => x.NumItem != undefined).forEach(obj => {
        switch (this.oCompras.CodMoneda) {
          case "MO001":
              obj.preccompra = obj.oArticulo.PrecCostoMN
            break;
          case "MO002":
              obj.preccompra = obj.oArticulo.PrecCostoME
            break;
          default:
            break;
        }

      });
      this.lstDetalleCompra = [...this.lstDetalleCompra]
      console.log('ActualizarPrecios: ' + this.lstDetalleCompra)
      this.oCompras.ListaDetalle = this.lstDetalleCompra.filter(x => x.NumItem != undefined)
      this.CalcularTotales();
    }
  }

  ActualizarKardex()
  {
    this.oCompras.FecKardex = (this.oCompras.dFecKardex != undefined ? formatNgbDateStruct(this.oCompras.dFecKardex) : undefined)
    this._compras.actualizar_kardex(this.oCompras).subscribe(
      response => {
        this.formSwal.title = "Éxito";
        this.formSwal.text = "Se ha actualizado correctamente.";
        this.formSwal.type = "success";
        this.formSwal.fire();
        this.EsDisableSubmit = false;
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
      }
    );
  }

  CambiarIGV()
  {
    this.ActualizarPrecios()
    this.CalcularTotales()
  }

  SelecionarDetalle(event){
    (event.type === 'dblclick') && event.cellElement.blur();
    switch (event.type) {
      case 'dblclick':
        if(!this.isVisualizar)
        {
          if (event.row.NumItem == undefined)
          {
            switch (event.column.prop) {
              case "CodArticulo":
                this.AbrirModalArticulo(this.modalArticulo)
                break;
              default:
                break;
            }
          }
          else
          {
            const rowIndex = this.tbDetalle.bodyComponent.getRowIndex(event.row);
            switch (event.column.prop) {
              case "NumItem":
                if (event.row.NumItem != undefined)
                {
                  this.deleteSwal.fire().then(result => {
                    if (result.value) {
                      this.EliminarFila(rowIndex)
                    }
                  })
                }
                break;
              case "cantidad":
                this.editing[rowIndex + '-cantidad'] = true
                break;
              case "preccompra":
                this.editing[rowIndex + '-preccompra'] = true
                break;
              case "dscTotasa":
                this.editing[rowIndex + '-dscTotasa'] = true
                break;
              case "dsctovalor":
                this.editing[rowIndex + '-dsctovalor'] = true
                  break;
              case "RecargoTasa":
                this.editing[rowIndex + '-RecargoTasa'] = true
                  break;
              case "RecargoValor":
                this.editing[rowIndex + '-RecargoValor'] = true
                  break;
              case "netoDet":
                this.editing[rowIndex + '-netoDet'] = true
                  break;
              case "TotalDet":
                this.editing[rowIndex + '-TotalDet'] = true
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

  ActualizarRequeridos()
  {
    const lstDoc = this.lstDocumento.filter(x => x.CodDocumento == this.oCompras.CodDocumento)
    lstDoc.forEach(i => {
        if(i.CodClaseDoc == "DEBI" || i.CodClaseDoc == "CRED")
        {
          this.isDocRefRequerid = true;
          this.formCompra.get('SerieNroRef').setValidators([Validators.required]);
          this.formCompra.get('SerieNroRef').updateValueAndValidity();
          this.formCompra.get('fecDoc').setValidators([Validators.required]);
          this.formCompra.get('fecDoc').updateValueAndValidity();
          this.isNinguno = (this.oCompras.DocRef == "00" ? true : false)
        }
        else
        {
          this.isDocRefRequerid = false;
          this.formCompra.get('SerieNroRef').setValidators([]);
          this.formCompra.get('SerieNroRef').updateValueAndValidity();
          this.formCompra.get('fecDoc').setValidators([]);
          this.formCompra.get('fecDoc').updateValueAndValidity();
        }
    });
  }

  CambiarTipo()
  {
    this.isNinguno = (this.oCompras.DocRef == "00" ? true : false)
  }

  PermisosUsuario(nombrePermiso: string)
  {
    let lstMenus: Menu[] = this.user.Menus.filter(x => x.Nombre == this.nombreMenu);

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
          default:
            break;
        }
      }
    }
  }

  GuardarCompra()
  {
    this.EsDisableSubmit = true;

    if (this.formCompra.valid)
    {
      if (this.isDocRefRequerid)
      {
        this.isNinguno = (this.oCompras.DocRef == "00" ? true : false)
        if (this.isNinguno)
        {
          this.ErrorPorTexto("El Tipo Doc. Ref. debe ser diferente de NINGUNO");
          this.isSubmit = true;
          this.EsDisableSubmit = false;
          return false
        }
      }
      if (this.oCompras.ListaDetalle.length > 0)
      {
        this.oCompras.NumeroDoc = (this.oCompras.NroDoc != undefined && this.oCompras.SerieDoc != undefined ? this.oCompras.SerieDoc + '-' + this.oCompras.NroDoc : undefined)
        this.oCompras.FecEmision = (this.oCompras.dFecEmision != undefined ? formatNgbDateStruct(this.oCompras.dFecEmision) : undefined)
        this.oCompras.Fecentrega = (this.oCompras.dFecentrega != undefined ? formatNgbDateStruct(this.oCompras.dFecentrega) : undefined)
        this.oCompras.FecContable = (this.oCompras.dFecContable != undefined ? formatNgbDateStruct(this.oCompras.dFecContable) : undefined)
        this.oCompras.FecKardex = (this.oCompras.dFecKardex != undefined ? formatNgbDateStruct(this.oCompras.dFecKardex) : undefined)
        this.oCompras.FecRef = (this.oCompras.dFecRef != undefined ? formatNgbDateStruct(this.oCompras.dFecRef) : undefined)
        this.oCompras.FecRegistro = (this.oCompras.dFecRegistro != undefined ? formatNgbDateStruct(this.oCompras.dFecRegistro) : undefined)
        let result = {}
        this._compras.guardar(this.oCompras).subscribe( response => {
          result = response
          this.formSwal.title = "Éxito";
          this.formSwal.text = "Se ha registrado correctamente.";
          this.formSwal.type = "success";
          this.formSwal.fire().then(result => {
            this.router.navigateByUrl('/GlassWeb/compras');
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
        this.ErrorPorTexto("Debe agregar artículos");
        this.EsDisableSubmit = false;
      }

    }
    else
      this.ErrorPorTexto("Complete los campos obligatorios");
      this.isSubmit = true;
      this.EsDisableSubmit = false;

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
