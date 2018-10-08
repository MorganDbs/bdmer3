import { Component, OnInit, ChangeDetectionStrategy, Input, Output, ViewChild, OnChanges, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LngLatBounds, LngLatLike, MapMouseEvent } from 'mapbox-gl';
import { Cluster, Supercluster } from 'supercluster';
import * as Turf from '@turf/turf';
import { MapService } from '../../modules/core/services/index';

import { IAppState } from '../../modules/ngrx/index';
import { Zone, Survey, Species, Station } from '../../modules/datas/models/index';
import { Results, Data } from '../../modules/analyse/models/index';

@Component({
  selector: 'bc-result-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="container">
    <div *ngIf="loading">Map is loading</div>
    <mgl-map *ngIf="!loading"
        [style]="'mapbox://styles/mapbox/satellite-v9'"
        [fitBounds]="bounds$ | async"
        [fitBoundsOptions]="{
          padding: boundsPadding,
          maxZoom: zoomMaxMap
        }"
        (zoomEnd)="zoomChange($event)">
        <ng-container *ngIf="showStations && (layerStations$ | async)">
          <mgl-geojson-source
            id="layerStations"
            [data]="layerStations$ | async">
            
            <mgl-layer
                *ngIf="(!showBiom) || (typeShow==='A')"
                id="stationId_abun"
                type="circle"
                source="layerStations"
                [paint]="{
                  'circle-color': {
                      property: 'abundancy',
                      type: 'interval',
                      stops: [
                      [0, '#FFEDA0'],
                      [1, '#FED976'],
                      [10, '#FEB24C'],
                      [20, '#FD8D3C'],
                      [30, '#FC4E2A'],
                      [40, '#E31A1C'],
                      [50, '#BD0026'],
                      [100, '#800026']
                      ]
                  },
                  'circle-radius': {
                      property: 'abundancy',
                      type: 'interval',
                      stops: [
                        [0, 2],
                        [1, 3],
                        [10, 4],
                        [20, 5],
                        [30, 6],
                        [40, 7],
                        [50, 8],
                        [100, 9]
                      ]
                  }
            }">
            </mgl-layer>
            <mgl-layer
                *ngIf="showBiom && typeShow==='B'"
                id="stationId_biom"
                type="circle"
                source="layerStations"
                [paint]="{
                  'circle-color': {
                      property: 'biomass',
                      type: 'interval',
                      stops: [
                      [0, '#FFEDA0'],
                      [1, '#FED976'],
                      [10, '#FEB24C'],
                      [20, '#FD8D3C'],
                      [30, '#FC4E2A'],
                      [40, '#E31A1C'],
                      [50, '#BD0026'],
                      [100, '#800026']
                      ]
                  },
                  'circle-radius': {
                      property: 'biomass',
                      type: 'interval',
                      stops: [
                        [0, 2],
                        [1, 3],
                        [10, 4],
                        [20, 5],
                        [30, 6],
                        [40, 7],
                        [50, 8],
                        [100, 9]
                      ]
                  }
            }"
            (click)="selectStation($event)">            
            </mgl-layer>
             <mgl-popup *ngIf="selectedStation"
              [lngLat]="selectedStation.geometry?.coordinates">
              <span style="color:black;">{{'STATION' | translate}} {{selectedStation.properties?.code}}</span><br/>
              <span *ngIf="typeShow==='B'" style="color:black;">{{'BIOMASS' | translate}} {{selectedStation.properties?.biomass}}</span>
              <span *ngIf="typeShow==='A'" style="color:black;">{{'ABUNDANCY' | translate}} {{selectedStation.properties?.abundancy}}</span>
            </mgl-popup>
          </mgl-geojson-source>
        </ng-container>
        <ng-container *ngIf="(layerZones$ | async) && showZones">
          <mgl-geojson-source
            id="layerZones"
            [data]="layerZones$ | async">
            <mgl-layer
              *ngIf="(!showBiom) || (typeShow==='A')"
              id="zonesid_abun"
              type="fill"
              source="layerZones"
              [paint]="{
                'fill-color': {
                  property: 'abundancy',
                    type: 'interval',
                    stops: [
                      [0, '#FFEDA0'],
                      [1, '#FED976'],
                      [10, '#FEB24C'],
                      [20, '#FD8D3C'],
                      [30, '#FC4E2A'],
                      [40, '#E31A1C'],
                      [50, '#BD0026'],
                      [100, '#800026']
                    ]
                },
                'fill-opacity': 0.3,
                'fill-outline-color': '#000'
                }"
              (click)="selectZone($event)">
            </mgl-layer>
            <mgl-layer
              *ngIf="showBiom && typeShow==='B'"
              id="zonesid_biom"
              type="fill"
              source="layerZones"
              [paint]="{
                'fill-color': {
                  property: 'biomass',
                    type: 'interval',
                    stops: [
                      [0, '#FFEDA0'],
                      [1, '#FED976'],
                      [10, '#FEB24C'],
                      [20, '#FD8D3C'],
                      [30, '#FC4E2A'],
                      [40, '#E31A1C'],
                      [50, '#BD0026'],
                      [100, '#800026']
                    ]
                },
                'fill-opacity': 0.3,
                'fill-outline-color': '#000'
                }"
              (click)="selectZone($event)">
            </mgl-layer>
            <mgl-popup *ngIf="selectedZone"
              [lngLat]="selectZoneCoordinates()">
              <span style="color:black;">{{'ZONE' | translate}} {{selectedZone.properties?.code}}</span><br/>
            </mgl-popup>
          </mgl-geojson-source>
        </ng-container>
      </mgl-map>
   </div>
  `,
  styles: [
    `
   mgl-map {
      width: 800px;
      height: 500px;
      border: 1px solid black;
    }
    .marker{
      color:white;
    }
    .marker.selected{
      color:red;
    }
    .container {
      display: flex;
      margin-left: 20px;
      margin-right: 20px;
    }
    .popup {
      color: black;
    }
  `]
})
export class ResultMapComponent implements OnInit, OnChanges {
  @Input() results: Results;
  @Input() analyseData: Data;
  @Input() typeShow: string;
  @Input() spShow: string;
  @Input() surveyShow: string;
  @Input() showStations: boolean;
  @Input() showZones: boolean;
  @Input() showBiom: boolean;
  @Output() zoneEmitter = new EventEmitter<string>();
  stations: any[] = [];
  zones: any[] = [];
  layerStations$: Observable<Turf.FeatureCollection>;
  layerZones$: Observable<Turf.FeatureCollection>;
  bounds$: Observable<LngLatBounds>;
  boundsPadding: number = 0;
  zoomMaxMap = 10;
  zoom: number = 9;
  selectedStation: GeoJSON.Feature<GeoJSON.Point> | null;
  selectedZone: GeoJSON.Feature<GeoJSON.Point> | null;

  constructor(mapService: MapService) {

  }

  zoomChange(event) {
    this.zoom = event.target.getZoom();
  }

  ngOnInit() {
    console.log(this.results);
    this.initStations();
    this.initZones();
    this.filterFeaturesCollection();
  }

  ngOnChanges(event) {
    this.filterFeaturesCollection();
  }

  initStations() {
    if (this.stations.length <= 0) {
      for (let i in this.results.resultPerSurvey) {
        for (let rsp of this.results.resultPerSurvey[i].resultPerSpecies) {
          for (let rt of rsp.resultPerStation) {
            let s: Station = this.analyseData.usedStations.filter((station: Station) => station.properties.code === rt.codeStation) && this.analyseData.usedStations.filter(station => station.properties.code === rt.codeStation)[0];
            let marker = MapService.getFeature(s, {
              code: s.properties.code,
              abundancy: rt.abundancePerHA,
              biomass: rt.biomassPerHA,
              species: rsp.codeSpecies,
              survey: this.results.resultPerSurvey[i].codeSurvey
            })

            this.stations.push(marker);
          }
        }
      }
    }
  }

  initZones() {
    if (this.zones.length <= 0) {
      for (let i in this.results.resultPerSurvey) {
        for (let rsp of this.results.resultPerSurvey[i].resultPerSpecies) {
          for (let rz of rsp.resultPerZone) {
            let z: Zone = this.analyseData.usedZones.filter((zone: Zone) => zone.properties.code === rz.codeZone) && this.analyseData.usedZones.filter((zone: Zone) => zone.properties.code === rz.codeZone)[0];
            let polygon = {
              geometry: z.geometry,
              properties: {
                code: z.properties.code,
                abundancy: rz.abundancePerHA,
                biomass: rz.biomassPerHA,
                species: rsp.codeSpecies,
                survey: this.results.resultPerSurvey[i].codeSurvey
              }
            };
            this.zones.push(polygon);
          }
        }
      }
    }
    this.bounds$ = of(MapService.zoomToZones(Turf.featureCollection(
      this.zones.map(zone => MapService.getPolygon(zone, { code: zone.properties.code, abundancy: zone.properties.abundancy, biomass: zone.properties.biomass }))
        .filter(polygon => polygon !== null))));
  }

  filterFeaturesCollection() {
    // stations
    let filteredStations = this.stations
      .filter(marker => marker.properties.species === this.spShow && marker.properties.survey === this.surveyShow);
    let featureCollection = Turf.featureCollection(filteredStations);
    this.layerStations$ = of(featureCollection);
    // zones
    let fc2 = Turf.featureCollection(
      this.zones
        .filter(zone => zone.properties.species === this.spShow && zone.properties.survey === this.surveyShow)
        .map(zone => MapService.getPolygon(zone, { code: zone.properties.code, abundancy: zone.properties.abundancy, biomass: zone.properties.biomass }))
        .filter(polygon => polygon !== null)
    );
    this.layerZones$ = of(fc2);
    //if (filteredStations.length > 0) {
    //  this.bounds$ = of(MapService.zoomToZones(fc2));
    //}
  }

  getValue(feature) {
    switch (this.typeShow) {
      case "B":
        return Math.round(feature.properties.biomass);
      case "A":
        return Math.round(feature.properties.abundancy);
      default:
        return 0;
    }
  }

  getUnit() {
    switch (this.typeShow) {
      case "B":
        return "Kg/ha";
      case "A":
        return "Holot./ha";
      default:
        return 0;
    }
  }

  selectStation(evt: MapMouseEvent) {
    this.selectedStation = (<any>evt).features[0];
  }

  selectZone(evt: MapMouseEvent) {
    this.selectedZone = (<any>evt).features[0];
    this.zoneEmitter.emit(this.selectedZone.properties.code);
  }

  selectZoneCoordinates() {
    return MapService.getCoordinates(this.selectedZone)[0][0];
  }


}
