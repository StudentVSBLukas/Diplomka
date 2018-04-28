import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import {HttpClientModule, HttpClient} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { NumbersConvertorDirective } from './convertor/numbersconvertor.directive';
import { DialogAlgoritmusComponent } from './dialog-algoritmus/dialog-algoritmus.component';
import { DialogOmezeniComponent } from './dialog-omezeni/dialog-omezeni.component';
import { GrafComponent } from './graf/graf.component';
import { LokalizaceComponentComponent } from './lokalizace-component/lokalizace-component.component';
import { PromennaService } from './promenna.service';
import { PromennePanelComponent } from './promenne-panel/promenne-panel.component';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DialogImportComponent } from './dialog-import/dialog-import.component';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    NumbersConvertorDirective,
    LokalizaceComponentComponent,
    DialogOmezeniComponent,
    PromennePanelComponent,
    DialogAlgoritmusComponent,
    GrafComponent,
    DialogImportComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    MultiSelectModule,
    FileUploadModule,
    TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
  ],
  providers: [PromennaService],
  bootstrap: [AppComponent]
})
export class AppModule { }