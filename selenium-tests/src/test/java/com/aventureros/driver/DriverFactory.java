package com.aventureros.driver;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

/**
 * DriverFactory – Patrón Singleton para gestión del WebDriver.
 *
 * <p>Detecta automáticamente el modo headless mediante la variable de entorno {@code CI}
 * (estándar de GitHub Actions). Si {@code CI=true} o el sistema operativo no tiene
 * display disponible, lanza Chrome en modo headless.</p>
 *
 * <p>Uso típico en un test:
 * <pre>
 *   {@literal @}BeforeAll
 *   static void setUp() {
 *       driver = DriverFactory.getDriver();
 *   }
 *
 *   {@literal @}AfterAll
 *   static void tearDown() {
 *       DriverFactory.quitDriver();
 *   }
 * </pre>
 * </p>
 */
public final class DriverFactory {

    /** Instancia singleton, almacenada por hilo para soportar ejecución paralela futura. */
    private static final ThreadLocal<WebDriver> DRIVER_THREAD_LOCAL = new ThreadLocal<>();

    private DriverFactory() {
        // Clase utilitaria: no instanciar
    }

    /**
     * Devuelve la instancia actual del WebDriver, creándola si no existe.
     *
     * @return instancia de {@link WebDriver} configurada
     */
    public static WebDriver getDriver() {
        if (DRIVER_THREAD_LOCAL.get() == null) {
            DRIVER_THREAD_LOCAL.set(createDriver());
        }
        return DRIVER_THREAD_LOCAL.get();
    }

    /**
     * Cierra el navegador y pone la referencia a {@code null}, permitiendo
     * que la siguiente llamada a {@link #getDriver()} cree una instancia fresca.
     */
    public static void quitDriver() {
        WebDriver driver = DRIVER_THREAD_LOCAL.get();
        if (driver != null) {
            driver.quit();
            DRIVER_THREAD_LOCAL.set(null);
        }
    }

    // ─── Métodos privados ───────────────────────────────────────────────────

    private static WebDriver createDriver() {
        // WebDriverManager descarga y configura el chromedriver automáticamente
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = buildChromeOptions();
        ChromeDriver driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        return driver;
    }

    /**
     * Construye las opciones de Chrome.
     * Activa headless cuando la variable de entorno {@code CI} existe y no está vacía,
     * o cuando la propiedad del sistema {@code headless} vale {@code true}.
     */
    private static ChromeOptions buildChromeOptions() {
        ChromeOptions options = new ChromeOptions();

        boolean isCI = isRunningInCI();
        boolean forceHeadless = Boolean.parseBoolean(System.getProperty("headless", "false"));

        if (isCI || forceHeadless) {
            // --headless=new es la forma moderna (Chrome ≥ 112)
            options.addArguments("--headless=new");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
        }

        options.addArguments("--window-size=1920,1080");
        options.addArguments("--disable-extensions");
        options.addArguments("--disable-gpu");
        // Evita el banner de "Chrome está siendo controlado por software automatizado"
        options.setExperimentalOption("excludeSwitches", new String[]{"enable-automation"});
        options.setExperimentalOption("useAutomationExtension", false);

        return options;
    }

    /**
     * Determina si se está ejecutando en un entorno CI.
     * GitHub Actions establece automáticamente {@code CI=true}.
     */
    private static boolean isRunningInCI() {
        String ci = System.getenv("CI");
        return ci != null && !ci.isBlank();
    }
}
