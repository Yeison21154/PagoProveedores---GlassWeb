import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { CobranzasService } from 'src/app/services/cobranzas.service';
import { Cobranzas, Historial, Usuario, Sucursal, Banco, Cajero, CobranzasDtl, Paginar } from 'src/app/others/interfaces';
import { UsuarioService } from 'src/app/services/usuario.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { formatDateToNgbDateStruct } from 'src/app/others/utilBootstrap';
declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');


@Component({
  selector: 'app-cobranza-listado',
  templateUrl: './cobranza-listado.component.html',
  styleUrls: ['./cobranza-listado.component.css'],
  providers: [DatePipe]
})
export class CobranzaListadoComponent implements OnInit {
  public radioData: any;
  constructor(private _cobranzas: CobranzasService,
    private router: Router,
    private _usuarios: UsuarioService,
    private _sucursal: SucursalService,
    private modalService: NgbModal) { }
  @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
  @ViewChild("ErrorFormHtml", {static: false}) formSwalHtml: SwalComponent;
  @ViewChild("deleteSwal", {static: false}) deleteSwal: SwalComponent;
  @ViewChild("contentHistorial", {static: false}) modalHistorial: NgbModal;


  page = {
    limit: 10,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };

  oCobranzasSeleccionado:Cobranzas;
  lstCobranzas:Cobranzas[] = [];
  lstCobranzasDtl:CobranzasDtl[] = [];
  lstTempCobranzas:Cobranzas[] = [];
  lstHistorial:Historial[] = [];
  lstSucursal:Sucursal[] = [];
  cargando= true;
  tipoBusquedaCobranzas: string = 'Documento'
  EsSucursal: boolean = true
  oSucursal= this._usuarios.getSucursal()
  MostrarBusquedaCobranzas = false;
  NombreMenu: string = 'mnuIngCobClientes'
  strBusqueda: string = ''
  user: Usuario = this._usuarios.getUserLoggedIn()

  ListarSucursal = this._sucursal.listar_activos().subscribe( response => {
    this.lstSucursal = response
  })

  ListarCobranzas()
  {
    let oPaginar: Paginar = {
      ColumnSort: this.page.orderBy,
      CurrentPage: this.page.offset + 1,
      PageSize: this.page.limit,
      TypeSort: this.page.orderDir,
      ColumnFilters: [],
      ValueFilters: []
    }
    if (this.EsSucursal)
    {
      oPaginar.ColumnFilters.push('codigosucursal');
      oPaginar.ValueFilters.push(this.oSucursal.CodigoSucursal);
    }
    if(this.strBusqueda != '' && this.strBusqueda != undefined)
    {

      oPaginar.ColumnFilters.push(this.tipoBusquedaCobranzas);
      oPaginar.ValueFilters.push(this.strBusqueda);
    }
    let listar = this._cobranzas.listar(oPaginar).subscribe( response => {
      this.lstCobranzas = response.Results
      this.lstTempCobranzas = response.Results;
      this.lstCobranzas = [...this.lstCobranzas];
      this.lstTempCobranzas = [...this.lstTempCobranzas];
      this.page.count = response.RowCount;
    },
    // error => {
    //   this.formSwal.fire()
    //   console.log(error)
    // },
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
    () => {
      this.cargando = false
    })

  }

  CambiarSucursalControles()
  {
    this.ListarCobranzas();
  }

