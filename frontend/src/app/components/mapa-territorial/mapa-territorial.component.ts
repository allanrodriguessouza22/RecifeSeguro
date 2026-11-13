import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { AlertaTerritorial, Territorio } from '../../models/alerta.model';

// Chave de API CARTO Basemaps para renderização oficial das camadas de mapa
export const CARTO_BASEMAPS_API_KEY = 'cb1_58fx_1_a186afa8ed283b6175a88947';

interface CoordenadaPontoApoio {
  id: number;
  latitude: number;
  longitude: number;
  nome: string;
}

// Coordenadas das Escolas e Pontos de Apoio Oficiais da Prefeitura do Recife
const PONTOS_APOIO_COORDS: Record<number, CoordenadaPontoApoio> = {
  1: { id: 1, latitude: -8.0245, longitude: -34.9168, nome: 'Escola Municipal Prof. Solano Trindade' },
  2: { id: 2, latitude: -8.0732, longitude: -34.8942, nome: 'Escola Municipal Karla Patrícia' },
  3: { id: 3, latitude: -8.1282, longitude: -34.9422, nome: 'Escola Municipal Sociólogo Gilberto Freyre' },
  4: { id: 4, latitude: -8.0138, longitude: -34.9342, nome: 'Escola Municipal Córrego do Jenipapo' },
  5: { id: 5, latitude: -8.0952, longitude: -34.9062, nome: 'Escola Municipal Paulo VI' },
  6: { id: 6, latitude: -8.1188, longitude: -34.9358, nome: 'Creche Municipal Casinha de Palha' },
};

