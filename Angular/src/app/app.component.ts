import { Component, OnInit } from '@angular/core';
import { NavHeaderComponent } from './begin/nav-header/nav-header.component';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavHeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Angular';

  constructor(private primengConfig: PrimeNGConfig) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    
    this.primengConfig.setTranslation({
      accept: 'Confirmar',
      reject: 'Cancelar',
      //translations
    });
  }
}
