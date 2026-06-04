package com.aventureros.tests;

import com.aventureros.pages.EmpleadosPage;
import com.aventureros.pages.LoginPage;
import com.aventureros.pages.NavbarPage;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Gestión de Empleados")
class EmpleadosTest extends BaseTest {

    private EmpleadosPage empleadosPage;
    private NavbarPage    navbarPage;

    @BeforeAll
    void setUp() {
        empleadosPage = new EmpleadosPage(driver);
        navbarPage    = new NavbarPage(driver);
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }

    @Test
    @Order(4)
    @DisplayName("TC-EMP-04: Invitar nuevo miembro con rol SOLO_LECTURA")
    void invitarNuevoMiembro() {
        empleadosPage.open();

        // Esperar que cualquier modal previo esté cerrado
        new WebDriverWait(driver, Duration.ofSeconds(15))
            .until(d -> !empleadosPage.isModalInvitarVisible());

        String correoNuevo = "lector.e2e." + System.currentTimeMillis() + "@test.com";
        empleadosPage.invitarMiembro(correoNuevo, "Test123!");

        // Esperar hasta 30s a que el modal desaparezca tras enviar
        new WebDriverWait(driver, Duration.ofSeconds(30))
            .until(ExpectedConditions.invisibilityOfElementLocated(
                By.cssSelector(".modal-invitar, .modal-container, [class*='modal']")
            ));

        assertFalse(empleadosPage.isModalInvitarVisible(),
            "El modal debe cerrarse tras enviar la invitación");
    }

    @Test
    @Order(5)
    @DisplayName("TC-EMP-05: Usuario SOLO_LECTURA no ve el botón 'Invitar miembro'")
    void lectorNoVeBtnInvitar() {
        WebDriverWait localWait = new WebDriverWait(driver, Duration.ofSeconds(15));
        waitForOverlayToDisappear();

        if (empleadosPage.isModalInvitarVisible()) {
            empleadosPage.cerrarModalInvitar();
        }

        navbarPage.logout();
        localWait.until(ExpectedConditions.urlContains("/login"));

        new LoginPage(driver).open()
            .loginAndWaitForRedirect(LECTOR_CORREO, LECTOR_PASSWORD, "/procesos");

        try {
            empleadosPage.open();
            if (driver.getCurrentUrl().contains("/empleados")) {
                assertFalse(empleadosPage.isBtnInvitarVisible(),
                    "Un SOLO_LECTURA no debe ver el botón 'Invitar miembro'");
            } else {
                assertTrue(
                    driver.getCurrentUrl().contains("/login") ||
                    driver.getCurrentUrl().contains("/procesos"),
                    "El lector debe ser redirigido. URL: " + driver.getCurrentUrl()
                );
            }
        } catch (Exception e) {
            assertTrue(
                driver.getCurrentUrl().contains("/login") ||
                driver.getCurrentUrl().contains("/procesos"),
                "El guard redirigió al lector. URL: " + driver.getCurrentUrl()
            );
        }

        waitForOverlayToDisappear();
        navbarPage.logout();
        localWait.until(ExpectedConditions.urlContains("/login"));
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }

    private void waitForOverlayToDisappear() {
        empleadosPage.waitForOverlayToDisappear();
    }
}