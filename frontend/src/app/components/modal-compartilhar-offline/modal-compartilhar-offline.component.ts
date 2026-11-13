import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';
import { AlertaTerritorial } from '../../models/alerta.model';
import { AlertaService } from '../../services/alerta.service';

@Component({
  selector: 'app-modal-compartilhar-offline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (aberto && alerta) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-offline"
      >
        <div class="bg-slate-900 border-2 border-slate-700 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
          <!-- Cabeçalho do Modal -->
          <div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
                </svg>
              </div>
              <div>
                <h3 id="titulo-modal-offline" class="text-lg font-black text-white">
                  Malha de Emergência Sem Internet
                </h3>
                <p class="text-xs text-amber-300 font-semibold">
                  Transmissão P2P Local • Funciona mesmo sem Wi-Fi ou 4G
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="fechar.emit()"
              class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              aria-label="Fechar janela de transmissão offline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Abas: Transmitir (Gerar QR) vs Receber (Importar) -->
          <div class="flex rounded-xl bg-slate-950 p-1 my-4 border border-slate-800">
            <button
              type="button"
              (click)="abaAtiva = 'transmitir'"
              [ngClass]="abaAtiva === 'transmitir' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-300 font-bold hover:text-white'"
              class="flex-1 py-2 rounded-lg text-xs sm:text-sm transition text-center cursor-pointer"
            >
              1. Transmitir Alerta (QR Code)
            </button>
            <button
              type="button"
              (click)="abaAtiva = 'receber'"
              [ngClass]="abaAtiva === 'receber' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-300 font-bold hover:text-white'"
              class="flex-1 py-2 rounded-lg text-xs sm:text-sm transition text-center cursor-pointer"
            >
              2. Receber Alerta de Vizinho
            </button>
          </div>

          <!-- ABA 1: TRANSMITIR ALERTA VIA QR CODE E SMS -->
          @if (abaAtiva === 'transmitir') {
            <div class="space-y-4">
              <div class="text-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <p class="text-xs text-slate-300">
                  Aponte a câmera de outro celular para ler este alerta hiperlocal sem precisar de conexão:
                </p>

                <!-- Imagem do QR Code -->
                <div class="my-3 flex justify-center">
                  @if (qrCodeDataUrl) {
                    <div class="p-2.5 bg-white rounded-2xl shadow-xl inline-block border-4 border-amber-400">
                      <img
                        [src]="qrCodeDataUrl"
                        alt="QR Code contendo alerta territorial de emergência"
                        class="w-56 h-56 object-contain"
                      />
                    </div>
                  } @else {
                    <div class="w-56 h-56 flex items-center justify-center bg-slate-800 rounded-xl text-xs text-slate-400 animate-pulse">
                      Gerando QR Code de emergência...
                    </div>
                  }
                </div>

                <div class="text-xs font-bold text-white bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-700 inline-block">
                  <span class="text-amber-400 font-black">Microterritório:</span> {{ alerta.microterritorio || alerta.territorio }}
                </div>
              </div>

              <!-- Ações Rápidas de Transmissão -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  [href]="obterLinkSms()"
                  class="inline-flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl font-extrabold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                  aria-label="Disparar alerta via SMS direto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-.974-.94 6.012 6.012 0 0 0 1.259-3.212A8.204 8.204 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                  <span>Enviar SMS (Rede 2G)</span>
                </a>

                <button
                  type="button"
                  (click)="compartilharNativo()"
                  class="inline-flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl font-extrabold text-xs bg-sky-400 text-slate-950 hover:bg-sky-300 transition cursor-pointer"
                  aria-label="Compartilhar por Bluetooth ou proximidade"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                  </svg>
                  <span>Bluetooth / Nearby</span>
                </button>
              </div>

              <button
                type="button"
                (click)="copiarPayloadTexto()"
                class="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                {{ copiado ? '✓ Código Copiado para a Área de Transferência!' : 'Copiar Código de Emergência para Envio Manual' }}
              </button>
            </div>
          }

          <!-- ABA 2: RECEBER ALERTA DE VIZINHO (IMPORTAR) -->
          @if (abaAtiva === 'receber') {
            <div class="space-y-4">
              <div class="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
                <p class="text-xs text-slate-300 mb-2 font-medium">
                  Se você está sem conexão e recebeu um código ou arquivo de alerta por Bluetooth ou SMS de um vizinho, cole-o abaixo para atualizar o semáforo de risco no seu aparelho:
                </p>

                <textarea
                  [(ngModel)]="codigoImportacao"
                  rows="4"
                  placeholder="Cole o código do alerta de emergência aqui..."
                  class="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-300 focus:border-amber-400 focus:outline-none"
                ></textarea>

                @if (mensagemErro) {
                  <p class="text-xs text-red-400 font-bold mt-1">
                    {{ mensagemErro }}
                  </p>
                }

                @if (mensagemSucesso) {
                  <p class="text-xs text-emerald-400 font-bold mt-1">
                    {{ mensagemSucesso }}
                  </p>
                }

                <div class="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    (click)="processarImportacao()"
                    [disabled]="!codigoImportacao.trim()"
                    class="flex-1 py-3 px-4 rounded-xl font-black text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-50 transition cursor-pointer"
                  >
                    Sincronizar Alerta no Meu Aparelho
                  </button>
                </div>
              </div>

              <!-- Simulação Rápida para o Pitch -->
              <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <p class="text-xs font-extrabold text-amber-300 uppercase mb-1">
                  Demonstração no Pitch:
                </p>
                <p class="text-xs text-slate-300 mb-2">
                  Simule a recepção instantânea de um alerta de vizinho (UR-02 Ibura - Alto da Sucupira):
                </p>
                <button
                  type="button"
                  (click)="simularRecepcaoPitch()"
                  class="w-full py-2 px-3 rounded-lg text-xs font-extrabold bg-slate-700 text-white hover:bg-slate-600 transition"
                >
                  Testar Recepção P2P Offline (Ibura • 45 mm/h)
                </button>
              </div>
            </div>
          }

          <!-- Rodapé do Modal -->
          <div class="mt-5 pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              (click)="fechar.emit()"
              class="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              Concluir e Voltar ao Painel
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalCompartilharOfflineComponent implements OnChanges {
  private readonly alertaService = inject(AlertaService);

  @Input() aberto = false;
  @Input() alerta: AlertaTerritorial | null = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() alertaSincronizado = new EventEmitter<AlertaTerritorial>();

  abaAtiva: 'transmitir' | 'receber' = 'transmitir';
  qrCodeDataUrl = '';
  codigoImportacao = '';
  copiado = false;
  mensagemErro = '';
  mensagemSucesso = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alerta'] || changes['aberto']) {
      if (this.aberto && this.alerta) {
        this.gerarQrCode();
      }
    }
  }

  async gerarQrCode(): Promise<void> {
    if (!this.alerta) return;
    try {
      const payload = this.alertaService.serializarParaP2P(this.alerta);
      this.qrCodeDataUrl = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 1,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
    }
  }

  obterLinkSms(): string {
    if (!this.alerta) return 'sms:';
    const local = this.alerta.microterritorio || this.alerta.territorio;
    const rota = this.alerta.rota_fuga_segura ? ` Rota: ${this.alerta.rota_fuga_segura}.` : '';
    const texto = `ALERTA DEFESA CIVIL RECIFE: Risco ${this.alerta.nivel_risco} em ${local}. Chuva: ${this.alerta.precipitacao_mm}mm/h. Abrigo: ${this.alerta.ponto_apoio}.${rota} Emergencia: 199.`;
    return `sms:?body=${encodeURIComponent(texto)}`;
  }

  compartilharNativo(): void {
    if (!this.alerta || typeof navigator === 'undefined' || !navigator.share) {
      this.copiarPayloadTexto();
      return;
    }
    const local = this.alerta.microterritorio || this.alerta.territorio;
    const rota = this.alerta.rota_fuga_segura ? ` Rota: ${this.alerta.rota_fuga_segura}.` : '';
    const texto = `🚨 ALERTA DEFESA CIVIL RECIFE: Risco ${this.alerta.nivel_risco} em ${local}! Chuva de ${this.alerta.precipitacao_mm} mm/h. Abrigo seguro: ${this.alerta.ponto_apoio}.${rota} Ligue 199 em emergência.`;

    navigator
      .share({
        title: `Alerta Defesa Civil - ${local}`,
        text: texto,
      })
      .catch(() => {
        this.copiarPayloadTexto();
      });
  }

  copiarPayloadTexto(): void {
    if (!this.alerta || typeof navigator === 'undefined' || !navigator.clipboard) return;
    const payload = this.alertaService.serializarParaP2P(this.alerta);
    navigator.clipboard.writeText(payload).then(() => {
      this.copiado = true;
      setTimeout(() => (this.copiado = false), 3000);
    });
  }

  processarImportacao(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    const alerta = this.alertaService.desserializarDeP2P(this.codigoImportacao);
    if (!alerta) {
      this.mensagemErro = 'Código de alerta inválido. Verifique o formato e tente novamente.';
      return;
    }

    this.mensagemSucesso = `✓ Alerta de ${alerta.microterritorio || alerta.territorio} sincronizado com sucesso!`;
    this.alertaSincronizado.emit(alerta);
    setTimeout(() => {
      this.fechar.emit();
    }, 1500);
  }

  simularRecepcaoPitch(): void {
    const payloadSimulado = JSON.stringify({
      v: 1,
      id: 3,
      t: 'UR-02 Ibura — Alto da Sucupira',
      b: 'Ibura',
      r: 'CRÍTICO',
      c: 45.0,
      m: 'Atenção urgente em Alto da Sucupira! Chuva crítica (45.0 mm/h). Risco extremo de deslizamento de barreira. Desocupe quartos colados ao morro!',
      s: 'Suba pela Rua Rio Pajeú até a Escola Sociólogo Gilberto Freyre. Afaste-se do talude. Defesa Civil: 199.',
      f: 'Suba pela Rua Rio Pajeú até a Escola Sociólogo Gilberto Freyre',
      a: 'Escola Municipal Sociólogo Gilberto Freyre',
      ts: new Date().toISOString(),
    });
    this.codigoImportacao = payloadSimulado;
    this.processarImportacao();
  }
}
