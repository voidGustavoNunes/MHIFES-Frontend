import { Component, OnInit } from '@angular/core';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CommonModule,
    PaginatorModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  horarioIndividualData: any[] = [];
  ingredient!: string;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    ) {
      this.form = this.formBuilder.group({
        user: [null],
        senha: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]]
      });
  }

  ngOnInit() {
    this.horarioIndividualData = [
      {
        hora: '12:52 - 14:30',
        seg: 'Name product',
        ter: 'Name product',
        qua: 'Name product',
        qui: 'Name product',
        sex: 'Name product',
        sab: 'Name product',
      },
      {
        hora: '12:52 - 14:30',
        seg: 'Name product',
        ter: 'Name product',
        qua: 'Name product',
        qui: 'Name product',
        sex: 'Name product',
        sab: 'Name product',
      },
      {
        hora: '12:52 - 14:30',
        seg: 'Name product',
        ter: 'Name product',
        qua: 'Name product',
        qui: 'Name product',
        sex: 'Name product',
        sab: 'Name product',
      },
    ]
  }
}
