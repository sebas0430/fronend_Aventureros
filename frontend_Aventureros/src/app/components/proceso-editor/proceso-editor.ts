import {
  Component, signal, inject, OnInit, AfterViewInit,
  ElementRef, ViewChild, HostListener, OnDestroy, PLATFORM_ID, computed
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProcesoService } from '../../services/proceso.service';
import { AuthService } from '../../services/auth.service';
import { Proceso, NodoBpmn, NodoBpmnTipo, ConexionBpmn, DefinicionBpmn } from '../../models/proceso.model';
import { ActividadService } from '../../services/actividad.service';
import { ActividadRegistroDTO, RolGlobal } from '../../models/actividad.model';

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
  private authService = inject(AuthService);
  private actividadService = inject(ActividadService);
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
  selectedId = signal<string | null>(null); 

  // Zoom/pan
  scale = signal(1);
  panX = signal(0);
  panY = signal(0);
  private panning = false;
  private panStartX = 0;
  private panStartY = 0;

  // ── Properties Panel ────────────────────────────────────────
  actividadesProceso = signal<ActividadRegistroDTO[]>([]);
  actividadSeleccionada = signal<ActividadRegistroDTO | null>(null);
  cargandoPropiedades = signal(false);
  rolesGlobales = Object.values(RolGlobal);
  tiposActividad = ['TASK', 'SERVICE', 'USER', 'MANUAL'];

  // Selected element derived state
  selectedNodo = computed(() => this.nodos().find(n => n.id === this.selectedId()) || null);
  selectedConexion = computed(() => this.conexiones().find(c => c.id === this.selectedId()) || null);

  readonly TOOLS: { id: NodoBpmnTipo | 'cursor' | 'conector'; label: string; icon: string }[] = [
    { id: 'cursor',    label: 'Seleccionar',  icon: '↖' },
    { id: 'inicio',    label: 'Inicio',        icon: '●' },
    { id: 'fin',       label: 'Fin',           icon: '◉' },
    { id: 'actividad', label: 'Actividad',     icon: '▭' },
    { id: 'gateway',   label: 'Gateway',       icon: '◇' },
    { id: 'conector',  label: 'Conectar',      icon: '→' },
  ];

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) { this.router.navigate(['/procesos']); return; }

    this.procesoService.obtenerProceso(id).subscribe({
      next: (p) => {
        this.proceso.set(p);
        this.cargarDefinicion(p.definicionJson);
        this.isLoading.set(false);
        this.cargarActividades(id);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initCanvas(), 100);
        }
      },
      error: () => { this.router.navigate(['/procesos']); }
    });
  }

  private cargarActividades(procesoId: number) {
    this.actividadService.listarPorProceso(procesoId).subscribe({
      next: (list) => this.actividadesProceso.set(list),
      error: () => console.error('Error al cargar actividades')
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  private cargarDefinicion(json?: string) {
    if (!json) {
      this.nodos.set([{ id: 'inicio-1', tipo: 'inicio', label: 'Inicio', x: 120, y: 200 }]);
      return;
    }
    try {
      const def: DefinicionBpmn = JSON.parse(json);
      this.nodos.set(def.nodos || []);
      this.conexiones.set(def.conexiones || []);
    } catch (e) {
      this.nodos.set([{ id: 'inicio-1', tipo: 'inicio', label: 'Inicio', x: 120, y: 200 }]);
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    this.renderLoop();
  }

  private resizeCanvas() {
    if (!this.wrapperRef || !this.canvasRef) return;
    const w = this.wrapperRef.nativeElement.clientWidth;
    const h = this.wrapperRef.nativeElement.clientHeight;
    this.canvasRef.nativeElement.width = w;
    this.canvasRef.nativeElement.height = h;
  }

  private renderLoop() {
    this.draw();
    this.animFrame = requestAnimationFrame(() => this.renderLoop());
  }

  private draw() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(this.panX(), this.panY());
    ctx.scale(this.scale(), this.scale());

    this.drawGrid(ctx, canvas.width / this.scale() + 2000, canvas.height / this.scale() + 2000);
    this.conexiones().forEach(c => this.drawConexion(ctx, c));
    this.nodos().forEach(n => this.drawNodo(ctx, n));

    ctx.restore();
  }

  private drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = -1000; x < w; x += 40) { ctx.moveTo(x, -1000); ctx.lineTo(x, h); }
    for (let y = -1000; y < h; y += 40) { ctx.moveTo(-1000, y); ctx.lineTo(w, y); }
    ctx.stroke();
  }

  private drawNodo(ctx: CanvasRenderingContext2D, n: NodoBpmn) {
    const hovered    = this.hoveredId === n.id;
    const selected   = this.selectedId() === n.id;
    const isConectando = this.conectandoDesde === n.id;
    ctx.save();

    // Halo de selección
    if (selected) {
      const { cx, cy } = this.getNodoCenter(n);
      ctx.beginPath();
      if (n.tipo === 'inicio' || n.tipo === 'fin') {
        ctx.arc(cx, cy, 36, 0, Math.PI * 2);
      } else if (n.tipo === 'actividad') {
        ctx.roundRect(n.x - 6, n.y - 6, 172, 72, 16);
      } else {
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
        this.drawGatewaySymbol(ctx, n.x + 40, n.y + 30, n.gatewayType);
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
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, glow: boolean) {
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 20; }
    ctx.beginPath();
    ctx.moveTo(cx, cy - size); ctx.lineTo(cx + size, cy); ctx.lineTo(cx, cy + size); ctx.lineTo(cx - size, cy);
    ctx.closePath();
    ctx.fillStyle = color + '33'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawGatewaySymbol(ctx: CanvasRenderingContext2D, cx: number, cy: number, type?: string) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    if (type === 'exclusive') {
      const s = 10; ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s);
      ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s); ctx.stroke();
    } else if (type === 'parallel') {
      const s = 12; ctx.beginPath(); ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s);
      ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy); ctx.stroke();
    } else if (type === 'inclusive') {
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.stroke();
    }
  }

  private drawConexion(ctx: CanvasRenderingContext2D, c: ConexionBpmn) {
    const from = this.nodos().find(n => n.id === c.desde);
    const to = this.nodos().find(n => n.id === c.hasta);
    if (!from || !to) return;
    const start = this.getPoint(from, to);
    const end = this.getPoint(to, from);
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    this.drawArrowhead(ctx, end.x, end.y, Math.atan2(end.y - start.y, end.x - start.x));
  }

  private getPoint(n: NodoBpmn, target: {x:number, y:number}) {
    const { cx, cy } = this.getNodoCenter(n);
    if (n.tipo === 'actividad') {
      if (Math.abs(target.x - cx) > Math.abs(target.y - cy)) return { x: target.x > cx ? n.x + 160 : n.x, y: cy };
      return { x: cx, y: target.y > cy ? n.y + 60 : n.y };
    }
    const r = n.tipo === 'gateway' ? 36 : 28;
    const angle = Math.atan2(target.y - cy, target.x - cx);
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  }

  private getNodoCenter(n: NodoBpmn) {
    return { cx: n.x + (n.tipo==='actividad'?80 : n.tipo==='gateway'?40:30), cy: n.y + 30 };
  }

  private drawArrowhead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -5); ctx.lineTo(-10, 5); ctx.closePath();
    ctx.fillStyle = 'rgba(148,163,184,0.6)'; ctx.fill(); ctx.restore();
  }

  private drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, cy: number, maxW: number, lineH: number) {
    const words = text.split(' ');
    let line = ''; const lines: string[] = [];
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
    const startY = cy - ((lines.length - 1) * lineH) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineH));
  }

  private hitTest(mx: number, my: number): string | null {
    const sx = (mx - this.panX()) / this.scale();
    const sy = (my - this.panY()) / this.scale();
    for (const n of [...this.nodos()].reverse()) {
      if (this.isInsideNodo(n, sx, sy)) return n.id;
    }
    return null;
  }

  private isInsideNodo(n: NodoBpmn, sx: number, sy: number): boolean {
    if (n.tipo === 'actividad') return sx >= n.x && sx <= n.x + 160 && sy >= n.y && sy <= n.y + 60;
    const { cx, cy } = this.getNodoCenter(n);
    const r = n.tipo === 'gateway' ? 38 : 32;
    return Math.hypot(sx - cx, sy - cy) <= r;
  }

  onCanvasMouseDown(e: MouseEvent) {
    const id = this.hitTest(e.offsetX, e.offsetY);
    const tool = this.toolActivo();
    if (tool === 'conector') {
      if (id) {
        if (!this.conectandoDesde) this.conectandoDesde = id;
        else if (id !== this.conectandoDesde) { this.addConexion(this.conectandoDesde, id); this.conectandoDesde = null; }
      } else this.conectandoDesde = null;
      return;
    }
    if (tool === 'cursor') {
      if (id) {
        this.seleccionarNodo(id); this.draggingId = id;
        const n = this.nodos().find(x => x.id === id)!;
        this.dragOffsetX = (e.offsetX - this.panX()) / this.scale() - n.x;
        this.dragOffsetY = (e.offsetY - this.panY()) / this.scale() - n.y;
      } else { this.seleccionarNodo(null); this.panning = true; this.panStartX = e.clientX - this.panX(); this.panStartY = e.clientY - this.panY(); }
      return;
    }
    if (!id) {
      const sx = (e.offsetX - this.panX()) / this.scale(), sy = (e.offsetY - this.panY()) / this.scale();
      this.addNodo(tool as NodoBpmnTipo, sx - 80, sy - 30);
    }
  }

  onCanvasMouseMove(e: MouseEvent) {
    this.hoveredId = this.hitTest(e.offsetX, e.offsetY);
    if (this.draggingId) {
      const sx = (e.offsetX - this.panX()) / this.scale(), sy = (e.offsetY - this.panY()) / this.scale();
      this.nodos.update(l => l.map(n => n.id === this.draggingId ? { ...n, x: sx - this.dragOffsetX, y: sy - this.dragOffsetY } : n));
    } else if (this.panning) {
      this.panX.set(e.clientX - this.panStartX); this.panY.set(e.clientY - this.panStartY);
    }
  }

  onCanvasMouseUp() { this.draggingId = null; this.panning = false; }

  onCanvasWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.scale.update(s => Math.min(Math.max(s * delta, 0.2), 3));
  }

  onCanvasDblClick(e: MouseEvent) {
    const id = this.hitTest(e.offsetX, e.offsetY);
    if (id) this.seleccionarNodo(id);
  }

  private addNodo(tipo: NodoBpmnTipo, x: number, y: number) {
    const labels: Record<NodoBpmnTipo, string> = { inicio: 'Inicio', fin: 'Fin', actividad: 'Nueva actividad', gateway: 'Decisión' };
    const nuevo: NodoBpmn = { id: `${tipo}-${Date.now()}`, tipo, label: labels[tipo], x, y };
    if (tipo === 'gateway') nuevo.gatewayType = 'exclusive';
    this.nodos.update(l => [...l, nuevo]);
  }

  private addConexion(desde: string, hasta: string) {
    if (this.conexiones().some(c => c.desde === desde && c.hasta === hasta)) return;
    this.conexiones.update(l => [...l, { id: `c-${Date.now()}`, desde, hasta }]);
  }

  borrarSeleccionado() {
    const id = this.selectedId();
    if (!id) return;
    this.nodos.update(l => l.filter(n => n.id !== id));
    this.conexiones.update(l => l.filter(c => c.desde !== id && c.hasta !== id));
    this.seleccionarNodo(null);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT','TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
      this.borrarSeleccionado();
    }
    if (e.key === 'Escape') { this.seleccionarNodo(null); this.conectandoDesde = null; }
  }

  zoomIn()  { this.scale.update(s => Math.min(s * 1.15, 3)); }
  zoomOut() { this.scale.update(s => Math.max(s * 0.87, 0.2)); }
  resetView() { this.scale.set(1); this.panX.set(0); this.panY.set(0); }

  guardar() {
    const p = this.proceso();
    if (!p) return;
    this.guardando.set(true);
    const def: DefinicionBpmn = { nodos: this.nodos(), conexiones: this.conexiones() };
    this.procesoService.guardarDefinicion(p.id, JSON.stringify(def)).subscribe({
      next: () => { this.guardando.set(false); this.mostrarMensaje('✅ Guardado correctamente'); },
      error: () => { this.guardando.set(false); this.mostrarMensaje('❌ Error al guardar'); }
    });
  }

  seleccionarNodo(id: string | null) {
    this.selectedId.set(id);
    if (!id) { this.actividadSeleccionada.set(null); return; }
    const nodo = this.nodos().find(n => n.id === id);
    if (nodo && nodo.tipo === 'actividad') {
      if (nodo.actividadId) {
        this.cargandoPropiedades.set(true);
        this.actividadService.obtenerActividad(nodo.actividadId).subscribe({
          next: (act) => { this.actividadSeleccionada.set(act); this.cargandoPropiedades.set(false); },
          error: () => this.cargandoPropiedades.set(false)
        });
      } else {
        this.actividadSeleccionada.set({
          nombre: nodo.label, tipoActividad: 'TASK', descripcion: '', rolResponsable: RolGlobal.EDITOR,
          procesoId: this.proceso()!.id, usuarioId: this.authService.getUsuario()!.id
        });
      }
    } else this.actividadSeleccionada.set(null);
  }

  updatePropiedadActividad(campo: string, valor: any) {
    this.actividadSeleccionada.update(act => act ? { ...act, [campo]: valor } : null);
    if (campo === 'nombre' && this.selectedId()) {
      this.nodos.update(list => list.map(n => n.id === this.selectedId() ? { ...n, label: valor } : n));
    }
  }

  guardarPropiedadesActividad() {
    const act = this.actividadSeleccionada(), nodoId = this.selectedId();
    if (!act || !nodoId) return;
    this.guardando.set(true);
    if (act.id) {
      this.actividadService.editarActividad(act.id, act).subscribe({
        next: () => { this.mostrarMensaje('Propiedades actualizadas'); this.guardando.set(false); },
        error: () => { this.mostrarMensaje('Error al actualizar'); this.guardando.set(false); }
      });
    } else {
      this.actividadService.crearActividad(act).subscribe({
        next: (nueva) => {
          if (nueva.id) {
            this.nodos.update(l => l.map(n => n.id === nodoId ? { ...n, actividadId: nueva.id } : n));
            this.actividadSeleccionada.set(nueva);
            this.mostrarMensaje('Actividad vinculada');
          }
          this.guardando.set(false);
        },
        error: () => { this.mostrarMensaje('Error al crear'); this.guardando.set(false); }
      });
    }
  }

  private mostrarMensaje(msg: string) { this.mensaje.set(msg); setTimeout(() => this.mensaje.set(''), 3000); }
  volverALista() { this.router.navigate(['/procesos']); }
  getZoomPercent(): number { return Math.round(this.scale() * 100); }

  // ── Propiedades extras ────────────────────────────────────────
  updateNodoLabel(id: string, label: string) {
    this.nodos.update(list => list.map(n => n.id === id ? { ...n, label } : n));
  }
  updateGatewayType(id: string, type: 'exclusive' | 'parallel' | 'inclusive') {
    this.nodos.update(list => list.map(n => n.id === id ? { ...n, gatewayType: type } : n));
  }
}
