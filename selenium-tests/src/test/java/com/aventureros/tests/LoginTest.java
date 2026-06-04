package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.RegistroEmpresaPage;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * LoginTest – Flujos de autenticación.
 *
 * <p>Casos cubiertos:
 * <ol>
 *   <li>Login exitoso con ADMINISTRADOR_EMPRESA → redirección a /procesos</li>
 *   <li>Login fallido con credenciales incorrectas → mensaje de error visible</li>
 *   <li>Login fallido con contraseña vacía → botón deshabilitado</li>
 *   <li>Navegar a /registro-empresa desde el login</li>
 *   <li>Logout cierra sesión y redirige al login</li>
 * </ol>
 * </p>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Flujos de autenticación (Login / Logout)")
class LoginTest extends BaseTest {

    private LoginPage loginPage;

    @BeforeEach
    void setUp() {
        loginPage = new LoginPage(driver);
        loginPage.open();
    }

    // ── Tests ────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("TC-AUTH-01: Login exitoso como ADMINISTRADOR_EMPRESA → redirige a /procesos")
    void loginExitosoAdmin() {
        loginPage.loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");

        String currentUrl = driver.getCurrentUrl();
        assertTrue(currentUrl.contains("/procesos"),
            "Tras login de admin debe redirigir a /procesos. URL actual: " + currentUrl);
        assertFalse(loginPage.hasError(),
            "No debe haber mensaje de error tras login exitoso");
    }

    @Test
    @Order(2)
    @DisplayName("TC-AUTH-02: Login fallido con credenciales incorrectas → muestra error")
    void loginConCredencialesIncorrectas() {
        loginPage.login("incorrecto@test.com", "password-incorrecto");

        assertTrue(loginPage.hasError(),
            "Debe mostrarse un mensaje de error al fallar el login");
        String errorText = loginPage.getErrorMessage();
        assertFalse(errorText.isBlank(),
            "El mensaje de error no debe estar vacío");
        // La URL NO debe haber cambiado (continúa en /login)
        assertTrue(driver.getCurrentUrl().contains("/login"),
            "El usuario debe permanecer en /login tras credenciales incorrectas");
    }

    @Test
    @Order(3)
    @DisplayName("TC-AUTH-03: Botón login deshabilitado cuando los campos están vacíos")
    void botonLoginDeshabilitadoSinDatos() {
        // El botón debe estar habilitado sólo cuando hay email y password
        // Al abrir la página sin escribir nada, el botón tiene [disabled] por Angular
        assertFalse(loginPage.waitForClickable(
            org.openqa.selenium.By.cssSelector(".login-button:not([disabled])")),
            "El botón de login debe estar deshabilitado si no hay datos ingresados");
    }

    @Test
    @Order(4)
    @DisplayName("TC-AUTH-04: Clic en 'Crear empresa' navega a /registro-empresa")
    void navegarARegistroEmpresa() {
        loginPage.clickCrearEmpresa();

        assertTrue(driver.getCurrentUrl().contains("/registro-empresa"),
            "Debe navegar a /registro-empresa al hacer clic en 'Crear empresa'");
    }

    @Test
    @Order(5)
    @DisplayName("TC-AUTH-05: Logout cierra sesión y redirige al login")
    void logoutExitoso() {
        // Primero hacemos login
        loginPage.loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");

        // Luego ejecutamos logout desde el sidebar
        com.aventureros.pages.NavbarPage navbar = new com.aventureros.pages.NavbarPage(driver);
        navbar.logout();

        assertTrue(driver.getCurrentUrl().contains("/login"),
            "Tras logout debe redirigir a /login. URL actual: " + driver.getCurrentUrl());
    }

    @Test
    @Order(6)
    @DisplayName("TC-AUTH-06: Acceso directo a ruta protegida sin auth → redirige a /login")
    void accesoSinAutenticacionRedirigido() {
        // Sin token, intentar acceder a /procesos debe redirigir al login
        loginPage.navigateTo("/procesos");
        loginPage.waitForUrlContains("/login");

        assertTrue(driver.getCurrentUrl().contains("/login"),
            "Un usuario no autenticado debe ser redirigido a /login al acceder a /procesos");
    }
}
