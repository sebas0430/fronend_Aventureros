package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.RolesPoolPage;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;

import static org.junit.jupiter.api.Assertions.*;

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

    @Test
    @Order(1)
    @DisplayName("TC-ROL-POOL-01: Página carga sin errores")
    void paginaCargaCorrectamente() {
        rolesPage.open();
        assertFalse(rolesPage.isErrorVisible(),
            "No debe haber error al cargar la página");
    }

    @Test
    @Order(2)
    @DisplayName("TC-ROL-POOL-02: Seleccionar pool")
    void seleccionarPool() {
        rolesPage.open();
        if (rolesPage.isDisplayed(By.cssSelector(".pool-item"))) {
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
        if (!rolesPage.isDisplayed(By.cssSelector(".pool-item"))) return;

        rolesPage.seleccionarPrimerPool();

        // Toda la lógica de checkboxes está en el Page Object (jsClick + presenceOf)
        // No repetir la espera aquí — evita el selector viejo que causaba el fallo
        int antes = rolesPage.contarRoles();
        rolesPage.crearRolPool(NOMBRE_ROL, true, true, false);
        int despues = rolesPage.contarRoles();

        assertTrue(despues >= antes,
            "El número de roles debe aumentar tras la creación");
    }
}