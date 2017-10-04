import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import { Injectable, NgZone } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Database } from '@ngrx/db';
import { Observable } from 'rxjs/Observable';
import { defer } from 'rxjs/observable/defer';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';


import { of } from 'rxjs/observable/of';
import { CountriesService } from "../../core/services/index";

import { CountryAction } from '../actions/index';
import { Country, User } from '../models/country';
import { IAppState, getSelectedCountry } from '../../ngrx/index';

@Injectable()
export class CountryEffects {
  /**
   * This effect does not yield any actions back to the store. Set
   * `dispatch` to false to hint to @ngrx/effects that it should
   * ignore any elements of this effect stream.
   *
   * The `defer` observable accepts an observable factory function
   * that is called when the observable is subscribed to.
   * Wrapping the database open call in `defer` makes
   * effect easier to test.
   */
  

  @Effect()
  addUserToCountry$: Observable<Action> = this.actions$
    .ofType(CountryAction.ActionTypes.ADD_USER)
    .map((action: CountryAction.AddUserAction) => action.payload)
    .mergeMap(user => 
      this.countriesService
        .addUser(user))
        .map((country) => new CountryAction.AddUserSuccessAction(country))
        .catch((country) => of(new CountryAction.AddUserFailAction(country))
        
    );

  @Effect()
  removeUserFromCountry$: Observable<Action> = this.actions$
    .ofType(CountryAction.ActionTypes.REMOVE_USER)
    .map((action: CountryAction.RemoveUserAction) => action.payload)
    .mergeMap(user => 
      this.countriesService
        .removeUser(user))
        .map((country) => new CountryAction.RemoveUserSuccessAction(country))
        .catch((country) => of(new CountryAction.RemoveUserFailAction(country))
    );

  @Effect({ dispatch: false }) addUserSuccess$ = this.actions$
    .ofType(CountryAction.ActionTypes.ADD_USER_SUCCESS)
    .do(() =>this.router.navigate(['/countries']));

  @Effect({ dispatch: false }) removeUserSuccess$ = this.actions$
    .ofType(CountryAction.ActionTypes.REMOVE_USER_SUCCESS)
    .do(() =>this.router.navigate(['/countries']));

  constructor(
    private actions$: Actions, 
    private store: Store<IAppState>, 
    private countriesService: CountriesService,
    private router: Router) {
    
    
  }
}
