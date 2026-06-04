package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * RolesPoolPage – Page Object para la ruta {@code /roles-pool}.
 *
 * <p>Selectores extraídos de {@code roles-pool-admin.html}:
 * <ul>
 *   <li>{@code .pool-item}        → items del panel lateral de pools</li>
 *   <li>{@code .btn-primary}      → "+ Nuevo Rol" (en panel derecho)</li>
 *   <li>{@code .roles-grid}       → grid de roles del pool seleccionado</li>
 *   <li>{@code .rol-card}         → card de un rol del pool</li>
 *   <li>{@code .modal-box}        → modal crear/editar</li>
 *   <li>{@code .modal-input}      → input nombre</li>
 *   <li>{@code .perm-check input} → checkboxes de permisos</li>
 *   <li>{@code .btn-edit}         → botón editar rol</li>
 * </ul>
 * </p>
 */
public class RolesPoolPage extends BasePage {

    // ── Localizadores – Layout ─────────────────────────────────────────────
    private final By poolItems         = By.cssSelector(".pool-item");
    private final By btnNuevoRol       = By.cssSelector(".roles-panel-header .btn-primary");
    private final By rolesGrid         = By.cssSelector(".roles-grid");
    private final By rolesEmpty        = By.cssSelector(".roles-empty");
    private final By rpaError          = By.cssSelector(".rpa-error");
    private final By rpaLoading        = By.cssSelector(".rpa-loading");
    private final By rolCards          = By.cssSelector(".rol-card");

    // ── Localizadores – Modal ──────────────────────────────────────────────
    private final By modalBox          = By.cssSelector(".modal-box");
    private final By inputNombreRol    = By.cssSelector(".modal-box .modal-input");
    private final By textareaDescRol   = By.cssSelector(".modal-box .modal-textarea");
    private final By checkCrear        = By.cssSelector("input[type='checkbox']:nth-child(1)");
    private final By checkEditar       = By.cssSelector("input[type='checkbox']:nth-child(2)");
    private final By checkEliminar     = By.cssSelector("input[type='checkbox']:nth-child(3)");
    private final By checkPublicar     = By.cssSelector("input[type='checkbox']:nth-child(4)");
    private final By checkRoles        = By.cssSelector("input[type='checkbox']:nth-child(5)");
    private final By btnGuardar        = By.cssSelector(".modal-box .btn-primary");
    private final By btnCancelar       = By.cssSelector(".modal-box .btn-secondary");

    public RolesPoolPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ───────────────────────────────────────────────────────────

    public RolesPoolPage open() {
        navigateTo("/roles-pool");
        return this;
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    /** Selecciona el primer pool del panel lateral. */
    public void seleccionarPrimerPool() {
        waitForVisible(poolItems);
        driver.findElements(poolItems).get(0).click();
        waitForAngularLoad(rpaLoading);
    }

    /** Abre el modal de creación de rol. */
    public void abrirModalCrear() {
        click(btnNuevoRol);
        waitForVisible(modalBox);
    }

    /**
     * Crea un rol de pool con los permisos indicados.
     *
     * @param nombre        nombre del rol
     * @param conCrear      habilitar permiso Crear Proceso
     * @param conEditar     habilitar permiso Editar Proceso
     * @param conPublicar   habilitar permiso Publicar Proceso
     */
    public void crearRolPool(String nombre, boolean conCrear, boolean conEditar, boolean conPublicar) {
        abrirModalCrear();
        type(inputNombreRol, nombre);
        if (conCrear) toggleCheckbox(checkCrear);
        if (conEditar) toggleCheckbox(checkEditar);
        if (conPublicar) toggleCheckbox(checkPublicar);
        click(btnGuardar);
        waitForInvisible(modalBox);
    }

    private void toggleCheckbox(By checkLocator) {
        waitForVisible(checkLocator).click();
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    public boolean isRolesGridVisible() {
        return isDisplayed(rolesGrid);
    }

    public boolean isEmptyVisible() {
        return isDisplayed(rolesEmpty);
    }

    public boolean isErrorVisible() {
        return isDisplayed(rpaError);
    }

    public int contarRoles() {
        try {
            waitForVisible(rolCards);
            return driver.findElements(rolCards).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean isModalVisible() {
        return isDisplayed(modalBox);
    }
}
