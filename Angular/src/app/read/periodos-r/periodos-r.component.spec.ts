import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodosRComponent } from './periodos-r.component';

describe('PeriodosRComponent', () => {
  let component: PeriodosRComponent;
  let fixture: ComponentFixture<PeriodosRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodosRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PeriodosRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
