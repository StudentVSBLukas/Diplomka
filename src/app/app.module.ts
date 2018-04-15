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
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { OmezeniPromenneComponent } from './omezeni-promenne/omezeni-promenne.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    AlgoritmComponent,
    BackjumpingComponent,
    PromennaComponent,
    NumbersConvertorDirective,
    OmezeniPromenneComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpModule,
    DropdownModule,
    MultiSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
