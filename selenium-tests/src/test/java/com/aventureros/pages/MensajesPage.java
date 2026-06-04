package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * MensajesPage – Page Object para la ruta {@code /mensajes}.
 *
 * <p>Selectores extraídos de {@code mensajes-proceso.html}:
 * <ul>
 *   <li>{@code .proceso-item}      → items del panel de procesos</li>
 *   <li>{@code .btn-primary}       → "+ Nuevo Evento"</li>
 *   <li>{@code .modal-box}         → modal crear evento</li>
 *   <li>{@code .modal-input:first} → input nombre mensaje</li>
 *   <li>Select tipo (THROW/CATCH)  → segundo .modal-input</li>
 *   <li>{@code .btn-launch}        → botón "🚀 Lanzar" en evento THROW</li>
 *   <li>{@code .btn-delete}        → botón "🗑️" en evento</li>
 *   <li>{@code .evento-card}       → cards de eventos del proceso</li>
 *   <li>{@code .traza-table}       → tabla de trazabilidad de CATCH</li>
 * </ul>
 * </p>
 */
public class MensajesPage extends BasePage {

    // ── Localizadores – Layout ────────────────────────────────────────────────
    private final By procesosPanel     = By.cssSelector(".procesos-panel");
    private final By procesoItems      = By.cssSelector(".proceso-item");
    private final By eventosPanel      = By.cssSelector(".eventos-panel");
    private final By btnNuevoEvento    = By.cssSelector(".eventos-header .btn-primary");
    private final By eventoCards       = By.cssSelector(".evento-card");
    private final By eventosEmpty      = By.cssSelector(".eventos-empty");
    private final By mpError           = By.cssSelector(".mp-error");
    private final By mpLoading         = By.cssSelector(".mp-loading");
    private final By trazaTable        = By.cssSelector(".traza-table");

    // ── Localizadores – Modal crear evento ────────────────────────────────────
    private final By modalBox          = By.cssSelector(".modal-box");
    private final By inputNombreMensaje = By.cssSelector(".modal-box .modal-input:first-of-type");
    private final By selectTipoEvento  = By.cssSelector(".modal-box select.modal-input");
    private final By selectFallback    = By.cssSelector(".modal-box select.modal-input:last-of-type");
    private final By btnGuardarEvento  = By.cssSelector(".modal-box .btn-primary");
    private final By btnCancelarEvento = By.cssSelector(".modal-box .btn-secondary");

    // ── Localizadores – Modal lanzar mensaje ──────────────────────────────────
    private final By modalLanzar       = By.cssSelector(".modal-box");
    private final By textareaPayload   = By.cssSelector(".modal-box .modal-textarea");
    private final By btnLanzar         = By.cssSelector(".modal-box .btn-primary:last-child");
    private final By resultadoLanzar   = By.cssSelector(".lanzar-resultado");

    public MensajesPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ───────────────────────────────────────────────────────────

    public MensajesPage open() {
        navigateTo("/mensajes");
        return this;
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    /** Selecciona el primer proceso del panel lateral. */
    public void seleccionarPrimerProceso() {
        waitForVisible(procesoItems);
        driver.findElements(procesoItems).get(0).click();
        waitForAngularLoad(mpLoading);
    }

    /**
     * Crea un nuevo evento de mensaje.
     *
     * @param nombreMensaje nombre del mensaje (p.ej. "pedido-aprobado")
     * @param tipo          "THROW" o "CATCH"
     */
    public void crearEvento(String nombreMensaje, String tipo) {
        click(btnNuevoEvento);
        waitForVisible(modalBox);
        type(inputNombreMensaje, nombreMensaje);
        selectByValue(selectTipoEvento, tipo);
        click(btnGuardarEvento);
        waitForInvisible(modalBox);
    }

    /**
     * Lanza un mensaje desde el primer evento de tipo THROW visible.
     *
     * @param payload JSON del payload (puede ser "{}")
     */
    public void lanzarPrimerMensaje(String payload) {
        waitForVisible(eventoCards);
        driver.findElements(By.cssSelector(".btn-launch")).get(0).click();
        waitForVisible(modalLanzar);
        type(textareaPayload, payload);
        click(btnLanzar);
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    public boolean isEventosPanelVisible() {
        return isDisplayed(eventosPanel);
    }

    public boolean isEmptyVisible() {
        return isDisplayed(eventosEmpty);
    }

    public boolean isErrorVisible() {
        return isDisplayed(mpError);
    }

    public boolean isTrazaVisible() {
        return isDisplayed(trazaTable);
    }

    public int contarEventos() {
        try {
            waitForVisible(eventoCards);
            return driver.findElements(eventoCards).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean isResultadoLanzarVisible() {
        return isDisplayed(resultadoLanzar);
    }
}
