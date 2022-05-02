import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import * as internal from 'assert';

export interface JQuery {
    toastr(options?: any): any;
}

export interface Cajero{
    CodCajero: string
    DescCajero: string
}

export interface Menu{
    Codigo: string
    Nombre: string
    Caption: string,
    Nivel: number
    Dependencia: string
}

export interface Permiso{
    Codusuario: string
    Codigo: string
    acceso: number
    escritura: number
    lectura: number
    Imprimir: number
    Exportar: number
    Anular: number
    Aprobar: number
    Actualiza: number
    Eliminar: number
}

export interface Usuario{
    Usuario: string
    clave: string
    Cargo: string
    CodUsuario: string
    Estado: number
    Nombres: string
    Grupo: number
    Cajero: Cajero
    Menus: Menu[]
    Permisos: Permiso[]
    Empresa: Empresa
}

export interface CondicionPago{
    CodCondPago: string
    DescCondPago: string
    Comentario: string
    Dias: number
    Estado: number
}

export interface Sucursal{
    CodigoSucursal: string
    Descsucursal: string
    Direccion: string
    Tarea: string
    Estado: number
}
// export interface ProveedorT{
//   numero:string,
//   Serie:string,
//   CodClaseDoc:string,
//   DescDocumento:string,
//   Cheque:ChequeEmitido[],
// }
export interface Documento{
    CodDocumento: string
    CodClaseDoc: string
    DescDocumento: string
    Serie: string
    Numero: string
    Estado: number
    GeneraMovFinanciero: string
    GeneraMovDe: string
    VanalRegistroDe: string
    CodSunat: string
    TipoOperacion: string
    TomaraTipoCambioDe: string
    Origen: string
    CargaInicial: number
    Vale: number
    CodigoSucursal: string
    RemiTrans: string
    Item: number
    NombreImpresora: string
    DriverImpresora: string
    PuertoImpresora: string
    ReporteDetallado: number
    Provision: number
    IncluyeIGV: number
    Archivo: string
    OrdenCompra: number
}

export interface Proveedor{
    CodProveedor: string
    NomProveedor: string
    RucProveedor: string
    NombreComercial: string
    DirProveedor: string
    ContactoNombre: string
}

export interface CentroCosto{
    Codccosto: string
    CodigoSucursal: string
    Descccosto: string
    CodCuenta: string
    SerieTicket: string
}

export interface Moneda{
    CodMoneda: string
    DescMoneda: string
}

export interface Almacen{
    CodAlmacen: string
    DescAlmacen: string
    CodigoSucursal: string
    CodSucursalSunat: string
    Estado: number
}

export interface Articulo{
    CodArticulo: string
    DescArticuloVta: string
    CodUnidadMedida: string
    DescUnidadMedida: string
    CodFamilia: string
    DescFamilia: string
    CodSubFamilia: string
    DescSubFamilia: string
    PrecCostoMN: number
    PrecCostoME: number
    CodProveedor: string
    CodMoneda: string
}

export interface EstadoDocumento{
    CodEstadoDocumento: string
    DescEstadoDocumento: string
}

export interface ComprasDtl
{
    NumItem: number
    CodDocumento: string
    NumeroDoc: string
    CodProveedor: string
    CodArticulo: string
    DescArticulo: string
    cantidad: number
    preccompra: number
    dscTotasa: number
    dsctovalor: number
    RecargoTasa: number
    RecargoValor: number
    netoDet: number
    ivaDet: number
    TotalDet: number
    comentarioDet: number
    Codigoum: string
    DescUnidadMedida: string
    Codigoumalternativa: string
    PrecCosto: number
    oArticulo: Articulo
}

