import 'rxjs/add/operator/let';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { RouterExtensions, Config } from '../../modules/core/index';
import { PouchDBService } from "../../modules/core/services/pouchdb.service";

import { IAppState, getCountries } from '../../modules/ngrx/index';
import { CountriesAction } from '../../modules/countries/actions/index';
import { Country } from '../../modules/countries/models/country';

@Component({
  selector: 'bc-countries-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <md-card>
      <md-card-title>Countries in BDMER</md-card-title>
    </md-card>

    <bc-country-preview-list [countries]="countries$ | async"></bc-country-preview-list>
    
  `,
  /**
   * Container components are permitted to have just enough styles
   * to bring the view together. If the number of styles grow,
   * consider breaking them out into presentational
   * components.
   */
  styles: [
    `
    md-card-title {
      display: flex;
      justify-content: center;
    }
  `,
  ],
})
export class CountryPageComponent implements OnInit {
  countries$: Observable<Country[]>;

  constructor(private store: Store<IAppState>, public routerext: RouterExtensions) {}

  ngOnInit() {    
    this.countries$ = this.store.let(getCountries);
    this.store.dispatch(new CountriesAction.LoadAction());    
  }
}
