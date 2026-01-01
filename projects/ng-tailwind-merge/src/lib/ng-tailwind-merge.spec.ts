import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgTailwindMerge } from './ng-tailwind-merge';

describe('NgTailwindMerge', () => {
  let component: NgTailwindMerge;
  let fixture: ComponentFixture<NgTailwindMerge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgTailwindMerge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgTailwindMerge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
