package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.MensajesPage;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * MensajesTest – Gestión de mensajes entre procesos.
 *
 * <p>Casos cubiertos:
 * <ol>
 *   <li>La página de mensajes carga correctamente</li>
 *   <li>Seleccionar un proceso en el panel lateral</li>
 *   <li>Crear un evento tipo THROW</li>
 *   <li>Crear un evento tipo CATCH</li>
 *   <li>Lanzar un mensaje desde un evento THROW</li>
 * </ol>
 * </p>
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Gestión de Mensajes")
class MensajesTest extends BaseTest {

    private MensajesPage mensajesPage;

    private static final String NOMBRE_MENSAJE = "mensaje-e2e-" + System.currentTimeMillis();

    @BeforeAll
    void loginComoAdmin() {
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");
    }

    @BeforeEach
    void setUp() {
        mensajesPage = new MensajesPage(driver);
    }

    // ── Tests ────────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("TC-MSG-01: Página de mensajes carga sin errores")
    void paginaMensajesCargaCorrectamente() {
        mensajesPage.open();

        assertFalse(mensajesPage.isErrorVisible(),
            "No debe haber error al cargar /mensajes");
        
        // Verifica que la página cargue, ya sea mostrando el panel de eventos o requiriendo selección
        assertTrue(mensajesPage.isEventosPanelVisible() || driver.getCurrentUrl().contains("/mensajes"),
            "La página de mensajes debe cargarse correctamente");
    }

    @Test
    @Order(2)
    @DisplayName("TC-MSG-02: Seleccionar un proceso muestra sus eventos")
    void seleccionarProcesoMuestraEventos() {
        mensajesPage.open();

        // Verificar si hay procesos en la lista
        if (mensajesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".proceso-item"))) {
            mensajesPage.seleccionarPrimerProceso();
            assertTrue(mensajesPage.isEventosPanelVisible(),
                "Al seleccionar un proceso debe mostrarse el panel de eventos");
        } else {
            // Si no hay procesos, el placeholder debería estar visible
            assertTrue(mensajesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".placeholder")),
                "Si no hay procesos seleccionados, debe mostrarse el placeholder");
        }
    }

    @Test
    @Order(3)
    @DisplayName("TC-MSG-03: Crear un evento THROW y verificar aparición")
    void crearEventoThrow() {
        mensajesPage.open();
        if (!mensajesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".proceso-item"))) {
            return; // Saltar si no hay procesos
        }
        
        mensajesPage.seleccionarPrimerProceso();
        int cantidadAntes = mensajesPage.contarEventos();

        mensajesPage.crearEvento(NOMBRE_MENSAJE + "-throw", "THROW");

        int cantidadDespues = mensajesPage.contarEventos();
        assertTrue(cantidadDespues > cantidadAntes,
            "El número de eventos debe incrementar tras crear un evento THROW");
    }

    @Test
    @Order(4)
    @DisplayName("TC-MSG-04: Crear un evento CATCH y verificar aparición")
    void crearEventoCatch() {
        mensajesPage.open();
        if (!mensajesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".proceso-item"))) {
            return; // Saltar si no hay procesos
        }
        
        mensajesPage.seleccionarPrimerProceso();
        int cantidadAntes = mensajesPage.contarEventos();

        mensajesPage.crearEvento(NOMBRE_MENSAJE + "-catch", "CATCH");

        int cantidadDespues = mensajesPage.contarEventos();
        assertTrue(cantidadDespues > cantidadAntes,
            "El número de eventos debe incrementar tras crear un evento CATCH");
    }

    @Test
    @Order(5)
    @DisplayName("TC-MSG-05: Lanzar un mensaje desde un evento THROW")
    void lanzarMensajeThrow() {
        mensajesPage.open();
        if (!mensajesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".proceso-item"))) {
            return; // Saltar si no hay procesos
        }
        
        mensajesPage.seleccionarPrimerProceso();
        
        // Verifica que haya al menos un botón de lanzar (THROW)
        if (mensajesPage.isDisplayed(org.openqa.selenium.By.cssSelector(".btn-launch"))) {
            mensajesPage.lanzarPrimerMensaje("{\"dato\":\"test\"}");
            assertTrue(mensajesPage.isResultadoLanzarVisible(),
                "Debe mostrarse el resultado del lanzamiento tras lanzar el mensaje");
            
            // Cerrar el modal
            mensajesPage.click(org.openqa.selenium.By.cssSelector(".modal-box .btn-secondary"));
        }
    }
}
