package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

// ConectoresPage – Page Object para /conectores.
public class ConectoresPage extends BasePage {

    // ── Localizadores – Página ────────────────────────────────────────────────
    private final By btnNuevoConector  = By.cssSelector(".con-header .btn-primary");
    private final By conGrid           = By.cssSelector(".con-grid");
    private final By conEmpty          = By.cssSelector(".con-empty");
    private final By conError          = By.cssSelector(".con-error");
    private final By conLoading        = By.cssSelector(".con-loading");

    // ── Localizadores – Modal crear/editar ────────────────────────────────────
    private final By modalBox           = By.cssSelector(".modal-box:not(.modal-danger)");
    private final By inputNombre        = By.cssSelector(".modal-box:not(.modal-danger) input[type='text'].modal-input");
    private final By selectTipo         = By.cssSelector(".modal-box:not(.modal-danger) select.modal-input");
    private final By inputDestino       = By.cssSelector(".modal-box:not(.modal-danger) input[placeholder*='https']");
    private final By inputMaxReintentos = By.cssSelector(".modal-box:not(.modal-danger) input[min='0']");
    private final By btnGuardar         = By.cssSelector(".modal-box:not(.modal-danger) .btn-primary");
    private final By btnCancelar        = By.cssSelector(".modal-box:not(.modal-danger) .btn-secondary");

    // ── Localizadores – Modal eliminar ────────────────────────────────────────
    private final By modalDanger          = By.cssSelector(".modal-box.modal-danger");
    private final By btnConfirmarEliminar = By.cssSelector(".modal-box.modal-danger .btn-danger");

    public ConectoresPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ────────────────────────────────────────────────────────────

    public ConectoresPage open() {
        navigateTo("/conectores");
        waitForAngularLoad(conLoading);
        wait.until(d ->
            !d.findElements(conGrid).isEmpty() ||
            !d.findElements(conEmpty).isEmpty()
        );
        return this;
    }

    // ── Acciones ──────────────────────────────────────────────────────────────

    public void abrirModalCrear() {
        click(btnNuevoConector);
        waitForVisible(modalBox);
    }

    public void crearConector(String nombre, String tipo, String destino, int maxReintentos) {
        abrirModalCrear();
        type(inputNombre, nombre);
        selectByValueOrText(selectTipo, tipo);
        type(inputDestino, destino);
        type(inputMaxReintentos, String.valueOf(maxReintentos));
        click(btnGuardar);
        waitForInvisible(modalBox);
        waitForVisible(conGrid);
    }

    public void eliminarPrimerConector() {
        waitForVisible(conGrid);
        driver.findElements(By.cssSelector(".con-card .btn-delete")).get(0).click();
        waitForVisible(modalDanger);
        click(btnConfirmarEliminar);
        waitForInvisible(modalDanger);
    }

    // ── Getters de estado ─────────────────────────────────────────────────────

    public boolean isGridVisible()       { return isDisplayed(conGrid);  }
    public boolean isEmptyVisible()      { return isDisplayed(conEmpty); }
    public boolean isErrorVisible()      { return isDisplayed(conError); }
    public boolean isModalCrearVisible() { return isDisplayed(modalBox); }

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
}
