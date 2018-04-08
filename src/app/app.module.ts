import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { AlgoritmComponent } from './algoritm/algoritm.component';
import { BackjumpingComponent } from './backjumping/backjumping.component';
import { NumbersConvertorDirective } from './convertor/numbersconvertor.directive';
import { PromennaComponent } from './promenna/promenna.component';
import { FormsModule } from '@angular/forms';
import {KeyFilterModule} from 'primeng/keyfilter';


@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    AlgoritmComponent,
    BackjumpingComponent,
    PromennaComponent,
    NumbersConvertorDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpModule,
    KeyFilterModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
