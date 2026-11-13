import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaTerritorial } from '../../models/alerta.model';

@Component({
  selector: 'app-card-risco',
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
        [ngClass]="obterClassesContainer(alerta.nivel_risco)"
        class="rounded-3xl border-2 p-6 sm:p-8 shadow-2xl transition-all duration-300 relative overflow-hidden"
        role="region"
        aria-live="polite"
        aria-label="Semáforo de risco climático atual"
      >
        <!-- 1. Topo do Semáforo: Selo de Nível de Risco + Ecossistema -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-white/15">
          <div class="inline-flex items-center gap-3">
            <span
              [ngClass]="obterClassesPontoSemaforo(alerta.nivel_risco)"
              class="inline-block h-4 w-4 rounded-full ring-4 shrink-0"
              aria-hidden="true"
            ></span>
            <span
              [ngClass]="obterClassesBadge(alerta.nivel_risco)"
              class="px-4 py-1.5 rounded-full text-sm sm:text-base font-black tracking-wider uppercase shadow-sm"
            >
              RISCO {{ alerta.nivel_risco }}
            </span>
          </div>

          <span class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl bg-black/35 text-white border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span>{{ alerta.ecossistema }}</span>
          </span>
        </div>

        <!-- 2. Localidade e Indicadores Climáticos sem quebra de texto -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mb-6">
          <div class="md:col-span-7 min-w-0">
            <p class="text-xs uppercase tracking-widest text-white/80 font-bold mb-1">
              Território Monitorado em Tempo Real
            </p>
            <h2 class="text-2xl sm:text-3xl font-black text-white leading-snug break-words">
              {{ alerta.territorio }}
            </h2>
          </div>

          <div class="md:col-span-5 grid grid-cols-2 gap-3">
            <div
              class="bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-center flex flex-col justify-center"
              aria-label="Volume de chuva atual em milímetros por hora"
            >
              <span class="block text-[11px] uppercase tracking-wider text-white/80 font-bold mb-0.5">
                Chuva Agora
              </span>
              <span class="text-xl sm:text-2xl font-black text-white whitespace-nowrap">
                {{ alerta.precipitacao_mm | number:'1.1-1' }}
                <small class="text-xs font-extrabold text-white/90">mm/h</small>
              </span>
            </div>

            <div
              class="bg-black/40 border border-white/20 rounded-2xl px-4 py-3 text-center flex flex-col justify-center"
              aria-label="Temperatura atual em graus Celsius"
            >
              <span class="block text-[11px] uppercase tracking-wider text-white/80 font-bold mb-0.5">
                Temperatura
              </span>
              <span class="text-xl sm:text-2xl font-black text-white whitespace-nowrap">
                {{ alerta.temperatura_c | number:'1.0-1' }}<small class="text-sm font-extrabold text-white/90">°C</small>
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Caixa de Mensagem Traduzida pela IA (Destaque principal para leitura < 3s) -->
        <div class="rounded-2xl bg-black/35 border border-white/20 p-5 sm:p-6 mb-6">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span class="text-xs font-extrabold uppercase tracking-wider text-white bg-white/15 px-3 py-1 rounded-lg">
              Tradução T.A.D.C. • Linguagem Cidadã
            </span>
            <span class="text-xs font-bold text-white/95 bg-black/45 border border-white/20 px-3 py-1 rounded-lg">
              {{ alerta.fonte_ia === 'gemini_ia' ? '✨ Google Gemini IA + Trava Determinística' : '🛡️ Guardrail Determinístico Validado' }}
            </span>
          </div>

          <p class="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {{ alerta.alerta_humanizado }}
          </p>
        </div>

        <!-- 4. Rodapé do Card: Botão de Leitura em Voz Alta (pt-BR) + Metadado -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            (click)="alternarVoz.emit()"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-extrabold text-base bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.99] transition shadow-lg cursor-pointer"
            [attr.aria-label]="lendoEmVozAlta ? 'Parar leitura em voz alta do alerta' : 'Ouvir alerta em voz alta'"
          >
            @if (lendoEmVozAlta) {
              <span class="inline-block h-3.5 w-3.5 rounded-sm bg-red-600 animate-ping shrink-0" aria-hidden="true"></span>
              <span>Parar Leitura em Voz Alta</span>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-slate-900" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
              </svg>
              <span>Ouvir Alerta em Voz Alta</span>
            }
          </button>

          <span class="text-xs sm:text-sm text-white/85 font-semibold sm:text-right">
            Compreensão em &lt; 3s • Acessibilidade Universal (pt-BR)
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
        return 'bg-gradient-to-br from-red-900 via-red-900 to-rose-950 border-red-400 shadow-red-950/50';
      case 'MODERADO':
        return 'bg-gradient-to-br from-amber-800 via-amber-800 to-yellow-950 border-amber-300 shadow-amber-950/50';
      default:
        return 'bg-gradient-to-br from-emerald-900 via-emerald-900 to-teal-950 border-emerald-400 shadow-emerald-950/50';
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
