import { Injectable, Output, EventEmitter } from '@angular/core';
import { Http, Headers, Response, URLSearchParams, RequestOptions } from '@angular/http';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { User, Authenticate } from '../models/user';
import * as PouchDB from "pouchdb";
import * as PouchDBAuth from "pouchdb-authentication";

@Injectable()
export class AuthService {
  public currentUser: User;
  private db: any;

  @Output() getLoggedInUser: EventEmitter<User> = new EventEmitter();

  constructor(private http: Http) {   
    var pouchOpts = {
      skipSetup: true
    };
    this.db = new PouchDB('http://entropie-dev:5984/books_app', pouchOpts);    
  }

  login({ username, password }: Authenticate): Observable<User> {  
    return fromPromise(this.db.login(username, password, (err, response) => {
      if (err) {
        if (err.name === 'unauthorized') {
          console.log(err);
          return of(_throw('Invalid username or password'));
        } else {
          console.log(err);
          return of(_throw(err.reason));
        }
      }
      this.currentUser = { name: username, country: response.roles[0]};
      this.getLoggedInUser.emit(this.currentUser);
      return of({ name: username, country: response.roles[0]});
    }));
  }

  logout(): Observable<any> {
    return fromPromise(this.db.logout((err, response) => {
      if (err) {
        return of(_throw(err.reason));
      }
      this.currentUser = { name: null, country: null};
      this.getLoggedInUser.emit(this.currentUser);
      return of(response.ok);
    }));
  }

  signup({ username, password }: Authenticate): Observable<any> {
    return fromPromise(this.db.signup(username, password, (err, response) => {
      if (err) {
        if (err.name === 'conflict') {
          return of(_throw('Invalid username or password'));
        } else if (err.name === 'forbidden') {
          return of(_throw('User name already exists'));
        } else {
          return of(_throw(err.reason));
        }
      }
      return of(response.ok);
    }));
  }
}