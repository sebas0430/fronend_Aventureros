package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * ConectoresPage – Page Object para la ruta {@code /conectores}.
 *
 * <p>Selectores extraídos de {@code conectores.html}:
 * <ul>
 *   <li>{@code .btn-primary} (header) → "+ Nuevo Conector"</li>
 *   <li>{@code .con-grid}             → grid de cards de conectores</li>
 *   <li>{@code .con-card}             → card individual</li>
 *   <li>{@code .con-name}             → nombre del conector en la card</li>
 *   <li>{@code .modal-box}            → modal crear/editar</li>
 *   <li>Inputs del modal → todos usan {@code .modal-input} con types distintos</li>
 *   <li>{@code .btn-send}             → botón "📤 Enviar" en card</li>
 *   <li>{@code .btn-edit}             → botón "✏️" en card</li>
 *   <li>{@code .btn-delete}           → botón "🗑️" en card</li>
 *   <li>{@code .btn-danger}           → confirmar eliminar</li>
 * </ul>
 * </p>
 */
public class ConectoresPage extends BasePage {

    // ── Localizadores – Página ─────────────────────────────────────────────
    private final By btnNuevoConector  = By.cssSelector(".con-header .btn-primary");
    private final By conGrid           = By.cssSelector(".con-grid");
    private final By conEmpty          = By.cssSelector(".con-empty");
    private final By conError          = By.cssSelector(".con-error");
    private final By conLoading        = By.cssSelector(".con-loading");

    // ── Localizadores – Modal crear/editar ─────────────────────────────────
    // Los inputs comparten la clase .modal-input pero están en orden determinístico
    private final By modalBox           = By.cssSelector(".modal-box:not(.modal-danger)");
    private final By inputNombre        = By.cssSelector(".modal-box:not(.modal-danger) .modal-input:nth-child(2)");
    private final By selectTipo         = By.cssSelector(".modal-box:not(.modal-danger) select.modal-input");
    private final By inputDestino       = By.cssSelector(".modal-box:not(.modal-danger) input[placeholder*='https']");
    private final By inputPuerto        = By.cssSelector(".modal-box:not(.modal-danger) input[type='number']:not([min])");
    private final By inputCredencial    = By.cssSelector(".modal-box:not(.modal-danger) input[placeholder*='vault']");
    private final By inputMaxReintentos = By.cssSelector(".modal-box:not(.modal-danger) input[min='0']");
    private final By btnGuardar         = By.cssSelector(".modal-box:not(.modal-danger) .btn-primary");
    private final By btnCancelar        = By.cssSelector(".modal-box:not(.modal-danger) .btn-secondary");

    // ── Localizadores – Modal eliminar ──────────────────────────────────────
    private final By modalDanger          = By.cssSelector(".modal-box.modal-danger");
    private final By btnConfirmarEliminar = By.cssSelector(".modal-box.modal-danger .btn-danger");

    // ── Localizadores – Modal enviar ────────────────────────────────────────
    private final By modalEnvio           = By.cssSelector(".modal-box .modal-title");
    private final By inputProcesoIdEnvio  = By.cssSelector(".modal-box input[placeholder='ID del proceso']");
    private final By textareaPayload      = By.cssSelector(".modal-box .modal-textarea");
    private final By btnEnviar            = By.cssSelector(".modal-box .btn-primary:last-child");
    private final By resultadoEnvio       = By.cssSelector(".envio-resultado");

    public ConectoresPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ───────────────────────────────────────────────────────────

    public ConectoresPage open() {
        navigateTo("/conectores");
        waitForAngularLoad(conLoading);
        return this;
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    /** Abre el modal de creación de conector. */
    public void abrirModalCrear() {
        click(btnNuevoConector);
        waitForVisible(modalBox);
    }

    /**
     * Crea un nuevo conector externo.
     *
     * @param nombre         nombre del conector
     * @param tipo           tipo: EMAIL, WEBHOOK, QUEUE
     * @param destino        URL/host destino
     * @param maxReintentos  número máximo de reintentos
     */
    public void crearConector(String nombre, String tipo, String destino, int maxReintentos) {
        abrirModalCrear();
        type(inputNombre, nombre);
        selectByValue(selectTipo, tipo);
        type(inputDestino, destino);
        type(inputMaxReintentos, String.valueOf(maxReintentos));
        click(btnGuardar);
        waitForInvisible(modalBox);
    }

    /**
     * Elimina el primer conector visible en el grid.
     */
    public void eliminarPrimerConector() {
        waitForVisible(conGrid);
        driver.findElements(By.cssSelector(".con-card .btn-delete")).get(0).click();
        waitForVisible(modalDanger);
        click(btnConfirmarEliminar);
        waitForInvisible(modalDanger);
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    public boolean isGridVisible() {
        return isDisplayed(conGrid);
    }

    public boolean isEmptyVisible() {
        return isDisplayed(conEmpty);
    }

    public boolean isErrorVisible() {
        return isDisplayed(conError);
    }

    public int contarConectores() {
        try {
            waitForVisible(conGrid);
            return driver.findElements(By.cssSelector(".con-card")).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public String getNombrePrimerConector() {
        return getText(By.cssSelector(".con-name"));
    }

    public boolean isModalCrearVisible() {
        return isDisplayed(modalBox);
    }
}