export interface Compras
{
    Documento: string
    CodDocumento: string
    SerieDoc: string
    NroDoc: string
    NumeroDoc: string
    CodProveedor: string
    NomProveedor: string
    Codcondpago: string
    Codsucursal: string
    Codccosto: string
    dFecEmision: NgbDateStruct
    FecEmision: string
    dFecentrega: NgbDateStruct
    Fecentrega: string
    CodMoneda: string
    ValorTC: number
    dscTotasa: number
    dsctovalor: number
    RecargoTasa: number
    RecargoValor: number
    neto: number
    iva: number
    TotalDoc: number
    comentarioDoc: number
    EstadoDoc: number
    CodAlmacen: string
    DescAlmacen: string
    inaFecto: number
    dFecRegistro: NgbDateStruct
    FecRegistro: string
    CodUsuario: string
    Percepcion: number
    NvoTotalDoc: number
    dFecContable: NgbDateStruct
    FecContable: string
    ReferenciaDoc: string
    dFecRef: NgbDateStruct
    FecRef: string
    DocRef: string
    Fise: number
    MueveAlmacen: string
    CodDocumentoReferencia: string
    numDocReferencia: string
    OfCodDocumento: string
    OfNumeroDoc: string
    cue: string
    Hora: Date
    IncluyeIGV: number
    Proveedor: Proveedor
    dFecKardex: NgbDateStruct
    FecKardex: string
    Opcion: number
    ListaDetalle : ComprasDtl[]

    DescDocumento: string
    DescMoneda: string
    DescCCosto: string
    DescCondPago: string
}
export interface cuentaDetalle{
  Banco: string
  Cajero: string
  CodBanco: string
  CodCheque:string
  NumeroCheque:number
  CodDocumento: string
  NumeroDoc: number
  DescMoneda: string
  Documento: string
  FecRegistro: Date
  TotalDoc:number
  ValorTC:number
  comentarioDet: string
  numDocDet: string
  EstadoDet: number,
  Cheque : string,
  CodDocDet: string
}
export interface ChequeEmitido {
  CodBanco:      string;
  DescBanco:     string;
  CodCheque:     string;
  NumeroCheque:  string;
  NomProveedor:  string;
  FecEmision:    string;
  Fecuso:        string;
  TotalDoc:      number;
  DescMoneda:    string;
  comentarioDoc: string;
  EstadoDoc:     number;
}

export interface ResDetalle{
  FecRegistro:string
  CodBanco:string
  operacion:string
  DescBanco:string
  DescCajero:string
  ValorTC:number
  TotalDoc:number
  DescMoneda:string
  comentarioDet:string
  ListaDetalle: listaD[]
}
export interface ObtenerDocumentoPago{
  comentarioDet:string,
  numDocDet:string,
  CodDocDet:string,
  DescMoneda:string,
  Cheque:ChequeEmitido,
  Banco:Banco,
  Cajero:Cajero,
  Pago:lstPagoProveedor
}
export interface proveedorT{
  numero:string,
  Serie:string,
  CodClaseDoc:string,
  DescDocumento:string,
  Cheque:ChequeEmitido,
  Banco:Banco,
  Cajero:Cajero,
  Opcion: number,
  EstadoDet:number,
  FecEmision:string,
  dFecEmision: NgbDateStruct
  FecRegistro:string,
  dFecRegistro:NgbDateStruct,
  ValorTC: number,
  CodMoneda: string,
  TotalME: number,
  TotalMN: number,
  Saldo: number,
  TotalPagar: number,
  numDocDet:string,
  TotalDoc:number,
  DescMoneda:string,
  comentarioDet:string,
  CodDocDet:string,
  ListaDetalle:lstPagoProveedor[],

}
export interface listaD{
  NumItem:number
  Documento:string
  NumeroDoc:string
  TipoDocumento:string
  CodProveedor:string
  nomProveedor:string
  DescMoneda:string
  TotalDet:number
  ValorTC:number
  comentarioDet:string
  Codctacontable:string
}
export interface PagoProveedor{
    FecRegistro:string
    CodBanco:string
    operacion:string
    DescBanco:string
    DescCajero:string
    ValorTC:number
    TotalDoc:number
    DescMoneda:string
    comentarioDet:string
}

