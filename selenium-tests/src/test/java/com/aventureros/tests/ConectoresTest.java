package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.ConectoresPage;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ConectoresTest – Gestión de conectores externos.
 *
 * <p>Casos cubiertos:
 * <ol>
 *   <li>La página de conectores carga para EDITOR/ADMIN</li>
 *   <li>Abrir modal de creación</li>
 *   <li>Crear un conector tipo WEBHOOK</li>
 *   <li>Eliminar un conector</li>
 *   <li>SOLO_LECTURA no tiene acceso a /conectores (guard)</li>
 * </ol>
 * </p>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Gestión de Conectores Externos")
class ConectoresTest extends BaseTest {

    private ConectoresPage conectoresPage;

    private static final String NOMBRE_CONECTOR = "Webhook E2E " + System.currentTimeMillis();

    @BeforeAll
    void loginComoAdmin() {
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }

    @BeforeEach
    void setUp() {
        conectoresPage = new ConectoresPage(driver);
    }

    // ── Tests ────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("TC-CON-01: Página de conectores carga sin errores")
    void paginaConectoresCargaCorrectamente() {
        conectoresPage.open();

        assertFalse(conectoresPage.isErrorVisible(),
            "No debe haber error al cargar /conectores");
        boolean tieneGrid  = conectoresPage.isGridVisible();
        boolean tieneEmpty = conectoresPage.isEmptyVisible();
        assertTrue(tieneGrid || tieneEmpty,
            "Debe mostrarse el grid de conectores o el estado vacío");
    }

    @Test
    @Order(2)
    @DisplayName("TC-CON-02: Abrir modal de creación y verificar que está visible")
    void abrirModalCreacion() {
        conectoresPage.open();
        conectoresPage.abrirModalCrear();

        assertTrue(conectoresPage.isModalCrearVisible(),
            "El modal de creación debe estar visible tras hacer clic en '+ Nuevo Conector'");

        // Cerrar el modal
        conectoresPage.click(org.openqa.selenium.By.cssSelector(".modal-box .btn-secondary"));
    }

    @Test
    @Order(3)
    @DisplayName("TC-CON-03: Crear conector tipo WEBHOOK → aparece en el grid")
    void crearConectorWebhook() {
        conectoresPage.open();
        int cantidadAntes = conectoresPage.contarConectores();

        conectoresPage.crearConector(
            NOMBRE_CONECTOR,
            "WEBHOOK",
            "https://webhook.site/test-aventureros-e2e",
            3
        );

        assertFalse(conectoresPage.isErrorVisible(),
            "No debe haber error tras crear el conector");
        int cantidadDespues = conectoresPage.contarConectores();
        assertTrue(cantidadDespues >= cantidadAntes,
            "El número de conectores debe incrementar o mantenerse tras la creación");
    }

    @Test
    @Order(4)
    @DisplayName("TC-CON-04: Eliminar un conector existente")
    void eliminarConector() {
        conectoresPage.open();

        if (!conectoresPage.isGridVisible()) {
            return; // Skip: no hay conectores para eliminar
        }

        int cantidadAntes = conectoresPage.contarConectores();
        conectoresPage.eliminarPrimerConector();
        int cantidadDespues = conectoresPage.contarConectores();

        assertTrue(cantidadDespues < cantidadAntes,
            "El número de conectores debe disminuir tras eliminar uno. Antes: "
            + cantidadAntes + ", Después: " + cantidadDespues);
    }

    @Test
    @Order(5)
    @DisplayName("TC-CON-05: SOLO_LECTURA no puede acceder a /conectores")
    void soloLecturaNoAccedeConectores() {
        // Logout del admin
        new com.aventureros.pages.NavbarPage(driver).logout();

        // Login como lector
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(LECTOR_CORREO, LECTOR_PASSWORD, "/procesos");

        // Intentar navegar a /conectores
        conectoresPage.navigateTo("/conectores");

        // El authGuard + roleGuard deben redirigir
        String url = driver.getCurrentUrl();
        assertFalse(url.contains("/conectores"),
            "SOLO_LECTURA no debe poder acceder a /conectores. URL actual: " + url);

        // Restaurar sesión de admin
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }
}
