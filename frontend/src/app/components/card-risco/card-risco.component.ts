import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaTerritorial } from '../../models/alerta.model';

@Component({
  selector: 'app-card-risco',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (alerta) {
      <section
        [ngClass]="obterClassesContainer(alerta.nivel_risco)"
        class="rounded-2xl border-2 p-5 sm:p-6 shadow-xl transition-all duration-300"
        role="region"
        aria-live="polite"
        aria-label="Semáforo de risco climático atual"
      >
        <!-- Topo do Semáforo: Selo de Nível de Risco + Ecossistema -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-2.5">
            <span
              [ngClass]="obterClassesPontoSemaforo(alerta.nivel_risco)"
              class="inline-block h-4 w-4 rounded-full ring-4"
              aria-hidden="true"
            ></span>
            <span
              [ngClass]="obterClassesBadge(alerta.nivel_risco)"
              class="px-3.5 py-1 rounded-full text-sm sm:text-base font-extrabold tracking-wider uppercase"
            >
              RISCO {{ alerta.nivel_risco }}
            </span>
          </div>

          <span class="text-xs sm:text-sm font-semibold px-3 py-1 rounded-lg bg-black/30 text-white border border-white/15">
            Ecossistema: {{ alerta.ecossistema }}
          </span>
        </div>

        <!-- Localidade e Indicadores Climáticos -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 pb-4 border-b border-white/20">
          <div>
            <p class="text-xs uppercase tracking-widest text-white/80 font-semibold">
              Território Monitorado
            </p>
            <h2 class="text-2xl sm:text-3xl font-black text-white leading-tight mt-0.5">
              {{ alerta.territorio }}
            </h2>
          </div>

          <div class="flex items-center gap-3">
            <div
              class="bg-black/35 border border-white/15 rounded-xl px-3.5 py-2 text-center min-w-[105px]"
              aria-label="Volume de chuva atual em milímetros por hora"
            >
              <span class="block text-xs uppercase text-white/80 font-medium">Chuva Agora</span>
              <span class="text-xl sm:text-2xl font-black text-white">
                {{ alerta.precipitacao_mm | number:'1.1-1' }} <small class="text-xs font-bold">mm/h</small>
              </span>
            </div>

            <div
              class="bg-black/35 border border-white/15 rounded-xl px-3.5 py-2 text-center min-w-[90px]"
              aria-label="Temperatura atual em graus Celsius"
            >
              <span class="block text-xs uppercase text-white/80 font-medium">Temp.</span>
              <span class="text-xl sm:text-2xl font-black text-white">
                {{ alerta.temperatura_c | number:'1.0-1' }}<small class="text-sm font-bold">°C</small>
              </span>
            </div>
          </div>
        </div>

        <!-- Mensagem Traduzida pela IA (Fonte >= 18px para leitura rápida < 3s) -->
        <div class="mb-5">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-xs font-bold uppercase tracking-wider text-white/90 bg-black/30 px-2.5 py-0.5 rounded">
              Tradução T.A.D.C. (Linguagem Acessível)
            </span>
          </div>
          <p class="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {{ alerta.alerta_humanizado }}
          </p>
        </div>

        <!-- Botão de Acessibilidade: Leitura em Voz Alta (pt-BR) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            (click)="alternarVoz.emit()"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-extrabold text-base bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.99] transition shadow-lg cursor-pointer"
            [attr.aria-label]="lendoEmVozAlta ? 'Parar leitura em voz alta do alerta' : 'Ouvir alerta em voz alta'"
          >
            @if (lendoEmVozAlta) {
              <span class="inline-block h-3 w-3 rounded-sm bg-red-600 animate-ping" aria-hidden="true"></span>
              <span>Parar Leitura em Voz Alta</span>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
              </svg>
              <span>Ouvir Alerta em Voz Alta</span>
            }
          </button>

          <span class="text-xs text-white/80 font-medium text-right">
            Compreensão em &lt; 3s • Auditado p/ Defesa Civil
          </span>
        </div>
      </section>
    }
  `,
})
export class CardRiscoComponent {
  @Input({ required: true }) alerta!: AlertaTerritorial;
  @Input() lendoEmVozAlta = false;
  @Output() alternarVoz = new EventEmitter<void>();

  obterClassesContainer(nivel: string): string {
    switch (nivel?.toUpperCase()) {
      case 'CRÍTICO':
        return 'bg-red-900 border-red-400 shadow-red-950/60';
      case 'MODERADO':
        return 'bg-amber-800 border-amber-300 shadow-amber-950/60';
      default:
        return 'bg-emerald-900 border-emerald-400 shadow-emerald-950/60';
    }
  }

  obterClassesPontoSemaforo(nivel: string): string {
    switch (nivel?.toUpperCase()) {
      case 'CRÍTICO':
        return 'bg-red-400 ring-red-300/40 animate-pulse';
      case 'MODERADO':
        return 'bg-amber-300 ring-amber-200/40 animate-pulse';
      default:
        return 'bg-emerald-400 ring-emerald-300/40';
    }
  }

  obterClassesBadge(nivel: string): string {
    switch (nivel?.toUpperCase()) {
      case 'CRÍTICO':
        return 'bg-white text-red-950';
      case 'MODERADO':
        return 'bg-amber-200 text-amber-950';
      default:
        return 'bg-emerald-200 text-emerald-950';
    }
  }
}

