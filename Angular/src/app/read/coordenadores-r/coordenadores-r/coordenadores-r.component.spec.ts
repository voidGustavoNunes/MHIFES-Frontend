import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordenadoresRComponent } from './coordenadores-r.component';

describe('CoordenadoresRComponent', () => {
  let component: CoordenadoresRComponent;
  let fixture: ComponentFixture<CoordenadoresRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordenadoresRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordenadoresRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
