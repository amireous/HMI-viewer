import { Injectable, signal } from '@angular/core';

export interface ModalState {
    isOpen: boolean;
    x: number;
    y: number;
    attributes: { name: string; value: string; }[];
    selectedElement: any | null;
}

@Injectable({ providedIn: 'root' })
export class SvgStateService {
    modalState = signal<ModalState>({
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
}