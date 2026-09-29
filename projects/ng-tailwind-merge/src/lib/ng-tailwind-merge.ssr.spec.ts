import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { describe, expect, it } from 'vitest';

import { NgMerge, NgTailwindMerge } from './ng-tailwind-merge';

@Component({
  selector: 'test-ssr-host',
  standalone: true,
  imports: [NgTailwindMerge, NgMerge],
  template: `
    <div id="tw" twMerge class="p-2 p-4 text-red-500"></div>
    <div id="merge" class="static-x p-2" [merge]="['p-4']"></div>
    <div id="tw-dynamic" twMerge class="p-2" [ngClass]="{ 'p-4': true }" [class.font-bold]="true"></div>
    <div id="merge-dynamic" class="p-2" [merge]="['p-4']" [class.font-bold]="true"></div>
  `,
})
class ServerHost {}

describe('server-rendered directive classes', () => {
  it('removes conflicts while retaining unrelated static classes', async () => {
    const html = await renderApplication(
      (context) => bootstrapApplication(ServerHost, { providers: [provideServerRendering()] }, context),
      {
        document: '<!doctype html><html><head></head><body><test-ssr-host></test-ssr-host></body></html>',
        url: 'http://localhost/',
      },
    );
    const document = new DOMParser().parseFromString(html, 'text/html');
    const tw = document.querySelector('#tw');
    const merge = document.querySelector('#merge');
    const twDynamic = document.querySelector('#tw-dynamic');
    const mergeDynamic = document.querySelector('#merge-dynamic');

    expect(tw).not.toBeNull();
    expect(tw?.classList.contains('p-2')).toBe(false);
    expect(tw?.classList.contains('p-4')).toBe(true);
    expect(tw?.classList.contains('text-red-500')).toBe(true);
    expect(merge).not.toBeNull();
    expect(merge?.classList.contains('static-x')).toBe(true);
    expect(merge?.classList.contains('p-2')).toBe(false);
    expect(merge?.classList.contains('p-4')).toBe(true);
    expect(twDynamic?.className.split(' ').sort()).toEqual(['font-bold', 'p-4']);
    expect(mergeDynamic?.className.split(' ').sort()).toEqual(['font-bold', 'p-4']);
  });
});
