import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaTerritorial } from '../../models/alerta.model';

@Component({
  selector: 'app-card-acao-apoio',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (alerta) {
      <section
        class="rounded-2xl bg-slate-900 border-2 border-slate-700 p-5 sm:p-6 shadow-lg"
        aria-label="Instruções de segurança e ponto de apoio mais próximo"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg sm:text-xl font-extrabold text-white">
              O Que Fazer Agora
            </h3>
            <p class="text-xs sm:text-sm text-slate-300">
              Orientação direta de autoproteção comunitária
            </p>
          </div>
        </div>

        <p class="text-base sm:text-lg font-medium text-slate-100 leading-relaxed mb-5 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          {{ alerta.acao_segura }}
        </p>

        <!-- Ponto de Apoio Oficial da Prefeitura do Recife -->
        <div class="rounded-xl bg-sky-950/60 border border-sky-500/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="inline-block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
              Ponto de Apoio / Abrigo Mais Próximo
            </span>
            <p class="text-base sm:text-lg font-extrabold text-white">
              {{ alerta.ponto_apoio }}
            </p>
            @if (alerta.fator_vulnerabilidade) {
              <p class="text-xs sm:text-sm text-slate-300 mt-1">
                Atenção local: {{ alerta.fator_vulnerabilidade }}
              </p>
            }
          </div>

          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              [href]="obterLinkMapa(alerta.ponto_apoio, alerta.territorio)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-sky-400 text-slate-950 hover:bg-sky-300 transition"
              aria-label="Ver rota no mapa até o ponto de apoio mais próximo"
            >
              <span>Ver no Mapa</span>
            </a>

            <a
              href="tel:199"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
              aria-label="Ligar 199 para a Defesa Civil do Recife"
            >
              <span>Ligar 199 (Defesa Civil)</span>
            </a>
          </div>
        </div>
      </section>
    }
  `,
})
export class CardAcaoApoioComponent {
  @Input({ required: true }) alerta!: AlertaTerritorial;

  obterLinkMapa(pontoApoio: string, territorio: string): string {
    const query = encodeURIComponent(`${pontoApoio}, ${territorio}, Recife - PE`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
}

