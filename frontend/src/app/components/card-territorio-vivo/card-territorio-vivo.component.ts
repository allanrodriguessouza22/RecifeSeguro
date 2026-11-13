import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaTerritorial } from '../../models/alerta.model';

@Component({
  selector: 'app-card-territorio-vivo',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
  template: `
    @if (alerta) {
      <section
        class="rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-2 border-emerald-600/50 p-6 sm:p-8 shadow-xl"
        aria-label="Cuidando do nosso território: mangues, rios e encostas"
      >
        <div class="flex items-start sm:items-center justify-between flex-wrap gap-3 mb-5">
          <div class="flex items-center gap-3.5">
            <div class="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl sm:text-2xl font-black text-white leading-tight">
                Cuidando do Nosso Território
              </h3>
              <p class="text-xs sm:text-sm text-emerald-200/90 font-medium mt-0.5">
                Antena na Lama • Proteção de Mangues, Rios, Córregos e Encostas
              </p>
            </div>
          </div>

          <span class="text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-xl bg-emerald-900/90 text-emerald-200 border border-emerald-500/40">
            ODS 6 • ODS 11 • ODS 13
          </span>
        </div>

        <div class="bg-slate-950/80 p-5 rounded-2xl border border-emerald-800/60">
          <p class="text-base sm:text-lg font-medium text-emerald-50 leading-relaxed">
            {{ alerta.cuidado_ambiental }}
          </p>
        </div>
      </section>
    }
  `,
})
export class CardTerritorioVivoComponent {
  @Input({ required: true }) alerta!: AlertaTerritorial;
}
