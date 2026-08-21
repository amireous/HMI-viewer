import { Injectable, signal } from '@angular/core';
import { Device } from '../models/device';

export interface ModalState {
    isOpen: boolean;
    x: number;
    y: number;
    attributes: { name: string; value: string; }[];
    selectedElement: any | null;
}

@Injectable({ providedIn: 'root' })
export class SvgStateService {
    readonly selectedDeviceId = signal<string | null>(null);
    readonly recentSelections = signal<Device[]>([]);
    readonly previewMode = signal<boolean>(false);

    readonly modalState = signal<ModalState>({
        isOpen: false,
        x: 0,
        y: 0,
        attributes: [],
        selectedElement: null
    });

    openModal(state: Omit<ModalState, 'isOpen'>) {
        this.modalState.set({ ...state, isOpen: true });
    }

    closeModal() {
        this.modalState.update(s => ({ ...s, isOpen: false, selectedElement: null }));
    }

    selectDevice(device: Device) {
        this.selectedDeviceId.set(device.id);

        this.recentSelections.update(current => {
            const filtered = current.filter(d => d.id !== device.id);
            return [device, ...filtered].slice(0, 5);
        });
    }

    togglePreviewMode() {
        this.previewMode.update(val => !val);

        if (this.previewMode()) {
            this.closeModal();
        }
    }
}