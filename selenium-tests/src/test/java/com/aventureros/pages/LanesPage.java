package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * LanesPage – Page Object para la ruta {@code /lanes}.
 *
 * <p>Selectores extraídos de {@code lanes.html}:
 * <ul>
 *   <li>{@code .pool-item}         → items del panel de pools (sidebar izquierdo)</li>
 *   <li>{@code .pool-item.active}  → pool actualmente seleccionado</li>
 *   <li>{@code .btn-primary}       → botón "+ Nuevo Lane"</li>
 *   <li>{@code .modal-box}         → modal crear/editar lane</li>
 *   <li>{@code .modal-input}       → input nombre en modal</li>
 *   <li>{@code .modal-textarea}    → textarea descripción en modal</li>
 *   <li>{@code .btn-edit}          → botón editar lane en card</li>
 *   <li>{@code .btn-delete}        → botón eliminar lane en card</li>
 *   <li>{@code .btn-danger}        → botón confirmar eliminar en modal danger</li>
 *   <li>{@code .lane-card}         → cards de lane en panel derecho</li>
 *   <li>{@code .lanes-panel}       → panel principal de lanes</li>
 * </ul>
 * </p>
 */
public class LanesPage extends BasePage {

    // ── Localizadores – Layout ────────────────────────────────────────────────
    private final By poolItems           = By.cssSelector(".pool-item");
    private final By poolItemActivo      = By.cssSelector(".pool-item.active");
    private final By btnNuevoLane        = By.cssSelector(".lanes-panel-header .btn-primary");
    private final By lanesPanel          = By.cssSelector(".lanes-panel");
    private final By laneCards           = By.cssSelector(".lane-card");
    private final By lanesEmpty          = By.cssSelector(".lanes-empty");
    private final By lanesLoading        = By.cssSelector(".lanes-loading");
    private final By errorMsg            = By.cssSelector(".lanes-error");

    // ── Localizadores – Modal crear/editar ────────────────────────────────────
    private final By modalBox            = By.cssSelector(".modal-box:not(.modal-danger)");
    private final By inputNombreLane     = By.cssSelector(".modal-box .modal-input");
    private final By textareaDescLane    = By.cssSelector(".modal-box .modal-textarea");
    private final By btnGuardarLane      = By.cssSelector(".modal-box .btn-primary");
    private final By btnCancelarLane     = By.cssSelector(".modal-box .btn-secondary");

    // ── Localizadores – Modal eliminar ────────────────────────────────────────
    private final By modalDanger         = By.cssSelector(".modal-box.modal-danger");
    private final By btnConfirmarEliminar = By.cssSelector(".modal-box.modal-danger .btn-danger");
    private final By btnCancelarEliminar = By.cssSelector(".modal-box.modal-danger .btn-secondary");

    public LanesPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ───────────────────────────────────────────────────────────

    public LanesPage open() {
        navigateTo("/lanes");
        return this;
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    /**
     * Selecciona el primer pool disponible en el panel lateral.
     */
    public void seleccionarPrimerPool() {
        waitForVisible(poolItems);
        driver.findElements(poolItems).get(0).click();
        waitForAngularLoad(lanesLoading);
    }

    /**
     * Abre el modal de creación de lane (requiere que un pool esté seleccionado).
     */
    public void abrirModalCrear() {
        click(btnNuevoLane);
        waitForVisible(modalBox);
    }

    /**
     * Crea un nuevo lane.
     *
     * @param nombre      nombre del lane
     * @param descripcion descripción (puede ser nulo)
     */
    public void crearLane(String nombre, String descripcion) {
        abrirModalCrear();
        // Hay un solo .modal-input en el modal de crear/editar
        type(inputNombreLane, nombre);
        if (descripcion != null && !descripcion.isBlank()) {
            type(textareaDescLane, descripcion);
        }
        click(btnGuardarLane);
        waitForInvisible(modalBox);
    }

    /**
     * Elimina el primer lane visible en la lista.
     * Hace clic en el botón 🗑️ y confirma en el modal de peligro.
     */
    public void eliminarPrimerLane() {
        waitForVisible(laneCards);
        driver.findElements(By.cssSelector(".lane-card .btn-delete")).get(0).click();
        waitForVisible(modalDanger);
        click(btnConfirmarEliminar);
        waitForInvisible(modalDanger);
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    public boolean isLanesPanelVisible() {
        return isDisplayed(lanesPanel);
    }

    public boolean isEmptyVisible() {
        return isDisplayed(lanesEmpty);
    }

    public boolean isErrorVisible() {
        return isDisplayed(errorMsg);
    }

    public int contarLanes() {
        try {
            waitForVisible(laneCards);
            return driver.findElements(laneCards).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean isModalCrearVisible() {
        return isDisplayed(modalBox);
    }

    public boolean isModalEliminarVisible() {
        return isDisplayed(modalDanger);
    }
}
