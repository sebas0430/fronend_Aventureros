package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/**
 * BasePage – Clase base de todos los Page Objects.
 *
 * <p>Proporciona una capa de abstracción sobre Selenium con:
 * <ul>
 *   <li>{@link #waitForVisible(By)} – espera explícita antes de interactuar</li>
 *   <li>{@link #click(By)} – clic robusto con espera previa</li>
 *   <li>{@link #type(By, String)} – limpia y escribe en un input</li>
 *   <li>{@link #getText(By)} – obtiene el texto visible de un elemento</li>
 *   <li>{@link #navigateTo(String)} – navega a una ruta relativa</li>
 *   <li>{@link #waitForUrlContains(String)} – espera que la URL contenga un fragmento</li>
 *   <li>{@link #isDisplayed(By)} – retorna false en lugar de lanzar excepción</li>
 *   <li>{@link #waitForInvisible(By)} – espera a que un elemento desaparezca</li>
 * </ul>
 * </p>
 *
 * <p><strong>Nunca</strong> se usa {@code Thread.sleep()} – siempre {@link WebDriverWait}.</p>
 */
public abstract class BasePage {

    /** Timeout estándar para esperas explícitas. */
    protected static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(15);

    /** Timeout corto para comprobaciones de ausencia de elemento. */
    protected static final Duration SHORT_TIMEOUT = Duration.ofSeconds(5);

    protected final WebDriver driver;
    protected final WebDriverWait wait;
    protected final String baseUrl;

    protected BasePage(WebDriver driver) {
        this.driver  = driver;
        this.wait    = new WebDriverWait(driver, DEFAULT_TIMEOUT);
        this.baseUrl = System.getProperty("app.url", "http://localhost:4200");
    }

    // ── Navegación ───────────────────────────────────────────────────────────

    /**
     * Navega a una ruta relativa de la aplicación.
     *
     * @param path por ejemplo {@code "/login"} o {@code "/procesos"}
     */
    public void navigateTo(String path) {
        driver.get(baseUrl + path);
    }

    // ── Interacciones ────────────────────────────────────────────────────────

    /**
     * Espera a que el elemento identificado por {@code locator} sea visible
     * y devuelve el {@link WebElement}.
     *
     * @param locator selector CSS / ID / XPath
     * @return elemento visible
     */
    public WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    /**
     * Espera a que el elemento sea clickeable y hace clic sobre él.
     *
     * @param locator selector del elemento
     */
    public void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    /**
     * Limpia el campo, espera a que sea visible y escribe el texto dado.
     *
     * @param locator selector del input / textarea
     * @param text    texto a escribir
     */
    public void type(By locator, String text) {
        WebElement element = waitForVisible(locator);
        element.clear();
        element.sendKeys(text);
    }

    /**
     * Obtiene el texto visible del elemento (trim aplicado).
     *
     * @param locator selector del elemento
     * @return texto del elemento sin espacios extremos
     */
    public String getText(By locator) {
        return waitForVisible(locator).getText().trim();
    }

    /**
     * Obtiene el valor del atributo {@code value} de un input.
     *
     * @param locator selector del input
     * @return valor actual del campo
     */
    public String getValue(By locator) {
        return waitForVisible(locator).getAttribute("value");
    }

    // ── Esperas de condición ─────────────────────────────────────────────────

    /**
     * Espera a que la URL del navegador contenga el fragmento especificado.
     *
     * @param fragment parte de la URL a esperar (p. ej. {@code "/procesos"})
     */
    public void waitForUrlContains(String fragment) {
        wait.until(ExpectedConditions.urlContains(fragment));
    }

    /**
     * Espera a que el elemento desaparezca del DOM o se oculte.
     *
     * @param locator selector del elemento
     */
    public void waitForInvisible(By locator) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    /**
     * Espera a que el texto de un elemento sea el esperado.
     *
     * @param locator       selector del elemento
     * @param expectedText  texto esperado
     */
    public void waitForText(By locator, String expectedText) {
        wait.until(ExpectedConditions.textToBe(locator, expectedText));
    }

    /**
     * Espera a que un elemento con el selector dado exista en el DOM y sea clickeable.
     *
     * @param locator selector
     * @return {@code true} si es clickeable antes del timeout, {@code false} en caso contrario
     */
    public boolean waitForClickable(By locator) {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(locator));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ── Utilidades ───────────────────────────────────────────────────────────

    /**
     * Comprueba si un elemento está visible sin lanzar excepción.
     *
     * @param locator selector del elemento
     * @return {@code true} si el elemento existe y está visible
     */
    public boolean isDisplayed(By locator) {
        try {
            WebDriverWait shortWait = new WebDriverWait(driver, SHORT_TIMEOUT);
            return shortWait.until(ExpectedConditions.visibilityOfElementLocated(locator)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Selecciona un option en un {@code <select>} por su valor (atributo {@code value}).
     *
     * @param locator selector del {@code <select>}
     * @param value   valor a seleccionar
     */
    public void selectByValue(By locator, String value) {
        WebElement select = waitForVisible(locator);
        select.findElements(By.tagName("option"))
              .stream()
              .filter(opt -> value.equals(opt.getAttribute("value")))
              .findFirst()
              .ifPresent(WebElement::click);
    }

    /**
     * Hace scroll hasta que el elemento es visible en pantalla, usando JavaScript.
     *
     * @param locator selector del elemento
     */
    public void scrollIntoView(By locator) {
        WebElement element = waitForVisible(locator);
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", element);
    }

    /**
     * Espera a que la página Angular haya terminado de renderizar (sin spinners visibles).
     *
     * @param spinnerLocator locator del spinner de carga
     */
    public void waitForAngularLoad(By spinnerLocator) {
        try {
            WebDriverWait shortWait = new WebDriverWait(driver, SHORT_TIMEOUT);
            shortWait.until(ExpectedConditions.visibilityOfElementLocated(spinnerLocator));
            wait.until(ExpectedConditions.invisibilityOfElementLocated(spinnerLocator));
        } catch (Exception ignored) {
            // El spinner puede no aparecer si la carga es inmediata
        }
    }
}
