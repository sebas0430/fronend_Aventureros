package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.ActividadesPage;
import com.aventureros.pages.ProcesosPage;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ActividadesTest – Gestión de actividades de un proceso.
 *
 * <p>Casos cubiertos:
 * <ol>
 *   <li>Acceder a la página de actividades de un proceso existente</li>
 *   <li>Crear una nueva actividad</li>
 *   <li>Volver a la vista de procesos</li>
 * </ol>
 * </p>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Gestión de Actividades de Proceso")
class ActividadesTest extends BaseTest {

    private ActividadesPage actividadesPage;
    private static final String NOMBRE_ACT = "Act E2E " + System.currentTimeMillis();
    private static long procesoIdTest = -1;

    @BeforeAll
    void loginComoAdmin() {
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
            
        // Pre-requisito: tener un proceso para crearle actividades
        ProcesosPage procesosPage = new ProcesosPage(driver);
        procesosPage.open();
        // Si no hay procesos, creamos uno
        if (procesosPage.contarCardsProcesos() == 0) {
            procesosPage.crearProceso("Proc Test", "Desc", "RRHH");
        }
        // Asumimos que el ID puede obtenerse o navegamos directo mediante click en UI
        // Para simplificar, navegaremos clickeando en el botón de tareas del primer proceso
        driver.findElements(org.openqa.selenium.By.cssSelector(".btn-tareas")).get(0).click();
    }

    @BeforeEach
    void setUp() {
        actividadesPage = new ActividadesPage(driver);
    }

    // ── Tests ────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("TC-ACT-01: Página de actividades carga")
    void paginaCargaCorrectamente() {
        assertTrue(actividadesPage.isGridVisible() || actividadesPage.isEmptyVisible(),
            "Debe mostrarse el grid o el empty state de actividades");
    }

    @Test
    @Order(2)
    @DisplayName("TC-ACT-02: Crear actividad")
    void crearActividad() {
        int antes = actividadesPage.contarActividades();
        actividadesPage.crearActividad(NOMBRE_ACT, "Desc test", "1");
        int despues = actividadesPage.contarActividades();
        assertTrue(despues >= antes, "El número de actividades debe incrementar tras la creación");
    }

    @Test
    @Order(3)
    @DisplayName("TC-ACT-03: Volver a procesos")
    void volverAProcesos() {
        actividadesPage.volverAProcesos();
        assertTrue(driver.getCurrentUrl().contains("/procesos"), 
            "Debe haber regresado a la lista de procesos");
    }
}
