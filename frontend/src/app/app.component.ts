import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertaService, TERRITORIOS_PADRAO } from './services/alerta.service';
import { AlertaTerritorial, Territorio } from './models/alerta.model';
import { CardRiscoComponent } from './components/card-risco/card-risco.component';
import { CardAcaoApoioComponent } from './components/card-acao-apoio/card-acao-apoio.component';
import { CardTerritorioVivoComponent } from './components/card-territorio-vivo/card-territorio-vivo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardRiscoComponent,
    CardAcaoApoioComponent,
    CardTerritorioVivoComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-between">
      <!-- 1. CABEÇALHO ACESSÍVEL COM STATUS ONLINE/OFFLINE E SELETOR DE COMUNIDADE -->
      <header class="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-30 backdrop-blur">
        <div class="max-w-3xl mx-auto px-4 py-4">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-3">
              <div class="h-11 w-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-950 shrink-0" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                  Recife Seguro
                </h1>
                <p class="text-xs sm:text-sm text-emerald-300 font-semibold mt-1">
                  T.A.D.C. • Tradutor de Alertas da Defesa Civil
                </p>
              </div>
            </div>

            <!-- Selo Online / Offline (Suporte PWA) -->
            <div class="flex items-center gap-2">
              @if (modoSimulacaoAtivo) {
                <span class="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-400 text-slate-950">
                  Modo Simulação
                </span>
              }
              <span
                [ngClass]="estaOnline
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-amber-950 text-amber-200 border-amber-400/60'"
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
                role="status"
                aria-live="polite"
              >
                <span
                  [ngClass]="estaOnline ? 'bg-emerald-400' : 'bg-amber-400'"
                  class="h-2.5 w-2.5 rounded-full"
                  aria-hidden="true"
                ></span>
                {{ estaOnline ? 'Online • Open-Meteo' : 'Offline • Cache Local' }}
              </span>
            </div>
          </div>

          <!-- Seletor de Território / Comunidade de Recife -->
          <div class="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800">
            <label
              for="seletor-territorio"
              class="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 mb-2"
            >
              Selecione sua Comunidade / Território em Recife:
            </label>
            <div class="flex flex-col sm:flex-row gap-2.5">
              <select
                id="seletor-territorio"
                [(ngModel)]="territorioSelecionadoId"
                (ngModelChange)="selecionarTerritorio($event)"
                aria-label="Selecionar bairro ou comunidade monitorada em Recife"
                class="w-full rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-bold text-base px-4 py-3 focus:border-emerald-400 transition cursor-pointer"
              >
                @for (t of territorios; track t.id) {
                  <option [ngValue]="t.id">
                    {{ t.nome_local }} — ({{ t.tipo_ecossistema }})
                  </option>
                }
              </select>

              <button
                type="button"
                (click)="atualizarTempoReal()"
                [disabled]="carregando"
                aria-label="Atualizar dados meteorológicos em tempo real"
                class="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-extrabold text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition cursor-pointer"
              >
                <span>{{ carregando ? 'Atualizando...' : 'Atualizar Agora' }}</span>
              </button>
            </div>

            <!-- Atalhos rápidos para os 3 territórios principais do Recife -->
            <div class="flex flex-wrap gap-2 mt-3" role="group" aria-label="Atalhos rápidos de comunidades">
              @for (t of territorios.slice(0, 3); track t.id) {
                <button
                  type="button"
                  (click)="selecionarTerritorio(t.id)"
                  [ngClass]="territorioSelecionadoId === t.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500 font-semibold'"
                  class="text-xs sm:text-sm px-3 py-1.5 rounded-lg border transition cursor-pointer"
                  [attr.aria-pressed]="territorioSelecionadoId === t.id"
                >
                  {{ obterNomeCurto(t.nome_local) }}
                </button>
              }
            </div>
          </div>
        </div>
      </header>

      <!-- CONTEÚDO PRINCIPAL (SINGLE-PAGE SIMPLIFICADA) -->
      <main class="max-w-3xl w-full mx-auto px-4 py-6 space-y-5 flex-1">
        @if (carregando && !alertaAtual) {
          <div
            class="rounded-2xl bg-slate-900 border-2 border-slate-800 p-8 text-center animate-pulse"
            role="status"
            aria-live="polite"
          >
            <p class="text-lg font-bold text-emerald-300">
              Consultando sensores climáticos e traduzindo alerta territorial...
            </p>
          </div>
        }

        @if (alertaAtual) {
          <!-- 2. CARD PRINCIPAL DE RISCO (SEMÁFORO VISUAL + VOZ) -->
          <app-card-risco
            [alerta]="alertaAtual"
            [lendoEmVozAlta]="lendoEmVozAlta"
            (alternarVoz)="alternarLeituraVozAlta()"
          ></app-card-risco>

          <!-- 3. CARD "O QUE FAZER AGORA" & PONTO DE APOIO -->
          <app-card-acao-apoio
            [alerta]="alertaAtual"
          ></app-card-acao-apoio>

          <!-- 4. CARD "CUIDANDO DO NOSSO TERRITÓRIO" (MANGUES, RIOS E ENCOSTAS) -->
          <app-card-territorio-vivo
            [alerta]="alertaAtual"
          ></app-card-territorio-vivo>
        }
      </main>

      <!-- 5. RODAPÉ DISCRETO DE DEMONSTRAÇÃO PARA O PITCH -->
      <footer class="border-t border-slate-800 bg-slate-900/90 mt-8">
        <div class="max-w-3xl mx-auto px-4 py-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p class="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Modo Demonstração (Pitch Hackathon APONTI • Antena na Lama)
              </p>
              <p class="text-xs text-slate-300 mt-0.5">
                Simule eventos climáticos extremos ao vivo para validar a tradução da IA e o semáforo de crise.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                (click)="atualizarTempoReal()"
                aria-label="Voltar para leitura climática em tempo real"
                class="px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
              >
                Clima Real (0 mm/h)
              </button>

              <button
                type="button"
                (click)="simularChuvaModerada()"
                aria-label="Simular chuva moderada de 8.5 milímetros por hora"
                class="px-3 py-2 rounded-lg text-xs font-extrabold bg-amber-400 text-slate-950 hover:bg-amber-300 transition cursor-pointer"
              >
                Simular Atenção (8.5 mm/h)
              </button>

              <button
                type="button"
                (click)="simularChuvaForte()"
                aria-label="Simular chuva forte de 22.5 milímetros por hora"
                class="px-3.5 py-2 rounded-lg text-xs font-extrabold bg-red-500 text-white hover:bg-red-400 shadow-md shadow-red-950 transition cursor-pointer"
              >
                Simular Chuva Forte (22.5 mm/h)
              </button>

              <button
                type="button"
                (click)="simularCriseExtrema()"
                aria-label="Acionar endpoint de crise extrema de 45 milímetros por hora"
                class="px-3.5 py-2 rounded-lg text-xs font-extrabold bg-rose-700 text-white hover:bg-rose-600 border border-rose-400/50 transition cursor-pointer"
              >
                Crise Extrema (45 mm/h)
              </button>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Inspirado no Manifesto Caranguejos com Cérebro (Manguebeat)</span>
            <span>Dados Abertos Recife + Open-Meteo + Gemini IA</span>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly alertaService = inject(AlertaService);

  territorios: Territorio[] = TERRITORIOS_PADRAO;
  territorioSelecionadoId = 1;
  alertaAtual: AlertaTerritorial | null = null;
  carregando = false;
  estaOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  lendoEmVozAlta = false;
  modoSimulacaoAtivo = false;
  private chuvaSimuladaAtual: number | null = null;

  private readonly handleOnline = () => {
    this.estaOnline = true;
  };

  private readonly handleOffline = () => {
    this.estaOnline = false;
  };

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
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
    const textoParaLer = [
      `Boletim Recife Seguro para ${this.alertaAtual.territorio}.`,
      `Nível de risco: ${this.alertaAtual.nivel_risco}.`,
      this.alertaAtual.alerta_humanizado,
      `O que fazer agora: ${this.alertaAtual.acao_segura}`,
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

  obterNomeCurto(nomeCompleto: string): string {
    return nomeCompleto.split('(')[0].trim();
  }
}

