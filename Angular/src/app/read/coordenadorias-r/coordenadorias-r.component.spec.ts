import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordenadoriasRComponent } from './coordenadorias-r.component';

describe('CoordenadoriasRComponent', () => {
  let component: CoordenadoriasRComponent;
  let fixture: ComponentFixture<CoordenadoriasRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordenadoriasRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordenadoriasRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
