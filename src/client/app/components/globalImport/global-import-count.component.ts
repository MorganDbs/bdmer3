import { Component, OnInit, AfterContentChecked, Output, Input, ChangeDetectionStrategy, EventEmitter, OnDestroy, OnChanges } from "@angular/core";
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from "@angular/forms";
import { Observable, from, Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { Count, Platform } from "../../modules/datas/models/index";
import { Csv2JsonService } from "../../modules/core/services/csv2json.service";
import { Country } from "../../modules/countries/models/country";

@Component({
  selector: "bc-global-import-count",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div [formGroup]="form">
    <mat-card class="no-box-shadow">
      <mat-card-title-group>
        <mat-card-title>{{'IMPORT_CSV' | translate }} Counts</mat-card-title>
        <fa mat-card-sm-image [name]="'upload'" [border]=true [size]=2></fa>
      </mat-card-title-group>
      <mat-card-content>{{'IMPORT_DESC' | translate }}</mat-card-content>
      <mat-card-content class="warn">{{'IMPORT_DESC_DATE' | translate }}</mat-card-content>
      <mat-card-footer class="footer">
        <h5 mat-subheader>{{ 'DOWNLOAD_CSV_COUNTS' | translate }}</h5>
        <a href="{{ getCsvUrlType1() }}" title="{{'CSV_COUNT_TYPE1' | translate}}" download>
          <fa [name]="'download'" [border]=true [size]=1></fa>
        </a>
        <a href="{{ getCsvUrlType2() }}" title="{{'CSV_COUNT_TYPE2' | translate}}" download>
          <fa [name]="'download'" [border]=true [size]=1></fa>
        </a>
      </mat-card-footer>
      <mat-card-actions align="start">
        <button (click)="fileInputCount.click(); clearInput()">
          <span>{{ 'IMPORT_CSV' | translate }}</span>
          <input #fileInputCount type="file" (change)="handleUploadCsv($event)" formControlName="countInputFile" style="display:none;"  accept=".csv"/>
        </button>
        <button class="btn-danger" *ngIf="csvFileCount" (click)="deleteCsv('count')">
          <span>{{ 'DELETE_CSV' | translate }}</span>
        </button>
        <div *ngIf="csvFileCount">{{csvFileCount.name}} {{ 'SELECTED_CSV' | translate }}</div>
      </mat-card-actions>

      <mat-card-content class="error" *ngIf="(error$ | async)  !== null" align="center">{{ 'ERROR_CSV_FIELD' | translate }} {{ error$ | async }}</mat-card-content>
      <mat-card-content class="msg" *ngIf="(importError$ | async)?.length === 0 && csvFileCount !== null && (error$ | async) === null" align="start">{{ 'VALID_DATA' | translate }}</mat-card-content>

      <mat-card-actions align="start" *ngIf="(importError$ | async)?.length > 0">
        <h2 class="errorList">{{'LIST_ERROR_COUNT' | translate}}</h2>
        <mat-list>
          <div *ngFor="let count of (importError$ | async)">
            <mat-list-item class="errorList">{{count}}</mat-list-item>
          </div>
        </mat-list>
      </mat-card-actions>
      <bc-count-global-import-map [error]="error$ | async" [importError]="importError$ | async" [platform]="platform" [countries]="countries" [newCounts]="newCounts$ | async"></bc-count-global-import-map>
    </mat-card>
  </div>
  `
})
export class GlobalImportCountComponent implements OnInit, OnChanges, OnDestroy {
  @Input("group") public form: FormGroup;
  @Input() importError$: Observable<string[]>;
  @Input() error$: Observable<string | null>;
  @Input() countries: Country[];
  @Input() platform: Platform;
  @Input() docs_repo: string;
  @Input() locale: string;
  @Input() csvFileCount: object = null;
  @Input() viewCount: boolean;
  @Output() countFileEmitter = new EventEmitter<{ file: any; action: string }>();
  @Output() stayHereEmitter = new EventEmitter<string>();

  newCounts$: Observable<{}>;
  view: boolean = false;
  hasErr: boolean;
  hasIErr: boolean;
  hasErrSub: Subscription;
  hasIErrSub: Subscription;

  constructor(private translate: TranslateService, private csv2JsonService: Csv2JsonService) {}

  ngOnInit() {
    this.hasErrSub = this.error$.subscribe(err => {
      this.hasErr = err !== null;
    });
    this.hasIErrSub = this.importError$.subscribe(ie => {
      this.hasIErr = ie.length > 0;
    });
  }

  ngOnChanges() {
    if (!this.viewCount && this.view) {
      if (this.csvFileCount !== null && (this.hasErr || this.hasIErr)) {
        this.deleteCsv();
      }
    }
    this.view = this.viewCount;
  }

  clearInput() {
    this.form.get("countInputFile").reset();
  }

  handleUploadCsv(csvFile: any) {
    if (csvFile.target.files && csvFile.target.files.length > 0) {
      this.csvFileCount = csvFile.target.files[0];
      this.countFileEmitter.emit({ file: this.csvFileCount, action: "check" });
      this.newCounts$ = from(this.csv2JsonService.csv2('count',this.csvFileCount));
    }
  }

  getCsvUrlType1() {
      return this.docs_repo = "importCountNoMesures-" + this.locale + ".csv";
    }

  getCsvUrlType2() {
      return this.docs_repo = "importCount-" + this.locale + ".csv";
  }

  ngOnDestroy() {
    this.hasErrSub.unsubscribe();
    this.hasIErrSub.unsubscribe();
  }

  deleteCsv() {
    let msg = this.translate.instant("DELETE_COUNT_CONFIRM");

    let confirmRm = confirm(msg);
    if (confirmRm) {
      this.countFileEmitter.emit({ file: null, action: "delete" });
      this.form.get("countInputFile").reset();
    } else {
      this.stayHereEmitter.emit("count");
    }
  }
}
