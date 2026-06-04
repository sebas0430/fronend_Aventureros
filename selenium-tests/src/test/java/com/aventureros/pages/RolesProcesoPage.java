package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class RolesProcesoPage extends BasePage {

    private final By btnNuevoRol        = By.cssSelector(".rp-header .btn-primary");
    private final By rpGrid             = By.cssSelector(".rp-grid");
    private final By rpEmpty            = By.cssSelector(".rp-empty");
    private final By rpError            = By.cssSelector(".rp-error");
    private final By rpLoading          = By.cssSelector(".rp-loading");
    private final By rpCards            = By.cssSelector(".rp-card");

    // Modal crear/editar — en el HTML es .modal-box sin .modal-danger
    private final By modalBox           = By.cssSelector(".modal-box:not(.modal-danger)");
    private final By inputNombreRol     = By.cssSelector(".modal-box:not(.modal-danger) .modal-input");
    private final By textareaDescRol    = By.cssSelector(".modal-box:not(.modal-danger) .modal-textarea");
    private final By btnGuardarRol      = By.cssSelector(".modal-box:not(.modal-danger) .btn-primary");

    // Cancelar dentro del modal crear/editar específicamente
    private final By btnCancelarRol     = By.cssSelector(".modal-box:not(.modal-danger) .btn-secondary");

    private final By modalDanger          = By.cssSelector(".modal-box.modal-danger");
    private final By btnConfirmarEliminar = By.cssSelector(".modal-box.modal-danger .btn-danger");

    public RolesProcesoPage(WebDriver driver) {
        super(driver);
    }

    public RolesProcesoPage open() {
        navigateTo("/roles-proceso");
        waitForAngularLoad(rpLoading);
        wait.until(d ->
            !d.findElements(rpGrid).isEmpty() ||
            !d.findElements(rpEmpty).isEmpty()
        );
        return this;
    }

    public void abrirModalCrear() {
        click(btnNuevoRol);
        waitForVisible(modalBox);
    }

    // Método para cancelar el modal — usa el selector específico del modal crear/editar
    public void cancelarModal() {
        click(btnCancelarRol);
        wait.until(ExpectedConditions.invisibilityOfElementLocated(modalBox));
    }

    public void crearRol(String nombre, String descripcion) {
        abrirModalCrear();
        type(inputNombreRol, nombre);
        if (descripcion != null && !descripcion.isBlank()) {
            type(textareaDescRol, descripcion);
        }
        click(btnGuardarRol);
        // Esperar que el modal desaparezca — Angular lo destruye con *ngIf al guardar
        wait.until(ExpectedConditions.invisibilityOfElementLocated(modalBox));
        // Esperar que el grid se actualice
        wait.until(d ->
            !d.findElements(rpGrid).isEmpty() ||
            !d.findElements(rpEmpty).isEmpty()
        );
    }

    public void editarPrimerRol(String nuevoNombre) {
        waitForVisible(rpCards);
        driver.findElements(By.cssSelector(".btn-edit")).get(0).click();
        waitForVisible(modalBox);
        // Limpiar y escribir el nuevo nombre
        type(inputNombreRol, nuevoNombre);
        click(btnGuardarRol);
        wait.until(ExpectedConditions.invisibilityOfElementLocated(modalBox));
    }

    public void eliminarPrimerRolSinUso() {
        waitForVisible(rpCards);
        driver.findElements(By.cssSelector(".btn-delete:not([disabled])"))
            .stream()
            .findFirst()
            .ifPresent(btn -> {
                btn.click();
                waitForVisible(modalDanger);
                click(btnConfirmarEliminar);
                waitForInvisible(modalDanger);
            });
    }

    public boolean isGridVisible()    { return isDisplayed(rpGrid);  }
    public boolean isEmptyVisible()   { return isDisplayed(rpEmpty); }
    public boolean isErrorVisible()   { return isDisplayed(rpError); }
    public boolean isModalVisible()   { return isDisplayed(modalBox); }

    public int contarRoles() {
        try {
            wait.until(d ->
                !d.findElements(rpGrid).isEmpty() ||
                !d.findElements(rpEmpty).isEmpty()
            );
            return driver.findElements(rpCards).size();
        } catch (Exception e) {
            return 0;
        }
    }
}