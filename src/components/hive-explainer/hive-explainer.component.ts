
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-hive-explainer',
  template: `
<div class="max-w-3xl mx-auto bg-gray-800/50 rounded-lg p-6 md:p-8 border border-gray-700 shadow-lg">
  <form (submit)="handleFormSubmit($event)">
    <div class="flex flex-col sm:flex-row gap-2">
      <input 
        type="text"
        [value]="question()"
        (input)="question.set($any($event.target).value)"
        placeholder="e.g., How does voting work?" 
        class="flex-grow bg-gray-900 border border-gray-700 text-white rounded-md py-3 px-4 focus:ring-2 focus:ring-red-500 focus:outline-none transition-shadow"
      >
      <button 
        type="submit"
        [disabled]="isLoading() || question().trim() === ''"
        class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
      >
        @if (isLoading()) {
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        } @else {
          <span>Ask AI</span>
        }
      </button>
    </div>
  </form>

  <div class="mt-4 text-center">
    <p class="text-sm text-gray-400">Or try one of these:</p>
    <div class="flex flex-wrap justify-center gap-2 mt-2">
      @for (q of predefinedQuestions; track q) {
        <button 
          (click)="askQuestion(q)"
          class="bg-gray-700 hover:bg-gray-600 text-xs text-gray-200 py-1 px-3 rounded-full transition-colors"
        >
          {{ q }}
        </button>
      }
    </div>
  </div>

  <div class="mt-6 min-h-[100px] bg-gray-900 p-4 rounded-md border border-gray-700">
    @if (isLoading()) {
      <div class="flex items-center justify-center h-full text-gray-400">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mr-3"></div>
        Thinking...
      </div>
    } @else {
      @if (error()) {
        <p class="text-red-400">{{ error() }}</p>
      } @else if (answer()) {
        <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 pt-1">
                <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <i class="fas fa-robot text-red-400"></i>
                </div>
            </div>
            <div class="bg-gray-800 rounded-lg p-3 flex-1">
                <p class="text-gray-300 whitespace-pre-wrap">{{ answer() }}</p>
            </div>
        </div>
      } @else {
        <p class="text-gray-500 text-center py-8">Your answer about Hive will appear here...</p>
      }
    }
  </div>
</div>
  `,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HiveExplainerComponent {
  private geminiService = inject(GeminiService);

  question = signal('');
  answer = signal('');
  isLoading = signal(false);
  error = signal('');

  predefinedQuestions = [
    'What can I do on Hive?',
    'How do I earn rewards?',
    'Is Hive like other social media platforms?',
    'What are Hive communities?'
  ];

  async askQuestion(prompt: string) {
    if (!prompt || this.isLoading()) {
      return;
    }
    
    this.question.set(prompt);
    this.isLoading.set(true);
    this.error.set('');
    this.answer.set('');

    try {
      const result = await this.geminiService.getHiveExplanation(prompt);
      this.answer.set(result);
    } catch (e: any) {
      this.error.set(e.message || 'Sorry, something went wrong. Please try again.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  handleFormSubmit(event: Event) {
    event.preventDefault();
    this.askQuestion(this.question());
  }
}
