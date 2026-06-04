package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

// LoginTest – Pruebas de autenticación.

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Autenticación – Login")
class LoginTest extends BaseTest {

    private LoginPage loginPage;

    @BeforeAll
    void setUp() {
        loginPage = new LoginPage(driver);
    }

    @BeforeEach
    void abrirLogin() {
        loginPage.open();
    }

    @Test
    @Order(1)
    @DisplayName("TC-LOGIN-01: Login exitoso como admin redirige a /procesos")
    void loginExitosoAdmin() {
        loginPage.loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
        assertTrue(
            driver.getCurrentUrl().contains("/procesos") ||
            driver.getCurrentUrl().contains("/empleados"),
            "Debe redirigir a /procesos o /empleados. URL: " + driver.getCurrentUrl()
        );
    }

    @Test
    @Order(2)
    @DisplayName("TC-LOGIN-02: Enviar formulario vacío muestra validación de error")
    void formularioVacioMuestraValidacion() {
        loginPage.login("", "");
        assertTrue(
            loginPage.hasError() || loginPage.hasValidationMessages(),
            "Debe mostrarse un error o mensaje de validación al enviar el formulario vacío"
        );
    }

    @Test
    @Order(3)
    @DisplayName("TC-LOGIN-03: Credenciales incorrectas muestran mensaje de error")
    void loginFallidoMuestraError() {
        loginPage.login("noexiste@test.com", "wrongpassword");
        assertTrue(loginPage.hasError(),
            "Debe mostrarse un mensaje de error con credenciales inválidas");
    }
}
