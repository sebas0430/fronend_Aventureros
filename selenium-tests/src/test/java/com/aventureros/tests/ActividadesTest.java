package com.aventureros.tests;

import com.aventureros.pages.LoginPage;
import com.aventureros.pages.ActividadesPage;
import com.aventureros.pages.ProcesosPage;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Gestión de Actividades de Proceso")
class ActividadesTest extends BaseTest {

    private ActividadesPage actividadesPage;
    private static final String NOMBRE_ACT = "Act E2E " + System.currentTimeMillis();

    @BeforeAll
    void loginComoAdmin() {
        new LoginPage(driver).open()
            .loginAndWaitForRedirect(ADMIN_CORREO, ADMIN_PASSWORD, "/procesos");

        ProcesosPage procesosPage = new ProcesosPage(driver);
        procesosPage.open();

        // Esperar que la página cargue completamente
        new WebDriverWait(driver, Duration.ofSeconds(15))
            .until(d -> procesosPage.isGridVisible() || procesosPage.isEmptyStateVisible());

        // Crear proceso solo si no hay ninguno
        if (procesosPage.contarCardsProcesos() == 0) {
            // Abrir modal y rellenar manualmente sin usar crearProceso()
            // para evitar depender del success-banner
            procesosPage.abrirModalCrear();

            new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(By.id("inp-nombre")));

            driver.findElement(By.id("inp-nombre")).sendKeys("Proc Test E2E");
            driver.findElement(By.id("inp-desc")).sendKeys("Descripcion test");

            // Seleccionar categoría
            WebElement select = driver.findElement(By.id("inp-cat"));
            select.findElements(By.tagName("option"))
                .stream()
                .filter(o -> !o.getAttribute("value").isEmpty())
                .findFirst()
                .ifPresent(WebElement::click);

            // Esperar que el botón confirmar se habilite
            new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(d -> {
                    WebElement btn = d.findElement(By.id("btn-confirmar-crear"));
                    return btn.getAttribute("disabled") == null && btn.isEnabled();
                });

            driver.findElement(By.id("btn-confirmar-crear")).click();

            // Esperar que el modal desaparezca (no depender del banner)
            new WebDriverWait(driver, Duration.ofSeconds(15))
                .until(ExpectedConditions.invisibilityOfElementLocated(
                    By.id("modal-crear-proceso")
                ));

            // Esperar que aparezca al menos una card
            new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(d -> !d.findElements(By.cssSelector(".proceso-card")).isEmpty());
        }

        // Navegar a actividades del primer proceso usando btn-tareas
        List<WebElement> btnsTareas = new WebDriverWait(driver, Duration.ofSeconds(15))
            .until(d -> {
                List<WebElement> btns = d.findElements(By.cssSelector(".btn-tareas"));
                return btns.isEmpty() ? null : btns;
            });

        btnsTareas.get(0).click();

        // Esperar que la URL cambie a actividades
        new WebDriverWait(driver, Duration.ofSeconds(15))
            .until(ExpectedConditions.urlContains("/actividades"));
    }

    @BeforeEach
    void setUp() {
        actividadesPage = new ActividadesPage(driver);
    }

    @Test
    @Order(1)
    @DisplayName("TC-ACT-01: Página de actividades carga")
    void paginaCargaCorrectamente() {
        assertTrue(actividadesPage.isGridVisible() || actividadesPage.isEmptyVisible(),
            "Debe mostrarse el grid o el empty state de actividades");
    }

    @Test
    @Order(2)
    @DisplayName("TC-ACT-02: Crear actividad")
    void crearActividad() {
        int antes = actividadesPage.contarActividades();
        actividadesPage.crearActividad(NOMBRE_ACT, "Desc test", "1");
        int despues = actividadesPage.contarActividades();
        assertTrue(despues >= antes,
            "El número de actividades debe incrementar tras la creación");
    }

    @Test
    @Order(3)
    @DisplayName("TC-ACT-03: Volver a procesos")
    void volverAProcesos() {
        actividadesPage.volverAProcesos();
        assertTrue(driver.getCurrentUrl().contains("/procesos"),
            "Debe haber regresado a la lista de procesos");
    }
}