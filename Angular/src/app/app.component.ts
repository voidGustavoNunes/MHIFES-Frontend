import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavHeaderComponent } from './begin/nav-header/nav-header.component';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { FooterComponent } from './begin/footer/footer.component';
import { PrimeNgImportsModule } from './shared/prime-ng-imports/prime-ng-imports.module';
import { ScannerPopupComponent } from './read/scanner-popup/scanner-popup.component';
import { CommonModule } from '@angular/common';
import { UserAuthService } from './_services/user-auth.service';

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
  dados: any;

  constructor(
    private primengConfig: PrimeNGConfig,
    private route: ActivatedRoute,
    private userAuthService: UserAuthService
  ) {
  }

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
    
    // this.loadAppData()
    this.carregado = false;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.carregado = true;
     });
  }
  
  private loadAppData() {
    this.route.data.subscribe(({ resolver }) => {
      console.log('dt ',resolver)
      this.dados = resolver;
      console.log('dd ',this.dados)
      if(this.dados == this.userAuthService.getLogin()) this.carregado = true;
      else this.carregado = false;
    });
  }

  openScannerDialog() {
    if (this.scanner) this.scanner.openConsultaDialog();
    else console.log('erro consulta erro')
  }
}
