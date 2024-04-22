import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { AlunoService } from './service/aluno.service';
import { ProfessorService } from './service/professor.service';
import { UsuarioPadraoService } from './service/usuario-padrao.service';
import { IConfig, provideEnvironmentNgxMask } from 'ngx-mask'

const maskConfigFunction: () => Partial<IConfig> = () => {
  return {
    validation: false,
  };
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    provideHttpClient(),
    AlunoService,
    ProfessorService,
    UsuarioPadraoService,
    provideEnvironmentNgxMask(maskConfigFunction),
  ]
};
