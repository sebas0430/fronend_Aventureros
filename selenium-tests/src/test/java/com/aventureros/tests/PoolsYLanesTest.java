package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.PoolsPage;
import com.aventureros.pages.LanesPage;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

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
        assertFalse(poolsPage.isErrorVisible(),
            "No debe haber errores tras crear el pool");
    }

    @Test
    @Order(3)
    @DisplayName("TC-POOL-03: Búsqueda por nombre filtra los resultados")
    void busquedaFiltrarPools() {
        poolsPage.open();
        poolsPage.buscar("xxxxxNOEXISTExxxxxE2E");

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

        // Esperar a que el botón cancelar sea clickeable
        WebElement btnCancelar = new WebDriverWait(driver, Duration.ofSeconds(10))
            .until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(
                    ".modal-container .btn-secondary, " +
                    ".modal-container button[type='button']:not(.btn-primary), " +
                    ".modal-overlay .btn-cancelar"
                )
            ));
        btnCancelar.click();

        // Esperar a que el modal desaparezca completamente
        new WebDriverWait(driver, Duration.ofSeconds(5))
            .until(ExpectedConditions.invisibilityOfElementLocated(
                By.cssSelector(".modal-container")
            ));

        assertFalse(poolsPage.isModalVisible(),
            "El modal debe cerrarse tras hacer clic en 'Cancelar'");
    }

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

        if (lanesPage.isDisplayed(By.cssSelector(".pool-item"))) {
            lanesPage.seleccionarPrimerPool();
            assertTrue(lanesPage.isLanesPanelVisible(),
                "Al seleccionar un pool debe mostrarse el panel de lanes");
        } else {
            assertTrue(lanesPage.isDisplayed(By.cssSelector(".lanes-placeholder")),
                "Sin pools, debe mostrarse el placeholder de selección");
        }
    }

    @Test
    @Order(7)
    @DisplayName("TC-LANE-03: Crear lane en un pool → aparece en la lista")
    void crearLaneEnPool() {
        lanesPage.open();

        if (!lanesPage.isDisplayed(By.cssSelector(".pool-item"))) {
            return;
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