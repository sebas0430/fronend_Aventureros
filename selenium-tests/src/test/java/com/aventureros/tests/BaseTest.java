package com.aventureros.tests;

import com.aventureros.driver.DriverFactory;
import org.openqa.selenium.WebDriver;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;

/**
 * BaseTest – Clase base compartida por todos los tests.
 *
 * <p>Gestiona el ciclo de vida del {@link WebDriver} con {@code @BeforeAll}
 * y {@code @AfterAll}. Al usar {@code @TestInstance(PER_CLASS)}, JUnit 5
 * permite que los métodos {@code @BeforeAll}/{@code @AfterAll} sean de
 * instancia (no {@code static}), facilitando compartir estado entre tests
 * ordenados en la misma clase.</p>
 *
 * <p>Cada clase concreta puede acceder al driver mediante el campo protegido
 * {@code driver}, y obtener la URL base con el sistema de propiedades:
 * <pre>
 *   System.getProperty("app.url", "http://localhost:4200")
 * </pre>
 * </p>
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class BaseTest {

    /** Instancia del WebDriver compartida durante la clase de test. */
    protected WebDriver driver;

    /** URL base de la aplicación (configurable con {@code -Dapp.url=}). */
    protected final String BASE_URL = System.getProperty("app.url", "http://localhost:4200");

    // ── Credenciales de prueba (externalizables vía system properties) ──────

    /** Correo de un administrador de empresa de prueba. */
    protected final String ADMIN_CORREO =
        System.getProperty("test.admin.correo", "admin@aventureros-test.com");

    /** Contraseña del administrador de empresa. */
    protected final String ADMIN_PASSWORD =
        System.getProperty("test.admin.password", "Admin123!");

    /** Correo de un usuario con rol EDITOR. */
    protected final String EDITOR_CORREO =
        System.getProperty("test.editor.correo", "editor@aventureros-test.com");

    /** Contraseña del editor. */
    protected final String EDITOR_PASSWORD =
        System.getProperty("test.editor.password", "Editor123!");

    /** Correo de un usuario con rol SOLO_LECTURA. */
    protected final String LECTOR_CORREO =
        System.getProperty("test.lector.correo", "lector@aventureros-test.com");

    /** Contraseña del usuario de solo lectura. */
    protected final String LECTOR_PASSWORD =
        System.getProperty("test.lector.password", "Lector123!");

    // ── Ciclo de vida ────────────────────────────────────────────────────────

    @BeforeAll
    void setUpDriver() {
        driver = DriverFactory.getDriver();
    }

    @AfterAll
    void tearDownDriver() {
        DriverFactory.quitDriver();
    }
}
