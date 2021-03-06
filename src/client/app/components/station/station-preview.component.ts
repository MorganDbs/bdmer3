import { Component, Input, OnInit } from "@angular/core";
import { Platform, Zone, Station } from "./../../modules/datas/models/platform";

@Component({
  selector: "bc-station-preview",
  template: `
    <a [routerLink]="['/station', codePlatform, code]">
      <mat-card>
        <mat-card-title-group>
          <mat-card-title>{{ code }}</mat-card-title>
          <mat-card-subtitle><span *ngIf="codePlatform">{{ codePlatform }}</span></mat-card-subtitle>
        </mat-card-title-group>
        <mat-card-content>
          {{ coord }}
        </mat-card-content>
        <mat-card-content>
          <h5 mat-subheader>{{ 'STATS' | translate }}</h5>
          <div>{{nCounts}} {{'COUNTS' | translate}}</div>
       </mat-card-content>
      </mat-card>
    </a>
  `,
  styles: [
    `
      mat-card {
        width: 400px;
        height: 300px;
        margin: 15px;
      }
      @media only screen and (max-width: 768px) {
        mat-card {
          margin: 15px 0 !important;
        }
      }
      mat-card:hover {
        box-shadow: 3px 3px 16px -2px rgba(0, 0, 0, 0.5);
      }
      mat-card-title {
        margin-right: 10px;
      }
      mat-card-title-group {
        margin: 0;
      }
      a {
        color: inherit;
        text-decoration: none;
      }
      img {
        width: auto !important;
        margin-left: 5px;
      }
      mat-card-content {
        margin-top: 15px;
        margin: 15px 0 0;
      }
      mat-list-item {
        max-height: 20px !important;
      }
    `
  ]
})
export class StationPreviewComponent implements OnInit {
  @Input() station: Station;
  @Input() platform: Platform;
  nCounts: number = 0;
  

  ngOnInit(){
    this.nCounts = (<any>this.platform).surveys.flatMap(s => s.counts.filter(c => c.codeStation === this.station.properties.code)).length;
  }

  get id() {
    return this.station.properties.code;
  }

  get code() {
    return this.station.properties.code;
  }

  get codePlatform() {
    return this.platform.code;
  }

  get coord() {
    return this.station.geometry.coordinates;
  }

  // get latitude() {
  //   return this.station.latitude;
  // }

  // get longitude() {
  //   return this.station.longitude;
  // }

  get thumbnail(): string | boolean {
    // WAIT FOR MAP GENERATION
    return null;
    //return "/assets/img/"+this.station.code+".jpg";
  }
}
