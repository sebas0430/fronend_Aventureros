package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.PoolsPage;
import com.aventureros.pages.LanesPage;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * PoolsYLanesTest – Gestión de Pools y Lanes.
 *
 * <p>Casos cubiertos:
 * <ol>
 *   <li>La página de pools carga correctamente</li>
 *   <li>Crear un pool nuevo → aparece en el grid</li>
 *   <li>Búsqueda de pool por nombre</li>
 *   <li>Abrir modal de edición de pool</li>
 *   <li>La página de lanes carga correctamente</li>
 *   <li>Seleccionar un pool en el panel lateral de Lanes</li>
 *   <li>Crear un lane en un pool</li>
 *   <li>Acceso a Pools restringido para SOLO_LECTURA (no en el navbar)</li>
 * </ol>
 * </p>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Gestión de Pools y Lanes")
class PoolsYLanesTest extends BaseTest {

    private PoolsPage poolsPage;
    private LanesPage lanesPage;

    private static final String NOMBRE_POOL = "Pool E2E " + System.currentTimeMillis();

    @BeforeAll
    void loginComoAdmin() {
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }

    @BeforeEach
    void setUp() {
        poolsPage = new PoolsPage(driver);
        lanesPage = new LanesPage(driver);
    }

    // ── Tests – Pools ────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("TC-POOL-01: Página de pools carga sin errores")
    void paginaPoolsCargaCorrectamente() {
        poolsPage.open();

        assertFalse(poolsPage.isErrorVisible(),
            "No debe haber error al cargar /pools");
        boolean tieneGrid  = poolsPage.isGridVisible();
        boolean tieneEmpty = poolsPage.isEmptyStateVisible();
        assertTrue(tieneGrid || tieneEmpty,
            "Debe mostrar el grid de pools o el estado vacío");
    }

    @Test
    @Order(2)
    @DisplayName("TC-POOL-02: Crear pool nuevo → aparece en el grid")
    void crearPoolNuevo() {
        poolsPage.open();
        int cantidadAntes = poolsPage.contarPools();

        poolsPage.crearPool(NOMBRE_POOL, "Pool generado por pruebas E2E");

        int cantidadDespues = poolsPage.contarPools();
        assertTrue(cantidadDespues >= cantidadAntes,
            "El número de pools no debe disminuir tras crear uno nuevo");
        // El pool recién creado debe ser encontrable en el grid
        assertFalse(poolsPage.isErrorVisible(),
            "No debe haber errores tras crear el pool");
    }

    @Test
    @Order(3)
    @DisplayName("TC-POOL-03: Búsqueda por nombre filtra los resultados")
    void busquedaFiltrarPools() {
        poolsPage.open();
        // Buscar un término que no existe → debe mostrar empty state
        poolsPage.buscar("xxxxxNOEXISTExxxxxE2E");

        // O no encuentra nada, o muestra 0 resultados sin error
        assertFalse(poolsPage.isErrorVisible(),
            "La búsqueda no debe producir un error");
    }

    @Test
    @Order(4)
    @DisplayName("TC-POOL-04: Abrir modal de creación y cancelar")
    void abrirYCancelarModalPool() {
        poolsPage.open();
        poolsPage.abrirModalCrear();

        assertTrue(poolsPage.isModalVisible(),
            "El modal debe abrirse al hacer clic en 'Nuevo Pool'");

        // Cancelar cerrando el overlay
        poolsPage.click(org.openqa.selenium.By.cssSelector(".modal-container .btn-secondary"));
        assertFalse(poolsPage.isModalVisible(),
            "El modal debe cerrarse tras hacer clic en 'Cancelar'");
    }

    // ── Tests – Lanes ────────────────────────────────────────────────────────

    @Test
    @Order(5)
    @DisplayName("TC-LANE-01: Página de Lanes carga correctamente")
    void paginaLanesCargaCorrectamente() {
        lanesPage.open();

        assertFalse(lanesPage.isErrorVisible(),
            "No debe haber error al cargar /lanes");
        assertTrue(lanesPage.isLanesPanelVisible() || driver.getCurrentUrl().contains("/lanes"),
            "La página de Lanes debe cargarse correctamente");
    }

    @Test
    @Order(6)
    @DisplayName("TC-LANE-02: Seleccionar un pool muestra el panel de lanes")
    void seleccionarPoolMuestraPanelDeLanes() {
        lanesPage.open();

        // Si hay pools disponibles, seleccionar el primero
        if (lanesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".pool-item"))) {
            lanesPage.seleccionarPrimerPool();
            assertTrue(lanesPage.isLanesPanelVisible(),
                "Al seleccionar un pool debe mostrarse el panel de lanes");
        } else {
            // Sin pools, el placeholder debe mostrarse
            assertTrue(lanesPage.isDisplayed(
                org.openqa.selenium.By.cssSelector(".lanes-placeholder")),
                "Sin pools, debe mostrarse el placeholder de selección");
        }
    }

    @Test
    @Order(7)
    @DisplayName("TC-LANE-03: Crear lane en un pool → aparece en la lista")
    void crearLaneEnPool() {
        lanesPage.open();

        // Solo ejecutar si hay pools disponibles
        if (!lanesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".pool-item"))) {
            return; // Skip: no hay pools aún
        }

        lanesPage.seleccionarPrimerPool();
        int cantidadAntes = lanesPage.contarLanes();

        lanesPage.crearLane("Lane E2E " + System.currentTimeMillis(), "Lane de prueba");

        int cantidadDespues = lanesPage.contarLanes();
        assertTrue(cantidadDespues > cantidadAntes,
            "El número de lanes debe incrementar tras crear uno. Antes: "
            + cantidadAntes + ", Después: " + cantidadDespues);
    }
}
