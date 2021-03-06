import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Csv2JsonService } from "../../modules/core/services/csv2json.service";
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from "@angular/forms";

import { RouterExtensions, Config } from "../../modules/core/index";
import { Platform, Zone, Station } from "../../modules/datas/models/index";
import { Country } from "../../modules/countries/models/country";

import { IAppState, getPlatformPageError, getSelectedPlatform, getPlatformPageMsg, getLangues } from "../../modules/ngrx/index";
import { PlatformAction } from "../../modules/datas/actions/index";
import { CountriesAction } from "../../modules/countries/actions/index";

@Component({
  moduleId: module.id,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "bc-station-import",
  templateUrl: "./station-import.component.html",
  styleUrls: ["./station-import.component.css"]
})
export class StationImportComponent implements OnDestroy {
  @Input() platform: Platform;
  @Input() countries: Country[];
  @Input() msg: string | null;
  @Input() error: string | null;
  @Input() importError: string[];
  @Output() upload = new EventEmitter<any>();
  @Output() err = new EventEmitter<string>();
  @Output() back = new EventEmitter();
  actionSubscription: Subscription;

  newStationInvalid: boolean = null;
  newStations$: Observable<Station[]>;
  needHelp: boolean = false;
  private csvFile: string;
  private docs_repo: string;
  private importCsvFile = null;

  stationForm: FormGroup = new FormGroup({
    stationInputFile: new FormControl()
  });

  constructor(
    private translate: TranslateService,
    private csv2JsonService: Csv2JsonService,
    private store: Store<IAppState>,
    public routerext: RouterExtensions,
    route: ActivatedRoute
  ) {
    this.actionSubscription = this.store.select(getLangues).subscribe((l: any) => {
      this.docs_repo = "../../../assets/files/";
      this.csvFile = "importStation-" + l + ".csv";
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }

  handleUpload(csvFile: any): void {
    let notFoundMsg = this.translate.instant("NO_CSV_FOUND");
    let reader = new FileReader();

    if (csvFile.target.files && csvFile.target.files.length > 0) {
      this.importCsvFile = csvFile.target.files[0];
      this.check(this.importCsvFile);
    } else {
      this.err.emit(notFoundMsg);
    }
  }

  check(csvFile) {
    this.newStationInvalid = false;
    this.store.dispatch(new PlatformAction.CheckStationCsvFile(csvFile));

    this.newStations$ = this.csv2JsonService.extractStationPreviewData(csvFile);
  }

  isStationsInvalid(event) {
    this.newStationInvalid = event;
  }

  send() {
    this.upload.emit(this.importCsvFile);
  }

  clearInput() {
    this.stationForm.get("stationInputFile").reset();
  }

  changeNeedHelp() {
    this.needHelp = !this.needHelp;
  }

  getCsvStations() {
    return this.csvFile;
  }

  getCsvStationsUrl() {
    return this.docs_repo + this.csvFile;
  }

  cancel() {
    this.back.emit();
  }
}
