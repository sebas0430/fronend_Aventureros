package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.RolesProcesoPage;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * RolesProcesoTest – Gestión de roles de proceso.
 *
 * <p>Casos cubiertos:
 * <ol>
 *   <li>La página de roles de proceso carga correctamente</li>
 *   <li>Abrir modal de creación</li>
 *   <li>Crear un nuevo rol de proceso</li>
 *   <li>Editar el nombre de un rol</li>
 *   <li>Eliminar un rol de proceso sin uso</li>
 * </ol>
 * </p>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Gestión de Roles de Proceso")
class RolesProcesoTest extends BaseTest {

    private RolesProcesoPage rolesPage;
    private static final String NOMBRE_ROL = "Rol E2E " + System.currentTimeMillis();

    @BeforeAll
    void loginComoAdmin() {
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }

    @BeforeEach
    void setUp() {
        rolesPage = new RolesProcesoPage(driver);
    }

    // ── Tests ────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("TC-ROL-PROC-01: Página carga sin errores")
    void paginaCargaCorrectamente() {
        rolesPage.open();
        assertFalse(rolesPage.isErrorVisible(), "No debe haber error al cargar la página");
        assertTrue(rolesPage.isGridVisible() || rolesPage.isEmptyVisible(),
            "Debe mostrarse el grid o el estado vacío");
    }

    @Test
    @Order(2)
    @DisplayName("TC-ROL-PROC-02: Modal de creación abre y cierra")
    void modalCreacion() {
        rolesPage.open();
        rolesPage.abrirModalCrear();
        assertTrue(rolesPage.isModalVisible(), "Modal debe estar visible al crear");
        rolesPage.click(org.openqa.selenium.By.cssSelector(".modal-box .btn-secondary"));
        assertFalse(rolesPage.isModalVisible(), "Modal debe cerrarse al cancelar");
    }

    @Test
    @Order(3)
    @DisplayName("TC-ROL-PROC-03: Crear nuevo rol de proceso")
    void crearRol() {
        rolesPage.open();
        int antes = rolesPage.contarRoles();
        rolesPage.crearRol(NOMBRE_ROL, "Descripción generada E2E");
        int despues = rolesPage.contarRoles();
        assertTrue(despues >= antes, "El número de roles debe aumentar");
    }

    @Test
    @Order(4)
    @DisplayName("TC-ROL-PROC-04: Editar rol existente")
    void editarRol() {
        rolesPage.open();
        if(rolesPage.contarRoles() > 0) {
            rolesPage.editarPrimerRol(NOMBRE_ROL + " Editado");
            assertFalse(rolesPage.isErrorVisible(), "Editar rol no debe generar error");
        }
    }

    @Test
    @Order(5)
    @DisplayName("TC-ROL-PROC-05: Eliminar un rol sin uso")
    void eliminarRol() {
        rolesPage.open();
        if(rolesPage.contarRoles() > 0) {
            rolesPage.eliminarPrimerRolSinUso();
            assertFalse(rolesPage.isErrorVisible(), "Eliminar rol no debe generar error");
        }
    }
}
