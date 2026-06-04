package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * RegistroEmpresaPage – Page Object para la ruta {@code /registro-empresa}.
 *
 * <p>Selectores basados en {@code registro-empresa.html} (usa ReactiveFormsModule):
 * <ul>
 *   <li>{@code input[formControlName="nombre"]}   → nombre de empresa</li>
 *   <li>{@code input[formControlName="nit"]}       → NIT</li>
 *   <li>{@code input[formControlName="correoContacto"]} → correo admin</li>
 *   <li>{@code input[formControlName="passwordAdmin"]}   → contraseña admin</li>
 *   <li>{@code input[formControlName="confirmPassword"]} → confirmación contraseña</li>
 *   <li>{@code .register-btn} → botón "Crear empresa"</li>
 *   <li>{@code .error-box}    → mensaje de error</li>
 * </ul>
 * </p>
 */
public class RegistroEmpresaPage extends BasePage {

    // ── Localizadores ────────────────────────────────────────────────────────
    private final By inputNombreEmpresa    = By.cssSelector("input[formControlName='nombre']");
    private final By inputNit              = By.cssSelector("input[formControlName='nit']");
    private final By inputCorreoAdmin      = By.cssSelector("input[formControlName='correoContacto']");
    private final By inputPasswordAdmin    = By.cssSelector("input[formControlName='passwordAdmin']");
    private final By inputConfirmPassword  = By.cssSelector("input[formControlName='confirmPassword']");
    private final By btnCrearEmpresa       = By.cssSelector(".register-btn");
    private final By errorBox              = By.cssSelector(".error-box");
    private final By registerCard          = By.cssSelector(".register-card");

    public RegistroEmpresaPage(WebDriver driver) {
        super(driver);
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    /** Navega directamente a la página de registro. */
    public RegistroEmpresaPage open() {
        navigateTo("/registro-empresa");
        waitForVisible(registerCard);
        return this;
    }

    /**
     * Rellena y envía el formulario de registro de empresa.
     *
     * @param nombre          nombre de la empresa
     * @param nit             NIT de la empresa
     * @param correo          correo del administrador
     * @param password        contraseña del administrador
     * @param confirmPassword confirmación de la contraseña
     */
    public void registrar(String nombre, String nit, String correo,
                          String password, String confirmPassword) {
        type(inputNombreEmpresa, nombre);
        type(inputNit, nit);
        type(inputCorreoAdmin, correo);
        type(inputPasswordAdmin, password);
        type(inputConfirmPassword, confirmPassword);
        click(btnCrearEmpresa);
    }

    /**
     * Registra la empresa y espera la redirección al login.
     */
    public void registrarYEsperarLogin(String nombre, String nit, String correo,
                                        String password, String confirmPassword) {
        registrar(nombre, nit, correo, password, confirmPassword);
        waitForUrlContains("/login");
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    /** Retorna el mensaje de error visible. */
    public String getErrorMessage() {
        return getText(errorBox);
    }

    /** Retorna {@code true} si hay un error visible en el formulario. */
    public boolean hasError() {
        return isDisplayed(errorBox);
    }

    /** Retorna {@code true} si el botón "Crear empresa" está deshabilitado. */
    public boolean isSubmitDisabled() {
        return !waitForVisible(btnCrearEmpresa).isEnabled();
    }
}
