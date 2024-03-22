import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosRComponent } from './eventos-r.component';

describe('EventosRComponent', () => {
  let component: EventosRComponent;
  let fixture: ComponentFixture<EventosRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosRComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventosRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
