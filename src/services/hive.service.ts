
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';

// --- Interfaces for API responses ---
interface DynamicGlobalProperties {
  total_vesting_fund_hive: string;
  total_vesting_shares: string;
  hbd_interest_rate: number;
  head_block_number: number;
  num_accounts: number;
  current_supply: string;
}

interface MedianHistoryPrice {
  base: string; // e.g., "1.234 HBD"
  quote: string; // e.g., "1.000 HIVE"
}

interface JsonRpcResponse<T> {
  result: T;
}

// --- Combined Stats Interface for the Component ---
export interface HiveStats {
    hivePrice: number;
    stakedHive: number;
    hbdInterestRate: number;
    totalSupply: number;
    percentStaked: number;
}

@Injectable({ providedIn: 'root' })
export class HiveService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://api.hive.blog';

  private createRequest<T>(method: string, params: any[] = []): Observable<T> {
    const body = {
      jsonrpc: '2.0',
      method,
      params,
      id: 1,
    };
    return this.http.post<JsonRpcResponse<T>>(this.API_URL, body).pipe(map(response => response.result));
  }

  getBlockchainStats(): Observable<HiveStats> {
    return forkJoin({
      globals: this.createRequest<DynamicGlobalProperties>('condenser_api.get_dynamic_global_properties'),
      price: this.createRequest<MedianHistoryPrice>('condenser_api.get_current_median_history_price'),
    }).pipe(
      map(({ globals, price }) => {
        const hivePrice = parseFloat(price.base.split(' ')[0]) / parseFloat(price.quote.split(' ')[0]);
        const stakedHive = parseFloat(globals.total_vesting_fund_hive.split(' ')[0]);
        const totalSupply = parseFloat(globals.current_supply.split(' ')[0]);
        const percentStaked = (stakedHive / totalSupply) * 100;

        return {
          hivePrice,
          stakedHive,
          hbdInterestRate: globals.hbd_interest_rate / 100, // Convert from basis points
          totalSupply,
          percentStaked
        };
      })
    );
  }
}