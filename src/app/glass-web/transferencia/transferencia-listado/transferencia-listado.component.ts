import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Historial, Usuario, Sucursal, Banco, Cajero, TransferenciaBanco, TransferenciaBancoDtl, Paginar } from 'src/app/others/interfaces';
import { UsuarioService } from 'src/app/services/usuario.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { formatDateToNgbDateStruct } from 'src/app/others/utilBootstrap';
import { TransferenciaBancoService } from 'src/app/services/transferencia-banco.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { stringify } from 'querystring';

declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'app-transferencia-listado',
  templateUrl: './transferencia-listado.component.html',
  styleUrls: ['./transferencia-listado.component.css'],
  providers: [DatePipe]
})
export class TransferenciaListadoComponent implements OnInit {
  public radioData: any;
  constructor(
    private router: Router,
    private _usuarios: UsuarioService,
    private _sucursal: SucursalService,
    private modalService: NgbModal,
    private _transferenciabanco: TransferenciaBancoService
  ) { }
  @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
  @ViewChild("ErrorFormHtml", {static: false}) formSwalHtml: SwalComponent;
  @ViewChild("deleteSwal", {static: false}) deleteSwal: SwalComponent;
  @ViewChild("contentHistorial", {static: false}) modalHistorial: NgbModal;
  @ViewChild("tbTransferencia", {static: false}) tbDetalle: DatatableComponent;

  page = {
    limit: 10,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };
  oTransferenciaBancoSeleccionado:TransferenciaBanco;
  lstTransferenciaBanco:TransferenciaBanco[] = [];
  lstTransferenciaBancoDtl:TransferenciaBancoDtl[] = [];
  lstTempTransferenciaBanco:TransferenciaBanco[] = [];
  lstHistorial:Historial[] = [];
  lstSucursal:Sucursal[] = [];
  cargando= true;
  tipoBusquedaTransferenciaBanco: string = 'documento'
  EsSucursal: boolean = true
  oSucursal= this._usuarios.getSucursal()
  MostrarBusquedaTransferenciaBanco = false;

  NombreMenu: string = 'mnuTranferenciaBanco'
  strBusqueda: string = ''

  user: Usuario = this._usuarios.getUserLoggedIn()

  ListarSucursal = this._sucursal.listar_activos().subscribe( response => {
    this.lstSucursal = response
  })