export interface CuentaContable{
    CodCuenta: string
    DescCuenta: string
    CuentaPadre: string
    DescCuentaPadre: string
    Periodo: number
    CuentaRegistro: string
    Estado: string
    Nivel: string
    Modulo: string
}

export interface Cobranzas{
    CodBanco: string
    DescBanco: string
    Documento: string
    NumDocumento: string
    DescDocumento: string
    CodCajero: string
    DescCajero: string
    CodDocumento: string
    CodOperacion: string
    SerieDoc: string
    NroDoc: string
    NumeroDoc: string
    OperacionConstancia: string
    dFecEmision: NgbDateStruct
    FechaEmision: string
    Numero: string
    DescMoneda: string
    CodMoneda: string
    ValorTC: number
    TotalPagar: number
    dFecCobrado: NgbDateStruct
    FechaCobrado: string
    FecRegistro: string
    Glosa: string
    EstadoDoc: number
    Saldo: number
    TotalMN: number
    TotalME: number
    CodigoSucursal: string
    CodUsuario: string
    comentarioDoc: string
    Opcion: number
    ListaDetalle: CobranzasDtl[]
    Banco: Banco
    Cajero: Cajero
}

export interface CuentaXCobrar{
    CodDocumento: string
    NumeroDoc: string
    CodCliente: string
    nomCliente: string
    CodMoneda: string
    DescMoneda: string
    FecRegistro: string
    ValorTC: number
    Total: number
    abono: string
    Saldo: string
    FecVcmto: string
    VEstado: number
    EstadoDoc: number
    CodDocumentoReferencia: string
    NumeroDocReferencia: string
}
export interface CuentaXPagarCabs{
  CodDocumento:string,
  NumeroDoc:string,
  CodProveedor:string,
  rucProveedor:string,
  nomProveedor:string,
  DescMoneda:string,
  Saldo:number,
  CodMoneda:string,
  FecRegistro:string,
  ValorTC:number,
  Total:number,
  cargo:number,
  comentario:string,
  EstadoDoc:number,
  CodOf:string,
  numOf:string,
  CodDocumentoReferencia:string,
  NumeroDocReferencia:string,
  FecVcmto:string,
   DescDocumento:string,}
export interface lstPagoProveedor{
  tipoDocumento: string,
  NumItem: number,
  CodProveedor: string,
  nomProveedor: string,
  NumeroDoc: string,
  CodDocumento: string,
  DescDocumento: string,
  Serie: string,
  Nro: string,
  ValorTC: number,
  CodMoneda: string,
  DescMoneda: string,
  TotalMN: number,
  TotalME: number,
  TotalDet:number,
  numDocDet:string,
  Codctacontable: string,
  DescPlanContable: string,
  Descripcion: string,
  FecRegistro:string,
  TotalDoc:number,
  FecCobrado:string,
  Mostrar:string
}
export interface CobranzasDtl{
    tipoDocumento: string
    NumItem: number
    CodCliente: string
    nomCliente: string
    CodDocumento: string
    DocumentoDet: string
    DescDocumento: string
    NumeroDoc: string
    Serie: string
    Nro: string
    ValorTC: number
    CodMoneda: string
    DescMoneda: string
    Saldo: number
    TotalDet: number
    TotalMN: number
    TotalME: number
    comentarioDet: string
    CodDetraccion: string
    Monto: number
    Codctacontable: string
    DescPlanContable: string
    Mostrar: string
    MueveSaldoBanco: number
    LetraDescto: string
    CodRef: string
    NroLetra: string
}

export interface Cliente{
    CodCliente: string
    nomCliente: string
    rucCliente: string
    telCliente: string
}

export interface Banco{
    CodBanco: string
    DescBanco: string
    CodMoneda: string
    DescMoneda: string
}