  ListarDetalle(row)
  {
    console.log(this.radioData);
    let oCobranzas : Cobranzas = row;
    this.oCobranzasSeleccionado = oCobranzas;
    console.log(this.oCobranzasSeleccionado)
    let ListarCobranzasDtl = this._cobranzas.listar_detalle(oCobranzas).subscribe(
      response => {
        this.lstCobranzasDtl = response
        this.lstCobranzasDtl = [...this.lstCobranzasDtl];
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
      //   this.ErrorGenerico()
      //   console.log(error)
      // }
    )
  }

  BuscarCobranzas(event) {
    this.radioData = "";
    this.oCobranzasSeleccionado = undefined;
    this.lstCobranzasDtl = [];
    this.lstCobranzasDtl = [...this.lstCobranzasDtl];
    this.strBusqueda = event.target.value.toLowerCase();
    this.page.offset = 0;
    this.ListarCobranzas();
  }

  RedireccionarNuevaCobranza()
  {
    this.router.navigateByUrl('/GlassWeb/cobranzas/crear');
  }

  RedireccionarEditarCobranza()
  {
    debugger;
    if (this.oCobranzasSeleccionado != undefined && this.oCobranzasSeleccionado != null)
    {
      this.router.navigateByUrl('/GlassWeb/cobranzas/obtener/'+ this.oCobranzasSeleccionado.CodOperacion + '/' + this.oCobranzasSeleccionado.NumDocumento);
    }
    else
      this.ErrorPorTexto("Debe seleccionar una cobranza.")
  }

  EliminarCobranza()
  {
    if (this.oCobranzasSeleccionado != undefined && this.oCobranzasSeleccionado != null)
    {
      if (this.oCobranzasSeleccionado.EstadoDoc == 2)
      {
        this.deleteSwal.fire().then(result => {
          if (result.value) {
            let oCobranzas: Cobranzas = this.oCobranzasSeleccionado;
            this._cobranzas.eliminar(oCobranzas).subscribe(
              response => {
                this.formSwal.title = "Éxito";
                this.formSwal.text = "Se ha eliminado correctamente.";
                this.formSwal.type = "success";
                this.formSwal.fire();
                this.ListarCobranzas();
                this.lstCobranzasDtl = []
                this.lstCobranzasDtl = [...this.lstCobranzasDtl];
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
        this.ErrorPorTexto("La cobranza debe ser tener estado ANULADO.")
    }
    else
      this.ErrorPorTexto("Debe seleccionar una cobranza.")
  }

  AbrirModalHistorial(content, event?)
  {
    if (this.oCobranzasSeleccionado != undefined && this.oCobranzasSeleccionado != null)
    {
      if (event != null || event != undefined)
        event.preventDefault();
      this._cobranzas.listar_historial(this.oCobranzasSeleccionado).subscribe(
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
        }
        // error => {
        //   this.ErrorGenerico()
        //   console.log(error)
        // }
      )

    }
    else
      this.ErrorPorTexto("Debe seleccionar una cobranza.")

  }

  CabeceraCobranzaDtl() {
    let oCobranzasDtl = {
      NumItem: "Item",
      CodCliente: "Cod. Clie.",
      nomCliente: "Nom. Cliente",
      DocumentoDet: "Documento",
      DescMoneda: "Moneda",
      TotalMN: "TotalMN",
      TotalME: "TotalME",
      comentarioDet: "Comentario",
    }
    return [oCobranzasDtl];
  }


   CuerpoCobranzaDtl(lstCobranzasDtl: CobranzasDtl[]) {
    var lstCobranzasDtlRep = [];
    let item = 1
    lstCobranzasDtl.forEach(i => {
      let oCobranzasDtl = {
        NumItem: item,
        CodCliente: i.CodCliente,
        nomCliente: i.nomCliente,
        DocumentoDet: i.DocumentoDet,
        DescMoneda: i.DescMoneda,
        TotalMN: i.TotalMN.toFixed(2),
        TotalME: i.TotalME.toFixed(2),
        comentarioDet: i.comentarioDet,
      }
      lstCobranzasDtlRep.push(oCobranzasDtl);
      item++;
    });
    return lstCobranzasDtlRep;
  }

  onSort(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string })
  {
    this.page.orderDir = sortInfo.sorts[0].dir;
    this.page.orderBy = sortInfo.sorts[0].prop;
    this.page.offset = 0;
    this.ListarCobranzas();
    this.radioData = "";
    this.oCobranzasSeleccionado = undefined;
    this.lstCobranzasDtl = [];
    this.lstCobranzasDtl = [...this.lstCobranzasDtl];
  }

  setPage(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.page.offset = pageInfo.offset;
    this.ListarCobranzas();
    this.radioData = "";
    this.oCobranzasSeleccionado = undefined;
    this.lstCobranzasDtl = [];
    this.lstCobranzasDtl = [...this.lstCobranzasDtl];
  }

  ImprimirCobranza()
  {
    if (this.oCobranzasSeleccionado != undefined && this.oCobranzasSeleccionado != null)
    {
      this._cobranzas.obtener(this.oCobranzasSeleccionado.CodOperacion, this.oCobranzasSeleccionado.NumDocumento).subscribe( response => {
        let oCobranzas: Cobranzas = response
        let nroSerie = response.NumDocumento.split('-')
        oCobranzas.SerieDoc = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
        oCobranzas.NroDoc = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
        oCobranzas.dFecCobrado = (oCobranzas.FechaCobrado != undefined && oCobranzas.FechaCobrado != null ? formatDateToNgbDateStruct(new Date(oCobranzas.FechaCobrado)) : undefined)
        oCobranzas.dFecEmision = (oCobranzas.FechaEmision != undefined && oCobranzas.FechaEmision != null ? formatDateToNgbDateStruct(new Date(oCobranzas.FechaEmision)) : undefined)
        let oBanco :Banco= {
          CodBanco: undefined,
          CodMoneda: undefined,
          DescBanco: undefined,
          DescMoneda: undefined
        }
        oBanco.CodBanco = oCobranzas.CodBanco;
        oBanco.DescBanco = oCobranzas.DescBanco;
        oBanco.CodMoneda = oCobranzas.CodMoneda;

        oCobranzas.Banco = oBanco;

        let oCajero :Cajero= {
          CodCajero: this.user.Cajero.CodCajero,
          DescCajero: this.user.Cajero.DescCajero
        }
        oCajero.CodCajero = oCobranzas.CodCajero;
        oCajero.DescCajero = oCobranzas.DescCajero;

        oCobranzas.Cajero = oCajero;

        oCobranzas.ListaDetalle.forEach(i => {
          let nroSerieDtl = i.NumeroDoc.split('-')
          i.Serie = (nroSerieDtl[0] != undefined && nroSerieDtl[0] != null ? nroSerieDtl[0] : undefined)
          i.Nro = (nroSerieDtl[1] != undefined && nroSerieDtl[1] != null ? nroSerieDtl[1] : undefined)
          i.TotalMN = i.TotalDet;
          i.TotalME = Number((i.TotalDet / i.ValorTC).toFixed(2));

        });

        const lst = oCobranzas.ListaDetalle;
        oCobranzas.ListaDetalle = [...lst]

        //CONSTRUCCIÓN DE REPORTE PDF
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setProperties({
          title: this.oCobranzasSeleccionado.Documento
        });
        doc.setFont('Cambria')
        doc.setFontSize(8)
        doc.setLineWidth(0.7);
        doc.roundedRect(18, 55, 560, 85, 6, 6);
        // doc.text("Atencio", 25, 35)
        doc.setFontSize(9)
        doc.setFontStyle('bold')
        doc.text("RECIBO:", 25, 50)
        let lengthRecibo = Math.round(doc.getTextWidth('RECIBO:'));
        doc.text(oCobranzas.DescDocumento, lengthRecibo + 30, 50)
        doc.text("F. Emisión:", 25, 70)
        let pipe = new DatePipe('en-US');
        let fec = pipe.transform(oCobranzas.FechaEmision, 'dd/MM/yyyy');
        let lengthFecEmision = Math.round(doc.getTextWidth('F. Emisión:'));
        doc.text(fec, lengthFecEmision + 30, 70)
        doc.text("Operación:", 400, 70)
        let lengthOperacion = Math.round(doc.getTextWidth('Operación:'));
        doc.text(this.oCobranzasSeleccionado.Documento, lengthOperacion + 405, 70)
        doc.text("Banco:", 25, 85)
        let lengthBanco = Math.round(doc.getTextWidth('Banco:'));
        doc.text(oCobranzas.DescBanco, lengthBanco + 30, 85)
        doc.text("ORIGINAL", 400, 85)
        doc.text("Cajero:", 25, 100)
        let lengthCajero = Math.round(doc.getTextWidth('Cajero:'));
        doc.text(oCobranzas.DescCajero, lengthCajero + 30, 100)
        doc.text("T/C:", 240, 100)
        let lengthTC = Math.round(doc.getTextWidth('T/C:'));
        doc.text(oCobranzas.ValorTC.toString(), lengthTC + 270, 100)
        doc.text("Moneda:", 400, 100)
        let lengthMoneda = Math.round(doc.getTextWidth('Moneda:'));
        doc.text(oCobranzas.DescMoneda, lengthMoneda + 405, 100)
        doc.text("Total:", 25, 115)
        let lengthTotal = Math.round(doc.getTextWidth('Total:'));
        doc.text(oCobranzas.TotalPagar.toFixed(2).toString(), lengthTotal + 30, 115)
        doc.text("Comentario:", 25, 130)
        let lengthComentario = Math.round(doc.getTextWidth('Comentario:'));
        doc.text(oCobranzas.Glosa, lengthComentario + 30, 130)
        // doc.autoTable(columns, data);
        doc.autoTable({
            startY: 145,
            head: this.CabeceraCobranzaDtl(),
            body: this.CuerpoCobranzaDtl(oCobranzas.ListaDetalle),
            styles: {
              //fillColor: [0, 0, 0],
              fontSize: 6,
              halign: 'center',
              tableWidth: 'auto'
            },
            headStyles: {
              fillColor: [0, 0, 0],
            },
            columnStyles: {
              0: {cellWidth: 30},
              1: {cellWidth: 50},
              2:{halign:'left', cellWidth: 160},
              3:{cellWidth: 60},
              4:{cellWidth: 50},
              5:{halign:'right'},
              6:{halign:'right'}
            },
            pageBreak: 'avoid',
            rowPageBreak: 'avoid',
            showHead: 'everyPage'
        })
        doc.setFontSize(10)
        //doc.text("TOTAL:", 240, doc.autoTableEndPosY() + 15);
        doc.text("TOTAL:", 320, doc.previousAutoTable.finalY + 15);

        let lengthTotalM = Math.round(doc.getTextWidth('TOTAL:'));
        doc.text(oCobranzas.TotalMN.toFixed(2).toString(), lengthTotalM + 400, doc.previousAutoTable.finalY + 15,null, null, 'right')
        doc.text(oCobranzas.TotalME.toFixed(2).toString(), lengthTotalM + 450, doc.previousAutoTable.finalY + 15,null, null, 'right')


        //doc.text(oCompras.iva.toFixed(2).toString(), 550, doc.previousAutoTable.finalY + 45 , null, null, 'right')

        doc.setLineWidth(1.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(40, doc.previousAutoTable.finalY + 35, 160, doc.previousAutoTable.finalY + 35);
        doc.text("PREPARADO POR", 53, doc.previousAutoTable.finalY + 50);

        doc.line(230, doc.previousAutoTable.finalY + 35, 350, doc.previousAutoTable.finalY + 35);
        doc.text("APROBADO POR", 247, doc.previousAutoTable.finalY + 50);

        doc.line(420, doc.previousAutoTable.finalY + 35, 540, doc.previousAutoTable.finalY + 35);
        doc.text("CLIENTE-DNI", 445, doc.previousAutoTable.finalY + 50);

        doc.setLineDash([10, 10], 0);
        doc.line(10, doc.previousAutoTable.finalY + 75, 583, doc.previousAutoTable.finalY + 75);
        doc.setLineDash([0, 0], 0);

        //*************COPIA 1**************
        doc.setFontSize(9)
        doc.setLineWidth(0.7);
        doc.roundedRect(18, doc.previousAutoTable.finalY + 115, 560, 85, 6, 6);
        doc.text("RECIBO:", 25, doc.previousAutoTable.finalY + 110)
        doc.text(oCobranzas.DescDocumento, lengthRecibo + 30, doc.previousAutoTable.finalY + 110)

        doc.text("F. Emisión:", 25, doc.previousAutoTable.finalY + 130)
        doc.text(fec, lengthFecEmision + 30, doc.previousAutoTable.finalY + 130)
        doc.text("Operación:", 400, doc.previousAutoTable.finalY + 130)
        doc.text(this.oCobranzasSeleccionado.Documento, lengthOperacion + 405, doc.previousAutoTable.finalY + 130)

        doc.text("Banco:", 25, doc.previousAutoTable.finalY + 145)
        doc.text(oCobranzas.DescBanco, lengthBanco + 30, doc.previousAutoTable.finalY + 145)
        doc.text("COPIA", 400, doc.previousAutoTable.finalY + 145)

        doc.text("Cajero:", 25, doc.previousAutoTable.finalY + 160)
        doc.text(oCobranzas.DescCajero, lengthCajero + 30, doc.previousAutoTable.finalY + 160)
        doc.text("T/C:", 240, doc.previousAutoTable.finalY + 160)
        doc.text(oCobranzas.ValorTC.toString(), lengthTC + 270, doc.previousAutoTable.finalY + 160)
        doc.text("Moneda:", 400, doc.previousAutoTable.finalY + 160)
        doc.text(oCobranzas.DescMoneda, lengthMoneda + 405, doc.previousAutoTable.finalY + 160)

        doc.text("Total:", 25, doc.previousAutoTable.finalY + 175)
        doc.text(oCobranzas.TotalPagar.toFixed(2).toString(), lengthTotal + 30, doc.previousAutoTable.finalY + 175)

        doc.text("Comentario:", 25, doc.previousAutoTable.finalY + 190)
        doc.text(oCobranzas.Glosa, lengthComentario + 30, doc.previousAutoTable.finalY + 190)
        // doc.autoTable(columns, data);
        doc.autoTable({
            startY: doc.previousAutoTable.finalY + 210,
            head: this.CabeceraCobranzaDtl(),
            body: this.CuerpoCobranzaDtl(oCobranzas.ListaDetalle),
            styles: {
              //fillColor: [0, 0, 0],
              fontSize: 6,
              halign: 'center',
              tableWidth: 'auto'
            },
            headStyles: {
              fillColor: [0, 0, 0],
            },
            columnStyles: {
              0: {cellWidth: 30},
              1: {cellWidth: 50},
              2:{halign:'left', cellWidth: 160},
              3:{cellWidth: 60},
              4:{cellWidth: 50},
              5:{halign:'right'},
              6:{halign:'right'}
            },
            pageBreak: 'avoid',
            rowPageBreak: 'avoid',
            showHead: 'everyPage'
        })
        doc.setFontSize(10)
        doc.text("TOTAL:", 320, doc.previousAutoTable.finalY + 15);
        doc.text(oCobranzas.TotalMN.toFixed(2).toString(), lengthTotalM + 400, doc.previousAutoTable.finalY + 15,null, null, 'right')
        doc.text(oCobranzas.TotalME.toFixed(2).toString(), lengthTotalM + 450, doc.previousAutoTable.finalY + 15,null, null, 'right')


        doc.setLineWidth(1.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(40, doc.previousAutoTable.finalY + 35, 160, doc.previousAutoTable.finalY + 35);
        doc.text("PREPARADO POR", 53, doc.previousAutoTable.finalY + 50);

        doc.line(230, doc.previousAutoTable.finalY + 35, 350, doc.previousAutoTable.finalY + 35);
        doc.text("APROBADO POR", 247, doc.previousAutoTable.finalY + 50);

        doc.line(420, doc.previousAutoTable.finalY + 35, 540, doc.previousAutoTable.finalY + 35);
        doc.text("CLIENTE-DNI", 445, doc.previousAutoTable.finalY + 50);

        doc.setLineDash([10, 10], 0);
        doc.line(10, doc.previousAutoTable.finalY + 75, 583, doc.previousAutoTable.finalY + 75);
        doc.setLineDash([0, 0], 0);



        //*************COPIA 2**************
        doc.setFontSize(9)
        doc.setLineWidth(0.7);
        doc.roundedRect(18, doc.previousAutoTable.finalY + 115, 560, 85, 6, 6);

        doc.text("RECIBO:", 25, doc.previousAutoTable.finalY + 110)
        doc.text(oCobranzas.DescDocumento, lengthRecibo + 30, doc.previousAutoTable.finalY + 110)

        doc.text("F. Emisión:", 25, doc.previousAutoTable.finalY + 130)
        doc.text(fec, lengthFecEmision + 30, doc.previousAutoTable.finalY + 130)
        doc.text("Operación:", 400, doc.previousAutoTable.finalY + 130)
        doc.text(this.oCobranzasSeleccionado.Documento, lengthOperacion + 405, doc.previousAutoTable.finalY + 130)

        doc.text("Banco:", 25, doc.previousAutoTable.finalY + 145)
        doc.text(oCobranzas.DescBanco, lengthBanco + 30, doc.previousAutoTable.finalY + 145)
        doc.text("COPIA", 400, doc.previousAutoTable.finalY + 145)

        doc.text("Cajero:", 25, doc.previousAutoTable.finalY + 160)
        doc.text(oCobranzas.DescCajero, lengthCajero + 30, doc.previousAutoTable.finalY + 160)
        doc.text("T/C:", 240, doc.previousAutoTable.finalY + 190)
        doc.text(oCobranzas.ValorTC.toString(), lengthTC + 270, doc.previousAutoTable.finalY + 160)
        doc.text("Moneda:", 400, doc.previousAutoTable.finalY + 160)
        doc.text(oCobranzas.DescMoneda, lengthMoneda + 405, doc.previousAutoTable.finalY + 160)

        doc.text("Total:", 25, doc.previousAutoTable.finalY + 175)
        doc.text(oCobranzas.TotalPagar.toFixed(2).toString(), lengthTotal + 30, doc.previousAutoTable.finalY + 175)

        doc.text("Comentario:", 25, doc.previousAutoTable.finalY + 190)
        doc.text(oCobranzas.Glosa, lengthComentario + 30, doc.previousAutoTable.finalY + 190)
        // doc.autoTable(columns, data);
        doc.autoTable({
            startY: doc.previousAutoTable.finalY + 210,
            head: this.CabeceraCobranzaDtl(),
            body: this.CuerpoCobranzaDtl(oCobranzas.ListaDetalle),
            styles: {
              //fillColor: [0, 0, 0],
              fontSize: 6,
              halign: 'center',
              tableWidth: 'auto'
            },
            headStyles: {
              fillColor: [0, 0, 0],
            },
            columnStyles: {
              0: {cellWidth: 30},
              1: {cellWidth: 50},
              2:{halign:'left', cellWidth: 160},
              3:{cellWidth: 60},
              4:{cellWidth: 50},
              5:{halign:'right'},
              6:{halign:'right'}
            },
            pageBreak: 'avoid',
            rowPageBreak: 'avoid',
            showHead: 'everyPage'
        })
        doc.setFontSize(10)
        doc.text("TOTAL:", 320, doc.previousAutoTable.finalY + 15);
        doc.text(oCobranzas.TotalMN.toFixed(2).toString(), lengthTotalM + 400, doc.previousAutoTable.finalY + 15,null, null, 'right')
        doc.text(oCobranzas.TotalME.toFixed(2).toString(), lengthTotalM + 450, doc.previousAutoTable.finalY + 15,null, null, 'right')


        doc.setLineWidth(1.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(40, doc.previousAutoTable.finalY + 35, 160, doc.previousAutoTable.finalY + 35);
        doc.text("PREPARADO POR", 53, doc.previousAutoTable.finalY + 50);

        doc.line(230, doc.previousAutoTable.finalY + 35, 350, doc.previousAutoTable.finalY + 35);
        doc.text("APROBADO POR", 247, doc.previousAutoTable.finalY + 50);

        doc.line(420, doc.previousAutoTable.finalY + 35, 540, doc.previousAutoTable.finalY + 35);
        doc.text("CLIENTE-DNI", 445, doc.previousAutoTable.finalY + 50);



        //PAGINADO DEL PDF
        const pageCount = doc.internal.getNumberOfPages();
        for(var i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8)
          doc.text(this.user.Empresa.RazonSocial, 25, 35)
          doc.text('Página ' + String(i) + ' de ' + String(pageCount), 530, 35);
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
      this.ErrorPorTexto("Debe seleccionar una cobranza.")

  }

  ImprimirCobranzaFormato2()
  {
    if (this.oCobranzasSeleccionado != undefined && this.oCobranzasSeleccionado != null)
    {
      this._cobranzas.obtener(this.oCobranzasSeleccionado.CodOperacion, this.oCobranzasSeleccionado.NumDocumento).subscribe( response => {
        let oCobranzas: Cobranzas = response
        let nroSerie = response.NumDocumento.split('-')
        oCobranzas.SerieDoc = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
        oCobranzas.NroDoc = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
        oCobranzas.dFecCobrado = (oCobranzas.FechaCobrado != undefined && oCobranzas.FechaCobrado != null ? formatDateToNgbDateStruct(new Date(oCobranzas.FechaCobrado)) : undefined)
        oCobranzas.dFecEmision = (oCobranzas.FechaEmision != undefined && oCobranzas.FechaEmision != null ? formatDateToNgbDateStruct(new Date(oCobranzas.FechaEmision)) : undefined)
        let oBanco :Banco= {
          CodBanco: undefined,
          CodMoneda: undefined,
          DescBanco: undefined,
          DescMoneda: undefined
        }
        oBanco.CodBanco = oCobranzas.CodBanco;
        oBanco.DescBanco = oCobranzas.DescBanco;
        oBanco.CodMoneda = oCobranzas.CodMoneda;

        oCobranzas.Banco = oBanco;

        let oCajero :Cajero= {
          CodCajero: this.user.Cajero.CodCajero,
          DescCajero: this.user.Cajero.DescCajero
        }
        oCajero.CodCajero = oCobranzas.CodCajero;
        oCajero.DescCajero = oCobranzas.DescCajero;

        oCobranzas.Cajero = oCajero;

        oCobranzas.ListaDetalle.forEach(i => {
          let nroSerieDtl = i.NumeroDoc.split('-')
          i.Serie = (nroSerieDtl[0] != undefined && nroSerieDtl[0] != null ? nroSerieDtl[0] : undefined)
          i.Nro = (nroSerieDtl[1] != undefined && nroSerieDtl[1] != null ? nroSerieDtl[1] : undefined)
          i.TotalMN = i.TotalDet;
          i.TotalME = Number((i.TotalDet / i.ValorTC).toFixed(2));

        });

        const lst = oCobranzas.ListaDetalle;
        oCobranzas.ListaDetalle = [...lst]

        //CONSTRUCCIÓN DE REPORTE PDF
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setProperties({
          title: this.oCobranzasSeleccionado.Documento
        });
        doc.setFont('Cambria')
        doc.setFontSize(8)
        doc.setLineWidth(0.7);
        doc.roundedRect(18, 55, 560, 85, 6, 6);
        // doc.text("Atencio", 25, 35)
        doc.setFontSize(9)
        doc.setFontStyle('bold')
        doc.text("RECIBO:", 25, 50)
        let lengthRecibo = Math.round(doc.getTextWidth('RECIBO:'));
        doc.text(oCobranzas.DescDocumento, lengthRecibo + 30, 50)
        doc.text("F. Emisión:", 25, 70)
        let pipe = new DatePipe('en-US');
        let fec = pipe.transform(oCobranzas.FechaEmision, 'dd/MM/yyyy');
        let lengthFecEmision = Math.round(doc.getTextWidth('F. Emisión:'));
        doc.text(fec, lengthFecEmision + 30, 70)
        doc.text("Operación:", 400, 70)
        let lengthOperacion = Math.round(doc.getTextWidth('Operación:'));
        doc.text(this.oCobranzasSeleccionado.Documento, lengthOperacion + 405, 70)
        doc.text("Banco:", 25, 85)
        let lengthBanco = Math.round(doc.getTextWidth('Banco:'));
        doc.text(oCobranzas.DescBanco, lengthBanco + 30, 85)
        doc.text("ORIGINAL", 400, 85)
        doc.text("Cajero:", 25, 100)
        let lengthCajero = Math.round(doc.getTextWidth('Cajero:'));
        doc.text(oCobranzas.DescCajero, lengthCajero + 30, 100)
        doc.text("T/C:", 240, 100)
        let lengthTC = Math.round(doc.getTextWidth('T/C:'));
        doc.text(oCobranzas.ValorTC.toString(), lengthTC + 270, 100)
        doc.text("Moneda:", 400, 100)
        let lengthMoneda = Math.round(doc.getTextWidth('Moneda:'));
        doc.text(oCobranzas.DescMoneda, lengthMoneda + 405, 100)
        doc.text("Total:", 25, 115)
        let lengthTotal = Math.round(doc.getTextWidth('Total:'));
        doc.text(oCobranzas.TotalPagar.toFixed(2).toString(), lengthTotal + 30, 115)
        doc.text("Comentario:", 25, 130)
        let lengthComentario = Math.round(doc.getTextWidth('Comentario:'));
        doc.text(oCobranzas.Glosa, lengthComentario + 30, 130)
        // doc.autoTable(columns, data);
        doc.autoTable({
            startY: 145,
            head: this.CabeceraCobranzaDtl(),
            body: this.CuerpoCobranzaDtl(oCobranzas.ListaDetalle),
            styles: {
              //fillColor: [0, 0, 0],
              fontSize: 6,
              halign: 'center',
              tableWidth: 'auto'
            },
            headStyles: {
              fillColor: [0, 0, 0],
            },
            columnStyles: {
              0: {cellWidth: 30},
              1: {cellWidth: 50},
              2:{halign:'left', cellWidth: 160},
              3:{cellWidth: 60},
              4:{cellWidth: 50},
              5:{halign:'right'},
              6:{halign:'right'}
            },
            pageBreak: 'avoid',
            rowPageBreak: 'avoid',
            showHead: 'everyPage'
        })
        doc.setFontSize(10)
        //doc.text("TOTAL:", 240, doc.autoTableEndPosY() + 15);
        doc.text("TOTAL:", 320, doc.previousAutoTable.finalY + 15);

        let lengthTotalM = Math.round(doc.getTextWidth('TOTAL:'));
        doc.text(oCobranzas.TotalMN.toFixed(2).toString(), lengthTotalM + 400, doc.previousAutoTable.finalY + 15,null, null, 'right')
        doc.text(oCobranzas.TotalME.toFixed(2).toString(), lengthTotalM + 450, doc.previousAutoTable.finalY + 15,null, null, 'right')


        doc.setLineWidth(1.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(40, doc.previousAutoTable.finalY + 40, 160, doc.previousAutoTable.finalY + 40);
        doc.text("PREPARADO POR", 53, doc.previousAutoTable.finalY + 55);

        doc.line(230, doc.previousAutoTable.finalY + 40, 350, doc.previousAutoTable.finalY + 40);
        doc.text("APROBADO POR", 247, doc.previousAutoTable.finalY + 55);

        doc.line(420, doc.previousAutoTable.finalY + 40, 540, doc.previousAutoTable.finalY + 40);
        doc.text("CLIENTE-DNI", 445, doc.previousAutoTable.finalY + 55);




        //PAGINADO DEL PDF
        const pageCount = doc.internal.getNumberOfPages();
        for(var i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8)
          doc.text(this.user.Empresa.RazonSocial, 25, 35)
          doc.text('Página ' + String(i) + ' de ' + String(pageCount), 530, 35);
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
      this.ErrorPorTexto("Debe seleccionar una cobranza.")

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

  ngOnInit() {
    this.setPage({ offset: 0 });
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

  ErrorPorHtml(html)
  {
    this.formSwalHtml.title = "Error";
    this.formSwalHtml.html = html
    this.formSwalHtml.type = "error";
    this.formSwalHtml.fire();
  }

}
