import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, FactoryProvider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule, MatCardModule, MatInputModule, MatListModule, MatSelectModule, MatOptionModule, MatRadioModule, MatChipsModule, MatDatepickerModule, 
  MatNativeDateModule, MatCheckboxModule, MatExpansionModule,MatStepperModule,MatTabsModule, MatSidenavModule, MatFormFieldModule, MatPaginatorModule } from '@angular/material';
import { Angular2FontawesomeModule } from 'angular2-fontawesome';
import { MomentModule } from 'angular2-moment';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
//import * as more from 'highcharts/highcharts-more.src';
//import * as exporting from 'highcharts/modules/exporting.src';
// modules
import { SHARED_COMPONENTS } from './components/index';

@NgModule({
  imports: [
    MatFormFieldModule,
  ],
  exports: [
    MatAutocompleteModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatTabsModule,
    MatPaginatorModule
  ]
})
export class MaterialModule { }

const SHARED_MODULES: any[] = [
  CommonModule,
  RouterModule,
  BrowserModule,
  HttpClientModule,
  FormsModule,
  ReactiveFormsModule,
  MatNativeDateModule,
  BrowserAnimationsModule,
  Angular2FontawesomeModule,
  MomentModule,
  NgxMapboxGLModule,
  ChartModule
];

/**
 * SharedModule
 * Only for shared components, directives and pipes
 * Do not specify providers here
 * https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#what-kinds-of-modules-should-i-have-and-how-should-i-use-them-
 */

@NgModule({
  imports: [
    ...SHARED_MODULES,     
  ],
  declarations: [
    ...SHARED_COMPONENTS
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA,
  ],
  exports: [
    ...SHARED_MODULES,
    MaterialModule,
    ...SHARED_COMPONENTS,
  ],
  providers: [
    //{provide: HIGHCHARTS_MODULES, useFactory: () => [ more, exporting ]}
  ]
})
export class SharedModule {}