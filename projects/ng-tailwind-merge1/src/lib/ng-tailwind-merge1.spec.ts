import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgTailwindMerge1 } from './ng-tailwind-merge1';

describe('NgTailwindMerge1', () => {
  let component: NgTailwindMerge1;
  let fixture: ComponentFixture<NgTailwindMerge1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgTailwindMerge1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgTailwindMerge1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
