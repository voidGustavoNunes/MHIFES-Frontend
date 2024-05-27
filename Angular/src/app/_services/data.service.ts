import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
    private localStorage!: any;
    
    private dataLoadedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        @Inject(DOCUMENT) private document: Document
    ) {
        this.localStorage = this.document.defaultView?.localStorage; 
    }

    setDataLoaded(loaded: boolean) {
        this.dataLoadedSubject.next(loaded);
    }

    getDataLoaded(): Observable<boolean> {
        return this.dataLoadedSubject.asObservable();
    }
}