package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * EmpleadosPage – Page Object para la ruta {@code /empleados}.
 *
 * <p>Selectores extraídos de {@code empleados.html}:
 * <ul>
 *   <li>{@code #btn-abrir-invitar}      → botón "Invitar miembro" (solo ADMIN_EMPRESA)</li>
 *   <li>{@code .pool-filter}            → select de filtro por pool</li>
 *   <li>{@code .employees-grid}         → grid de cards de empleados</li>
 *   <li>{@code .loading-state}          → spinner de carga</li>
 *   <li>{@code .error-banner}           → banner de error</li>
 *   <li>{@code .empty-state}            → estado vacío</li>
 * </ul>
 * El modal de invitación está en su propio componente {@code InvitarUsuarioPage}.
 * </p>
 */
public class EmpleadosPage extends BasePage {

    // ── Localizadores ────────────────────────────────────────────────────────
    private final By btnAbrirInvitar  = By.id("btn-abrir-invitar");
    private final By poolFilter       = By.cssSelector(".pool-filter");
    private final By employeesGrid    = By.cssSelector(".employees-grid");
    private final By loadingState     = By.cssSelector(".loading-state");
    private final By errorBanner      = By.cssSelector(".error-banner");
    private final By emptyState       = By.cssSelector(".empty-state");
    private final By pageHeader       = By.cssSelector("h1");

    // ── Localizadores – Modal Invitar ────────────────────────────────────────
    private final By inputCorreoInvitar   = By.id("input-correo");
    private final By selectRolInvitar     = By.id("select-rol");
    private final By inputPasswordInvitar = By.id("input-password");
    private final By btnEnviarInvitacion  = By.id("btn-enviar-invitacion");
    private final By btnCancelarInvitacion = By.id("btn-cancelar-invitacion");
    private final By modalInvitar         = By.cssSelector(".modal-panel");

    public EmpleadosPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ───────────────────────────────────────────────────────────

    public EmpleadosPage open() {
        navigateTo("/empleados");
        waitForAngularLoad(loadingState);
        return this;
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    /** Abre el modal de invitación de miembros. */
    public void abrirModalInvitar() {
        click(btnAbrirInvitar);
        waitForVisible(modalInvitar);
    }

    /**
     * Invita a un nuevo miembro de equipo.
     *
     * @param correo   correo del nuevo usuario
     * @param password contraseña inicial
     */
    public void invitarMiembro(String correo, String password) {
        abrirModalInvitar();
        type(inputCorreoInvitar, correo);
        type(inputPasswordInvitar, password);
        // El rol siempre queda en SOLO_LECTURA (único valor disponible en el select)
        click(btnEnviarInvitacion);
        waitForInvisible(modalInvitar);
    }

    /** Cierra el modal de invitación sin enviar. */
    public void cerrarModalInvitar() {
        click(btnCancelarInvitacion);
        waitForInvisible(modalInvitar);
    }

    /** Filtra los empleados por pool usando el select. */
    public void filtrarPorPool(String poolId) {
        selectByValue(poolFilter, poolId);
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    public boolean isGridVisible() {
        return isDisplayed(employeesGrid);
    }

    public boolean isErrorVisible() {
        return isDisplayed(errorBanner);
    }

    public boolean isEmptyStateVisible() {
        return isDisplayed(emptyState);
    }

    public boolean isBtnInvitarVisible() {
        return isDisplayed(btnAbrirInvitar);
    }

    public boolean isModalInvitarVisible() {
        return isDisplayed(modalInvitar);
    }

    public int contarEmpleados() {
        try {
            waitForVisible(employeesGrid);
            return driver.findElements(By.cssSelector(".employees-grid app-empleado-card")).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public String getTituloHeader() {
        return getText(pageHeader);
    }
}
