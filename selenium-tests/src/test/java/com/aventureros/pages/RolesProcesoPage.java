package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * RolesProcesoPage – Page Object para la ruta {@code /roles-proceso}.
 *
 * <p>Selectores extraídos de {@code roles-proceso.html}:
 * <ul>
 *   <li>{@code .btn-primary} (header) → "+ Nuevo Rol"</li>
 *   <li>{@code .rp-grid}              → grid de roles</li>
 *   <li>{@code .rp-card}              → card de rol</li>
 *   <li>{@code .modal-box}            → modal crear/editar</li>
 *   <li>{@code .modal-input}          → input nombre rol</li>
 *   <li>{@code .modal-textarea}       → textarea descripción</li>
 *   <li>{@code .btn-edit}             → botón editar en card</li>
 *   <li>{@code .btn-delete}           → botón eliminar en card</li>
 *   <li>{@code .btn-danger}           → confirmar eliminar</li>
 *   <li>{@code .rp-error}             → mensaje de error global</li>
 *   <li>{@code .rp-empty}             → estado vacío</li>
 * </ul>
 * </p>
 */
public class RolesProcesoPage extends BasePage {

    // ── Localizadores – Página ─────────────────────────────────────────────
    private final By btnNuevoRol        = By.cssSelector(".rp-header .btn-primary");
    private final By rpGrid             = By.cssSelector(".rp-grid");
    private final By rpEmpty            = By.cssSelector(".rp-empty");
    private final By rpError            = By.cssSelector(".rp-error");
    private final By rpLoading          = By.cssSelector(".rp-loading");
    private final By rpCards            = By.cssSelector(".rp-card");

    // ── Localizadores – Modal crear/editar ─────────────────────────────────
    private final By modalBox           = By.cssSelector(".modal-box:not(.modal-danger)");
    private final By inputNombreRol     = By.cssSelector(".modal-box:not(.modal-danger) .modal-input");
    private final By textareaDescRol    = By.cssSelector(".modal-box:not(.modal-danger) .modal-textarea");
    private final By btnGuardarRol      = By.cssSelector(".modal-box:not(.modal-danger) .btn-primary");
    private final By btnCancelarRol     = By.cssSelector(".modal-box:not(.modal-danger) .btn-secondary");
    private final By modalError         = By.cssSelector(".modal-box .modal-error");

    // ── Localizadores – Modal eliminar ─────────────────────────────────────
    private final By modalDanger          = By.cssSelector(".modal-box.modal-danger");
    private final By btnConfirmarEliminar = By.cssSelector(".modal-box.modal-danger .btn-danger");

    public RolesProcesoPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ───────────────────────────────────────────────────────────

    public RolesProcesoPage open() {
        navigateTo("/roles-proceso");
        waitForAngularLoad(rpLoading);
        return this;
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    /** Abre el modal de creación de rol. */
    public void abrirModalCrear() {
        click(btnNuevoRol);
        waitForVisible(modalBox);
    }

    /**
     * Crea un nuevo rol de proceso.
     *
     * @param nombre      nombre del rol
     * @param descripcion descripción (puede ser null)
     */
    public void crearRol(String nombre, String descripcion) {
        abrirModalCrear();
        type(inputNombreRol, nombre);
        if (descripcion != null && !descripcion.isBlank()) {
            type(textareaDescRol, descripcion);
        }
        click(btnGuardarRol);
        waitForInvisible(modalBox);
    }

    /**
     * Edita el primer rol de proceso visible.
     *
     * @param nuevoNombre nuevo nombre
     */
    public void editarPrimerRol(String nuevoNombre) {
        waitForVisible(rpCards);
        driver.findElements(By.cssSelector(".btn-edit")).get(0).click();
        waitForVisible(modalBox);
        type(inputNombreRol, nuevoNombre);
        click(btnGuardarRol);
        waitForInvisible(modalBox);
    }

    /**
     * Elimina el primer rol sin uso en el grid.
     * (Solo puede eliminarse si no está asignado a ningún proceso.)
     */
    public void eliminarPrimerRolSinUso() {
        waitForVisible(rpCards);
        // Busca botones de eliminar habilitados (sin disabled)
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

    // ── Getters de estado ────────────────────────────────────────────────────

    public boolean isGridVisible() {
        return isDisplayed(rpGrid);
    }

    public boolean isEmptyVisible() {
        return isDisplayed(rpEmpty);
    }

    public boolean isErrorVisible() {
        return isDisplayed(rpError);
    }

    public int contarRoles() {
        try {
            waitForVisible(rpCards);
            return driver.findElements(rpCards).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean isModalVisible() {
        return isDisplayed(modalBox);
    }
}
