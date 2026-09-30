import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { NgMerge, NgTailwindMerge, cn, mergeTailwindClasses } from 'ng-tailwind-merge';
import {
  combineSignals,
  debounceSignal,
  distinctSignal,
  filterSignal,
  watchSignal,
} from '@sergeydus/ng-signals-utils';

@Component({
  selector: 'app-root',
  imports: [NgTailwindMerge, NgMerge],
  template: `
    <div twMerge class="p-2 p-4" [ngClass]="{ 'font-bold': enabled() }" [class.text-sm]="true"></div>
    <div class="static-x p-2" [merge]="['p-4', 'text-red-500']"></div>
    <p>{{ tuple[0] }} {{ tuple[1] }} {{ debounced() }} {{ retained() }} {{ unique() }}</p>
  `,
})
class App {
  readonly enabled = signal(true);
  readonly count = signal(1);
  readonly label = signal('ok');
  readonly combined = combineSignals([this.count, this.label]);
  readonly tuple: readonly [number, string] = this.combined();
  readonly debounced = debounceSignal(this.count, 10);
  readonly retained = filterSignal(this.count, value => value > 0, 0);
  readonly unique = distinctSignal(this.count);
  readonly classes = [cn('p-2', 'p-4'), mergeTailwindClasses('m-2', 'm-4')];

  constructor() {
    watchSignal(this.count, () => {});
  }
}

bootstrapApplication(App).catch(error => console.error(error));