@Component({
  selector: 'app-mapa-territorial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="rounded-2xl bg-slate-900 border-2 border-slate-700 shadow-xl overflow-hidden flex flex-col"
      aria-label="Mapa interativo de microterritórios e pontos de apoio do Recife"
    >
      <!-- Barra Superior do Mapa: Título, Microterritório Ativo e Ação GPS -->
      <div class="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.31a1.125 1.125 0 0 0-1.006 0L3.622 5.748A1.125 1.125 0 0 0 3 6.754v11.927c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-white leading-tight">
              Mapa Interativo do Recife • Tempo Real
            </h2>
            <p class="text-xs text-slate-300">
              Toque em qualquer ponto ou comunidade para carregar a IA e a rota de fuga
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="usarMinhaLocalizacaoGps()"
            [disabled]="buscandoGps"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 text-emerald-300 hover:bg-slate-700 border border-emerald-500/40 transition cursor-pointer"
            title="Localizar onde estou no Recife"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span>{{ buscandoGps ? 'Localizando...' : 'Meu GPS' }}</span>
          </button>
        </div>
      </div>

      <!-- Atalhos Rápidos por Chip (Pills de Microterritórios) -->
      <div class="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar" role="tablist">
        @for (t of territorios; track t.id) {
          <button
            type="button"
            (click)="clicarTerritorio(t.id)"
            [ngClass]="territorioSelecionadoId === t.id
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md border-emerald-400'
              : 'bg-slate-950/80 text-slate-300 hover:text-white border-slate-700/80 font-medium'"
            class="shrink-0 text-xs px-3 py-1 rounded-lg border transition cursor-pointer"
          >
            {{ obterRotuloCurto(t) }}
          </button>
        }
      </div>

      <!-- Container do Mapa Leaflet -->
      <div class="relative w-full h-[320px] sm:h-[400px] bg-slate-950">
        <div #mapContainer class="w-full h-full z-10"></div>

        <!-- Card Flutuante de Rota no Mapa -->
        @if (alertaAtual) {
          <div class="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
            <div class="pointer-events-auto max-w-md mx-auto bg-slate-950/95 border-2 border-emerald-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in">
              <div class="min-w-0">
                <span class="block text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  Ponto de Apoio Ativo no Mapa:
                </span>
                <p class="text-xs sm:text-sm font-black text-white truncate">
                  {{ alertaAtual.ponto_apoio }}
                </p>
                <p class="text-[11px] text-slate-300 truncate">
                  {{ alertaAtual.microterritorio || alertaAtual.territorio }} • Risco {{ alertaAtual.nivel_risco }}
                </p>
              </div>

              <div class="shrink-0 text-right">
                <span class="inline-block px-2 py-0.5 rounded text-[11px] font-black uppercase text-slate-950"
                  [ngClass]="obterCorBadgeRisco(alertaAtual.nivel_risco)">
                  {{ alertaAtual.nivel_risco }}
                </span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Rodapé do Mapa com Legenda de Cores e Instrução -->
      <div class="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5 font-bold text-slate-300">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> Baixo
          </span>
          <span class="flex items-center gap-1.5 font-bold text-slate-300">
            <span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span> Moderado
          </span>
          <span class="flex items-center gap-1.5 font-bold text-slate-300">
            <span class="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span> Crítico
          </span>
          <span class="flex items-center gap-1.5 font-bold text-sky-300">
            <span class="h-2.5 w-2.5 rounded-sm bg-sky-400"></span> Escola/Abrigo
          </span>
        </div>

        <span class="text-[11px] text-slate-400">
          Dados Cartográficos © OpenStreetMap + CARTO
        </span>
      </div>
    </section>
  `,
})
export class MapaTerritorialComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef<HTMLDivElement>;

  @Input() territorios: Territorio[] = [];
  @Input() territorioSelecionadoId = 1;
  @Input() alertaAtual: AlertaTerritorial | null = null;
  @Output() selecionarTerritorio = new EventEmitter<number>();

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private rotaLayer: L.Polyline | null = null;
  private abrigoMarker: L.Marker | null = null;
  buscandoGps = false;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      // Pequeno timeout para garantir que o container já tenha tamanho renderizado no DOM
      setTimeout(() => {
        this.inicializarMapa();
      }, 50);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      if (changes['territorioSelecionadoId'] || changes['alertaAtual'] || changes['territorios']) {
        this.renderizarMarcadores();
        this.centralizarNoTerritorioSelecionado();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private inicializarMapa(): void {
    if (!this.mapContainerRef) return;

    const latRecife = -8.065;
    const lonRecife = -34.915;

    this.map = L.map(this.mapContainerRef.nativeElement, {
      center: [latRecife, lonRecife],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Camada de mapa Voyager da CARTO autenticada com a chave de API fornecida (?key=)
    const chaveParam = CARTO_BASEMAPS_API_KEY ? `?key=${CARTO_BASEMAPS_API_KEY}` : '';
    const cartoUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${chaveParam}`;

    const tileLayer = L.tileLayer(cartoUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    });

    // Fallback de resiliência: se a chave CARTO expirar ou falhar, alterna para OpenStreetMap nativo
    tileLayer.on('tileerror', () => {
      if (!this.map) return;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);
    });

    tileLayer.addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    // Evento de clique em qualquer ponto do mapa (procura o microterritório mais próximo)
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.aoClicarNoMapa(e.latlng.lat, e.latlng.lng);
    });

    this.renderizarMarcadores();
    this.centralizarNoTerritorioSelecionado();

    // Garante redimensionamento correto após render inicial
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  private renderizarMarcadores(): void {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    if (this.rotaLayer) {
      this.map.removeLayer(this.rotaLayer);
      this.rotaLayer = null;
    }
    if (this.abrigoMarker) {
      this.map.removeLayer(this.abrigoMarker);
      this.abrigoMarker = null;
    }

    const nivelRisco = this.alertaAtual?.nivel_risco?.toUpperCase() || 'BAIXO';

    this.territorios.forEach((t) => {
      const estaSelecionado = t.id === this.territorioSelecionadoId;
      const corIcone = estaSelecionado
        ? this.obterCorCssRisco(nivelRisco)
        : '#059669'; // Emerald sutil

      const classePulso = estaSelecionado && nivelRisco === 'CRÍTICO' ? 'marcador-pulso-critico' : '';
      const tamanho = estaSelecionado ? 38 : 28;

      const htmlIcone = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div class="${classePulso}" style="
            width: ${tamanho}px;
            height: ${tamanho}px;
            border-radius: 9999px;
            background: ${corIcone};
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #020617;
            font-weight: 900;
            font-size: ${estaSelecionado ? '14px' : '11px'};
          ">
            ${estaSelecionado ? '🚨' : '📍'}
          </div>
          <div style="
            margin-top: 3px;
            background: rgba(2, 6, 23, 0.95);
            color: ${estaSelecionado ? '#fbbf24' : '#e2e8f0'};
            font-weight: ${estaSelecionado ? '800' : '600'};
            font-size: 11px;
            padding: 2px 7px;
            border-radius: 6px;
            border: 1px solid ${estaSelecionado ? '#fbbf24' : '#334155'};
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          ">
            ${t.microterritorio ? t.microterritorio.split('/')[0].trim() : t.nome_local.split('—')[0].trim()}
          </div>
        </div>
      `;

      const divIcon = L.divIcon({
        html: htmlIcone,
        className: 'custom-div-icon',
        iconSize: [tamanho, tamanho],
        iconAnchor: [tamanho / 2, tamanho / 2],
      });

      const marker = L.marker([t.latitude, t.longitude], { icon: divIcon });
      marker.on('click', () => {
        this.clicarTerritorio(t.id);
      });

      this.markersLayer!.addLayer(marker);
    });

    // Se temos um microterritório selecionado, desenha o Abrigo e a Linha da Rota Segura
    const terrAtual = this.territorios.find((t) => t.id === this.territorioSelecionadoId);
    const apoioInfo = PONTOS_APOIO_COORDS[this.territorioSelecionadoId];

    if (terrAtual && apoioInfo) {
      // Marcador do Abrigo (Escola / Ponto de Apoio)
      const shelterIconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #0284c7;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          ">
            🏫
          </div>
          <div style="
            margin-top: 3px;
            background: #0369a1;
            color: #ffffff;
            font-weight: 800;
            font-size: 10px;
            padding: 1px 6px;
            border-radius: 4px;
            border: 1px solid #38bdf8;
            white-space: nowrap;
          ">
            ABRIGO SEGURO
          </div>
        </div>
      `;

      const shelterIcon = L.divIcon({
        html: shelterIconHtml,
        className: 'custom-shelter-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      this.abrigoMarker = L.marker([apoioInfo.latitude, apoioInfo.longitude], {
        icon: shelterIcon,
      }).addTo(this.map);

      // Traça a Linha / Corredor de Fuga Seguro entre a Comunidade e a Escola
      this.rotaLayer = L.polyline(
        [
          [terrAtual.latitude, terrAtual.longitude],
          [apoioInfo.latitude, apoioInfo.longitude],
        ],
        {
          color: '#38bdf8',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.9,
        }
      ).addTo(this.map);
    }
  }

  private centralizarNoTerritorioSelecionado(): void {
    if (!this.map) return;
    const selecionado = this.territorios.find((t) => t.id === this.territorioSelecionadoId);
    if (selecionado) {
      this.map.flyTo([selecionado.latitude, selecionado.longitude], 14, {
        duration: 1.0,
      });
    }
  }

  clicarTerritorio(id: number): void {
    this.selecionarTerritorio.emit(id);
  }

  private aoClicarNoMapa(lat: number, lon: number): void {
    if (this.territorios.length === 0) return;

    // Calcula a distância euclidiana para encontrar o microterritório monitorado mais próximo
    let maisProximo = this.territorios[0];
    let menorDistancia = Infinity;

    this.territorios.forEach((t) => {
      const dLat = t.latitude - lat;
      const dLon = t.longitude - lon;
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      if (dist < menorDistancia) {
        menorDistancia = dist;
        maisProximo = t;
      }
    });

    if (maisProximo && maisProximo.id !== this.territorioSelecionadoId) {
      this.clicarTerritorio(maisProximo.id);
    }
  }

  usarMinhaLocalizacaoGps(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Geolocalização não disponível no navegador.');
      return;
    }

    this.buscandoGps = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.buscandoGps = false;
        this.aoClicarNoMapa(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        this.buscandoGps = false;
        // Se GPS falhar ou permissão for negada, foca no Ibura como referência
        this.clicarTerritorio(3);
      },
      { timeout: 8000 }
    );
  }

  obterRotuloCurto(t: Territorio): string {
    if (t.id === 3) return 'UR-02 Ibura (Encosta)';
    if (t.id === 6) return 'Vila dos Milagres (Canal)';
    return t.microterritorio ? t.microterritorio.split('/')[0].trim() : t.nome_local.split('—')[0].trim();
  }

  obterCorCssRisco(nivel: string): string {
    switch (nivel) {
      case 'CRÍTICO':
        return '#ef4444';
      case 'MODERADO':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  }

  obterCorBadgeRisco(nivel: string): string {
    switch (nivel?.toUpperCase()) {
      case 'CRÍTICO':
        return 'bg-red-400 text-slate-950 font-black';
      case 'MODERADO':
        return 'bg-amber-400 text-slate-950 font-black';
      default:
        return 'bg-emerald-400 text-slate-950 font-black';
    }
  }
}
