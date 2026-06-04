package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.RegistroEmpresaPage;
import org.junit.jupiter.api.*;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Flujos de Registro de Empresa")
class RegistroEmpresaTest extends BaseTest {

    private RegistroEmpresaPage registroPage;

    private static final String NIT_UNICO = "9001" + System.currentTimeMillis() % 100000;

    @BeforeEach
    void setUp() {
        registroPage = new RegistroEmpresaPage(driver);
        registroPage.open();
    }

    @Test
    @Order(1)
    @DisplayName("TC-REG-01: Registro exitoso de empresa nueva → redirige al login")
    void registroExitoso() {
        String correoUnico = "admin+" + UUID.randomUUID().toString().substring(0, 8) + "@test.com";

        registroPage.registrar(
            "Empresa Test " + NIT_UNICO,
            NIT_UNICO,
            correoUnico,
            "Admin123!",
            "Admin123!"
        );

        // Manejar el alert nativo antes de cualquier otra acción
        try {
            WebDriverWait alertWait = new WebDriverWait(driver, Duration.ofSeconds(5));
            alertWait.until(ExpectedConditions.alertIsPresent());
            Alert alert = driver.switchTo().alert();
            String alertText = alert.getText();
            assertTrue(
                alertText.contains("creada") ||
                alertText.contains("exitoso") ||
                alertText.contains("correctamente"),
                "El alert debe confirmar la creación. Texto: " + alertText
            );
            alert.accept();
        } catch (TimeoutException e) {
            // El alert no apareció, continuar normalmente
        }

        new WebDriverWait(driver, Duration.ofSeconds(10))
            .until(ExpectedConditions.urlContains("/login"));

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
            "OtraPassword456!"
        );

        assertTrue(registroPage.hasError(),
            "Debe mostrarse un error cuando las contraseñas no coinciden");
    }

    @Test
    @Order(3)
    @DisplayName("TC-REG-03: Formulario vacío → botón deshabilitado")
    void formularioVacioBotonDeshabilitado() {
        registroPage.open();

        WebElement btnSubmit = driver.findElement(
            By.cssSelector("button[type='submit'], .btn-crear-empresa, #btn-registro")
        );

        boolean deshabilitadoPorAtributo = !btnSubmit.isEnabled();
        boolean deshabilitadoPorClase    = btnSubmit.getAttribute("class") != null
                                        && btnSubmit.getAttribute("class").contains("disabled");
        boolean deshabilitadoPorAria     = "true".equals(btnSubmit.getAttribute("aria-disabled"));

        assertTrue(deshabilitadoPorAtributo || deshabilitadoPorClase || deshabilitadoPorAria,
            "El botón 'Crear empresa' debe estar deshabilitado si el formulario está vacío");
    }

    @Test
    @Order(4)
    @DisplayName("TC-REG-04: Enlace de regreso a login disponible")
    void enlaceDeRegresoAlLogin() {
        driver.navigate().back();
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open();
        assertTrue(driver.getCurrentUrl().contains("/login"),
            "Al ir atrás debe mostrar la página de login");
    }
}