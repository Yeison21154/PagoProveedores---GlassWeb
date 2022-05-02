import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GlassWebRoutingModule, routingComponents } from './glass-web-routing.module';
import { GlassWebComponent } from './glass-web.component';
import { MenuComponent } from './menu/menu.component';
import { MenuHeaderComponent } from './menu-header/menu-header.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomDatepickerI18n, I18n } from '../others/NgbDatePickerES';
import { ComprasListadoComponent } from './compras/compras-listado/compras-listado.component';
import { ComprasMantenimientoComponent } from './compras/compras-mantenimiento/compras-mantenimiento.component';
import { HomeComponent } from './home/home/home.component';
import { CobranzaListadoComponent } from './cobranza/cobranza-listado/cobranza-listado.component';
import { CobranzaMantenimientoComponent } from './cobranza/cobranza-mantenimiento/cobranza-mantenimiento.component';
import { PermisosDirective } from '../directives/permisos.directive';
import { TransferenciaMantenimientoComponent } from './transferencia/transferencia-mantenimiento/transferencia-mantenimiento.component';
import { TransferenciaListadoComponent } from './transferencia/transferencia-listado/transferencia-listado.component';
import { ProveedorListadoComponent } from './proveedores/proveedor-listado/proveedor-listado.component';
import { ProveedorMantenimientoComponent } from './proveedores/proveedor-mantenimiento/proveedor-mantenimiento.component';

@NgModule({
  declarations: [
    GlassWebComponent,
    routingComponents,
    MenuComponent,
    MenuHeaderComponent,
    ComprasListadoComponent,
    ComprasMantenimientoComponent,
    HomeComponent,
    CobranzaListadoComponent,
    CobranzaMantenimientoComponent,
    PermisosDirective,
    TransferenciaMantenimientoComponent,
    TransferenciaListadoComponent,
    ProveedorListadoComponent,
    ProveedorMantenimientoComponent,
  ],
  imports: [
    CommonModule,
    GlassWebRoutingModule,
    NgxDatatableModule,
    HttpClientModule,
    NgbModule,
    SweetAlert2Module.forRoot(),
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [CustomDatepickerI18n, I18n],
  bootstrap: [GlassWebComponent]
})
export class GlassWebModule { }
