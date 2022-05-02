import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CondicionPagoService } from 'src/app/services/condicion-pago.service';
import { CondicionPago, Compras, ComprasDtl, Historial, Paginar, Proveedor, Usuario } from 'src/app/others/interfaces';
import { ComprasService } from 'src/app/services/compras.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { formatDateToNgbDateStruct } from 'src/app/others/utilBootstrap';
//import * as jsPDF from 'jspdf';
import { UsuarioService } from 'src/app/services/usuario.service';

declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'app-compras-listado',
  templateUrl: './compras-listado.component.html',
  styleUrls: ['./compras-listado.component.css'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ComprasListadoComponent implements OnInit {
  public radioData: any;
  constructor(private _compras: ComprasService,
    private router: Router,
    private modalService: NgbModal, private _usuarios: UsuarioService) { }
  @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
  @ViewChild("deleteSwal", {static: false}) deleteSwal: SwalComponent;
  @ViewChild("contentHistorial", {static: false}) modalHistorial: NgbModal;

  ngOnInit() {
    this.setPage({ offset: 0 });
    //console.log(this._usuarios.S);
  }

  page = {
    limit: 10,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };

  oComprasSeleccionado:Compras;
  lstCompras:Compras[] = [];
  lstComprasDtl:ComprasDtl[] = [];
  lstTempCompras:Compras[] = [];
  lstHistorial:Historial[] = [];
  cargando= true;
  tipoBusquedaCompras: string = 'Documento'
  strBusqueda: string = ''
  MostrarBusquedaCompras = false;
  ListCompras = this.ListarCompras()
  NombreMenu: string = 'mnucompradirecta'
  user: Usuario = this._usuarios.getUserLoggedIn()


  ListarCompras()
  {
    let oPaginar: Paginar = {
      ColumnSort: this.page.orderBy,
      CurrentPage: this.page.offset + 1,
      PageSize: this.page.limit,
      TypeSort: this.page.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }
    if(this.strBusqueda != '' && this.strBusqueda != undefined)
    {
      oPaginar.ColumnFilters.push(this.tipoBusquedaCompras);
      oPaginar.ValueFilters.push(this.strBusqueda);
    }
    let listar = this._compras.listar(oPaginar).subscribe( response => {
      this.lstCompras = response.Results
      this.lstTempCompras = response.Results;
      this.lstCompras = [...this.lstCompras];
      this.lstTempCompras = [...this.lstTempCompras];
      this.page.count = response.RowCount;
      console.log(response);
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
    },


    // error => {
    //   this.formSwal.fire()
    //   console.log(error)
    // },
    () => {
      this.cargando = false
    })
  }

  ListarDetalle(row)
  {
    console.log(this.radioData);
    let oCompras : Compras = row;
    this.oComprasSeleccionado = oCompras;
    console.log(this.oComprasSeleccionado)
    let ListarComprasDtl = this._compras.listar_detalle(oCompras).subscribe(
      response => {
        this.lstComprasDtl = response
        this.lstComprasDtl = [...this.lstComprasDtl];
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
      },
    )
  }

  BuscarCompras(event) {
    this.radioData = "";
    this.oComprasSeleccionado = undefined;
    this.lstComprasDtl = [];
    this.lstComprasDtl = [...this.lstComprasDtl];
    this.strBusqueda = event.target.value.toLowerCase();
    this.page.offset = 0;
    this.ListarCompras();
  }

  onSort(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string })
  {
    this.page.orderDir = sortInfo.sorts[0].dir;
    this.page.orderBy = sortInfo.sorts[0].prop;
    this.page.offset = 0;
    this.ListarCompras();
    this.radioData = "";
    this.oComprasSeleccionado = undefined;
    this.lstComprasDtl = [];
    this.lstComprasDtl = [...this.lstComprasDtl];
  }

  setPage(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.page.offset = pageInfo.offset;
    this.ListarCompras();
    this.radioData = "";
    this.oComprasSeleccionado = undefined;
    this.lstComprasDtl = [];
    this.lstComprasDtl = [...this.lstComprasDtl];
  }

  RedireccionarNuevaCompra()
  {
    this.router.navigateByUrl('/GlassWeb/compras/crear');
  }

  RedireccionarEditarCompra()
  {
    if (this.oComprasSeleccionado != undefined && this.oComprasSeleccionado != null)
    {
      this.router.navigateByUrl('/GlassWeb/compras/obtener/'+ this.oComprasSeleccionado.CodDocumento + '/' + this.oComprasSeleccionado.NumeroDoc + '/' + this.oComprasSeleccionado.CodProveedor);
    }
    else
      this.ErrorPorTexto("Debe seleccionar una compra.")
  }

  EliminarCompra()
  {
    if (this.oComprasSeleccionado != undefined && this.oComprasSeleccionado != null)
    {
      if (this.oComprasSeleccionado.EstadoDoc == 1)
      {
        this.deleteSwal.fire().then(result => {
          if (result.value) {
            let oCompras: Compras = this.oComprasSeleccionado;
            this._compras.eliminar(oCompras).subscribe(
              response => {
                this.formSwal.title = "Éxito";
                this.formSwal.text = "Se ha registrado correctamente.";
                this.formSwal.type = "success";
                this.formSwal.fire();
                this.ListarCompras();
                this.lstComprasDtl = []
                this.lstComprasDtl = [...this.lstComprasDtl];
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
      else
        this.ErrorPorTexto("La compra debe ser tener estado PENDIENTE.")
    }
    else
      this.ErrorPorTexto("Debe seleccionar una compra.")
  }

  AbrirModalHistorial(content, event?)
  {
    if (this.oComprasSeleccionado != undefined && this.oComprasSeleccionado != null)
    {
      if (event != null || event != undefined)
        event.preventDefault();
      this._compras.listar_historial(this.oComprasSeleccionado).subscribe(
        response => {
          debugger;
          this.lstHistorial = response
          this.lstHistorial = [...this.lstHistorial];
          this.open(content);
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
        },
      )

    }
    else
      this.ErrorPorTexto("Debe seleccionar una compra.")

  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg'
    });
  }

  SelecionarDetalle(event){
    (event.type === 'dblclick') && event.cellElement.blur();
    switch (event.type) {
      case 'dblclick':
        switch (event.column.prop) {
          case "Documento":

            break;
          default:
            break;
        }
        break;
      default:
        break;
    }


  }

  ErrorPorTexto(txt)
  {
    this.formSwal.title = "Error";
    this.formSwal.text = txt;
    this.formSwal.type = "error";
    this.formSwal.fire();
  }
  ErrorGenerico()
  {
    this.formSwal.title = "Error";
    this.formSwal.text = "Ha ocurrido un error inesperado, contacte con su administrador.";
    this.formSwal.type = "error";
    this.formSwal.fire();
  }



  ImprimirCompra()
  {
    if (this.oComprasSeleccionado != undefined && this.oComprasSeleccionado != null)
    {
      this._compras.obtener(this.oComprasSeleccionado.CodDocumento, this.oComprasSeleccionado.NumeroDoc, this.oComprasSeleccionado.CodProveedor).subscribe( response => {
        console.log(response)
        let oCompras: Compras = response
        let nroSerie = response.NumeroDoc.split('-')
        oCompras.SerieDoc = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
        oCompras.NroDoc = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
        oCompras.dFecRegistro = (oCompras.FecRegistro != undefined && oCompras.FecRegistro != null ? formatDateToNgbDateStruct(new Date(oCompras.FecRegistro)) : undefined)
        oCompras.dFecEmision = (oCompras.FecEmision != undefined && oCompras.FecEmision != null ? formatDateToNgbDateStruct(new Date(oCompras.FecEmision)) : undefined)
        console.log(oCompras);
        // let oProveedor :Proveedor= {
        //   CodProveedor : undefined,
        //   NomProveedor: undefined,
        //   RucProveedor: undefined,
        //   NombreComercial:undefined,
        //   DirProveedor: undefined,
        //   ContactoNombre: undefined
        // }

        // oProveedor.CodProveedor = oCompras.CodProveedor;
        // oProveedor.NomProveedor = oCompras.NomProveedor;
        // oProveedor.RucProveedor = oCompras.CodProveedor;


        // oCompras.Proveedor = oProveedor;


        const lst = oCompras.ListaDetalle;
        oCompras.ListaDetalle = [...lst]

        //CONSTRUCCIÓN DE REPORTE PDF
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setProperties({
          title: this.oComprasSeleccionado.Documento
        });
        doc.setFont('Cambria')
        doc.setFontSize(8)
        //doc.setLineWidth(0.7);

        //doc.roundedRect(18, 55, 560, 85, 6, 6);

        doc.setFontSize(14)
        doc.setFontStyle('bold')

        //doc.text("COMPRA DIRECTA",{align:"center"}, 0,1)
        doc.text('COMPRA DIRECTA', doc.internal.pageSize.width/2, 50, null, null, 'center');
        doc.setFontSize(8)
        //doc.text("(Ingreso Almacen)", {align:"center"}, 0,1)
        doc.text('(INGRESO ALMACEN)', doc.internal.pageSize.width/2, 60, null, null, 'center');

        doc.setFontSize(9)

        doc.setFontStyle('normal')
        doc.text("Proveedor:", 25, 80)
        doc.setFontStyle('bold')
        let lengthProveedor = Math.round(doc.getTextWidth('Proveedor:'));
        doc.text(oCompras.Proveedor.NomProveedor, lengthProveedor + 30, 80)

        doc.setFontStyle('normal')
        doc.text("Documento:", 400, 80)
        doc.setFontStyle('bold')
        let lengthDocumento = Math.round(doc.getTextWidth('Documento:'));
        doc.text(oCompras.DescDocumento, lengthDocumento + 405, 80)

        doc.setFontStyle('normal')
        doc.text("F. Emisión:", 25, 95)
        doc.setFontStyle('bold')
        let pipe = new DatePipe('en-US');
        let fec = pipe.transform(oCompras.FecEmision, 'dd/MM/yyyy');
        let lengthFecEmision = Math.round(doc.getTextWidth('F. Emisión:'));
        doc.text(fec, lengthFecEmision + 30, 95)

        doc.setFontStyle('normal')
        doc.text("Nro:", 400, 95)
        doc.setFontStyle('bold')
        let lengthNro = Math.round(doc.getTextWidth('Nro:'));
        doc.text(oCompras.CodDocumento + " " + oCompras.NumeroDoc, lengthNro + 405, 95)


        doc.setFontStyle('normal')
        let fecReg = pipe.transform(oCompras.FecRegistro, 'dd/MM/yyyy');
        doc.text("Ingresó al Almacen de:", 25, 110)
        doc.setFontStyle('bold')
        let lengthAlmacen = Math.round(doc.getTextWidth('Ingresó al Almacen de:'));
        doc.text(oCompras.DescAlmacen + "   " + fecReg, lengthAlmacen + 30, 110)

        doc.setFontStyle('normal')
        let fecVcmto = pipe.transform(oCompras.Fecentrega, 'dd/MM/yyyy');
        doc.text("F.Vcmto:", 400, 110)
        doc.setFontStyle('bold')
        let lengthFVcmto = Math.round(doc.getTextWidth('F.Vcmto:'));
        doc.text(fecVcmto, lengthFVcmto + 405, 110)

        doc.setFontStyle('normal')
        doc.text("Moneda:", 25, 125)
        doc.setFontStyle('bold')
        let lengthMoneda = Math.round(doc.getTextWidth('Moneda:'));
        doc.text(oCompras.DescMoneda, lengthMoneda + 30, 125)

        doc.setFontStyle('normal')
        doc.text("C.Costo:", 180, 125)
        doc.setFontStyle('bold')
        let lengthCCosto = Math.round(doc.getTextWidth('C.Costo:'));
        doc.text(oCompras.DescCCosto, lengthCCosto + 185, 125)

        doc.setFontStyle('normal')
        doc.text("Condición Pago:", 400, 125)
        doc.setFontStyle('bold')
        let lengthCondPago = Math.round(doc.getTextWidth('Condición Pago:'));
        doc.text(oCompras.DescCondPago, lengthCondPago + 405, 125)

        doc.setFontStyle('normal')
        doc.text("T/C:", 25, 140)
        doc.setFontStyle('bold')
        let lengthTC = Math.round(doc.getTextWidth('T/C:'));
        doc.text(oCompras.ValorTC.toString(), lengthTC + 30, 140)

        doc.setFontStyle('normal')
        doc.text("Doc.Ref:", 180, 140)
        doc.setFontStyle('bold')
        let lengthDocRef = Math.round(doc.getTextWidth('Doc.Ref:'));
        doc.text(oCompras.DocRef + " " + oCompras.CodDocumentoReferencia + " " + oCompras.numDocReferencia, lengthDocRef + 185, 140)

        doc.setFontStyle('normal')
        doc.text("Mueve Almacen:", 400, 140)
        doc.setFontStyle('bold')
        let lengthMueveAlmacen = Math.round(doc.getTextWidth('Mueve Almacen:'));
        doc.text((oCompras.MueveAlmacen.toString() == "0")?"SI":"NO", lengthMueveAlmacen + 405, 140)

        doc.setFontStyle('normal')
        doc.text("Comentario:", 25, 155)
        doc.setFontStyle('bold')
        let lengthComentario = Math.round(doc.getTextWidth('Comentario:'));
        doc.text(oCompras.comentarioDoc, lengthComentario + 30, 155)


        doc.autoTable({
            startY: 170,
            head: this.CabeceraComprasDtl(),
            body: this.CuerpoComprasDtl(oCompras.ListaDetalle),
            styles: {
              //fillColor: [0, 0, 0],
              fontSize: 8,
              halign: 'center',
              tableWidth: 'auto'
            },
            headStyles: {
              fillColor: [0, 0, 0]
            },
            columnStyles: {
              0: {cellWidth: 30},
            },
            pageBreak: 'avoid',
            rowPageBreak: 'avoid',
            showHead: 'everyPage'
        })


        doc.text("Afecto:", 450, doc.previousAutoTable.finalY + 15)
        let lengthAfecto = Math.round(doc.getTextWidth('Afecto:'));
        doc.text(oCompras.neto.toFixed(2).toString(),  550, doc.previousAutoTable.finalY + 15, null, null, 'right')

        doc.text("Inafecto:", 450, doc.previousAutoTable.finalY + 30)
        let lengthInafecto = Math.round(doc.getTextWidth('Inafecto:'));
        doc.text(oCompras.inaFecto.toFixed(2).toString(), 550, doc.previousAutoTable.finalY + 30 , null, null, 'right')

        doc.text("IGV:", 450, doc.previousAutoTable.finalY + 45)
        let lengthIGV = Math.round(doc.getTextWidth('IGV:'));
        doc.text(oCompras.iva.toFixed(2).toString(), 550, doc.previousAutoTable.finalY + 45 , null, null, 'right')

        doc.text("Fise:", 450, doc.previousAutoTable.finalY + 60)
        let lengthFise = Math.round(doc.getTextWidth('Fise:'));
        doc.text(oCompras.Fise.toFixed(2).toString(), 550, doc.previousAutoTable.finalY + 60 , null, null, 'right')

        doc.setFontSize(10)
        doc.text("Total:", 450, doc.previousAutoTable.finalY + 75)
        let lengthTotal = Math.round(doc.getTextWidth('Total:'));
        doc.text(oCompras.NvoTotalDoc.toFixed(2).toString(), 550, doc.previousAutoTable.finalY + 75 , null, null, 'right')




        //PAGINADO DEL PDF
        const pageCount = doc.internal.getNumberOfPages();
        for(var i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8)
          //doc.text(this.user.Empresa.RazonSocial, 25, 35)

          let fecPag = pipe.transform(new Date(), 'dd/MM/yyyy');

          doc.text(fecPag, 530, 30);
          doc.text('Página ' + String(i) + ' de ' + String(pageCount), 530, 40);




          var img = new Image()
          img.src = 'assets/img/empresa_logo.png'
          doc.addImage(img, 'png', 25, 25, 100, 35)

        }



        // doc.output("dataurlnewwindow")
        window.open(doc.output('bloburl'), '_blank');
        // doc.save(this.oCobranzasSeleccionado.Documento + ".pdf")

      },
      error => {
        switch (error.status) {
          case 400:
          case 404:
            if (error.error != undefined)
            {
              let strMensaje = error.error.mensaje;
              this.ErrorPorTexto(strMensaje);
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
      this.ErrorPorTexto("Debe seleccionar una compra.")

  }

  CabeceraComprasDtl() {
    let oComprasDtl = {
      NumItem: "Item",
      CodArticulo: "Código",
      Cantidad: "Cantidad",
      UnidadMedida: "Unidad",
      DescArticulo: "Artículo",
      preccompra: "P.U.",
      netoDet: "Neto"
    }
    return [oComprasDtl];
  }

  CuerpoComprasDtl(lstComprasDtl: ComprasDtl[]) {
    var lstComprasDtlRep = [];

    lstComprasDtl.forEach(i => {
      let oComprasDtl = {
        NumItem: i.NumItem,
        CodArticulo: i.CodArticulo,
        Cantidad: i.cantidad,
        UnidadMedida:i.DescUnidadMedida,
        DescArticulo: i.DescArticulo,
        preccompra:i.preccompra,
        netoDet : i.netoDet
      }
      lstComprasDtlRep.push(oComprasDtl);
    });
    return lstComprasDtlRep;
  }



}
