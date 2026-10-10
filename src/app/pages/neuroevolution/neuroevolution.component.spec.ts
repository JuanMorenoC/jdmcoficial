import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeuroevolutionComponent } from './neuroevolution.component';

describe('NeuroevolutionComponent', () => {
  let component: NeuroevolutionComponent;
  let fixture: ComponentFixture<NeuroevolutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeuroevolutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeuroevolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
