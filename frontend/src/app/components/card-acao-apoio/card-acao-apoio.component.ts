import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaTerritorial } from '../../models/alerta.model';

@Component({
  selector: 'app-card-acao-apoio',
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
        class="rounded-3xl bg-slate-900/95 border-2 border-slate-700/90 p-6 sm:p-8 shadow-xl"
        aria-label="Instruções de segurança e ponto de apoio mais próximo"
      >
        <!-- Cabeçalho do Card -->
        <div class="flex items-start sm:items-center gap-3.5 mb-5">
          <div class="p-3 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="text-xl sm:text-2xl font-black text-white leading-tight">
              O Que Fazer Agora
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Orientação direta de autoproteção comunitária e rota de abrigo
            </p>
          </div>
        </div>

        <!-- Orientação de Ação Segura -->
        <div class="mb-5 bg-slate-950/90 p-5 rounded-2xl border border-slate-800">
          <p class="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed">
            {{ alerta.acao_segura }}
          </p>
        </div>

        <!-- Rota de Fuga Hiperlocal Específica do Microterritório -->
        @if (alerta.rota_fuga_segura) {
          <div class="mb-5 p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-400/50 flex items-start gap-3.5">
            <div class="px-2.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 shrink-0 font-black text-xs tracking-wider">
              ROTA
            </div>
            <div class="min-w-0">
              <span class="block text-xs font-black uppercase text-amber-300 tracking-wider">
                Rota de Fuga Segura (Hiperlocal)
              </span>
              <p class="text-sm sm:text-base font-bold text-white mt-0.5 leading-snug">
                {{ alerta.rota_fuga_segura }}
              </p>
            </div>
          </div>
        }

        <!-- Ponto de Apoio Oficial da Prefeitura do Recife + Botões de Ação em Grid sem Quebra -->
        <div class="rounded-2xl bg-sky-950/50 border border-sky-500/40 p-5 sm:p-6">
          <div class="flex flex-col gap-1.5">
            <div class="inline-flex items-center gap-2">
              <span class="inline-block h-2 w-2 rounded-full bg-sky-400" aria-hidden="true"></span>
              <span class="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                Ponto de Apoio / Abrigo Oficial Mais Próximo (Dados Abertos Recife)
              </span>
            </div>

            <p class="text-lg sm:text-xl font-black text-white leading-snug mt-0.5 break-words">
              {{ alerta.ponto_apoio }}
            </p>

            @if (alerta.fator_vulnerabilidade) {
              <p class="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                <strong class="text-sky-200">Atenção territorial:</strong> {{ alerta.fator_vulnerabilidade }}
              </p>
            }
          </div>

          <!-- Grid Responsivo de 4 Botões (Malha P2P Offline, Mapa, WhatsApp, 199) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-sky-400/20">
            <button
              type="button"
              (click)="abrirCompartilhamento.emit()"
              class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-extrabold text-sm bg-amber-400 text-slate-950 hover:bg-amber-300 transition shadow-sm text-center cursor-pointer"
              aria-label="Compartilhar este alerta sem internet via QR Code ou SMS"
            >
              <span>⚡ Malha Offline</span>
            </button>

            <a
              [href]="obterLinkMapa(alerta.ponto_apoio, alerta.territorio)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-extrabold text-sm bg-sky-400 text-slate-950 hover:bg-sky-300 transition shadow-sm text-center"
              aria-label="Ver rota no mapa até o ponto de apoio mais próximo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>Ver no Mapa</span>
            </a>

            <a
              [href]="obterLinkWhatsApp(alerta)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-extrabold text-sm bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition shadow-sm text-center"
              aria-label="Compartilhar este alerta no grupo de WhatsApp da comunidade"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            <a
              href="tel:199"
              class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-extrabold text-sm bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-600 transition shadow-sm text-center"
              aria-label="Ligar 199 para a Defesa Civil do Recife"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              <span>Ligar 199</span>
            </a>
          </div>
        </div>
      </section>
    }
  `,
})
export class CardAcaoApoioComponent {
  @Input({ required: true }) alerta!: AlertaTerritorial;
  @Output() abrirCompartilhamento = new EventEmitter<void>();

  obterLinkMapa(pontoApoio: string, territorio: string): string {
    const query = encodeURIComponent(`${pontoApoio}, ${territorio}, Recife - PE`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  obterLinkWhatsApp(alerta: AlertaTerritorial): string {
    const origem =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://recifeseguro-five.vercel.app';
    const local = alerta.microterritorio || alerta.territorio;
    const texto = [
      `🚨 *Recife Seguro (T.A.D.C.) — ${local}*`,
      `Nível de Risco: *${alerta.nivel_risco}* (${alerta.precipitacao_mm.toFixed(1)} mm/h)`,
      '',
      alerta.alerta_humanizado,
      '',
      `🏫 *Ponto de Apoio:* ${alerta.ponto_apoio}`,
      `📞 *Emergência Defesa Civil:* 199`,
      `🔗 *Acompanhe o alerta do bairro:* ${origem}/?territorio=${alerta.territorio_id}`,
    ].join('\n');
    return `https://wa.me/?text=${encodeURIComponent(texto)}`;
  }
}
