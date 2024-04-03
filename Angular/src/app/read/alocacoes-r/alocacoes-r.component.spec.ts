import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlocacoesRComponent } from './alocacoes-r.component';

describe('AlocacoesRComponent', () => {
  let component: AlocacoesRComponent;
  let fixture: ComponentFixture<AlocacoesRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlocacoesRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlocacoesRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
