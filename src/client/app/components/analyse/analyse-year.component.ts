import { Observable } from 'rxjs/Observable';
import { Component, OnInit, AfterContentChecked, Output, Input, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Platform } from '../../modules/datas/models/index';

@Component({
  selector: 'bc-analyse-year',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [formGroup]="form"> 
      <h2>{{ 'SELECT_YEARS' | translate }}</h2>
      <mat-checkbox (change)="checkAll($event)">
          {{ 'CHECK_ALL' | translate }}
        </mat-checkbox>
      <div  class="years">
        <div *ngFor="let year of years$ | async; let i=index">
          <bc-year [group]="form.controls.years.controls[i]" [year]="year" (yearEmitter)="changeValue($event)"></bc-year>
        </div>
      </div>
    </div>
  `,

  styles: [
    `
    .years {
      margin-top:10px;
      margin-bottom:10px;
      padding:5px;
      border: 1px solid grey;
    }
    `]
})
export class AnalyseYearComponent implements OnInit {
  @Input() years$: Observable<string[]>;
  defaultYears: string[] = [];
  checkedYears: string[] = [];
  @Output() yearEmitter = new EventEmitter<string[]>();
  @Input('group') public form: FormGroup;

  constructor(private _fb: FormBuilder) {

  }

  ngOnInit() {
    this.initYears();
  }

  newYear(y: string) {
    return this._fb.group({
      year: new FormControl(this.checkedYears.filter(year => year === y).length > 0)
    });
  }

  initYears() {
    this.years$
      .filter(years => years !== null)
      .subscribe(years => {
        this.defaultYears=[];
        this.form.controls['years'] = this._fb.array([]);
        for (let year of years) {
          this.defaultYears.push(year);
          const control = <FormArray>this.form.controls['years'];
          control.push(this.newYear(year));
        }
      })
  }

  changeValue(yearCheck: any) {
    console.log(yearCheck);
    this.checkedYears=[...this.checkedYears.filter(y => y!==yearCheck.year)];
    if(yearCheck.checked){
      this.checkedYears.push(yearCheck.year);
    }
    this.yearEmitter.emit(this.checkedYears);
  }

  checkAll(ev) {
    const control = <FormArray>this.form.controls['years'];
    control.value.forEach(x => x.year = ev.checked)
    control.setValue(control.value);
    this.checkedYears=(ev.checked)?this.defaultYears:[];
    this.yearEmitter.emit(this.checkedYears);
  }

}