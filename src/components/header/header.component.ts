
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
<header class="bg-gray-900 bg-opacity-50 backdrop-blur-md sticky top-0 z-50">
  <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
    <div class="flex items-center space-x-3">
      <svg class="w-8 h-8 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.37.24a1.5 1.5 0 00-.74 0L3.13 4.1a1.5 1.5 0 00-.88 1.3V18.6a1.5 1.5 0 00.88 1.3l8.5 3.86a1.5 1.5 0 00.74 0l8.5-3.86a1.5 1.5 0 00.88-1.3V5.4a1.5 1.5 0 00-.88-1.3L12.37.24zM4.5 5.71l7.5 3.4v12.78l-7.5-3.4V5.71zm15 12.78l-7.5 3.4V9.11l7.5-3.4v12.78z"></path></svg>
      <span class="text-2xl font-bold text-white">whatishive.com</span>
    </div>
    <div class="hidden md:flex items-center space-x-6">
      <a href="#features" (click)="scrollTo($event, 'features')" class="text-gray-300 hover:text-red-500 transition-colors">Features</a>
      <a href="#stats" (click)="scrollTo($event, 'stats')" class="text-gray-300 hover:text-red-500 transition-colors">Stats</a>
      <a href="#projects" (click)="scrollTo($event, 'projects')" class="text-gray-300 hover:text-red-500 transition-colors">Ecosystem</a>
      <a href="https://signup.hive.io/" target="_blank" rel="noopener noreferrer" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors">Get Started</a>
    </div>
  </nav>
</header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  scrollTo(event: MouseEvent, elementId: string): void {
    event.preventDefault();
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
