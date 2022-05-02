import { EstadoDocumento, proveedorT } from './../../../others/interfaces';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { cuentaDetalle, listaD, Paginar, ResDetalle } from 'src/app/others/interfaces';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { formatDateToNgbDateStruct } from 'src/app/others/utilBootstrap';
import { DatePipe } from '@angular/common';

declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'app-proveedor-listado',
  templateUrl: './proveedor-listado.component.html',
  styleUrls: ['./proveedor-listado.component.css']
})
export class ProveedorListadoComponent implements OnInit {

  constructor(private _proveedor:ProveedorService, private _ruta:Router) { }
  public listCuentas:any[] =[];
  public lstTempCuentas:any[] = [];
  public CuentaProSelecionado;
  public data:any;
  public oDetalleSelecionado:cuentaDetalle;
  public ListarCuentaDtl:ResDetalle[] = [];
  public MostrarBusqueda = false;
  public tipoBusqueda: string = 'Documento'
  public NombreMenu: string = 'mnupagoproveedores';
  public strBusqueda: string = '';
  public cargando= true;
  public SumaE!:number;
  @ViewChild("deleteSwal", {static: false}) deleteSwal: SwalComponent;
  @ViewChild("ErrorForm", {static: false}) formSwal: SwalComponent;
  public page = {
    limit: 6,
    count: 0,
    offset: 0,
    orderBy: '',
    orderDir: 'asc'
  };
  ngOnInit() {
      //this.listCuentasxPagar();
      this.setPage({ offset: 0 });
    }
    redirecionarNuevoPagoP(){
      this._ruta.navigateByUrl('/GlassWeb/proveedor/crear');
      console.log('ok')
    }
    RedireccionarEditarPagoP()
  {
    if (this.oDetalleSelecionado != undefined && this.oDetalleSelecionado != null)
    {this._ruta.navigateByUrl('/GlassWeb/proveedor/obtener/'+ this.oDetalleSelecionado.numDocDet);
    }
    else
      this.ErrorPorTexto("Debe seleccionar una compra.")
  }
  listCuentasxPagar(){
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
      oPaginar.ColumnFilters.push(this.tipoBusqueda);
      oPaginar.ValueFilters.push(this.strBusqueda);
      console.log(this.tipoBusqueda)
      console.log(this.strBusqueda)
    }
    this._proveedor.listarProveedorPendiente(oPaginar).subscribe(resul=>{
      this.listCuentas = resul.Results;
      this.lstTempCuentas = [...this.lstTempCuentas];
      this.listCuentas = [...this.listCuentas];
      this.lstTempCuentas = [...this.lstTempCuentas];
      this.page.count = resul.RowCount;
      console.log(this.listCuentas);
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
    () => {
      this.cargando = false
    })
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
  ListarDetalle(row)
  {
    console.log(row);
    let oDetalle : cuentaDetalle = row;
    console.log(oDetalle);
    this.oDetalleSelecionado = oDetalle;
    let ListarCuentaDtl = this._proveedor.ListarDetalle(oDetalle).subscribe(
      response => {
        this.ListarCuentaDtl = response
        console.log(this.ListarCuentaDtl);
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
   BuscarPagosProveedor(event) {
    this.data = "";
    //this.oComprasSeleccionado = undefined;
    this.ListarCuentaDtl = [];
    this.ListarCuentaDtl = [...this.ListarCuentaDtl];
    this.strBusqueda = event.target.value.toLowerCase();
    this.page.offset = 0;
    this.listCuentasxPagar();
  }
  setPage(pageInfo: { count?: number, pageSize?: number, limit?: number, offset?: number }) {
    this.page.offset = pageInfo.offset;
    this.oDetalleSelecionado = undefined;
    this.listCuentasxPagar();
    this.data = "";
    //this.oComprasSeleccionado = undefined;
    // this.lstComprasDtl = [];
    // this.lstComprasDtl = [...this.lstComprasDtl];
  }
  onSort(sortInfo: { sorts: { dir: string, prop: string }[], column: {}, prevValue: string, newValue: string })
  {
    this.page.orderDir = sortInfo.sorts[0].dir;
    this.page.orderBy = sortInfo.sorts[0].prop;
    this.oDetalleSelecionado = undefined;
    this.page.offset = 0;
    this.ListarDetalle
    this.listCuentasxPagar();
  }
  EliminarProveedor(){
    if(this.oDetalleSelecionado != undefined && this.oDetalleSelecionado != null){
      if(this.oDetalleSelecionado.EstadoDet == 2){
        this.deleteSwal.fire().then(resp =>{
          if(resp.value){
            let oDetalleS: cuentaDetalle = this.oDetalleSelecionado;
            this._proveedor.eliminar(oDetalleS).subscribe(exito =>{
              this.formSwal.title = "Éxito";
                this.formSwal.text = "Se ha eliminado correctamente.";
                this.formSwal.type = "success";
                this.formSwal.fire();
                this.listCuentasxPagar();
                this.ListarCuentaDtl = [];
                this.oDetalleSelecionado = undefined;
                this.ListarCuentaDtl = [...this.ListarCuentaDtl];
            },
            error =>{
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
      else
        this.ErrorPorTexto("El Pago Proveedor debe tener un estado de  ANULADO.")
    }
    else
       this.ErrorPorTexto("Debe Seleccionar un Documento de Pago");

  }

  ImprimirPagoProveedor(){
    if(this.oDetalleSelecionado != null && this.oDetalleSelecionado != undefined){
      this._proveedor.ObtenerPagarDet(this.oDetalleSelecionado).subscribe(resp=>{
        let oDetalleGuia: ResDetalle = resp;
        const lst = oDetalleGuia.ListaDetalle
        console.log(oDetalleGuia);
        console.log(lst);

        oDetalleGuia.ListaDetalle = [...lst]
        //CONSTRUCCIÓN DE REPORTE PDF
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setProperties({
          title: this.oDetalleSelecionado.Documento
        });
        doc.setFont('Cambria')
        doc.setFontSize(8)
        doc.setFontSize(14)
        doc.setFontStyle('bold')

        doc.text('PAGO PROVEEDORES', doc.internal.pageSize.width/2, 50, null, null, 'center');
        doc.setFontSize(8)
        doc.text('(EGRESO POR PAGO PROVEEDORES)', doc.internal.pageSize.width/2, 60, null, null, 'center');

        doc.setFontSize(9)
        //-----------1era FILA
        doc.setFontStyle('normal')
        doc.text("F. Emisión:", 25, 80)
        doc.setFontStyle('bold')
        let pipe = new DatePipe('en-US');
        let fec = pipe.transform(oDetalleGuia.FecRegistro, 'dd/MM/yyyy');
        let lengthFecEmision = Math.round(doc.getTextWidth('F. Emisión:'));
        doc.text(fec, lengthFecEmision + 30, 80)

        doc.setFontStyle('normal')
        doc.text("Operacion:", 400, 80)
        doc.setFontStyle('bold')
        let lengthDocumento = Math.round(doc.getTextWidth('Operacion:'));
        doc.text(oDetalleGuia.operacion, lengthDocumento + 405, 80)
        //-----------2da FILA
        doc.setFontStyle('normal')
        doc.text("Banco:", 25, 95)
        doc.setFontStyle('bold')
        let lengthNro = Math.round(doc.getTextWidth('Banco:'));
        doc.text(oDetalleGuia.CodBanco, lengthNro + 30, 95)

        doc.setFontStyle('normal')
        doc.setFontStyle('bold')
        let lengtdescripcion = Math.round(doc.getTextWidth('Banco:'));
        doc.text(oDetalleGuia.DescBanco, lengtdescripcion + 70, 95);

        doc.setFontStyle('normal')
        doc.text("ORIGINAL", 400, 95)
        doc.setFontStyle('bold')
        //-----------3era FILA
        doc.setFontStyle('normal')
        doc.text("Cajera:", 25, 110)
        doc.setFontStyle('bold')
        let lengthCajera = Math.round(doc.getTextWidth('Cajera:'));
        doc.text(oDetalleGuia.DescCajero, lengthCajera + 30, 110)

        doc.setFontStyle('normal')
        doc.text("T/C:", 250, 110)
        doc.setFontStyle('bold')
        let lengthTC = Math.round(doc.getTextWidth('Cajera:'));
        doc.text(oDetalleGuia.ValorTC.toString(), lengthTC + 255, 110)

        doc.setFontStyle('normal')
        doc.text("Moneda:", 320, 110)
        doc.setFontStyle('bold')
        let lengthMoneda = Math.round(doc.getTextWidth('Moneda:'));
        doc.text(oDetalleGuia.DescMoneda, lengthMoneda + 325, 110)
        //-----------4ta FILA
        doc.setFontStyle('normal')
        doc.text("Total:", 25, 125)
        doc.setFontStyle('bold')
        let lengthTotal = Math.round(doc.getTextWidth('Total:'));
        doc.text(oDetalleGuia.TotalDoc.toString(), lengthTotal + 30, 125)
        //-----------5ta FILA
        doc.setFontStyle('normal')
        doc.text("Comentario:", 25, 140)
        doc.setFontStyle('bold')
        let lengthComentario = Math.round(doc.getTextWidth('Comentario:'));
        if(oDetalleGuia.comentarioDet != null)
        doc.text(oDetalleGuia.comentarioDet.toString(), lengthComentario + 30, 140)

        //----------------------------CABEZERA
        doc.autoTable({
          startY: 170,
          head: this.CabeceraPagoProveedor(),
          body: this.CuerpoPagoProveedor(oDetalleGuia.ListaDetalle),
          styles: {
            //fillColor: [0, 0, 0],
            fontSize: 8,
            halign: 'center',
            tableWidth: 'auto'
          },
          headStyles: {
            fillColor: [0, 0, 0]
          },
          margin : {  top : 65  },
          columnStyles: {
            0: {cellWidth: 30},
          },
          pageBreak: 'avoid',
          rowPageBreak: 'avoid',
          showHead: 'everyPage'
      })
      doc.setFontSize(10)
      doc.setFontStyle('bold');
      doc.text("Total:", 400, doc.previousAutoTable.finalY + 15)
      let lengthTotaDoc = Math.round(doc.getTextWidth('Total:'));
      doc.text(oDetalleGuia.TotalDoc.toFixed(2).toString(),  500, doc.previousAutoTable.finalY + 15, null, null, 'right');
      doc.text(this.SumaE.toFixed(2).toString(),  550, doc.previousAutoTable.finalY + 15, null, null, 'right');

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
        //---------------------------------------------ABRIR DOCUMENTO
        window.open(doc.output('bloburl'), '_blank');
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
      });
    }
    else
       this.ErrorPorTexto("Debe Seleccionar un Documento de Pago Para poder Imprimir");
  }

  CabeceraPagoProveedor() {
    let oComprasDtl = {
      NumItem: "Item",
      CodProveedor: "CodProveedor",
      NomProveedor: "NomProveedor",
      Documento: "Documento",
      Moneda: "Moneda",
      TotalMN: "TotalMN",
      TotalIME: "TotalIME"
    }
    return [oComprasDtl];
  }

  CuerpoPagoProveedor(lstPagoPro: listaD[]) {
    var lstPagoProveedorDtl = [];
    var SumaMNI = 0;

    lstPagoPro.forEach(i => {
      const MNI:number = i.TotalDet / i.ValorTC;
      this.SumaE = SumaMNI += MNI;
      let olistaD = {
        NumItem: i.NumItem,
        CodProveedor: i.CodProveedor,
        NomProveedor: i.nomProveedor,
        Documento:i.NumeroDoc,
        Moneda: i.DescMoneda,
        TotalMN: i.TotalDet,
        TotalIME : MNI.toFixed(2)
      }
      lstPagoProveedorDtl.push(olistaD);
    });
    return lstPagoProveedorDtl;
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
}
