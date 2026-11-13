import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertaService, TERRITORIOS_PADRAO } from './services/alerta.service';
import { AlertaTerritorial, Territorio } from './models/alerta.model';
import { CardRiscoComponent } from './components/card-risco/card-risco.component';
import { CardAcaoApoioComponent } from './components/card-acao-apoio/card-acao-apoio.component';
import { CardTerritorioVivoComponent } from './components/card-territorio-vivo/card-territorio-vivo.component';
import { ModalCompartilharOfflineComponent } from './components/modal-compartilhar-offline/modal-compartilhar-offline.component';
import { MapaTerritorialComponent } from './components/mapa-territorial/mapa-territorial.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardRiscoComponent,
    CardAcaoApoioComponent,
    CardTerritorioVivoComponent,
    ModalCompartilharOfflineComponent,
    MapaTerritorialComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-between">
      <!-- 1. CABEÇALHO TÁTICO COMPACTO E FIXO COM STATUS ONLINE/OFFLINE E MALHA P2P -->
      <header class="border-b border-slate-800/90 bg-slate-950/90 sticky top-0 z-30 backdrop-blur-md">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-3.5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/80 shrink-0"
                aria-hidden="true"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <div class="min-w-0">
                <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                  Recife Seguro
                </h1>
                <p class="text-xs sm:text-sm text-emerald-300 font-semibold mt-1 truncate">
                  T.A.D.C. • Mapa Interativo & Malha de Emergência Offline
                </p>
              </div>
            </div>

            <!-- Controles de Conexão (Pitch) e Malha P2P -->
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              @if (modoSimulacaoAtivo) {
                <span class="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-400 text-slate-950 shadow-sm">
                  Modo Simulação
                </span>
              }

              <button
                type="button"
                (click)="alternarQuedaRedeSimulada()"
                [attr.aria-pressed]="modoQuedaRedeSimulado"
                [ngClass]="conexaoAtiva
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 hover:border-emerald-400'
                  : 'bg-red-950/90 text-red-200 border-red-500/70 hover:border-red-400 animate-pulse'"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer"
                title="Clique para simular queda de internet para o Pitch"
              >
                <span
                  [ngClass]="conexaoAtiva ? 'bg-emerald-400' : 'bg-red-400'"
                  class="h-2.5 w-2.5 rounded-full shrink-0"
                  aria-hidden="true"
                ></span>
                <span>{{ conexaoAtiva ? 'Online • Open-Meteo' : 'Offline • Sem Sinal' }}</span>
              </button>

              <button
                type="button"
                (click)="abrirModalP2P()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 hover:bg-amber-300 shadow cursor-pointer transition"
                aria-label="Abrir central de transmissão sem internet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                </svg>
                <span>Malha P2P</span>
              </button>
            </div>
          </div>

          <!-- BANNER ATIVO QUANDO OFFLINE OU SEM SINAL (MODO EMERGÊNCIA REAL) -->
          @if (!conexaoAtiva) {
            <div
              class="mt-3 p-3.5 rounded-2xl bg-amber-950/90 border-2 border-amber-500/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in"
              role="alert"
            >
              <div class="flex items-center gap-2.5">
                <span class="h-3 w-3 rounded-full bg-amber-400 shrink-0 animate-ping" aria-hidden="true"></span>
                <div>
                  <p class="text-xs sm:text-sm font-black text-amber-200 leading-tight">
                    MODO EMERGÊNCIA SEM INTERNET ATIVO
                  </p>
                  <p class="text-xs text-amber-300/90 mt-0.5">
                    Infraestrutura de rede inoperante. Abrigos e rotas de fuga salvos em cache local.
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="abrirModalP2P()"
                class="shrink-0 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-300 transition cursor-pointer"
              >
                Transmitir Alerta Offline (QR Code)
              </button>
            </div>
          }
        </div>
      </header>

      <!-- CONTEÚDO PRINCIPAL COM ESPAÇAMENTO GARANTIDO (FLEX COL GAP-6) -->
      <main class="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-7 flex-1">
        <!-- 1. MAPA INTERATIVO DO RECIFE -->
        <app-mapa-territorial
          [territorios]="territorios"
          [territorioSelecionadoId]="territorioSelecionadoId"
          [alertaAtual]="alertaAtual"
          (selecionarTerritorio)="selecionarTerritorio($event)"
        ></app-mapa-territorial>

        <!-- ESTADO DE CARREGAMENTO -->
        @if (carregando && !alertaAtual) {
          <div
            class="rounded-3xl bg-slate-900 border-2 border-slate-800 p-8 text-center animate-pulse"
            role="status"
            aria-live="polite"
          >
            <p class="text-lg font-bold text-emerald-300">
              Consultando sensores climáticos e traçando corredor de fuga...
            </p>
          </div>
        }

        <!-- CARDS PRINCIPAIS COM ESPAÇAMENTO CONSISTENTE -->
        @if (alertaAtual) {
          <div class="flex flex-col gap-6 sm:gap-7">
            <!-- 2. CARD PRINCIPAL DE RISCO (SEMÁFORO VISUAL + VOZ + MICROTERRITÓRIO) -->
            <app-card-risco
              [alerta]="alertaAtual"
              [lendoEmVozAlta]="lendoEmVozAlta"
              (alternarVoz)="alternarLeituraVozAlta()"
            ></app-card-risco>

            <!-- 3. CARD "O QUE FAZER AGORA" & PONTO DE APOIO COM ROTA HIPERLOCAL -->
            <app-card-acao-apoio
              [alerta]="alertaAtual"
              (abrirCompartilhamento)="abrirModalP2P()"
            ></app-card-acao-apoio>

            <!-- 4. CARD "CUIDANDO DO NOSSO TERRITÓRIO" (MANGUES, RIOS E ENCOSTAS) -->
            <app-card-territorio-vivo
              [alerta]="alertaAtual"
            ></app-card-territorio-vivo>
          </div>
        }
      </main>

      <!-- MODAL DE TRANSMISSÃO E RECEBIMENTO DE ALERTA SEM INTERNET (MALHA P2P) -->
      <app-modal-compartilhar-offline
        [aberto]="modalP2PAberto"
        [alerta]="alertaAtual"
        (fechar)="modalP2PAberto = false"
        (alertaSincronizado)="aoSincronizarAlertaOffline($event)"
      ></app-modal-compartilhar-offline>

      <!-- 5. RODAPÉ DE DEMONSTRAÇÃO PARA O PITCH (GRID ALINHADO DE 5 BOTÕES) -->
      <footer class="border-t border-slate-800 bg-slate-900/95 mt-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div class="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 sm:p-5">
            <div class="mb-3.5">
              <p class="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Modo Demonstração ao Vivo • Pitch Hackathon APONTI (Antena na Lama)
              </p>
              <p class="text-xs sm:text-sm text-slate-300 mt-0.5">
                Simule eventos climáticos extremos ao vivo para demonstrar a mudança do mapa, da IA e da malha offline:
              </p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <button
                type="button"
                (click)="atualizarTempoReal()"
                aria-label="Voltar para leitura climática em tempo real"
                class="px-3 py-2.5 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-600 transition cursor-pointer text-center"
              >
                Clima Real (0 mm/h)
              </button>

              <button
                type="button"
                (click)="simularChuvaModerada()"
                aria-label="Simular chuva moderada de 8.5 milímetros por hora"
                class="px-3 py-2.5 rounded-xl text-xs font-extrabold bg-amber-400 text-slate-950 hover:bg-amber-300 transition cursor-pointer text-center shadow-sm"
              >
                Atenção (8.5 mm/h)
              </button>

              <button
                type="button"
                (click)="simularChuvaForte()"
                aria-label="Simular chuva forte de 22.5 milímetros por hora"
                class="px-3 py-2.5 rounded-xl text-xs font-extrabold bg-red-500 text-white hover:bg-red-400 transition cursor-pointer text-center shadow-sm"
              >
                Chuva Forte (22.5 mm/h)
              </button>

              <button
                type="button"
                (click)="simularCriseExtrema()"
                aria-label="Acionar endpoint de crise extrema de 45 milímetros por hora"
                class="px-3 py-2.5 rounded-xl text-xs font-extrabold bg-rose-700 text-white hover:bg-rose-600 border border-rose-400/50 transition cursor-pointer text-center shadow-sm"
              >
                Crise Extrema (45 mm/h)
              </button>

              <button
                type="button"
                (click)="abrirModalP2P()"
                aria-label="Demonstrar malha P2P offline via QR Code"
                class="col-span-2 sm:col-span-1 px-3 py-2.5 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm transition cursor-pointer text-center"
              >
                ⚡ Malha P2P
              </button>
            </div>
          </div>

          <div class="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Inspirado no Manifesto Caranguejos com Cérebro (Manguebeat)</span>
            <span>Mapa Territorial Interativo • Malha P2P Offline • Google Gemini IA</span>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly alertaService = inject(AlertaService);

  territorios: Territorio[] = TERRITORIOS_PADRAO;
  territorioSelecionadoId = 3; // Inicia no Ibura (UR-02) para forte impacto inicial
  alertaAtual: AlertaTerritorial | null = null;
  carregando = false;
  estaOnlineNavegador = typeof navigator !== 'undefined' ? navigator.onLine : true;
  modoQuedaRedeSimulado = false;
  lendoEmVozAlta = false;
  modoSimulacaoAtivo = false;
  modalP2PAberto = false;
  private chuvaSimuladaAtual: number | null = null;

  get conexaoAtiva(): boolean {
    return this.estaOnlineNavegador && !this.modoQuedaRedeSimulado;
  }

  private readonly handleOnline = () => {
    this.estaOnlineNavegador = true;
  };

  private readonly handleOffline = () => {
    this.estaOnlineNavegador = false;
  };

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      const params = new URLSearchParams(window.location.search);
      const idUrl = Number(params.get('territorio'));
      if (idUrl >= 1 && idUrl <= 6) {
        this.territorioSelecionadoId = idUrl;
      }
    }

    this.alertaService.listarTerritorios().subscribe((lista) => {
      if (lista && lista.length > 0) {
        this.territorios = lista;
      }
      this.carregarAlerta(this.territorioSelecionadoId, null);
    });
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      this.pararLeituraVozAlta();
    }
  }

  alternarQuedaRedeSimulada(): void {
    this.modoQuedaRedeSimulado = !this.modoQuedaRedeSimulado;
    if (this.modoQuedaRedeSimulado) {
      if (this.alertaAtual) {
        this.alertaService.salvarCacheOffline(this.territorioSelecionadoId, this.alertaAtual);
      }
    }
  }

  abrirModalP2P(): void {
    this.modalP2PAberto = true;
  }

  aoSincronizarAlertaOffline(alerta: AlertaTerritorial): void {
    this.alertaAtual = alerta;
    if (alerta.territorio_id) {
      this.territorioSelecionadoId = alerta.territorio_id;
    }
    this.pararLeituraVozAlta();
  }

  selecionarTerritorio(id: number): void {
    this.territorioSelecionadoId = Number(id);
    this.pararLeituraVozAlta();
    this.carregarAlerta(this.territorioSelecionadoId, this.chuvaSimuladaAtual);
  }

  atualizarTempoReal(): void {
    this.modoSimulacaoAtivo = false;
    this.chuvaSimuladaAtual = null;
    this.pararLeituraVozAlta();
    this.carregarAlerta(this.territorioSelecionadoId, null);
  }

  simularChuvaModerada(): void {
    this.modoSimulacaoAtivo = true;
    this.chuvaSimuladaAtual = 8.5;
    this.pararLeituraVozAlta();
    this.carregarAlerta(this.territorioSelecionadoId, 8.5);
  }

  simularChuvaForte(): void {
    this.modoSimulacaoAtivo = true;
    this.chuvaSimuladaAtual = 22.5;
    this.pararLeituraVozAlta();
    this.carregarAlerta(this.territorioSelecionadoId, 22.5);
  }

  simularCriseExtrema(): void {
    this.modoSimulacaoAtivo = true;
    this.chuvaSimuladaAtual = 45.0;
    this.pararLeituraVozAlta();
    this.carregando = true;
    this.alertaService.simularCrisePitch(this.territorioSelecionadoId, 45.0).subscribe({
      next: (alerta) => {
        this.alertaAtual = alerta;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }

  private carregarAlerta(territorioId: number, simularChuva: number | null): void {
    this.carregando = true;
    this.alertaService.obterAlerta(territorioId, simularChuva).subscribe({
      next: (alerta) => {
        this.alertaAtual = alerta;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }

  alternarLeituraVozAlta(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !this.alertaAtual) {
      return;
    }

    if (this.lendoEmVozAlta) {
      this.pararLeituraVozAlta();
      return;
    }

    window.speechSynthesis.cancel();
    const local = this.alertaAtual.microterritorio || this.alertaAtual.territorio;
    const rota = this.alertaAtual.rota_fuga_segura ? ` Rota de fuga recomendada: ${this.alertaAtual.rota_fuga_segura}.` : '';

    const textoParaLer = [
      `Boletim hiperlocal Recife Seguro para ${local}.`,
      `Nível de risco: ${this.alertaAtual.nivel_risco}.`,
      this.alertaAtual.alerta_humanizado,
      `O que fazer agora: ${this.alertaAtual.acao_segura}`,
      rota,
      `Cuidado com o território: ${this.alertaAtual.cuidado_ambiental}`,
    ].join(' ');

    const utterance = new SpeechSynthesisUtterance(textoParaLer);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.onend = () => {
      this.lendoEmVozAlta = false;
    };
    utterance.onerror = () => {
      this.lendoEmVozAlta = false;
    };

    this.lendoEmVozAlta = true;
    window.speechSynthesis.speak(utterance);
  }

  private pararLeituraVozAlta(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.lendoEmVozAlta = false;
  }
}