  ListarTransferenciaBanco()
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
      oPaginar.ColumnFilters.push(this.tipoBusquedaTransferenciaBanco);
      oPaginar.ValueFilters.push(this.strBusqueda);
    }
    let listar = this._transferenciabanco.listar(oPaginar).subscribe( response => {
      this.lstTransferenciaBanco = response.Results
      this.lstTempTransferenciaBanco = response.Results;
      this.lstTransferenciaBanco = [...this.lstTransferenciaBanco];
      this.lstTempTransferenciaBanco = [...this.lstTempTransferenciaBanco];
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

  ListarDetalle(row)
  {
    console.log(this.radioData);
    let oTransferenciaBanco : TransferenciaBanco = row;
    this.oTransferenciaBancoSeleccionado = oTransferenciaBanco;
    this.oTransferenciaBancoSeleccionado.codusuario = this.user.CodUsuario;
    console.log(this.oTransferenciaBancoSeleccionado)
    let ListarTransferenciaBancoDtl = this._transferenciabanco.listar_detalle(oTransferenciaBanco).subscribe(
      response => {
        this.lstTransferenciaBancoDtl = response
        this.lstTransferenciaBancoDtl = [...this.lstTransferenciaBancoDtl];
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

  AbrirModalHistorial(content, event?)
  {
    if (this.oTransferenciaBancoSeleccionado != undefined && this.oTransferenciaBancoSeleccionado != null)
    {
      if (event != null || event != undefined)
        event.preventDefault();
      this._transferenciabanco.listar_historial(this.oTransferenciaBancoSeleccionado).subscribe(
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
        // error => {
        //   this.ErrorGenerico()
        //   console.log(error)
        // }
      )

    }
    else
      this.ErrorPorTexto("Debe seleccionar una transferencia de banco.")

  }


  CambiarSucursalControles()
  {
    this.ListarTransferenciaBanco()
  }

  BuscarTransferenciaBanco(event) {
    this.radioData = "";
    this.oTransferenciaBancoSeleccionado = undefined;
    this.lstTransferenciaBancoDtl = [];
    this.lstTransferenciaBancoDtl = [...this.lstTransferenciaBancoDtl];
    this.strBusqueda = event.target.value.toLowerCase();
    this.page.offset = 0;
    this.ListarTransferenciaBanco();
  }

  onSort(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string }) {
    this.page.orderDir = sortInfo.sorts[0].dir;
    this.page.orderBy = sortInfo.sorts[0].prop;
    this.page.offset = 0;
    this.ListarTransferenciaBanco();
    this.radioData = "";
    this.oTransferenciaBancoSeleccionado = undefined;
    this.lstTransferenciaBancoDtl = [];
    this.lstTransferenciaBancoDtl = [...this.lstTransferenciaBancoDtl];
  }

  setPage(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.page.offset = pageInfo.offset;
    this.ListarTransferenciaBanco();
    this.radioData = "";
    this.oTransferenciaBancoSeleccionado = undefined;
    this.lstTransferenciaBancoDtl = [];
    this.lstTransferenciaBancoDtl = [...this.lstTransferenciaBancoDtl];
  }

  RedireccionarNuevaTransferenciaBanco()
  {
    this.router.navigateByUrl('/GlassWeb/transferencia-banco/crear');
  }

  RedireccionarEditarTransferenciaBanco()
  {
    debugger;
    if (this.oTransferenciaBancoSeleccionado != undefined && this.oTransferenciaBancoSeleccionado != null)
    {
      this.router.navigateByUrl('/GlassWeb/transferencia-banco/obtener/'+ this.oTransferenciaBancoSeleccionado.coddocumento + '/' + this.oTransferenciaBancoSeleccionado.numdocumento);
    }
    else
      this.ErrorPorTexto("Debe seleccionar una transferencia de banco.")
  }

  EliminarTransferenciaBanco()
  {
    if (this.oTransferenciaBancoSeleccionado != undefined && this.oTransferenciaBancoSeleccionado != null)
    {
      if (this.oTransferenciaBancoSeleccionado.estadodoc == 2)
      {
        this.deleteSwal.fire().then(result => {
          if (result.value) {
            let oTransferenciaBanco: TransferenciaBanco = this.oTransferenciaBancoSeleccionado;
            this._transferenciabanco.eliminar(oTransferenciaBanco).subscribe(
              response => {
                this.formSwal.title = "Éxito";
                this.formSwal.text = "Se ha eliminado correctamente.";
                this.formSwal.type = "success";
                this.formSwal.fire();
                this.ListarTransferenciaBanco();
                this.lstTransferenciaBancoDtl = []
                this.lstTransferenciaBancoDtl = [...this.lstTransferenciaBancoDtl];
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
        this.ErrorPorTexto("La transferencia de banco debe ser tener estado ANULADO.")
    }
    else
      this.ErrorPorTexto("Debe seleccionar una transferencia de banco.")
  }

  ImprimirTransferenciaBancoF8()
  {
    if (this.oTransferenciaBancoSeleccionado != undefined && this.oTransferenciaBancoSeleccionado != null)
    {
      this._transferenciabanco.obtener(this.oTransferenciaBancoSeleccionado.coddocumento, this.oTransferenciaBancoSeleccionado.numdocumento).subscribe( response => {
        debugger;
        let oTransferenciaBanco: TransferenciaBanco = response
        let nroSerie = response.numdocumento.split('-')
        oTransferenciaBanco.seriedoc = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
        oTransferenciaBanco.nrodoc = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
        oTransferenciaBanco.dFecRegistro = (oTransferenciaBanco.fecregistro != undefined && oTransferenciaBanco.fecregistro != null ? formatDateToNgbDateStruct(new Date(oTransferenciaBanco.fecregistro)) : undefined)
        oTransferenciaBanco.dFecRecibido = (oTransferenciaBanco.fecrecibido != undefined && oTransferenciaBanco.fecrecibido != null ? formatDateToNgbDateStruct(new Date(oTransferenciaBanco.fecrecibido)) : undefined)
        oTransferenciaBanco.dFecEmision = (oTransferenciaBanco.fecemision != undefined && oTransferenciaBanco.fecemision != null ? formatDateToNgbDateStruct(new Date(oTransferenciaBanco.fecemision)) : undefined)


        let oCajero :Cajero= {
          CodCajero: this.user.Cajero.CodCajero,
          DescCajero: this.user.Cajero.DescCajero
        }
        oCajero.CodCajero = oTransferenciaBanco.codcajero;
        oCajero.DescCajero = oTransferenciaBanco.desccajero;

        oTransferenciaBanco.Cajero = oCajero;


        const lst = oTransferenciaBanco.ListaDetalle;
        oTransferenciaBanco.ListaDetalle = [...lst]

        //CONSTRUCCIÓN DE REPORTE PDF
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setProperties({
          title: this.oTransferenciaBancoSeleccionado.documento
        });
        doc.setFont('Courier')
        doc.setFontSize(9)

        doc.text("*************************", 15, 50)
        doc.setFontStyle('italic')
        doc.text(this.user.Empresa.RazonSocial, 15, 65)
        doc.setFontStyle('normal')
        doc.text("VALES DE ENTREGAS", 80, 90)
        doc.text(oTransferenciaBanco.coddocumento + oTransferenciaBanco.numdocumento, 15, 105)
        doc.text("Se remite A", 15, 120)
        let lengthRemite = Math.round(doc.getTextWidth('Se remite A'));
        doc.text(oTransferenciaBanco.ListaDetalle.length > 0 ? oTransferenciaBanco.ListaDetalle[0].desccajero : "", lengthRemite + 30, 115)
        doc.setLineDash([3, 3], 0);
        doc.line(lengthRemite + 30, 120, lengthRemite + 200, 120);
        doc.setLineDash([0, 0], 0);
        doc.text("Ventas Del :", 15, 135)
        let lengthFechaReg = Math.round(doc.getTextWidth('Ventas Del :'));
        let pipe = new DatePipe('en-US');
        let fecEmi = pipe.transform(oTransferenciaBanco.fecemision, 'dd/MM/yyyy');
        doc.text(fecEmi, lengthFechaReg + 30, 135)
        doc.text("Efect. S/.", 15, 150)
        doc.text(oTransferenciaBanco.impefectivomn.toFixed(2).toString(), 120, 150)
        doc.text("==>", 180, 150)
        doc.text(oTransferenciaBanco.depoefectivomn.toFixed(2).toString(), 230, 150)
        doc.text("Efect. $.", 15, 165)
        doc.text(oTransferenciaBanco.impefectivome.toFixed(2).toString(), 120, 165)
        doc.text("==>", 180, 165)
        doc.text(oTransferenciaBanco.depoefectivome.toFixed(2).toString(), 230, 165)
        doc.text("Cheque S/.", 15, 180)
        doc.text(oTransferenciaBanco.impechequemn.toFixed(2).toString(), 120, 180)
        doc.text("==>", 180, 180)
        doc.text(oTransferenciaBanco.depoechequemn.toFixed(2).toString(), 230, 180)
        doc.text("Cheque $.", 15, 195)
        doc.text(oTransferenciaBanco.impechequeme.toFixed(2).toString(), 120, 195)
        doc.text("==>", 180, 195)
        doc.text(oTransferenciaBanco.depoechequeme.toFixed(2).toString(), 230, 195)
        doc.text("T/C:", 15, 210)
        doc.text(oTransferenciaBanco.valortc.toString(), 120, 210)
        doc.setLineDash([3, 3], 0)
        doc.line(15, 225, 230, 225)
        doc.setLineDash([0, 0], 0)
        doc.text("Asunto:", 15, 255)
        doc.text(oTransferenciaBanco.comentario, 15, 270)

        doc.setLineDash([10, 10], 0);
        doc.line(30, 300, 250, 300);
        doc.setLineDash([0, 0], 0);
        doc.text(oTransferenciaBanco.desccajero, 100, 315);

        doc.text("*************************", 15, 350)

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
      this.ErrorPorTexto("Debe seleccionar una transferencia de banco.")

  }

  ImprimirTransferenciaBanco()
  {
    if (this.oTransferenciaBancoSeleccionado != undefined && this.oTransferenciaBancoSeleccionado != null)
    {
      this._transferenciabanco.obtener(this.oTransferenciaBancoSeleccionado.coddocumento, this.oTransferenciaBancoSeleccionado.numdocumento).subscribe( response => {
        debugger;
        let oTransferenciaBanco: TransferenciaBanco = response
        let nroSerie = response.numdocumento.split('-')
        oTransferenciaBanco.seriedoc = (nroSerie[0] != undefined && nroSerie[0] != null ? nroSerie[0] : undefined)
        oTransferenciaBanco.nrodoc = (nroSerie[1] != undefined && nroSerie[1] != null ? nroSerie[1] : undefined)
        oTransferenciaBanco.dFecRegistro = (oTransferenciaBanco.fecregistro != undefined && oTransferenciaBanco.fecregistro != null ? formatDateToNgbDateStruct(new Date(oTransferenciaBanco.fecregistro)) : undefined)
        oTransferenciaBanco.dFecRecibido = (oTransferenciaBanco.fecrecibido != undefined && oTransferenciaBanco.fecrecibido != null ? formatDateToNgbDateStruct(new Date(oTransferenciaBanco.fecrecibido)) : undefined)
        oTransferenciaBanco.dFecEmision = (oTransferenciaBanco.fecemision != undefined && oTransferenciaBanco.fecemision != null ? formatDateToNgbDateStruct(new Date(oTransferenciaBanco.fecemision)) : undefined)


        let oCajero :Cajero= {
          CodCajero: this.user.Cajero.CodCajero,
          DescCajero: this.user.Cajero.DescCajero
        }
        oCajero.CodCajero = oTransferenciaBanco.codcajero;
        oCajero.DescCajero = oTransferenciaBanco.desccajero;

        oTransferenciaBanco.Cajero = oCajero;


        const lst = oTransferenciaBanco.ListaDetalle;
        oTransferenciaBanco.ListaDetalle = [...lst]

        //CONSTRUCCIÓN DE REPORTE PDF
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setProperties({
          title: this.oTransferenciaBancoSeleccionado.documento
        });
        doc.setFont('Cambria')
        doc.setFontSize(9)
        doc.setLineWidth(0.7);
        doc.rect(10, 5, 578, 350);
        let pipe = new DatePipe('en-US');
        let fecAct = pipe.transform(new Date(), 'dd/MM/yyyy');
        doc.text(fecAct, 450, 20)
        let hora = pipe.transform(new Date(), 'hh:mm:ss a');
        doc.text(hora, 520, 20)
        doc.setFontSize(11)
        doc.setFontStyle('bolditalic')
        doc.text(this.user.Empresa.RazonSocial, 50, 55)
        doc.setFontSize(13)
        doc.setFontStyle('bold')
        doc.text("VALE DE ENTREGAS", 435, 55)
        doc.setLineWidth(0.7);
        doc.roundedRect(430, 40, 145, 20, 6, 6);
        doc.setFontSize(10)
        doc.setFontStyle('normal')
        doc.text(oTransferenciaBanco.coddocumento + oTransferenciaBanco.numdocumento, 460, 75)
        doc.text("Se remite:", 50, 90)
        let lengthRemite = Math.round(doc.getTextWidth('Se remite:'));
        doc.setFontStyle('bold')
        doc.text(oTransferenciaBanco.ListaDetalle.length > 0 ? oTransferenciaBanco.ListaDetalle[0].desccajero : "", lengthRemite + 60, 90)
        doc.setFontStyle('normal')
        doc.text("Ventas Del:", 360, 90)
        let fecEmi = pipe.transform(oTransferenciaBanco.fecemision, 'dd/MM/yyyy');
        doc.setFontStyle('bold')
        doc.text(fecEmi, 430, 90)
        doc.setFontStyle('normal')
        doc.setLineDash([5, 5], 0);
        doc.line(lengthRemite + 60, 95, lengthRemite + 280, 95);
        doc.setLineDash([0, 0], 0);


        doc.text("El importe de:", 70, 110)
        doc.text("Boletas de Depósito:", 320, 110)

        doc.text("Efectivo S/.", 70, 140)
        doc.text(oTransferenciaBanco.impefectivomn.toFixed(2).toString(), 255, 140, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 145, 260, 145);
        doc.setLineDash([0, 0], 0);
        doc.text("Efectivo S/.", 320, 140)
        doc.text(oTransferenciaBanco.depoefectivomn.toFixed(2).toString(), 505, 140, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(400, 145, 510, 145);
        doc.setLineDash([0, 0], 0);

        doc.text("Efectivo $.", 70, 155)
        doc.text(oTransferenciaBanco.impefectivome.toFixed(2).toString(), 255, 155, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 160, 260, 160);
        doc.setLineDash([0, 0], 0);
        doc.text("Efectivo $.", 320, 155)
        doc.text(oTransferenciaBanco.depoefectivome.toFixed(2).toString(), 505, 155, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(400, 160, 510, 160);
        doc.setLineDash([0, 0], 0);

        doc.text("Cheque S/.", 70, 170)
        doc.text(oTransferenciaBanco.impechequemn.toFixed(2).toString(), 255, 170, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 175, 260, 175);
        doc.setLineDash([0, 0], 0);
        doc.text("Cheque S/.", 320, 170)
        doc.text(oTransferenciaBanco.depoechequemn.toFixed(2).toString(), 505, 170, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(400, 175, 510, 175);
        doc.setLineDash([0, 0], 0);

        doc.text("Cheque $.", 70, 185)
        doc.text(oTransferenciaBanco.impechequeme.toFixed(2).toString(), 255, 185, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 190, 260, 190);
        doc.setLineDash([0, 0], 0);
        doc.text("Cheque $.", 320, 185)
        doc.text(oTransferenciaBanco.depoechequeme.toFixed(2).toString(), 505, 185, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(400, 190, 510, 190);
        doc.setLineDash([0, 0], 0);

        doc.text("T/C.", 70, 200)
        doc.text(oTransferenciaBanco.valortc.toString(), 255, 200, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 205, 260, 205);
        doc.setLineDash([0, 0], 0);

        doc.setLineWidth(0.7);
        doc.roundedRect(65, 125, 200, 100, 6, 6);

        doc.setLineWidth(0.7);
        doc.roundedRect(315, 125, 200, 100, 6, 6);


        doc.text("Observación:", 70, 245)

        doc.text(oTransferenciaBanco.comentario, 70, 275)
        doc.setLineDash([5, 5], 0);
        doc.setLineWidth(0.7);
        doc.roundedRect(65, 260, 450, 40, 6, 6);
        doc.setLineDash([0, 0], 0);


        doc.setFontStyle('bold')
        doc.text(oTransferenciaBanco.desccajero, 230, 320)
        doc.setFontStyle('normal')
        doc.setLineDash([5, 5], 0);
        doc.line(70, 325, 190, 325);
        doc.line(230, 325, 350, 325);
        doc.line(400, 325, 520, 325);
        doc.setLineDash([0, 0], 0);

        doc.text("CONDUCTOR", 95, 340)
        doc.text("CAJERA", 270, 340)
        doc.text("RECIBI CONFORME", 415, 340)


        doc.setLineDash([10, 10], 0);
        doc.line(10, 400, 583, 400);
        doc.setLineDash([0, 0], 0);


        //****************COPIA*******************
        doc.setFontSize(9)
        doc.setLineWidth(0.7);
        doc.rect(10, 440, 578, 350);
        doc.text(fecAct, 450, 460)
        doc.text(hora, 520, 460)
        doc.setFontSize(11)
        doc.setFontStyle('bolditalic')
        doc.text(this.user.Empresa.RazonSocial, 50, 495)
        doc.setFontStyle('bold')
        doc.text("COPIA", 50, 510)
        doc.setFontSize(13)
        doc.text("VALE DE ENTREGAS", 435, 495)
        doc.setLineWidth(0.7);
        doc.roundedRect(430, 480, 145, 20, 6, 6);
        doc.setFontSize(10)
        doc.setFontStyle('normal')
        doc.text(oTransferenciaBanco.coddocumento + oTransferenciaBanco.numdocumento, 460, 515)
        doc.text("Se remite:", 50, 530)
        doc.setFontStyle('bold')
        doc.text(oTransferenciaBanco.ListaDetalle.length > 0 ? oTransferenciaBanco.ListaDetalle[0].desccajero : "", lengthRemite + 60, 530)
        doc.setFontStyle('normal')
        doc.text("Ventas Del:", 360, 530)
        doc.setFontStyle('bold')
        doc.text(fecEmi, 430, 530)
        doc.setFontStyle('normal')
        doc.setLineDash([5, 5], 0);
        doc.line(lengthRemite + 60, 535, lengthRemite + 280, 535);
        doc.setLineDash([0, 0], 0);


        doc.text("El importe de:", 70, 550)
        doc.text("Boletas de Depósito:", 320, 550)

        doc.text("Efectivo S/.", 70, 580)
        doc.text(oTransferenciaBanco.impefectivomn.toFixed(2).toString(), 255, 580, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 585, 260, 585);
        doc.setLineDash([0, 0], 0);
        doc.text("Efectivo S/.", 320, 580)
        doc.text(oTransferenciaBanco.depoefectivomn.toFixed(2).toString(), 505, 580, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(400, 585, 510, 585);
        doc.setLineDash([0, 0], 0);

        doc.text("Efectivo $.", 70, 595)
        doc.text(oTransferenciaBanco.impefectivome.toFixed(2).toString(), 255, 595, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 600, 260, 600);
        doc.setLineDash([0, 0], 0);
        doc.text("Efectivo $.", 320, 595)
        doc.text(oTransferenciaBanco.depoefectivome.toFixed(2).toString(), 505, 595, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(400, 600, 510, 600);
        doc.setLineDash([0, 0], 0);

        doc.text("Cheque S/.", 70, 610)
        doc.text(oTransferenciaBanco.impechequemn.toFixed(2).toString(), 255, 610, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 615, 260, 615);
        doc.setLineDash([0, 0], 0);
        doc.text("Cheque S/.", 320, 610)
        doc.text(oTransferenciaBanco.depoechequemn.toFixed(2).toString(), 505, 610, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(400, 615, 510, 615);
        doc.setLineDash([0, 0], 0);

        doc.text("Cheque $.", 70, 625)
        doc.text(oTransferenciaBanco.impechequeme.toFixed(2).toString(), 255, 625, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 630, 260, 630);
        doc.setLineDash([0, 0], 0);
        doc.text("Cheque $.", 320, 625)
        doc.text(oTransferenciaBanco.depoechequeme.toFixed(2).toString(), 505, 625, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(400, 630, 510, 630);
        doc.setLineDash([0, 0], 0);

        doc.text("T/C.", 70, 640)
        doc.text(oTransferenciaBanco.valortc.toString(), 255, 640, {align:'right'})
        doc.setLineDash([5, 5], 0);
        doc.line(150, 645, 260, 645);
        doc.setLineDash([0, 0], 0);

        doc.setLineWidth(0.7);
        doc.roundedRect(65, 565, 200, 100, 6, 6);

        doc.setLineWidth(0.7);
        doc.roundedRect(315, 565, 200, 100, 6, 6);


        doc.text("Observación:", 70, 685)

        doc.text(oTransferenciaBanco.comentario, 70, 715)
        doc.setLineDash([5, 5], 0);
        doc.setLineWidth(0.7);
        doc.roundedRect(65, 700, 450, 40, 6, 6);
        doc.setLineDash([0, 0], 0);


        doc.setFontStyle('bold')
        doc.text(oTransferenciaBanco.desccajero, 230, 760)
        doc.setFontStyle('normal')
        doc.setLineDash([5, 5], 0);
        doc.line(70, 765, 190, 765);
        doc.line(230, 765, 350, 765);
        doc.line(400, 765, 520, 765);
        doc.setLineDash([0, 0], 0);

        doc.text("CONDUCTOR", 95, 780)
        doc.text("CAJERA", 270, 780)
        doc.text("RECIBI CONFORME", 415, 780)

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
      this.ErrorPorTexto("Debe seleccionar una transferencia de banco.")

  }

  SelecionarDetalle(event){
    (event.type === 'dblclick') && event.cellElement.blur();
    switch (event.type) {
      case 'dblclick':
        switch (event.column.prop) {
          case "documento":

            break;
          default:
            break;
        }
        break;
      default:
        break;
    }


  }

  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg'
    });
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

  ngOnInit() {
    this.setPage({ offset: 0 });
  }

}
