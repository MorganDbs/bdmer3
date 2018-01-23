import { Injectable, Output, EventEmitter } from '@angular/core';
import { Http, Headers, Response, URLSearchParams, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';


import * as PouchDB from "pouchdb";
import { ResponsePDB } from '../../core/models/pouchdb';
import { Site, Zone, Transect } from '../models/site';
import { Country } from '../../countries/models/country';

@Injectable()
export class SiteService {
  private currentSite: Observable<Site>;
  private db: any;

  constructor(private http: Http) {
  }

  initDB(dbname: string, remote: string): Observable<any> {
    //console.log(dbname);
    this.db = new PouchDB(dbname);
    return fromPromise(this.sync(remote + dbname));
  }

  public getAll(): Observable<any> {
   return fromPromise(this.db.allDocs({ include_docs: true }))
      .map((result: ResponsePDB) => 
        result.rows.map(row => row.doc)
      )
  }

  getSite(siteCode: string): Observable<Site> {
    return fromPromise(this.db.query(function(doc, emit) {
      emit(doc.code);
    }, { key: siteCode, include_docs: true }))
    .map((result: ResponsePDB) => {
      return result.rows && result.rows[0] && result.rows[0].doc;
    
    })
  }

  addSite(site: Site): Observable<Site> {
    site._id=site.code;
    this.currentSite = of(site);
    return fromPromise(this.db.put(site))
      .filter((response: ResponsePDB) => { return response.ok; })
      .mergeMap(response => {
        console.log(response);
        return  this.currentSite;
      })
  }

  importSite(site: Site[]): Observable<Observable<Site>> {
    return of(site)
      .map((sp, i) => this.addSite(sp[i]))
  }

  editSite(site: Site, country: Country): Observable<Site> {
    console.log(site);
    site._id=site.code;
    return this.getSite(site.code)
      .mergeMap(st => {  
        if (!site.zones) site.zones = []; 
        if(country !== undefined){
          site.codeCountry = country.code;
        }
        if(site.codeCountry === null){
          return _throw('Import is not possible : country has not been defined');
        }      
        if(st) {site._rev = st._rev;}
        this.currentSite = of(site);
        return fromPromise(this.db.put(site));
      })
      .filter((response: ResponsePDB) => { return response.ok; })
      .mergeMap((response) => {
        return  this.currentSite;
      })
  }

  removeSite(site: Site): Observable<Site> {    
    return fromPromise(this.db.remove(site))
      .filter((response: ResponsePDB) => { return response.ok; })
      .mergeMap(response => {
        return of(site);
      })
  }

  editZone(site: Site, zone: Zone): Observable<Zone> {
    return this.getSite(site.code)
      .filter(site => site!==null)
      .mergeMap(st => {   
        console.log(zone); 
        if(!st.zones) st.zones = [];
        if(!zone.transects) zone.transects = [];
        if(!zone.zonePreferences) zone.zonePreferences = [];
        console.log(zone);
        if(st.zones.filter(z => z.code === zone.code).length > -1){
          st.zones = [ ...st.zones.filter(z => z.code !== zone.code), zone];
        } else {
          st.zones.push(zone);
        }
        this.currentSite = of(st);
        return fromPromise(this.db.put(st));
      })
      .filter((response: ResponsePDB) => { return response.ok; })
      .mergeMap((response) => {
        return  of(zone);
      })
  }

  editTransect(site: Site, transect: Transect): Observable<Transect> {
    console.log("Edit : "+transect);
    return this.getSite(site.code)
      .filter(site => site!==null)
      .mergeMap(st => {  
        if(!transect.counts) transect.counts = [];
        let zn = st.zones.filter(z => z.code === transect.codeZone)[0];
        if(zn){
          if(zn.transects.filter(t => t.code === transect.code).length > -1){
            zn.transects = [ ...zn.transects.filter(t => t.code !== transect.code), transect];
          }
          st.zones = [ ...st.zones.filter(z => z.code !== zn.code), zn];
        } 
        this.currentSite = of(st);
        return fromPromise(this.db.put(st));
      })
      .filter((response: ResponsePDB) => { return response.ok; })
      .mergeMap((response) => {
        return  of(transect);
      })
  }

  public sync(remote: string): Promise<any> {
    let remoteDatabase = new PouchDB(remote);
    return this.db.sync(remoteDatabase, {
      live: true,
      retry: true
    }).on('error', error => {
      console.error(JSON.stringify(error));
    });
  }
}