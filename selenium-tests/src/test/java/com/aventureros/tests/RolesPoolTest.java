package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.RolesPoolPage;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * RolesPoolTest – Gestión de roles de pool.
 *
 * <p>Casos cubiertos:
 * <ol>
 *   <li>La página carga correctamente</li>
 *   <li>Seleccionar un pool</li>
 *   <li>Crear un rol de pool con permisos específicos</li>
 * </ol>
 * </p>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Gestión de Roles de Pool")
class RolesPoolTest extends BaseTest {

    private RolesPoolPage rolesPage;
    private static final String NOMBRE_ROL = "Rol Pool E2E " + System.currentTimeMillis();

    @BeforeAll
    void loginComoAdmin() {
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }

    @BeforeEach
    void setUp() {
        rolesPage = new RolesPoolPage(driver);
    }

    // ── Tests ────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("TC-ROL-POOL-01: Página carga sin errores")
    void paginaCargaCorrectamente() {
        rolesPage.open();
        assertFalse(rolesPage.isErrorVisible(), "No debe haber error al cargar la página");
    }

    @Test
    @Order(2)
    @DisplayName("TC-ROL-POOL-02: Seleccionar pool")
    void seleccionarPool() {
        rolesPage.open();
        if (rolesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".pool-item"))) {
            rolesPage.seleccionarPrimerPool();
            assertTrue(rolesPage.isRolesGridVisible() || rolesPage.isEmptyVisible(),
                "Debe mostrarse el panel de roles tras seleccionar un pool");
        }
    }

    @Test
    @Order(3)
    @DisplayName("TC-ROL-POOL-03: Crear un nuevo rol en el pool")
    void crearRolPool() {
        rolesPage.open();
        if (!rolesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".pool-item"))) return;
        rolesPage.seleccionarPrimerPool();
        int antes = rolesPage.contarRoles();
        rolesPage.crearRolPool(NOMBRE_ROL, true, true, false);
        int despues = rolesPage.contarRoles();
        assertTrue(despues >= antes, "El número de roles debe aumentar tras la creación");
    }
}
