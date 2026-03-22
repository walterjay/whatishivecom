
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { HiveService, HiveStats } from '../../services/hive.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-stats',
  template: `
<div class="max-w-5xl mx-auto">
    @if (isLoading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            @for (_ of [1,2,3,4,5,6]; track _) {
                <div class="bg-gray-800/50 rounded-lg p-6 animate-pulse">
                    <div class="h-8 w-8 bg-gray-700 rounded-full mx-auto mb-4"></div>
                    <div class="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                    <div class="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
            }
        </div>
    } @else if (error()) {
        <div class="text-center bg-red-900/50 border border-red-700 text-red-300 p-6 rounded-lg">
            <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <p class="font-bold">An Error Occurred</p>
            <p>{{ error() }}</p>
        </div>
    } @else if (stats(); as s) {
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 text-center">
            <!-- Hive Price -->
            <div class="bg-gray-800/50 p-6 rounded-lg border border-transparent hover:border-red-500/50 transition-colors">
                <div class="text-red-400 text-3xl mb-3"><i class="fas fa-dollar-sign"></i></div>
                <div class="text-3xl font-bold text-white">{{ formatCurrency(s.hivePrice, 3) }}</div>
                <div class="text-gray-400">Current HIVE Price</div>
            </div>

            <!-- Total Accounts -->
            <div class="bg-gray-800/50 p-6 rounded-lg border border-transparent hover:border-red-500/50 transition-colors">
                <div class="text-blue-400 text-3xl mb-3"><i class="fas fa-users"></i></div>
                <div class="text-3xl font-bold text-white">&gt; 2.5 Million</div>
                <div class="text-gray-400">Total Accounts</div>
            </div>

            <!-- Total HIVE Supply -->
            <div class="bg-gray-800/50 p-6 rounded-lg border border-transparent hover:border-red-500/50 transition-colors">
                <div class="text-yellow-400 text-3xl mb-3"><i class="fas fa-coins"></i></div>
                <div class="text-3xl font-bold text-white">{{ formatNumber(s.totalSupply) }}</div>
                <div class="text-gray-400">Total HIVE Supply</div>
            </div>

            <!-- HIVE Staked -->
            <div class="bg-gray-800/50 p-6 rounded-lg border border-transparent hover:border-red-500/50 transition-colors">
                <div class="text-purple-400 text-3xl mb-3"><i class="fas fa-lock"></i></div>
                <div class="text-3xl font-bold text-white">{{ formatNumber(s.stakedHive) }}</div>
                <div class="text-gray-400">HIVE Staked</div>
            </div>

            <!-- % of HIVE Staked -->
            <div class="bg-gray-800/50 p-6 rounded-lg border border-transparent hover:border-red-500/50 transition-colors">
                <div class="text-indigo-400 text-3xl mb-3"><i class="fas fa-chart-pie"></i></div>
                <div class="text-3xl font-bold text-white">{{ formatPercent(s.percentStaked) }}</div>
                <div class="text-gray-400">% of HIVE Staked</div>
            </div>
            
            <!-- HBD Savings APR -->
            <div class="bg-gray-800/50 p-6 rounded-lg border border-transparent hover:border-red-500/50 transition-colors">
                <div class="text-green-400 text-3xl mb-3"><i class="fas fa-piggy-bank"></i></div>
                <div class="text-3xl font-bold text-white">{{ formatPercent(s.hbdInterestRate) }}</div>
                <div class="text-gray-400">HBD Savings APR</div>
            </div>
        </div>
    }
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent implements OnInit {
  private hiveService = inject(HiveService);

  stats = signal<HiveStats | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.hiveService.getBlockchainStats().pipe(
      catchError(err => {
        console.error('Failed to fetch Hive stats:', err);
        this.error.set('Could not load blockchain data. Please try again later.');
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        this.stats.set(data);
      }
      this.isLoading.set(false);
    });
  }

  formatNumber(value: number | undefined): string {
    if (value === undefined) return '...';
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  formatCurrency(value: number | undefined, maximumFractionDigits = 0): string {
    if (value === undefined) return '...';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits
    });
  }

  formatPercent(value: number | undefined): string {
    if (value === undefined) return '...';
    return `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
  }
}
