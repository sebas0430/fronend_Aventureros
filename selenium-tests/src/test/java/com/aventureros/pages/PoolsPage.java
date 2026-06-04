package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * PoolsPage – Page Object para la ruta {@code /pools}.
 *
 * <p>Selectores extraídos de {@code pools.html}:
 * <ul>
 *   <li>{@code .btn-primary} (primer botón del header) → "Nuevo Pool"</li>
 *   <li>{@code .search-input}    → input de búsqueda</li>
 *   <li>{@code .pools-grid}      → grid de pools</li>
 *   <li>{@code .pool-card}       → card individual de pool</li>
 *   <li>{@code .modal-container} → modal crear/editar pool</li>
 *   <li>{@code #nombre}          → input nombre en modal (formControlName="nombre")</li>
 *   <li>{@code #descripcion}     → textarea descripción en modal</li>
 *   <li>{@code .btn-primary[type="submit"]} → botón "Crear Pool" / "Guardar Cambios"</li>
 *   <li>{@code .action-btn.edit} → botón editar en card</li>
 *   <li>{@code .action-btn.delete} → botón eliminar en card</li>
 * </ul>
 * </p>
 */
public class PoolsPage extends BasePage {

    // ── Localizadores – Header ────────────────────────────────────────────────
    private final By btnNuevoPool      = By.cssSelector(".header-actions .btn-primary");
    private final By searchInput       = By.cssSelector(".search-input");
    private final By poolsGrid         = By.cssSelector(".pools-grid");
    private final By emptyState        = By.cssSelector(".empty-state");
    private final By errorBanner       = By.cssSelector(".error-banner");

    // ── Localizadores – Modal crear/editar ───────────────────────────────────
    private final By modalContainer    = By.cssSelector(".modal-container");
    private final By inputNombre       = By.id("nombre");
    private final By inputDescripcion  = By.id("descripcion");
    private final By btnGuardar        = By.cssSelector(".modal-container .btn-primary[type='submit']");
    private final By btnCancelarModal  = By.cssSelector(".modal-container .btn-secondary");

    // ── Localizadores – Modal procesos del pool ───────────────────────────────
    private final By modalProcesos     = By.cssSelector(".modal-container .procesos-list");

    public PoolsPage(WebDriver driver) {
        super(driver);
    }

    // ── Navegación ───────────────────────────────────────────────────────────

    public PoolsPage open() {
        navigateTo("/pools");
        return this;
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    /** Abre el modal de creación de pool. */
    public void abrirModalCrear() {
        click(btnNuevoPool);
        waitForVisible(modalContainer);
    }

    /**
     * Crea un nuevo pool.
     *
     * @param nombre      nombre del pool
     * @param descripcion descripción (puede ser vacío)
     */
    public void crearPool(String nombre, String descripcion) {
        abrirModalCrear();
        type(inputNombre, nombre);
        if (descripcion != null && !descripcion.isBlank()) {
            type(inputDescripcion, descripcion);
        }
        click(btnGuardar);
        waitForInvisible(modalContainer);
    }

    /**
     * Busca pools usando el input de búsqueda.
     *
     * @param termino texto a buscar
     */
    public void buscar(String termino) {
        type(searchInput, termino);
    }

    /** Hace clic sobre la primera card de pool visible para ver sus procesos. */
    public void verProcesosDelPrimePool() {
        waitForVisible(poolsGrid);
        driver.findElements(By.cssSelector(".pool-card")).get(0).click();
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    public boolean isGridVisible() {
        return isDisplayed(poolsGrid);
    }

    public boolean isEmptyStateVisible() {
        return isDisplayed(emptyState);
    }

    public boolean isErrorVisible() {
        return isDisplayed(errorBanner);
    }

    public boolean isModalVisible() {
        return isDisplayed(modalContainer);
    }

    public int contarPools() {
        try {
            waitForVisible(poolsGrid);
            return driver.findElements(By.cssSelector(".pool-card")).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public String getNombrePrimerPool() {
        return getText(By.cssSelector(".pool-name"));
    }
}
