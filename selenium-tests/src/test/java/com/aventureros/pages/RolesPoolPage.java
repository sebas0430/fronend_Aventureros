package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

public class RolesPoolPage extends BasePage {

    private final By poolItems    = By.cssSelector(".pool-item");
    private final By btnNuevoRol  = By.cssSelector(".roles-panel-header .btn-primary");
    private final By rolesGrid    = By.cssSelector(".roles-grid");
    private final By rolesEmpty   = By.cssSelector(".roles-empty");
    private final By rpaError     = By.cssSelector(".rpa-error");
    private final By rpaLoading   = By.cssSelector(".rpa-loading");
    private final By rolCards     = By.cssSelector(".rol-card");
    private final By modalBox     = By.cssSelector(".modal-box");
    private final By inputNombreRol = By.cssSelector(".modal-box .modal-input");
    private final By btnGuardar   = By.cssSelector(".modal-box .btn-primary");
    private final By btnCancelar  = By.cssSelector(".modal-box .btn-secondary");

    // Selector correcto: checkboxes dentro de .perm-check en el modal
    private final By checkboxesEnModal =
        By.cssSelector(".modal-box .perm-check input[type='checkbox']");

    public RolesPoolPage(WebDriver driver) {
        super(driver);
    }

    public RolesPoolPage open() {
        navigateTo("/roles-pool");
        waitForAngularLoad(rpaLoading);
        return this;
    }

    public void seleccionarPrimerPool() {
        waitForVisible(poolItems);
        driver.findElements(poolItems).get(0).click();
        waitForAngularLoad(rpaLoading);
        wait.until(d ->
            !d.findElements(rolesGrid).isEmpty() ||
            !d.findElements(rolesEmpty).isEmpty()
        );
    }

    public void abrirModalCrear() {
        click(btnNuevoRol);
        waitForVisible(modalBox);
    }

    public void crearRolPool(String nombre, boolean conCrear,
                              boolean conEditar, boolean conPublicar) {
        abrirModalCrear();
        type(inputNombreRol, nombre);

        // Esperar presencia en DOM (no visibilidad — están dentro de <label>)
        wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(checkboxesEnModal));
        List<WebElement> checks = driver.findElements(checkboxesEnModal);

        // Orden en el HTML: 0=Crear, 1=Editar, 2=Eliminar, 3=Publicar, 4=GestionarRoles
        if (conCrear    && checks.size() > 0) jsClick(checks.get(0));
        if (conEditar   && checks.size() > 1) jsClick(checks.get(1));
        if (conPublicar && checks.size() > 3) jsClick(checks.get(3));

        click(btnGuardar);
        longWait.until(ExpectedConditions.invisibilityOfElementLocated(modalBox));
    }

    private void jsClick(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }

    public boolean isRolesGridVisible() { return isDisplayed(rolesGrid);  }
    public boolean isEmptyVisible()     { return isDisplayed(rolesEmpty); }
    public boolean isErrorVisible()     { return isDisplayed(rpaError);   }
    public boolean isModalVisible()     { return isDisplayed(modalBox);   }

    public int contarRoles() {
        try {
            wait.until(d ->
                !d.findElements(rolesGrid).isEmpty() ||
                !d.findElements(rolesEmpty).isEmpty()
            );
            return driver.findElements(rolCards).size();
        } catch (Exception e) {
            return 0;
        }
    }
}