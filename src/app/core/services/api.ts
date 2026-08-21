import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Device, RawDevice } from '../models/device';

@Injectable({ providedIn: 'root' })
export class ApiService {
	private readonly devicesUrl = '/devices.json';
	
	constructor(private readonly http: HttpClient) { }

	public searchDevices(query: string): Observable<Device[]> {
		const normalizedQuery = query.toLowerCase();

		return this.http.get<RawDevice[]>(this.devicesUrl).pipe(
			map((rawDevices) => this.normalizeDevices(rawDevices)),
			map((devices) =>
				devices.filter(
					(device) =>
						device.name.toLowerCase().includes(normalizedQuery) ||
						device.code.toLowerCase().includes(normalizedQuery)
				)
			),
			catchError(() => of([]))
		);
	}

	private normalizeDevices(rawDevices: RawDevice[]): Device[] {
		const devicesById = new Map<string, Device>();

		for (const rawDevice of rawDevices) {
			const id = rawDevice.id?.trim().toLowerCase() || rawDevice.code?.trim().toLowerCase();
			const code = rawDevice.code?.trim().toLowerCase();

			if (!id && !code) {
				continue;
			}

			devicesById.set(id || code!, {
				id: id || code!,
				code: code || 'unknown code',
				name: rawDevice.name?.trim() || 'Unknown Device',
				type: rawDevice.type?.trim() || 'Unknown Type',
				area: rawDevice.area?.trim() || 'Unknown Area',
				status: this.normalizeStatus(rawDevice.status),
				lastSeen: rawDevice.lastSeen,
				vendor: rawDevice.vendor?.trim() || 'Unknown Vendor',
			});
		}

		return Array.from(devicesById.values());
	}

	private normalizeStatus(status: string | null): Device['status'] {
		switch (status?.trim().toLowerCase()) {
			case 'running':
				return 'running';
			case 'stopped':
				return 'stopped';
			case 'fault':
				return 'fault';
			default:
				return 'unknown';
		}
	}
}
