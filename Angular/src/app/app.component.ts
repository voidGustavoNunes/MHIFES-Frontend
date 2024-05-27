import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavHeaderComponent } from './begin/nav-header/nav-header.component';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { FooterComponent } from './begin/footer/footer.component';
import { PrimeNgImportsModule } from './shared/prime-ng-imports/prime-ng-imports.module';
import { ScannerPopupComponent } from './read/scanner-popup/scanner-popup.component';
import { CommonModule } from '@angular/common';
import { DataService } from './_services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavHeaderComponent,
    FooterComponent,
    PrimeNgImportsModule,
    ScannerPopupComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('scanner') scanner!: ScannerPopupComponent; 

  title = 'Angular';
  carregado: boolean = false;

  constructor(
    private primengConfig: PrimeNGConfig,
    private dataService: DataService
  ) {
    setTimeout(() => {
      this.dataService.setDataLoaded(true);
      this.loadAppData()
    }, 2000);}

  ngOnInit() {
    this.primengConfig.ripple = true;
    
    this.primengConfig.setTranslation({
      accept: 'Confirmar',
      reject: 'Cancelar',
      firstDayOfWeek: 0,
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      dayNamesMin: ['Do', 'Se', 'Te', 'Qua', 'Qui', 'Se', 'Sa'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
        'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      today: 'Hoje'
      //translations
    });
    
    this.loadAppData()
  }

  ngAfterViewInit(): void {
    // setTimeout(() => this.carregado = true, 1000);
  }

  private loadAppData() {
    this.dataService.getDataLoaded().subscribe(loaded => {
      console.log(loaded)
      this.carregado = loaded;
    });
  }

  openScannerDialog() {
    if (this.scanner) this.scanner.openConsultaDialog();
    else console.log('erro consulta erro')
  }
}