export interface DetraccionVenta{
    Numero: string
    NroConstancia: string
    CodCliente: string
    FecDeposito: Date
    TotalDoc: number
    CodDocumento: string
    NumeroDoc: string
    EstadoDoc: number
    CodBanco: string
    NomCliente: string
    RucCliente: string
}

export interface Referencia{
    TipoDocRef: string
    FecDoc: Date
    SNRef: string
}

export interface TipoCambio{
    FechaTipoCambio: Date
    CodMoneda: string
    ValorCompra: number
    ValorVenta: number
    Estado: number
    ValorCompraSunat: number
    ValorVentaSunat: number

}

export interface DocumentoBat{
    CodigoSucursal: string
    Grupo: string
    Clave: string
    Valor: string
    Estado: number
}

export interface Parametro {
    Codsucursal: string
    valorigv: number
    valormtominreten: number
    valorreten: number
    valorcuarta: number
    valories: number
    periodo: number
    stocknegativo: number
    avisarstockminimo: number
    seeliminaDoc: number
    tccompra: string
    tcventa: string
    avisarlineacredito: number
    AvisarLineaCredProveedor: number
    ValorPunto: string
    Grifo: number
    ModificaPrecio: number
    MostrarStock: number
    ListaPrecio: number
    Mensaje: string
    EstadoMensaje: number
    PlanContable: number
    MontoMaxBoleta: number
    ModificaFecVcmto: number
    ModificaDirecCostCompra: number
    AvisarRetencion: number
    MultiAlmacen: number
}

export interface Historial{
    Modulo: string
    Documento: string
    CodDocumento: string
    NumeroDoc: string
    CodRazon: string
}

export interface Persona{
    Id: number
    Nombre: string
    Apellido: string
    Direccion: string
}

export interface Paginado {
    Results: []
    CurrentPage: number
    PageCount: number
    PageSize: number
    RowCount: number
    HasPrevious: boolean
    HasNext: boolean
    FirstRowOnPage: number
    LastRowOnPage: number
}

export interface Paginar{
    ColumnSort: string
    TypeSort: string
    CurrentPage: number
    PageSize: number
    ColumnFilters: string[]
    ValueFilters: string[]
}

export interface TransferenciaBanco{
    coddocumento: string
    numdocumento: string
    documento: string
    seriedoc: string
    nrodoc: string
    codusuario: string
    codcajero: string
    desccajero: string
    fecemision: string
    dFecEmision: NgbDateStruct
    codmoneda: string
    valortc: number
    totalmn: number
    totalme: number
    estadodoc: number
    comentario: string
    fecregistro: string
    dFecRegistro: NgbDateStruct
    codigosucursal: string
    codsucursal: string
    fecrecibido: string
    dFecRecibido: NgbDateStruct
    hora: string
    dHora: NgbTimeStruct
    impefectivomn: number
    impefectivome: number
    impechequemn: number
    impechequeme: number
    depoefectivomn: number
    depoefectivome: number
    depoechequemn: number
    depoechequeme: number
    Opcion: number
    descestado: string
    ListaDetalle: TransferenciaBancoDtl[]
    Cajero: Cajero

}

export interface TransferenciaBancoDtl{
    item: number
    coddocumento: string
    numdocumento: string
    seriedoc: string
    nrodoc: string
    codbancoorigen: string
    descbancoorigen: string
    codmonedaorigen: string
    descmonedaorigen: string
    monto: number
    codbancodestino: string
    descbancodestino: string
    codmonedadestino: string
    descmonedadestino: string
    codbanco: string
    descbanco: string
    montomn: number
    montome: number
    codcajero: string
    desccajero: string
    operacion: string
    glosa: string
}

export interface TokenGW{
    CodUsuario:string,
    Usuario:string,
    CodigoSucursal:string,
    Key:string,
    Ip:string,
    Fecha:Date,
    Sitio:string
}

export interface Empresa{
    RazonSocial:string,
    Ruc:string,
    Titulo1:string,
    Titulo2:string,
    Titulo3:string
}
