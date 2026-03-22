
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-feature-card',
  template: `
<div class="bg-gray-800 p-6 rounded-lg text-center h-full flex flex-col items-center transform transition-transform duration-300 hover:-translate-y-2">
  <div class="bg-red-500/10 text-red-500 rounded-full p-4 mb-4 inline-flex">
    <i class="{{ feature().icon }} fa-2x"></i>
  </div>
  <h3 class="text-xl font-bold mb-2 text-white">{{ feature().title }}</h3>
  <p class="text-gray-400">{{ feature().description }}</p>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureCardComponent {
  feature = input.required<Feature>();
}
