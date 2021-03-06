import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subscription, pipe, of } from "rxjs";
import { map } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { LngLatBounds, Layer, LngLat, MapMouseEvent, Map } from "mapbox-gl";
import * as Turf from "@turf/turf";

import { RouterExtensions, Config } from "../../modules/core/index";
import { Platform, Zone, Station, Count } from "../../modules/datas/models/index";
import { Country, Coordinates } from "../../modules/countries/models/country";
import { IAppState } from "../../modules/ngrx/index";
import { MapService } from "../../modules/core/services/index";

@Component({
  moduleId: module.id,
  selector: 'bc-count-global-import-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'global-import-count-map.component.html',
  styleUrls: ['../maps.css']
})
export class PreviewMapCountGlobalImportComponent implements OnInit, OnChanges {
  @Input() platform: Platform;
  @Input() countries: Country[];
  @Input() newCounts: Count[];
  @Input() importError: string[];
  @Input() error: string;

  bounds: LngLatBounds;
  boundsPadding: number = 100;
  map: any;

  zoomMaxMap: number = 10;
  zoom = 9;
  zoomMinCountries: number = 4;
  zoomMinStations: number = 3;
  zoomMaxStations: number = 5;
  selectedStation: GeoJSON.Feature<GeoJSON.Point> | null;
  selectedZone: GeoJSON.Feature<GeoJSON.Polygon> | null;
  colorPreview: Object;
  markerCountry: any;
  zones: Zone[] = [];
  newStationsPreviewInvalid: any[] = [];
  newStationsPreviewValid: any[] = [];
  layerZones$: Observable<Turf.FeatureCollection>;
  stations: Station[] = [];
  stationsCount: Station[] = [];
  layerStationsCount$: Observable<Turf.FeatureCollection>;
  layerStations$: Observable<Turf.FeatureCollection>;
  show: string[] = ["countries"];
  tmp: string[] = [];
  bls: string[] = ["mapbox://styles/mapbox/satellite-v9", "mapbox://styles/mapbox/streets-v9"];
  bl: number;

  constructor() {
    this.bl = 0;
  }

  ngOnInit() {
    this.init();
  }

  ngOnChanges() {
    if (this.importError.length > 0 || this.error !== null) {
      this.reset();
    } else {
      if (this.newCounts && typeof this.newCounts !== "string") {
        this.init();
      }
    }
  }

  reset() {
    this.newStationsPreviewInvalid = [];
    this.newStationsPreviewValid = [];
  }

  setMap(event) {
    this.map = event;
    if (this.bounds) {
      this.map.fitBounds(this.bounds, { padding: 10 });
    }
  }

  zoomChange(event) {
    this.zoom = event.target.getZoom();

    if (this.zoom <= this.zoomMinCountries) this.show = [...this.show.filter(s => s !== "countries"), "countries"];
    if (this.zoom <= this.zoomMaxStations && this.zoom > this.zoomMinCountries)
      this.show = [...this.show.filter(s => s !== "countries" && s !== "zones"), "countries", "zones"];
    if (this.zoom > this.zoomMaxStations) this.show = [...this.show.filter(s => s !== "zones" && s !== "stations"), "zones", "stations"];
  }

  changeView(view: string) {
    this.show = this.show.indexOf(view) >= 0 ? [...this.show.filter(s => s !== view)] : [...this.show, view];
  }

  isDisplayed(layer: string) {
    return this.show.indexOf(layer) >= 0;
  }

  changeBL() {
    this.bl = this.bl ? 0 : 1;
    // Remove all the layers to reload them on new style when baselayer is loaded
    this.tmp = this.show;
    this.show = [];
  }

  styleChange(event) {
    // when style is loaded put back the layers
    if (event.dataType === "style") {
      if (this.tmp.length > 0) {
        this.show = this.tmp;
        this.tmp = [];
      }
    }
  }

  init() {
    if (this.countries.length > 0) {
      if (this.newCounts !== null && this.newCounts.length > 0) {
        this.platform.stations.forEach(station => {
          this.newCounts.forEach(count => {
            if (count.codeStation === station.properties.code) {
              if (!this.stationsCount.includes(station)) {
                this.stationsCount.push(station);
              }
            }
          });
        });
      }

      let country = this.countries.filter(country => country.code === this.platform.codeCountry)[0];

      this.markerCountry = {
        country: country.code,
        name: country.name,
        lngLat: [country.coordinates.lng, country.coordinates.lat]
      };

      if (this.platform.zones.length > 0) this.setZones(this.platform);
      if (this.platform.stations.length > 0) this.setStations(this.platform);
      if (this.stationsCount.length > 0) this.setStationsCount(this.stationsCount);
    }
  }

  zoomOnCountry(countryCode: string) {
    this.bounds = MapService.zoomToCountries([this.markerCountry.lngLat]);
  }

  setZones(platform: Platform) {
    this.zones = this.platform.zones;
    let fc = Turf.featureCollection(this.zones.map(zone => MapService.getPolygon(zone, { code: zone.properties.code })))
    this.layerZones$ = of(fc);
    this.bounds = MapService.zoomToZones(fc);
  }

  setStations(platform: Platform) {
    this.stations = this.platform.stations;
    let fc = Turf.featureCollection(this.stations.map(station => Turf.point(station.geometry.coordinates, { code: station.properties.code })))
    this.layerStations$ = of(fc);
    this.bounds = MapService.zoomToStations(fc);
  }

  setStationsCount(stations: Station[]) {
    let fc = Turf.featureCollection(stations.map(station => Turf.point(station.geometry.coordinates, { code: station.properties.code })));
    this.layerStationsCount$ = of(fc);
    this.bounds = MapService.zoomToStations(Turf.featureCollection(stations.map(station => Turf.point(station.geometry.coordinates, { code: station.properties.code }))));
  }

  showPopupStation(evt: MapMouseEvent) {
    this.selectedStation = (<any>evt).features[0];
  }
}
