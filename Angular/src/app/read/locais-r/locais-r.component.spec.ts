import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocaisRComponent } from './locais-r.component';

describe('LocaisRComponent', () => {
  let component: LocaisRComponent;
  let fixture: ComponentFixture<LocaisRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocaisRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LocaisRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
