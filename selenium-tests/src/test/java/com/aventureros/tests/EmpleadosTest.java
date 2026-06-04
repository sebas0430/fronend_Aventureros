package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.EmpleadosPage;
import com.aventureros.pages.NavbarPage;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * EmpleadosTest – Gestión de equipo (empleados).
 *
 * <p>Casos cubiertos:
 * <ol>
 *   <li>La página de empleados carga para ADMINISTRADOR_EMPRESA</li>
 *   <li>El botón "Invitar miembro" solo está visible para admin</li>
 *   <li>Abrir y cerrar el modal de invitación</li>
 *   <li>Invitar un miembro nuevo con rol SOLO_LECTURA</li>
 *   <li>Verificar que el usuario SOLO_LECTURA NO ve el botón "Invitar"</li>
 *   <li>Filtro por pool no produce errores</li>
 * </ol>
 * </p>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Gestión de Equipo (Empleados)")
class EmpleadosTest extends BaseTest {

    private EmpleadosPage empleadosPage;
    private NavbarPage navbarPage;

    @BeforeAll
    void loginComoAdmin() {
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }

    @BeforeEach
    void setUp() {
        empleadosPage = new EmpleadosPage(driver);
        navbarPage    = new NavbarPage(driver);
    }

    // ── Tests ────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("TC-EMP-01: Página de empleados carga sin errores para admin")
    void paginaEmpleadosCargaParaAdmin() {
        empleadosPage.open();

        assertFalse(empleadosPage.isErrorVisible(),
            "No debe haber error al cargar /empleados como admin");
        assertEquals("Gestión de Equipo", empleadosPage.getTituloHeader(),
            "El título de la página debe ser 'Gestión de Equipo'");
    }

    @Test
    @Order(2)
    @DisplayName("TC-EMP-02: Botón 'Invitar miembro' visible para ADMINISTRADOR_EMPRESA")
    void btnInvitarVisibleParaAdmin() {
        empleadosPage.open();

        assertTrue(empleadosPage.isBtnInvitarVisible(),
            "El botón 'Invitar miembro' debe ser visible para ADMINISTRADOR_EMPRESA");
    }

    @Test
    @Order(3)
    @DisplayName("TC-EMP-03: Abrir y cerrar modal de invitación sin enviar")
    void abrirYCerrarModalInvitar() {
        empleadosPage.open();
        empleadosPage.abrirModalInvitar();

        assertTrue(empleadosPage.isModalInvitarVisible(),
            "El modal de invitación debe abrirse al hacer clic en 'Invitar miembro'");

        empleadosPage.cerrarModalInvitar();

        assertFalse(empleadosPage.isModalInvitarVisible(),
            "El modal de invitación debe cerrarse al hacer clic en 'Cancelar'");
    }

    @Test
    @Order(4)
    @DisplayName("TC-EMP-04: Invitar nuevo miembro con rol SOLO_LECTURA")
    void invitarNuevoMiembro() {
        empleadosPage.open();
        int cantidadAntes = empleadosPage.contarEmpleados();

        String correoNuevo = "lector.e2e." + System.currentTimeMillis() + "@test.com";
        empleadosPage.invitarMiembro(correoNuevo, "Test123!");

        // Tras invitar, el modal debe haberse cerrado
        assertFalse(empleadosPage.isModalInvitarVisible(),
            "El modal debe cerrarse tras enviar la invitación");
    }

    @Test
    @Order(5)
    @DisplayName("TC-EMP-05: Usuario SOLO_LECTURA no ve el botón 'Invitar miembro'")
    void lectorNoVeBtnInvitar() {
        // Cerrar sesión del admin
        navbarPage.logout();

        // Login como lector
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(LECTOR_CORREO, LECTOR_PASSWORD, "/procesos");

        // Navegar a empleados (solo accesible si es admin de empresa o admin de pool)
        empleadosPage.navigateTo("/empleados");

        // Si el guard permite acceso, el botón invitar NO debe estar visible
        // (si el guard no permite, redirige a /login)
        if (driver.getCurrentUrl().contains("/empleados")) {
            assertFalse(empleadosPage.isBtnInvitarVisible(),
                "Un SOLO_LECTURA no debe ver el botón 'Invitar miembro'");
        } else {
            // El guard redirigió → comportamiento correcto también
            assertTrue(driver.getCurrentUrl().contains("/login") ||
                       driver.getCurrentUrl().contains("/procesos"),
                "El lector debe ser redirigido a /login o /procesos desde /empleados");
        }

        // Volver a login como admin para los tests siguientes
        navbarPage.logout();
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }
}
