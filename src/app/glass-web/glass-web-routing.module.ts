import { ProveedorListadoComponent } from './proveedores/proveedor-listado/proveedor-listado.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GlassWebComponent } from './glass-web.component';
import { ComprasMantenimientoComponent } from './compras/compras-mantenimiento/compras-mantenimiento.component';
import { ComprasListadoComponent } from './compras/compras-listado/compras-listado.component';
import { HomeComponent } from './home/home/home.component'
import { CobranzaMantenimientoComponent } from './cobranza/cobranza-mantenimiento/cobranza-mantenimiento.component';
import { CobranzaListadoComponent } from './cobranza/cobranza-listado/cobranza-listado.component';
import { TransferenciaListadoComponent } from './transferencia/transferencia-listado/transferencia-listado.component';
import { TransferenciaMantenimientoComponent } from './transferencia/transferencia-mantenimiento/transferencia-mantenimiento.component';
import { ProveedorMantenimientoComponent } from './proveedores/proveedor-mantenimiento/proveedor-mantenimiento.component';

const routes: Routes = [
  { path: '', component: GlassWebComponent, children: [
    { path: 'compras', children: [
      { path: '', component: ComprasListadoComponent, pathMatch: 'full'},
      { path: 'crear', component: ComprasMantenimientoComponent},
      { path: 'obtener/:codDoc/:nroDoc/:codProv', component: ComprasMantenimientoComponent},
    ]},
    {path:'proveedor', children:[
      {path:'', component:ProveedorListadoComponent, pathMatch:'full'},
      {path:'crear', component:ProveedorMantenimientoComponent,data:{title:"Pago Proveedores"}},
      {path: 'obtener/:codDoc', component: ProveedorMantenimientoComponent},
    ]},
    { path: 'cobranzas', children: [
      { path: '', component: CobranzaListadoComponent, pathMatch: 'full'},
      { path: 'crear', component: CobranzaMantenimientoComponent},
      { path: 'obtener/:codDoc/:nroDoc', component: CobranzaMantenimientoComponent},
    ]},
    { path: 'transferencia-banco', children: [
      { path: '', component: TransferenciaListadoComponent, pathMatch: 'full'},
      { path: 'crear', component: TransferenciaMantenimientoComponent},
      { path: 'obtener/:codDoc/:nroDoc', component: TransferenciaMantenimientoComponent},
    ]},
    { path: 'seleccion-sucursal', component: HomeComponent},
    { path: '', component: HomeComponent, pathMatch: 'full'},
    { path: '**', redirectTo: "['/login']"}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GlassWebRoutingModule { }
export const routingComponents = [ComprasMantenimientoComponent]
