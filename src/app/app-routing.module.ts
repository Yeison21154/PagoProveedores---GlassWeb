import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { PersonaComponent } from './components/persona/persona.component';
// import { ComprasComponent } from './components/compras/compras.component';
// import { NotFoundComponent } from './components/not-found/not-found.component';
// import { CondicionPagoMantenimientoComponent } from './components/condicion-pago/condicion-pago-mantenimiento/condicion-pago-mantenimiento.component';
// import { CondicionPagoListadoComponent } from './components/condicion-pago/condicion-pago-listado/condicion-pago-listado.component';
// import { HomeComponent } from './components/home/home.component';

// import { GlassComponent } from './components/glass/glass.component';
import { LoginComponent } from './login/login/login.component';
import { NotFoundComponent } from './login/not-found/not-found.component';
import { RestriccionGuard } from './restriccion.guard';

const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full'},
  { path: 'login', component: LoginComponent},
  { path: 'GlassWeb', canActivateChild: [RestriccionGuard],
  // loadChildren: () => import(`./glass-web/glass-web.module`).then(m => m.GlassWebModule) },
  loadChildren: './glass-web/glass-web.module#GlassWebModule' },
  // { path: 'GlassWeb', component: GlassComponent, outlet: 'login', children: [
  //   { path: 'compras', component: ComprasComponent, outlet: 'glass'},
  //   { path: 'condicion-pago/mantenimiento', component: CondicionPagoMantenimientoComponent, outlet: 'glass'},
  //   { path: 'condicion-pago', component: CondicionPagoListadoComponent, outlet: 'glass'},
  //   { path: 'persona', component: PersonaComponent, outlet: 'glass'},
  // ]},
  { path: 'not-found', component: NotFoundComponent},
  { path: '**', redirectTo: 'not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ /*enableTracing*/useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [NotFoundComponent]