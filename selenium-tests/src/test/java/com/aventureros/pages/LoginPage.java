package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

// LoginPage – Page Object para /login.

public class LoginPage extends BasePage {

    // ── Localizadores ─────────────────────────────────────────────────────────
    private final By inputCorreo     = By.id("correo");
    private final By inputPassword   = By.id("password");
    private final By btnLogin        = By.cssSelector(".login-button");
    private final By btnCrearEmpresa = By.cssSelector(".btn-register-company");
    private final By errorMessage    = By.cssSelector(".error-message");
    private final By spinnerLogin    = By.cssSelector(".spinner");
    private final By loginCard       = By.cssSelector(".login-card");

    /**
     * Locator para mensajes de validación inline de Angular Reactive Forms.
     * Cubre los patrones más comunes: .ng-invalid con .ng-touched,
     * mat-error (Angular Material), y clases propias de la app.
     */
    private final By validationMessages = By.cssSelector(
        ".error-message, .error-hint, mat-error, " +
        "input.ng-invalid.ng-touched, .field-error, .form-error"
    );

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    // ── Acciones ──────────────────────────────────────────────────────────────

    public LoginPage open() {
        navigateTo("/login");
        waitForVisible(loginCard);
        return this;
    }

    public void login(String correo, String password) {
        type(inputCorreo, correo);
        type(inputPassword, password);
        click(btnLogin);
    }

    public void loginAndWaitForRedirect(String correo, String password, String expectedUrlFragment) {
        login(correo, password);
        longWait.until(d ->
            d.getCurrentUrl().contains(expectedUrlFragment) ||
            d.getCurrentUrl().contains("/empleados")
        );
    }

    public void clickCrearEmpresa() {
        click(btnCrearEmpresa);
        waitForUrlContains("/registro-empresa");
    }

    // ── Getters de estado ─────────────────────────────────────────────────────

    public String getErrorMessage() {
        return getText(errorMessage);
    }

    public boolean hasError() {
        return isDisplayed(errorMessage);
    }

    public boolean hasValidationMessages() {
        return isDisplayed(validationMessages);
    }

    public boolean isLoading() {
        return isDisplayed(spinnerLogin);
    }

    public boolean isLoginButtonDisabled() {
        return isButtonDisabled(btnLogin);
    }
}
