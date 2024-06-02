import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class DataLoadingService {
    private loadingMap: Map<string, boolean> = new Map();
    loadingComplete$ = new Subject<void>();
  
    isLoading(routePath: string): boolean {
      return this.loadingMap.get(routePath) === true;
    }
  
    startLoading(routePath: string) {
      this.loadingMap.set(routePath, true);
    }
  
    completeLoading(routePath: string) {
      this.loadingMap.set(routePath, false);
      this.loadingComplete$.next(); // Notify subscribers
    }
  }
  