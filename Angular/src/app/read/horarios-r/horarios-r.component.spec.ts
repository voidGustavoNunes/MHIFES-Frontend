import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosRComponent } from './horarios-r.component';

describe('HorariosRComponent', () => {
  let component: HorariosRComponent;
  let fixture: ComponentFixture<HorariosRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HorariosRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
