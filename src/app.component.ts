
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FeatureCardComponent, Feature } from './components/feature-card/feature-card.component';
import { HiveExplainerComponent } from './components/hive-explainer/hive-explainer.component';
import { LiveFeedComponent } from './components/live-feed/live-feed.component';
import { StatsComponent } from './components/stats/stats.component';

interface Project {
  name: string;
  description: string;
  url: string;
  logo?: string;
}

@Component({
  selector: 'app-root',
  template: `
<div class="min-h-screen bg-gray-900 text-white flex flex-col">
  <app-header></app-header>

  <main class="flex-grow">
    <!-- Hero Section -->
    <section class="hero-bg text-center py-24 px-4">
      <h1 class="text-5xl md:text-6xl font-bold mb-4 tracking-tight">Unleash Your Voice. <span class="text-red-400">Unlock Your Value.</span></h1>
      <p class="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">Welcome to Hive: a decentralized, censorship-resistant social blockchain where you own your content and earn rewards for your creativity.</p>
      <a href="#explainer" (click)="scrollTo($event, 'explainer')" class="mt-8 inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 duration-300">
        Start Exploring
      </a>
    </section>

    <!-- Stats Section -->
    <section id="stats" class="py-20 bg-black bg-opacity-40 scroll-mt-20">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-4">Hive by the Numbers</h2>
        <p class="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Hive is a living, breathing economy. See the latest stats pulled directly from the blockchain.</p>
        <app-stats></app-stats>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-gray-900 scroll-mt-20">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">What makes Hive different?</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          @for (feature of features; track feature.title) {
            <app-feature-card [feature]="feature"></app-feature-card>
          }
        </div>
      </div>
    </section>

    <!-- Learn More Section -->
    <section id="learn-more" class="py-20 bg-black bg-opacity-40 scroll-mt-20">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-4">Explore the Official Documentation</h2>
            <p class="text-gray-400 max-w-2xl mx-auto mb-8">Delve deeper into the Hive blockchain. Find comprehensive developer documentation, read about its history, and explore the core principles that power the ecosystem.</p>
            <a href="https://hive.io" target="_blank" rel="noopener noreferrer" class="inline-block bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 duration-300">
                Visit Hive.io
            </a>
        </div>
    </section>
    
    <!-- Live Feed Section -->
    <section id="live-feed" class="py-20 bg-gray-900 scroll-mt-20">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-4">See Hive in Action</h2>
            <p class="text-center text-gray-400 mb-12 max-w-2xl mx-auto">The Hive ecosystem is constantly buzzing with activity. Here are some examples of the actions you'll see across the network.</p>
            <app-live-feed></app-live-feed>
        </div>
    </section>

    <!-- Interactive Explainer Section -->
    <section id="explainer" class="py-20 bg-black bg-opacity-20 scroll-mt-20">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-4">Have Questions?</h2>
            <p class="text-center text-gray-400 mb-12 max-w-2xl mx-auto">Use our AI assistant to learn about Hive in simple terms. Ask anything you're curious about!</p>
            <app-hive-explainer></app-hive-explainer>
        </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="py-20 bg-gray-900 scroll-mt-20">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12">Dive into the Ecosystem</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                @for (project of projects; track project.name) {
                    <a [href]="project.url" target="_blank" rel="noopener noreferrer" class="block bg-gray-800 rounded-lg p-6 hover:bg-red-500/10 border border-transparent hover:border-red-500 transition-all duration-300 group">
                        <div class="flex items-center mb-3">
                            @if (project.logo) {
                                <img [ngSrc]="project.logo" alt="{{ project.name }} logo" class="w-8 h-8 mr-4 rounded-full" width="32" height="32">
                            }
                            <h3 class="text-xl font-bold text-white">{{ project.name }}</h3>
                        </div>
                        <p class="text-gray-400 group-hover:text-gray-300">{{ project.description }}</p>
                    </a>
                }
            </div>
        </div>
    </section>

    <!-- Call to Action -->
    <section class="text-center py-20 px-4 bg-red-600">
        <h2 class="text-3xl font-bold mb-4">Ready to Join?</h2>
        <p class="text-red-100 max-w-2xl mx-auto mb-8">Create your Hive account today and start your journey on the decentralized web. It's free and takes just a few minutes.</p>
        <a href="https://signup.hive.io/" target="_blank" rel="noopener noreferrer" class="inline-block bg-white text-red-600 font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 duration-300">
            Create an Account
        </a>
    </section>

  </main>

  <app-footer></app-footer>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, FeatureCardComponent, HiveExplainerComponent, LiveFeedComponent, StatsComponent, NgOptimizedImage]
})
export class AppComponent {
  features: Feature[] = [
    {
      icon: 'fas fa-comments',
      title: 'Own Your Voice',
      description: 'On Hive, your content is truly yours. Create, share, and engage without censorship or fear of being de-platformed.'
    },
    {
      icon: 'fas fa-coins',
      title: 'Earn Rewards',
      description: 'Get rewarded for creating and curating content. Your engagement has real value, paid out in cryptocurrency.'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Lightning Fast & Free',
      description: 'Experience a decentralized network with fast, feeless transactions. No more waiting or paying high fees.'
    },
     {
      icon: 'fas fa-users',
      title: 'Thriving Communities',
      description: 'Find your niche! From gaming and art to finance and travel, there is a community for every passion on Hive.'
    }
  ];

  projects: Project[] = [
    {
      name: 'PeakD',
      description: 'A popular, feature-rich interface for the Hive social network.',
      url: 'https://peakd.com',
      logo: 'https://peakd.com/favicon.ico'
    },
    {
      name: 'Ecency',
      description: 'A mobile-friendly and rewarding way to interact with Hive.',
      url: 'https://ecency.com',
      logo: 'https://ecency.com/favicon.ico'
    },
    {
      name: 'Splinterlands',
      description: 'The hit blockchain trading card game. Play, trade, and earn.',
      url: 'https://splinterlands.com',
    },
    {
      name: '3Speak',
      description: 'A decentralized video platform that champions free speech.',
      url: 'https://3speak.tv',
    },
    {
      name: 'LeoFinance',
      description: 'A community for finance and investing enthusiasts on the blockchain.',
      url: 'https://leofinance.io',
      logo: 'https://leofinance.io/favicon.ico'
    },
    {
      name: 'Liketu',
      description: 'Share your photos and moments on a decentralized platform.',
      url: 'https://liketu.com/',
      logo: 'https://liketu.com/favicon.ico'
    },
    {
      name: 'D.Buzz',
      description: 'Microblogging on Hive. Share your short-form thoughts with the world.',
      url: 'https://d.buzz/',
      logo: 'https://d.buzz/favicon.ico'
    },
    {
      name: 'HiveBlocks',
      description: 'Explore the Hive blockchain with this powerful block explorer.',
      url: 'https://hiveblocks.com',
    },
    {
      name: 'HiveKPI',
      description: 'Key Performance Indicators and statistics for the Hive blockchain.',
      url: 'https://hivekpi.com',
      logo: 'https://hivekpi.com/favicon.ico'
    },
    {
      name: 'HiveProjects.io',
      description: 'A directory of apps, tools, and services built by the Hive community.',
      url: 'https://hiveprojects.io',
    }
  ];

  scrollTo(event: MouseEvent, elementId: string): void {
    event.preventDefault();
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}