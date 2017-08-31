import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';

import * as PouchDB from "pouchdb";
import { Book } from '../../books/models/book';


@Injectable()
export class PouchDBService {

    private db: any;
    private isImplemented: boolean = false;

    public constructor() { }

    initDB() : Promise<any> {
        this.db = new PouchDB('books_app');
        return this.sync("http://entropie-dev:5984/books_app");
    }

    public getAll() : Observable<any> {        
        return fromPromise(
            this.db.allDocs({ include_docs: true })
                .then(docs => {
                    return docs.rows.map(row => {
                        return row.doc;
                    });
                }));
    }

    public add(book: Book) : Promise<any> {
         return this.db.post(book);
    }

    public update(book: Book) : Promise<any> {
        return this.db.put(book);
    }

    public delete(book: Book) : Promise<any> {
        console.log(book);
        return this.db.remove(book);

    } 

    public sync(remote: string) : Promise<any> {
        console.log(remote);
        let remoteDatabase = new PouchDB(remote);
        return this.db.sync(remoteDatabase, {
            live: true,
            retry: true
        }).on('change', change => {
            console.log(change);
        }).on('paused', function (info) {
          // replication was paused, usually because of a lost connection
          console.log(info);
        }).on('active', function (info) {
          // replication was resumed
          console.log(info);
        }).on('error', error => {
            console.error(JSON.stringify(error));
        });
    }


    getChanges(): Observable<any> {
        return Observable.create(observer => {
                this.db.changes({ live: true, since: 'now', include_docs: true })
                    .on('change', change => {
                        observer.next(change.doc);
                    });
        });
    }

}