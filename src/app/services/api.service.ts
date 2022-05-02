import { Injectable, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private config: any;

  constructor(private http: HttpClient) {
  }

  //api_url: string = 'http://190.187.38.243:8061/GlassWebApi/api'

  api_url: string = environment.api_url;
  /*
  api_url: string = this.apiUrlGet();

   apiUrlGet(){
    console.log('api_url:');
    console.log(this.api_url);

      this.http.get('./assets/config.json')
        .toPromise()
        .then(data => {

          console.log(data);
          this.config = data;

          console.log("this.config:");
          console.log(this.config);

          this.api_url = this.config.apiUrl;
          console.log('this.api_url:');
          console.log(this.api_url);
      });

      return this.api_url;
  }
  */

  //api_url2: string = this.apiUrlGet();


  //console.log('this.api_url2:');
  //console.log(this.api_url2);

  // api_url: string = 'https://localhost:44305/api/'

  // api_url: string = 'http://localhost/GlassWebApi/api/'



}
