import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, map, take } from "rxjs";
import { DataLoadingService } from "../_services/data.loading.service";

@Injectable({
    providedIn: 'root'
  })
export class DataLoadingGuard implements CanActivate {

    constructor(
      private dataLoadingService: DataLoadingService,
      private router: Router
    ) {}
  
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const dataLoaded = route.data['dataLoaded'] as boolean;
  
      if (!dataLoaded) {
        // Page refresh and data loading in progress
        if (this.dataLoadingService.isLoading(route.data['path'])) {
          // Data is loading, subscribe to loading observable
          return this.dataLoadingService.loadingComplete$.pipe(
            take(1), // Unsubscribe after first emission
            map(() => {
              // Data loaded, update dataLoaded and allow activation
              route.data['dataLoaded'] = true;
              return true;
            })
          );
        } else {
          // Data is not loading, show loading indicator
          this.router.navigate(['/carregando']); // Replace with your loading route
          return false;
        }
      }
  
      return true; // Data loaded or already activated
    }
  }
  