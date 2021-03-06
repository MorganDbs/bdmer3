import { Injectable } from "@angular/core";
import { Action, Store } from "@ngrx/store";
import { Effect, Actions, ofType } from "@ngrx/effects";
import { Observable, defer, pipe, of } from "rxjs";
import { catchError, map, mergeMap, withLatestFrom, switchMap, tap, delay } from "rxjs/operators";
import { Router } from "@angular/router";

import { Csv2JsonService } from "../../core/services/csv2json.service";
import { SpeciesService } from "../services/species.service";
import { SpeciesAction } from "../actions/index";
import { Species } from "../models/species";
import { IAppState, getServiceUrl, getPrefixDatabase } from "../../ngrx/index";
import { AppInitAction } from "../../core/actions/index";

@Injectable()
export class SpeciesEffects {
  @Effect({ dispatch: false })
  openDB$: Observable<any> = this.actions$.ofType<AppInitAction.FinishAppInitAction>(AppInitAction.ActionTypes.FINISH_APP_INIT).pipe(
    withLatestFrom(this.store.select(getServiceUrl),this.store.select(getPrefixDatabase)),
    map(value => this.speciesService.initDB("species", value[1], value[2]))
  );

  @Effect()
  loadSpecies$: Observable<Action> = this.actions$.ofType<SpeciesAction.LoadAction>(SpeciesAction.ActionTypes.LOAD).pipe(
    switchMap(() => this.speciesService.getAll()),
    map((species: Species[]) => new SpeciesAction.LoadSuccessAction(species)),
    catchError(error => of(new SpeciesAction.LoadFailAction(error)))
  );

  @Effect()
  addSpeciesToList$: Observable<Action> = this.actions$.ofType<SpeciesAction.AddSpeciesAction>(SpeciesAction.ActionTypes.ADD_SPECIES).pipe(
    map((action: SpeciesAction.AddSpeciesAction) => action.payload),
    mergeMap(species => this.speciesService.editSpecies(species)),
    map((species: Species) => new SpeciesAction.AddSpeciesSuccessAction(species)),
    catchError(error => of(new SpeciesAction.AddSpeciesFailAction(error)))
  );

  @Effect()
  importSpeciesToList$: Observable<Action> = this.actions$.ofType<SpeciesAction.ImportSpeciesAction>(SpeciesAction.ActionTypes.IMPORT_SPECIES).pipe(
    map((action: SpeciesAction.ImportSpeciesAction) => action.payload),
    mergeMap(speciesCsv => this.csv2jsonService.csv2("species", speciesCsv)),
    mergeMap((species:Species[]) => this.speciesService.importSpecies(species)),
    map((species: Species[]) => new SpeciesAction.ImportSpeciesSuccessAction(species)),
    catchError(error => of(new SpeciesAction.AddSpeciesFailAction(error)))
  );

  @Effect()
  removeSpeciesFromList$: Observable<Action> = this.actions$.ofType<SpeciesAction.RemoveSpeciesAction>(SpeciesAction.ActionTypes.REMOVE_SPECIES).pipe(
    map((action: SpeciesAction.RemoveSpeciesAction) => action.payload),
    mergeMap(species => this.speciesService.removeSpecies(species)),
    map(species => new SpeciesAction.RemoveSpeciesSuccessAction(species)),
    catchError(species => of(new SpeciesAction.RemoveSpeciesFailAction(species)))
  );

  @Effect()
  checkSpeciesCsv$: Observable<Action> = this.actions$
    .ofType<SpeciesAction.CheckSpeciesCsvFile>(SpeciesAction.ActionTypes.CHECK_SPECIES_CSV_FILE)
    .pipe(
      tap(() => this.store.dispatch(new SpeciesAction.RemoveMsgAction())),
      map((action: SpeciesAction.CheckSpeciesCsvFile) => action.payload),
      mergeMap(speciesCsv => this.csv2jsonService.csv2("species", speciesCsv)),
      mergeMap(species => this.speciesService.checkSpecies(species)),
      map(error => new SpeciesAction.CheckSpeciesAddErrorAction(error))
    );

  @Effect()
  addSpeciesSuccess$ = this.actions$.ofType<SpeciesAction.AddSpeciesSuccessAction>(SpeciesAction.ActionTypes.ADD_SPECIES_SUCCESS).pipe(
    map((action: SpeciesAction.AddSpeciesSuccessAction) => action.payload),
    mergeMap(species => this.router.navigate(["/species/" + species._id])),
    delay(3000),
    map(() => new SpeciesAction.RemoveMsgAction())
  );

  @Effect()
  importSpeciesSuccess$ = this.actions$.ofType<SpeciesAction.ImportSpeciesSuccessAction>(SpeciesAction.ActionTypes.IMPORT_SPECIES_SUCCESS).pipe(
    map((action: SpeciesAction.ImportSpeciesSuccessAction) => action.payload),
    mergeMap(species => this.router.navigate(["/species"])),
    delay(3000),
    map(() => new SpeciesAction.RemoveMsgAction())
  );

  @Effect()
  removeSpeciesSuccess$ = this.actions$.ofType<SpeciesAction.RemoveSpeciesSuccessAction>(SpeciesAction.ActionTypes.REMOVE_SPECIES_SUCCESS).pipe(
    tap(() => this.router.navigate(["/species"])),
    delay(3000),
    map(() => new SpeciesAction.RemoveMsgAction())
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store<IAppState>,
    private speciesService: SpeciesService,
    private csv2jsonService: Csv2JsonService
  ) {}
}
