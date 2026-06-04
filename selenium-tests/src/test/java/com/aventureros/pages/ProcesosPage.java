package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * ProcesosPage – Page Object para la ruta {@code /procesos}.
 *
 * <p>Selectores extraídos de {@code procesos.html}:
 * <ul>
 *   <li>{@code #btn-crear-proceso}          → botón "Nuevo Proceso"</li>
 *   <li>{@code #modal-crear-proceso}        → modal de creación</li>
 *   <li>{@code #inp-nombre}                 → input nombre en modal crear</li>
 *   <li>{@code #inp-desc}                   → textarea descripción en modal crear</li>
 *   <li>{@code #inp-cat}                    → select categoría en modal crear</li>
 *   <li>{@code #btn-confirmar-crear}        → botón confirmar creación</li>
 *   <li>{@code #btn-cerrar-modal}           → botón cerrar modal</li>
 *   <li>{@code #btn-cancelar-modal}         → botón cancelar modal</li>
 *   <li>{@code .proceso-card}               → cards de procesos en el grid</li>
 *   <li>{@code #filtro-todos}, etc.         → botones de filtro por estado</li>
 *   <li>{@code #success-banner}             → banner de éxito</li>
 *   <li>{@code #btn-confirmar-estado}       → botón confirmar cambio de estado</li>
 *   <li>{@code #btn-confirmar-del}          → botón confirmar eliminación</li>
 *   <li>{@code #btn-confirmar-compartir}    → botón confirmar compartir</li>
 *   <li>{@code #inp-pool-destino}           → select pool destino</li>
 * </ul>
 * </p>
 */
public class ProcesosPage extends BasePage {

    // ── Localizadores – Header y filtros ─────────────────────────────────────
    private final By btnCrearProceso        = By.id("btn-crear-proceso");
    private final By filtroBtnTodos         = By.id("filtro-todos");
    private final By filtroBtnBorrador      = By.id("filtro-BORRADOR");
    private final By filtroBtnPublicado     = By.id("filtro-PUBLICADO");
    private final By filtroBtnInactivo      = By.id("filtro-INACTIVO");
    private final By successBanner          = By.id("success-banner");
    private final By errorBanner            = By.cssSelector(".error-banner");
    private final By loadingState           = By.cssSelector(".loading-state");
    private final By procesosGrid           = By.cssSelector(".procesos-grid");
    private final By emptyState             = By.cssSelector(".empty-state");

    // ── Localizadores – Modal Crear ──────────────────────────────────────────
    private final By modalCrear             = By.id("modal-crear-proceso");
    private final By inputNombreCrear       = By.id("inp-nombre");
    private final By inputDescCrear         = By.id("inp-desc");
    private final By selectCatCrear         = By.id("inp-cat");
    private final By btnConfirmarCrear      = By.id("btn-confirmar-crear");
    private final By btnCerrarModal         = By.id("btn-cerrar-modal");
    private final By btnCancelarModal       = By.id("btn-cancelar-modal");

    // ── Localizadores – Modal Editar ─────────────────────────────────────────
    private final By modalEditar            = By.id("modal-editar-proceso");
    private final By inputNombreEditar      = By.id("edit-nombre");
    private final By inputDescEditar        = By.id("edit-desc");
    private final By selectCatEditar        = By.id("edit-cat");
    private final By btnConfirmarEditar     = By.id("btn-confirmar-edit");
    private final By btnCerrarModalEditar   = By.id("btn-cerrar-modal-edit");

    // ── Localizadores – Modal Eliminar ───────────────────────────────────────
    private final By modalEliminar          = By.id("modal-confirmar-eliminar");
    private final By btnConfirmarDel        = By.id("btn-confirmar-del");
    private final By btnCerrarModalDel      = By.id("btn-cerrar-modal-del");

    // ── Localizadores – Modal Cambio de Estado ───────────────────────────────
    private final By modalConfirmEstado     = By.id("modal-confirm-estado");
    private final By btnConfirmarEstado     = By.id("btn-confirmar-estado");

    // ── Localizadores – Modal Compartir ──────────────────────────────────────
    private final By modalCompartir         = By.id("modal-compartir");
    private final By selectPoolDestino      = By.id("inp-pool-destino");
    private final By selectPermiso          = By.id("inp-permiso");
    private final By btnConfirmarCompartir  = By.id("btn-confirmar-compartir");

    public ProcesosPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ───────────────────────────────────────────────────────────

    public ProcesosPage open() {
        navigateTo("/procesos");
        waitForAngularLoad(loadingState);
        return this;
    }

    // ── Acciones – CRUD de Proceso ───────────────────────────────────────────

    /** Abre el modal de creación. */
    public void abrirModalCrear() {
        click(btnCrearProceso);
        waitForVisible(modalCrear);
    }

    /**
     * Rellena y envía el formulario de creación.
     *
     * @param nombre     nombre del proceso
     * @param descripcion descripción
     * @param categoria  categoría (debe coincidir con una opción del select)
     */
    public void crearProceso(String nombre, String descripcion, String categoria) {
        abrirModalCrear();
        type(inputNombreCrear, nombre);
        type(inputDescCrear, descripcion);
        selectByValue(selectCatCrear, categoria);
        click(btnConfirmarCrear);
        waitForInvisible(modalCrear);
    }

    /**
     * Edita un proceso existente buscando su botón de editar por ID dinámico.
     *
     * @param procesoId   ID del proceso
     * @param nuevoNombre nuevo nombre (puede ser null para no cambiar)
     * @param nuevaDesc   nueva descripción (puede ser null para no cambiar)
     */
    public void editarProceso(long procesoId, String nuevoNombre, String nuevaDesc) {
        By btnEditarIcon = By.cssSelector("#proceso-" + procesoId + " .btn-icon-edit");
        click(btnEditarIcon);
        waitForVisible(modalEditar);
        if (nuevoNombre != null) {
            type(inputNombreEditar, nuevoNombre);
        }
        if (nuevaDesc != null) {
            type(inputDescEditar, nuevaDesc);
        }
        click(btnConfirmarEditar);
        waitForInvisible(modalEditar);
    }

    /**
     * Elimina un proceso por su ID (flujo: botón eliminar → modal → confirmar).
     *
     * @param procesoId ID del proceso
     */
    public void eliminarProceso(long procesoId) {
        By btnEliminarIcon = By.cssSelector("#proceso-" + procesoId + " .btn-icon-delete");
        click(btnEliminarIcon);
        waitForVisible(modalEliminar);
        click(btnConfirmarDel);
        waitForInvisible(modalEliminar);
    }

    /**
     * Cambia el estado de un proceso (BORRADOR→PUBLICADO, PUBLICADO→INACTIVO, etc.)
     * usando los botones dinámicos de la card.
     *
     * @param procesoId ID del proceso
     * @param btnClass  clase del botón de acción (p.ej. "btn-publicar", "btn-inactivar")
     */
    public void cambiarEstado(long procesoId, String btnClass) {
        By btnAccion = By.cssSelector("#proceso-" + procesoId + " ." + btnClass);
        click(btnAccion);
        waitForVisible(modalConfirmEstado);
        click(btnConfirmarEstado);
        waitForInvisible(modalConfirmEstado);
    }

    /**
     * Abre el editor BPMN de un proceso en BORRADOR.
     *
     * @param procesoId ID del proceso
     */
    public void abrirEditor(long procesoId) {
        click(By.id("btn-editar-" + procesoId));
        waitForUrlContains("/editor/" + procesoId);
    }

    /**
     * Abre el modal de compartir con pool para un proceso PUBLICADO.
     *
     * @param procesoId    ID del proceso
     * @param poolDestinoId ID del pool destino
     * @param permiso      "LECTURA" o "LECTURA_ESCRITURA"
     */
    public void compartirConPool(long procesoId, String poolDestinoId, String permiso) {
        click(By.id("btn-compartir-" + procesoId));
        waitForVisible(modalCompartir);
        selectByValue(selectPoolDestino, poolDestinoId);
        selectByValue(selectPermiso, permiso);
        click(btnConfirmarCompartir);
        waitForInvisible(modalCompartir);
    }

    // ── Filtros ──────────────────────────────────────────────────────────────

    public void filtrarTodos() {
        click(filtroBtnTodos);
    }

    public void filtrarBorradores() {
        click(filtroBtnBorrador);
    }

    public void filtrarPublicados() {
        click(filtroBtnPublicado);
    }

    public void filtrarInactivos() {
        click(filtroBtnInactivo);
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    public boolean isModalCrearVisible() {
        return isDisplayed(modalCrear);
    }

    public boolean isSuccessVisible() {
        return isDisplayed(successBanner);
    }

    public boolean isErrorVisible() {
        return isDisplayed(errorBanner);
    }

    public boolean isGridVisible() {
        return isDisplayed(procesosGrid);
    }

    public boolean isEmptyStateVisible() {
        return isDisplayed(emptyState);
    }

    /** Retorna {@code true} si existe una card para el proceso con el ID dado. */
    public boolean existeCardProceso(long procesoId) {
        return isDisplayed(By.id("proceso-" + procesoId));
    }

    /** Retorna el texto de la card del proceso (nombre + estado, etc.). */
    public String getTextoCardProceso(long procesoId) {
        return getText(By.id("proceso-" + procesoId));
    }

    /** Cuenta cuántas cards de proceso hay en el grid actualmente. */
    public int contarCardsProcesos() {
        try {
            waitForVisible(procesosGrid);
            return driver.findElements(By.cssSelector(".proceso-card")).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean isConfirmarCrearHabilitado() {
        return waitForVisible(btnConfirmarCrear).isEnabled();
    }

    public void cerrarModalCrear() {
        click(btnCerrarModal);
        waitForInvisible(modalCrear);
    }
}
