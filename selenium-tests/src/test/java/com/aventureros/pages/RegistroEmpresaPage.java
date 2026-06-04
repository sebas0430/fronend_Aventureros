package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class RegistroEmpresaPage extends BasePage {

    private final By inputNombreEmpresa   = By.cssSelector("input[formControlName='nombre']");
    private final By inputNit             = By.cssSelector("input[formControlName='nit']");
    private final By inputCorreoAdmin     = By.cssSelector("input[formControlName='correoContacto']");
    private final By inputPasswordAdmin   = By.cssSelector("input[formControlName='passwordAdmin']");
    private final By inputConfirmPassword = By.cssSelector("input[formControlName='confirmPassword']");
    private final By btnCrearEmpresa      = By.cssSelector(".register-btn");
    private final By errorBox             = By.cssSelector(".error-box");
    private final By registerCard         = By.cssSelector(".register-card");

    public RegistroEmpresaPage(WebDriver driver) {
        super(driver);
    }

    public RegistroEmpresaPage open() {
        navigateTo("/registro-empresa");
        waitForVisible(registerCard);
        return this;
    }

    public void registrar(String nombre, String nit, String correo,
                          String password, String confirmPassword) {
        type(inputNombreEmpresa,   nombre);
        type(inputNit,             nit);
        type(inputCorreoAdmin,     correo);
        type(inputPasswordAdmin,   password);
        type(inputConfirmPassword, confirmPassword);
        click(btnCrearEmpresa);
    }

    public void registrarYEsperarLogin(String nombre, String nit, String correo,
                                        String password, String confirmPassword) {
        registrar(nombre, nit, correo, password, confirmPassword);
        longWait.until(d -> d.getCurrentUrl().contains("/login"));
    }

    public String getErrorMessage() {
        return getText(errorBox);
    }

    public boolean hasError() {
        return isDisplayed(errorBox);
    }

    // El botón solo se deshabilita mientras loading=true.
    // Para verificar "formulario vacío", comprobamos el estado
    // del FormGroup de Angular directamente via JavaScript.
    public boolean isSubmitDisabled() {
        WebElement btn = waitForVisible(btnCrearEmpresa);

        // 1. Verificar atributo disabled nativo (loading=true)
        if (!btn.isEnabled() || btn.getAttribute("disabled") != null) {
            return true;
        }

        // 2. Verificar si el FormGroup Angular está inválido via JS
        // ng-invalid se añade automáticamente por Angular a los inputs inválidos
        try {
            Long invalidInputs = (Long) ((JavascriptExecutor) driver).executeScript(
                "return document.querySelectorAll('form .ng-invalid').length;"
            );
            return invalidInputs != null && invalidInputs > 0;
        } catch (Exception e) {
            return false;
        }
    }
}