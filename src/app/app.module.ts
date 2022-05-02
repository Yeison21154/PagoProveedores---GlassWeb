import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomDatepickerI18n, I18n } from './others/NgbDatePickerES';
import { LoginComponent } from './login/login/login.component';
import { NotFoundComponent } from './login/not-found/not-found.component';
import { RestriccionGuard } from './restriccion.guard';

import { ApiService } from '../app/services/api.service';

// import { PermisosDirective } from './directives/permisos.directive';


@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    NotFoundComponent,
    LoginComponent,
    // PermisosDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxDatatableModule,
    HttpClientModule,
    NgbModule,
    SweetAlert2Module.forRoot(),
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [CustomDatepickerI18n, I18n, RestriccionGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
