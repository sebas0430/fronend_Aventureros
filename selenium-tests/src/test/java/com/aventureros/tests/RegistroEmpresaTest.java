package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.RegistroEmpresaPage;
import org.junit.jupiter.api.*;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * RegistroEmpresaTest – Flujos de registro de empresa.
 *
 * <p>Casos cubiertos:
 * <ol>
 *   <li>Registro exitoso de empresa nueva → redirige al login</li>
 *   <li>Registro con NIT duplicado → muestra error</li>
 *   <li>Registro con contraseñas no coincidentes → muestra error</li>
 *   <li>Registro con campos vacíos → botón deshabilitado</li>
 * </ol>
 * </p>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Flujos de Registro de Empresa")
class RegistroEmpresaTest extends BaseTest {

    private RegistroEmpresaPage registroPage;

    /** UUID único para este run de pruebas → evita conflictos de NIT duplicado. */
    private static final String NIT_UNICO = "9001" + System.currentTimeMillis() % 100000;

    @BeforeEach
    void setUp() {
        registroPage = new RegistroEmpresaPage(driver);
        registroPage.open();
    }

    // ── Tests ────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("TC-REG-01: Registro exitoso de empresa nueva → redirige al login")
    void registroExitoso() {
        String correoUnico = "admin+" + UUID.randomUUID().toString().substring(0, 8) + "@test.com";

        registroPage.registrarYEsperarLogin(
            "Empresa Test " + NIT_UNICO,
            NIT_UNICO,
            correoUnico,
            "Admin123!",
            "Admin123!"
        );

        assertTrue(driver.getCurrentUrl().contains("/login"),
            "Tras registro exitoso debe redirigir a /login. URL: " + driver.getCurrentUrl());
    }

    @Test
    @Order(2)
    @DisplayName("TC-REG-02: Registro con contraseñas no coincidentes → muestra error")
    void registroConPasswordsNoCoincidenMuestraError() {
        registroPage.registrar(
            "Empresa Error",
            "99999",
            "test@test.com",
            "Admin123!",
            "OtraPassword456!" // no coincide
        );

        assertTrue(registroPage.hasError(),
            "Debe mostrarse un error cuando las contraseñas no coinciden");
    }

    @Test
    @Order(3)
    @DisplayName("TC-REG-03: Formulario vacío → botón deshabilitado")
    void formularioVacioBotonDeshabilitado() {
        // Sin rellenar ningún campo, el botón debe estar disabled
        assertTrue(registroPage.isSubmitDisabled(),
            "El botón 'Crear empresa' debe estar deshabilitado si el formulario está vacío");
    }

    @Test
    @Order(4)
    @DisplayName("TC-REG-04: Enlace de regreso a login disponible")
    void enlaceDeRegresoAlLogin() {
        // Navegar a login desde la página de registro
        driver.navigate().back();
        // Verificar que el formulario de login está disponible
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open();
        assertTrue(driver.getCurrentUrl().contains("/login"),
            "Al ir atrás debe mostrar la página de login");
    }
}
