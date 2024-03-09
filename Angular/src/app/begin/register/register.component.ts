import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    ) {
      this.form = this.formBuilder.group({
        user: [null],
        matricula: [null],
        senha: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(150)]]
      });
  }

  ngOnInit() {}

  navigateToPage() {
    this.router.navigate(['login']);
  }

  onSubmit() {
    if (this.form.valid) {
      this.form.reset();
    } else {
      alert('Informação inválida. Preencha o campo!');
    }
    
  }
}
