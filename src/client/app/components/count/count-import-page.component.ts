import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subscription, pipe } from "rxjs";
import { map, catchError, first } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";

import { RouterExtensions, Config } from "../../modules/core/index";
import { Platform, Zone, Survey } from "../../modules/datas/models/index";
import { Country } from "../../modules/countries/models/country";

import {
  IAppState,
  getPlatformPageError,
  getAllCountriesInApp,
  getSelectedPlatform,
  getPlatformPageMsg,
  getSelectedZone,
  getSelectedSurvey,
  getPlatformImpErrors,
  getCountryCountList
} from "../../modules/ngrx/index";
import { PlatformAction } from "../../modules/datas/actions/index";
import { CountriesAction } from "../../modules/countries/actions/index";

@Component({
  selector: "bc-count-import-page",
  template: `
    <bc-count-import
      (upload)="handleUpload($event)"
      (err)="handleErrorUpload($event)"
      (back)="return($event)"
      [error]="error$ | async"
      [msg]="msg$ | async"
      [platform]="platform$ | async"
      [survey]="survey$ | async"
      [countries]="countries$ | async"
      [countriesCount]="countriesCount$ | async"
      [importError]="importError$ | async">
    </bc-count-import>
  `,
  styles: [``]
})
export class CountImportPageComponent implements OnInit, OnDestroy {
  platform$: Observable<Platform>;
  survey$: Observable<Survey>;
  error$: Observable<string | null>;
  msg$: Observable<string | null>;
  importError$: Observable<string | null>;
  countries$: Observable<Country[]>;
  countriesCount$: Observable<String[]>;

  platformSubscription: Subscription;
  surveySubscription: Subscription;
  needHelp: boolean = false;
  private csvFile: string;
  private docs_repo: string;

  constructor(private store: Store<IAppState>, public routerext: RouterExtensions, route: ActivatedRoute) {
    this.platformSubscription = route.params.pipe(map(params => new PlatformAction.SelectPlatformAction(params.idPlatform))).subscribe(store);
    this.surveySubscription = route.params.pipe(map(params => new PlatformAction.SelectSurveyAction(params.idSurvey))).subscribe(store);
  }

  ngOnInit() {
    this.error$ = this.store.select(getPlatformPageError);
    this.msg$ = this.store.select(getPlatformPageMsg);
    this.platform$ = this.store.select(getSelectedPlatform);
    this.survey$ = this.store.select(getSelectedSurvey);
    this.importError$ = this.store.select(getPlatformImpErrors);
    this.countries$ = this.store.select(getAllCountriesInApp);
    this.countriesCount$ = this.store.select(getCountryCountList);
  }

  ngOnDestroy() {
    this.platformSubscription.unsubscribe();
    this.surveySubscription.unsubscribe();
  }

  handleUpload(csvFile: any): void {
    this.store.dispatch(new PlatformAction.ImportCountAction(csvFile));
  }

  handleErrorUpload(msg: string) {
    this.store.dispatch(new PlatformAction.AddPlatformFailAction(msg));
  }

  return(event) {
    this.routerext.navigate(["/platform/"], {
      transition: {
        duration: 1000,
        name: "slideTop"
      }
    });
  }
}
