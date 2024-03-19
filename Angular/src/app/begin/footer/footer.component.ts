import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  anoAtual: any;
  
  constructor(
    ) { }

  ngOnInit(): void {
    this.anoAtual = new Date().getFullYear();
  }
}
