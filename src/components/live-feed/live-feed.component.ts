
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';

interface FeedItem {
  id: number;
  icon: string;
  user: string;
  action: string;
  target: string;
  time: string;
  iconColor: string;
}

@Component({
  selector: 'app-live-feed',
  template: `
<div class="max-w-2xl mx-auto bg-gray-800/50 rounded-lg p-4 md:p-6 border border-gray-700 shadow-lg">
    <div class="relative h-96 overflow-hidden">
        @for (item of visibleItems(); track item.id) {
            <div class="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg mb-2 w-full animate-fade-in-up">
                <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center {{ item.iconColor }}">
                    <i class="{{ item.icon }} text-white"></i>
                </div>
                <div class="flex-grow">
                    <p class="text-white text-sm md:text-base"><span class="font-bold">{{ item.user }}</span> {{ item.action }} <span class="text-red-400 font-semibold">{{ item.target }}</span></p>
                </div>
                <div class="text-sm text-gray-400 flex-shrink-0">{{ item.time }}</div>
            </div>
        }
    </div>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveFeedComponent implements OnInit, OnDestroy {
  private allActivities: FeedItem[] = [
    { id: 1, user: 'starkerz', action: 'published a post in', target: 'Community: 3Speak', time: '1m ago', icon: 'fas fa-file-video', iconColor: 'bg-red-500' },
    { id: 2, user: 'theycallmedan', action: 'upvoted', target: 'a post by @leofinance', time: '2m ago', icon: 'fas fa-arrow-up', iconColor: 'bg-green-500' },
    { id: 3, user: 'splinterlands', action: 'announced a new tournament in', target: 'Splinterlands', time: '5m ago', icon: 'fas fa-trophy', iconColor: 'bg-yellow-500' },
    { id: 4, user: 'acidyo', action: 'commented on', target: 'a photo in Liketu', time: '5m ago', icon: 'fas fa-comment', iconColor: 'bg-blue-500' },
    { id: 5, user: 'anomadsoul', action: 'created a new community', target: 'TravelFeed', time: '10m ago', icon: 'fas fa-users', iconColor: 'bg-indigo-500' },
    { id: 6, user: 'taskmaster4450', action: 'published a post in', target: 'Community: LeoFinance', time: '12m ago', icon: 'fas fa-chart-line', iconColor: 'bg-purple-500' },
    { id: 7, user: 'onealfa', action: 'transferred HBD to', target: '@savings', time: '15m ago', icon: 'fas fa-piggy-bank', iconColor: 'bg-pink-500' },
    { id: 8, user: 'blocktrades', action: 'produced a new block', target: '#86,345,122', time: '18m ago', icon: 'fas fa-cube', iconColor: 'bg-gray-500' },
    { id: 9, user: 'ocd', action: 'curated a post from', target: 'a new author', time: '20m ago', icon: 'fas fa-pen-nib', iconColor: 'bg-teal-500' },
    { id: 10, user: 'lordbutterfly', action: 'shared a video on', target: '3Speak', time: '22m ago', icon: 'fas fa-video', iconColor: 'bg-red-500' },
  ];
  private currentIndex = 0;
  
  visibleItems = signal<FeedItem[]>([]);
  private intervalId?: number;

  ngOnInit() {
    this.currentIndex = 5;
    this.visibleItems.set(this.allActivities.slice(0, 5).reverse());

    this.intervalId = window.setInterval(() => {
      this.updateFeed();
    }, 2500);
  }

  updateFeed() {
    this.visibleItems.update(currentItems => {
      // Remove the last item
      const newItems = currentItems.slice(0, currentItems.length - 1);
      
      // Get the next item from the pool
      const nextItem = this.allActivities[this.currentIndex];
      
      // Add the new item to the start of the array
      newItems.unshift(nextItem);

      // Cycle through the mock data
      this.currentIndex = (this.currentIndex + 1) % this.allActivities.length;

      return newItems;
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
