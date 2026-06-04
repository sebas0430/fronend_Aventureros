package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * LoginPage – Page Object para la ruta {@code /login}.
 *
 * <p>Selectores basados en el template real {@code login.html}:
 * <ul>
 *   <li>{@code id="correo"} → input de correo</li>
 *   <li>{@code id="password"} → input de contraseña</li>
 *   <li>{@code .login-button} → botón "Iniciar Sesión"</li>
 *   <li>{@code .btn-register-company} → enlace a /registro-empresa</li>
 *   <li>{@code .error-message} → div de error de credenciales</li>
 *   <li>{@code .spinner} → spinner de carga durante el login</li>
 * </ul>
 * </p>
 */
public class LoginPage extends BasePage {

    // ── Localizadores ────────────────────────────────────────────────────────
    private final By inputCorreo           = By.id("correo");
    private final By inputPassword         = By.id("password");
    private final By btnLogin              = By.cssSelector(".login-button");
    private final By btnCrearEmpresa       = By.cssSelector(".btn-register-company");
    private final By errorMessage          = By.cssSelector(".error-message");
    private final By spinnerLogin          = By.cssSelector(".spinner");
    private final By loginCard             = By.cssSelector(".login-card");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    /** Navega a la página de login. */
    public LoginPage open() {
        navigateTo("/login");
        waitForVisible(loginCard);
        return this;
    }

    /**
     * Completa el formulario de login y hace clic en "Iniciar Sesión".
     *
     * @param correo   correo del usuario
     * @param password contraseña
     */
    public void login(String correo, String password) {
        type(inputCorreo, correo);
        type(inputPassword, password);
        click(btnLogin);
    }

    /**
     * Realiza el login y espera a que la URL cambie (redirección post-auth).
     *
     * @param correo   correo del usuario
     * @param password contraseña
     * @param expectedUrlFragment fragmento de URL destino (p.ej. "/procesos")
     */
    public void loginAndWaitForRedirect(String correo, String password, String expectedUrlFragment) {
        login(correo, password);
        wait.until(d -> d.getCurrentUrl().contains(expectedUrlFragment) || d.getCurrentUrl().contains("/empleados"));
    }

    /** Hace clic en el enlace "Crear empresa" → navega a /registro-empresa. */
    public void clickCrearEmpresa() {
        click(btnCrearEmpresa);
        waitForUrlContains("/registro-empresa");
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    /** Retorna el mensaje de error mostrado al fallar el login. */
    public String getErrorMessage() {
        return getText(errorMessage);
    }

    /** Retorna {@code true} si hay un mensaje de error visible. */
    public boolean hasError() {
        return isDisplayed(errorMessage);
    }

    /** Retorna {@code true} si el spinner de carga está visible. */
    public boolean isLoading() {
        return isDisplayed(spinnerLogin);
    }
}
