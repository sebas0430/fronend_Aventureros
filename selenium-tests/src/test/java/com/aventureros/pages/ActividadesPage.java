package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

// ActividadesPage – Page Object para la ruta /procesos/:id/actividades.

public class ActividadesPage extends BasePage {

    // ── Localizadores – Layout ────────────────────────────────────────────────
    private final By btnVolver         = By.cssSelector(".btn-back");
    private final By btnNuevaActividad = By.cssSelector(".actividades-header .btn-primary");
    private final By actividadesGrid   = By.cssSelector(".actividades-grid");
    private final By emptyState        = By.cssSelector(".empty-state");
    private final By loadingState      = By.cssSelector(".loading-state");
    private final By actCards          = By.cssSelector(".actividad-card");

    // ── Localizadores – Modal ─────────────────────────────────────────────────
    private final By modalBox     = By.cssSelector(".modal-box");
    private final By inputNombre  = By.cssSelector(".modal-box input[type='text']");
    private final By inputOrden   = By.cssSelector(".modal-box input[type='number']");
    private final By textareaDesc = By.cssSelector(".modal-box textarea");
    private final By btnGuardar   = By.cssSelector(".modal-box .btn-primary");

    public ActividadesPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ────────────────────────────────────────────────────────────

    public ActividadesPage open(long procesoId) {
        navigateTo("/procesos/" + procesoId + "/actividades");
        waitForAngularLoad(loadingState);
        wait.until(d ->
            !d.findElements(actividadesGrid).isEmpty() ||
            !d.findElements(emptyState).isEmpty()
        );
        return this;
    }

    // ── Acciones ──────────────────────────────────────────────────────────────

    public void volverAProcesos() {
        click(btnVolver);
        waitForUrlContains("/procesos");
    }

    public void abrirModalCrear() {
        click(btnNuevaActividad);
        waitForVisible(modalBox);
    }

    public void crearActividad(String nombre, String descripcion, String orden) {
        abrirModalCrear();
        type(inputNombre, nombre);
        if (orden != null) type(inputOrden, orden);
        type(textareaDesc, descripcion);
        click(btnGuardar);
        waitForInvisible(modalBox);
    }

    // ── Getters de estado ─────────────────────────────────────────────────────

    public boolean isGridVisible()  { return isDisplayed(actividadesGrid); }
    public boolean isEmptyVisible() { return isDisplayed(emptyState);      }

    public int contarActividades() {
        try {
            wait.until(d ->
                !d.findElements(actividadesGrid).isEmpty() ||
                !d.findElements(emptyState).isEmpty()
            );
            return driver.findElements(actCards).size();
        } catch (Exception e) {
            return 0;
        }
    }
}
