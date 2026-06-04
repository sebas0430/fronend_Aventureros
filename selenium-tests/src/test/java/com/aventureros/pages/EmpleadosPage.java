package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class EmpleadosPage extends BasePage {

    private final By btnAbrirInvitar       = By.id("btn-abrir-invitar");
    private final By poolFilter            = By.cssSelector(".pool-filter");
    private final By employeesGrid         = By.cssSelector(".employees-grid");
    private final By loadingState          = By.cssSelector(".loading-state");
    private final By errorBanner           = By.cssSelector(".error-banner");
    private final By emptyState            = By.cssSelector(".empty-state");
    private final By pageHeader            = By.cssSelector("h1");

    private final By inputCorreoInvitar    = By.id("input-correo");
    private final By inputPasswordInvitar  = By.id("input-password");
    private final By btnEnviarInvitacion   = By.id("btn-enviar-invitacion");
    private final By btnCancelarInvitacion = By.id("btn-cancelar-invitacion");

    // El modal tiene dos posibles contenedores según el estado
    private final By modalInvitar          = By.cssSelector(".modal-panel");
    private final By modalBackdrop         = By.cssSelector(".modal-backdrop");

    public EmpleadosPage(WebDriver driver) {
        super(driver);
    }

    public EmpleadosPage open() {
        navigateTo("/empleados");
        waitForAngularLoad(loadingState);
        wait.until(d ->
            !d.findElements(employeesGrid).isEmpty() ||
            !d.findElements(emptyState).isEmpty()
        );
        return this;
    }

    public void abrirModalInvitar() {
        click(btnAbrirInvitar);
        waitForVisible(modalInvitar);
    }

    public void invitarMiembro(String correo, String password) {
        abrirModalInvitar();
        type(inputCorreoInvitar, correo);
        type(inputPasswordInvitar, password);
        click(btnEnviarInvitacion);

        // Esperar que el backdrop (padre del modal) desaparezca.
        // El componente padre destruye app-invitar-usuario cuando recibe
        // el evento cerrar/invitacionExitosa, lo que elimina el backdrop.
        longWait.until(
            ExpectedConditions.invisibilityOfElementLocated(modalBackdrop)
        );
    }

    public void cerrarModalInvitar() {
        click(btnCancelarInvitacion);
        longWait.until(
            ExpectedConditions.invisibilityOfElementLocated(modalBackdrop)
        );
    }

    public boolean isGridVisible()         { return isDisplayed(employeesGrid);  }
    public boolean isErrorVisible()        { return isDisplayed(errorBanner);    }
    public boolean isEmptyStateVisible()   { return isDisplayed(emptyState);     }
    public boolean isBtnInvitarVisible()   { return isDisplayed(btnAbrirInvitar);}

    // Verificar modal por backdrop, que es el elemento raíz real
    public boolean isModalInvitarVisible() {
        return isDisplayed(modalBackdrop);
    }

    public int contarEmpleados() {
        try {
            waitForVisible(employeesGrid);
            return driver.findElements(
                By.cssSelector(".employees-grid app-empleado-card")
            ).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public String getTituloHeader() {
        return getText(pageHeader);
    }
}