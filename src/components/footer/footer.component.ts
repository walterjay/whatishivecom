
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
<footer class="bg-gray-900 border-t border-gray-800">
  <div class="container mx-auto px-4 py-6 text-center text-gray-400">
    <p>&copy; {{ currentYear }} whatishive.com - Your portal to the Hive ecosystem.</p>
  </div>
</footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
