import {
  Component, signal, inject, OnInit, AfterViewInit,
  ElementRef, ViewChild, HostListener, OnDestroy, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProcesoService } from '../../services/proceso.service';
import { Proceso, NodoBpmn, NodoBpmnTipo, ConexionBpmn, DefinicionBpmn } from '../../models/proceso.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-proceso-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proceso-editor.html',
  styleUrl: './proceso-editor.css'
})
export class ProcesoEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrapper') wrapperRef!: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private procesoService = inject(ProcesoService);
  private platformId = inject(PLATFORM_ID);

  proceso = signal<Proceso | null>(null);
  isLoading = signal(true);
  guardando = signal(false);
  mensaje = signal('');
  toolActivo = signal<NodoBpmnTipo | 'cursor' | 'conector'>('cursor');

  nodos = signal<NodoBpmn[]>([]);
  conexiones = signal<ConexionBpmn[]>([]);

  // Drag state
  private draggingId: string | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  // Conector state
  conectandoDesde: string | null = null;
  // Canvas ctx
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrame: number | null = null;
  // Canvas hover & selection
  private hoveredId: string | null = null;
  selectedId = signal<string | null>(null); // nodo actualmente seleccionado

  // Zoom/pan
  scale = signal(1);
  panX = signal(0);
  panY = signal(0);
  private panning = false;
  private panStartX = 0;
  private panStartY = 0;

  readonly TOOLS: { id: NodoBpmnTipo | 'cursor' | 'conector'; label: string; icon: string }[] = [
    { id: 'cursor',    label: 'Seleccionar',  icon: '↖' },
    { id: 'inicio',    label: 'Inicio',        icon: '●' },
    { id: 'fin',       label: 'Fin',           icon: '◉' },
    { id: 'actividad', label: 'Actividad',     icon: '▭' },
    { id: 'gateway',   label: 'Gateway',       icon: '◇' },
    { id: 'conector',  label: 'Conectar',      icon: '→' },
  ];

  ngOnInit() {
    // Guard SSR: localStorage no existe en Node.js
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = localStorage.getItem('usuario');
    if (!stored) { this.router.navigate(['/login']); return; }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) { this.router.navigate(['/procesos']); return; }

    this.procesoService.obtenerProceso(id).subscribe({
      next: (p) => {
        this.proceso.set(p);
        this.cargarDefinicion(p.definicionJson);
        this.isLoading.set(false);
      },
      error: () => { this.router.navigate(['/procesos']); }
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.initCanvas(), 100);
  }

  ngOnDestroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  private cargarDefinicion(json?: string) {
    if (!json) {
      this.nodos.set([
        { id: 'inicio-1', tipo: 'inicio', label: 'Inicio', x: 120, y: 200 }
      ]);
      this.conexiones.set([]);
      return;
    }
    try {
      const def: DefinicionBpmn = JSON.parse(json);
      this.nodos.set(def.nodos ?? []);
      this.conexiones.set(def.conexiones ?? []);
    } catch {
      this.nodos.set([{ id: 'inicio-1', tipo: 'inicio', label: 'Inicio', x: 120, y: 200 }]);
      this.conexiones.set([]);
    }
  }

  // ── Canvas ─────────────────────────────────────────────────────
  private initCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    this.loop();
  }

  private resizeCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    const wrapper = this.wrapperRef?.nativeElement;
    if (!canvas || !wrapper) return;
    canvas.width  = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
  }

  @HostListener('window:resize')
  onResize() { this.resizeCanvas(); }

  private loop() {
    this.draw();
    this.animFrame = requestAnimationFrame(() => this.loop());
  }

  private draw() {
    const ctx = this.ctx;
    const canvas = this.canvasRef?.nativeElement;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(this.panX(), this.panY());
    ctx.scale(this.scale(), this.scale());

    this.drawGrid(ctx, canvas);
    this.conexiones().forEach(c => this.drawConexion(ctx, c));
    this.nodos().forEach(n => this.drawNodo(ctx, n));

    ctx.restore();
  }

  private drawGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const step = 40;
    const w = canvas.width / this.scale();
    const h = canvas.height / this.scale();
    ctx.strokeStyle = 'rgba(79,70,229,0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  private getNodoCenter(n: NodoBpmn): { cx: number; cy: number } {
    if (n.tipo === 'inicio' || n.tipo === 'fin') return { cx: n.x + 30, cy: n.y + 30 };
    if (n.tipo === 'gateway') return { cx: n.x + 40, cy: n.y + 30 };
    return { cx: n.x + 80, cy: n.y + 30 };
  }

  /** Devuelve el punto en el BORDE del nodo más cercano al ángulo dado (en radianes) */
  private getBorderPoint(n: NodoBpmn, angle: number): { x: number; y: number } {
    const { cx, cy } = this.getNodoCenter(n);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    switch (n.tipo) {
      case 'inicio':
      case 'fin': {
        const r = 28;
        return { x: cx + cos * r, y: cy + sin * r };
      }
      case 'actividad': {
        // Rectángulo 160×60, testar intersección con el borde
        const hw = 80, hh = 30; // half-width, half-height
        const abscos = Math.abs(cos), abssin = Math.abs(sin);
        let scale: number;
        if (hw * abssin <= hh * abscos) {
          // Intersecta en lado izquierdo o derecho
          scale = hw / abscos;
        } else {
          // Intersecta en lado superior o inferior
          scale = hh / abssin;
        }
        return { x: cx + cos * scale, y: cy + sin * scale };
      }
      case 'gateway': {
        // Diamante: eje semiancho = s horizontalmente, s verticalmente
        const s = 36;
        const abscos = Math.abs(cos), abssin = Math.abs(sin);
        const scale = s / (abscos + abssin);
        return { x: cx + cos * scale, y: cy + sin * scale };
      }
    }
    return { x: cx, y: cy };
  }

  private drawConexion(ctx: CanvasRenderingContext2D, c: ConexionBpmn) {
    const from = this.nodos().find(n => n.id === c.desde);
    const to   = this.nodos().find(n => n.id === c.hasta);
    if (!from || !to) return;

    const { cx: cx1, cy: cy1 } = this.getNodoCenter(from);
    const { cx: cx2, cy: cy2 } = this.getNodoCenter(to);

    // Ángulo entre centros
    const angle = Math.atan2(cy2 - cy1, cx2 - cx1);

    // Puntos en el borde de salida y de entrada
    const p1 = this.getBorderPoint(from, angle);
    const p2 = this.getBorderPoint(to, angle + Math.PI); // sentido contrario

    // Puntos de control para bezier — curvatura suave proporcional a la distancia
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const curve = Math.min(dist * 0.35, 80);
    const cp1x = p1.x + Math.cos(angle) * curve;
    const cp1y = p1.y + Math.sin(angle) * curve;
    const cp2x = p2.x - Math.cos(angle) * curve;
    const cp2y = p2.y - Math.sin(angle) * curve;

    // Línea bezier
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    ctx.strokeStyle = 'rgba(165,180,252,0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();

    // Punta de flecha en p2, orientada hacia el ángulo final de la curva
    const arrowAngle = Math.atan2(p2.y - cp2y, p2.x - cp2x);
    const aLen = 13, aWid = 0.42;
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(
      p2.x - aLen * Math.cos(arrowAngle - aWid),
      p2.y - aLen * Math.sin(arrowAngle - aWid)
    );
    ctx.lineTo(
      p2.x - aLen * Math.cos(arrowAngle + aWid),
      p2.y - aLen * Math.sin(arrowAngle + aWid)
    );
    ctx.closePath();
    ctx.fillStyle = 'rgba(165,180,252,0.9)';
    ctx.fill();
  }

  private drawNodo(ctx: CanvasRenderingContext2D, n: NodoBpmn) {
    const hovered    = this.hoveredId === n.id;
    const selected   = this.selectedId() === n.id;
    const isConectando = this.conectandoDesde === n.id;
    ctx.save();

    // Halo de selección (anillo externo)
    if (selected) {
      const { cx, cy } = this.getNodoCenter(n);
      ctx.beginPath();
      if (n.tipo === 'inicio' || n.tipo === 'fin') {
        ctx.arc(cx, cy, 36, 0, Math.PI * 2);
      } else if (n.tipo === 'actividad') {
        ctx.roundRect(n.x - 6, n.y - 6, 172, 72, 16);
      } else {
        // gateway
        const s = 44;
        ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy);
        ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s, cy);
        ctx.closePath();
      }
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    switch (n.tipo) {
      case 'inicio':
        this.drawCircle(ctx, n.x + 30, n.y + 30, 28, '#22c55e', hovered || isConectando);
        ctx.fillStyle = '#fff'; ctx.font = '600 11px Inter, system-ui'; ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x + 30, n.y + 68);
        break;
      case 'fin':
        this.drawCircle(ctx, n.x + 30, n.y + 30, 28, '#ef4444', hovered || isConectando);
        ctx.beginPath(); ctx.arc(n.x + 30, n.y + 30, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239,68,68,0.5)'; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '600 11px Inter, system-ui'; ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x + 30, n.y + 68);
        break;
      case 'actividad':
        this.drawRoundRect(ctx, n.x, n.y, 160, 60, 12, '#4f46e5', hovered || isConectando);
        ctx.fillStyle = '#f1f5f9'; ctx.font = '600 13px Inter, system-ui'; ctx.textAlign = 'center';
        this.drawWrappedText(ctx, n.label, n.x + 80, n.y + 30, 140, 18);
        break;
      case 'gateway':
        this.drawDiamond(ctx, n.x + 40, n.y + 30, 36, '#f59e0b', hovered || isConectando);
        ctx.fillStyle = '#fff'; ctx.font = '600 10px Inter, system-ui'; ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x + 40, n.y + 78);
        break;
    }
    ctx.restore();
  }

  private drawCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, glow: boolean) {
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 20; }
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = color + '33'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string, glow: boolean) {
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 20; }
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = color + '25'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string, glow: boolean) {
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 20; }
    ctx.beginPath();
    ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy); ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s, cy);
    ctx.closePath();
    ctx.fillStyle = color + '25'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, cy: number, maxW: number, lineH: number) {
    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
      else line = t;
    }
    if (line) lines.push(line);
    const startY = cy - ((lines.length - 1) * lineH) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineH));
  }

  // ── Hit testing ────────────────────────────────────────────────
  private hitTest(mx: number, my: number): string | null {
    const sx = (mx - this.panX()) / this.scale();
    const sy = (my - this.panY()) / this.scale();
    const reversed = [...this.nodos()].reverse();
    for (const n of reversed) {
      if (this.isInsideNodo(n, sx, sy)) return n.id;
    }
    return null;
  }

  private isInsideNodo(n: NodoBpmn, sx: number, sy: number): boolean {
    switch (n.tipo) {
      case 'inicio':
      case 'fin':
        return Math.hypot(sx - (n.x + 30), sy - (n.y + 30)) <= 32;
      case 'actividad':
        return sx >= n.x && sx <= n.x + 160 && sy >= n.y && sy <= n.y + 60;
      case 'gateway': {
        const dx = Math.abs(sx - (n.x + 40)), dy = Math.abs(sy - (n.y + 30));
        return dx + dy <= 38;
      }
    }
    return false;
  }

  // ── Canvas events ──────────────────────────────────────────────
  onCanvasMouseDown(e: MouseEvent) {
    const tool = this.toolActivo();
    const id = this.hitTest(e.offsetX, e.offsetY);

    if (tool === 'conector') {
      if (id) {
        if (!this.conectandoDesde) {
          this.conectandoDesde = id;
        } else if (id !== this.conectandoDesde) {
          this.addConexion(this.conectandoDesde, id);
          this.conectandoDesde = null;
        }
      } else {
        this.conectandoDesde = null;
      }
      return;
    }

    if (tool === 'cursor') {
      if (id) {
        // Seleccionar el nodo clickeado
        this.selectedId.set(id);
        this.draggingId = id;
        const n = this.nodos().find(x => x.id === id)!;
        const sx = (e.offsetX - this.panX()) / this.scale();
        const sy = (e.offsetY - this.panY()) / this.scale();
        this.dragOffsetX = sx - n.x;
        this.dragOffsetY = sy - n.y;
      } else {
        // Click en espacio vacío → deseleccionar
        this.selectedId.set(null);
        this.panning = true;
        this.panStartX = e.clientX - this.panX();
        this.panStartY = e.clientY - this.panY();
      }
      return;
    }

    if (!id) {
      const sx = (e.offsetX - this.panX()) / this.scale();
      const sy = (e.offsetY - this.panY()) / this.scale();
      this.addNodo(tool as NodoBpmnTipo, sx - 80, sy - 30);
    }
  }

  onCanvasMouseMove(e: MouseEvent) {
    this.hoveredId = this.hitTest(e.offsetX, e.offsetY);

    if (this.draggingId) {
      const sx = (e.offsetX - this.panX()) / this.scale();
      const sy = (e.offsetY - this.panY()) / this.scale();
      this.nodos.update(list => list.map(n =>
        n.id === this.draggingId
          ? { ...n, x: sx - this.dragOffsetX, y: sy - this.dragOffsetY }
          : n
      ));
      return;
    }

    if (this.panning) {
      this.panX.set(e.clientX - this.panStartX);
      this.panY.set(e.clientY - this.panStartY);
    }
  }

  onCanvasMouseUp() {
    this.draggingId = null;
    this.panning = false;
  }

  onCanvasWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.scale.update(s => Math.min(Math.max(s * delta, 0.2), 3));
  }

  onCanvasDblClick(e: MouseEvent) {
    const id = this.hitTest(e.offsetX, e.offsetY);
    if (!id) return;
    const nodo = this.nodos().find(n => n.id === id);
    if (!nodo) return;
    const nuevoLabel = prompt('Nombre del elemento:', nodo.label);
    if (nuevoLabel !== null && nuevoLabel.trim()) {
      this.nodos.update(list => list.map(n =>
        n.id === id ? { ...n, label: nuevoLabel.trim() } : n
      ));
    }
  }

  // ── Acciones ────────────────────────────────────────────────────
  private addNodo(tipo: NodoBpmnTipo, x: number, y: number) {
    const labels: Record<NodoBpmnTipo, string> = {
      inicio: 'Inicio', fin: 'Fin', actividad: 'Nueva actividad', gateway: 'Decisión'
    };
    this.nodos.update(l => [...l, {
      id: `${tipo}-${Date.now()}`, tipo, label: labels[tipo], x, y
    }]);
  }

  private addConexion(desde: string, hasta: string) {
    const existe = this.conexiones().some(c => c.desde === desde && c.hasta === hasta);
    if (existe) return;
    this.conexiones.update(l => [...l, { id: `c-${Date.now()}`, desde, hasta }]);
  }

  borrarSeleccionado() {
    const id = this.selectedId();
    if (!id) return;
    this.nodos.update(l => l.filter(n => n.id !== id));
    this.conexiones.update(l => l.filter(c => c.desde !== id && c.hasta !== id));
    this.selectedId.set(null);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Solo borrar si no hay un input activo
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      this.borrarSeleccionado();
    }
    if (e.key === 'Escape') {
      this.selectedId.set(null);
      this.conectandoDesde = null;
    }
  }

  zoomIn()  { this.scale.update(s => Math.min(s * 1.15, 3)); }
  zoomOut() { this.scale.update(s => Math.max(s * 0.87, 0.2)); }
  resetView() { this.scale.set(1); this.panX.set(0); this.panY.set(0); }

  guardar() {
    const p = this.proceso();
    if (!p) return;
    const def: DefinicionBpmn = { nodos: this.nodos(), conexiones: this.conexiones() };
    this.guardando.set(true);
    this.procesoService.guardarDefinicion(p.id, JSON.stringify(def)).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensaje.set('✅ Guardado correctamente');
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: () => {
        this.guardando.set(false);
        this.mensaje.set('❌ Error al guardar. Intenta de nuevo.');
        setTimeout(() => this.mensaje.set(''), 3000);
      }
    });
  }

  volverALista() { this.router.navigate(['/procesos']); }

  getZoomPercent(): number { return Math.round(this.scale() * 100); }
}
