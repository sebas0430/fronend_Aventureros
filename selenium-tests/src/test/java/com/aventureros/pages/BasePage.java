package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public abstract class BasePage {

    protected static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(15);
    protected static final Duration SHORT_TIMEOUT   = Duration.ofSeconds(5);
    protected static final Duration LONG_TIMEOUT    = Duration.ofSeconds(30);

    protected final WebDriver     driver;
    protected final WebDriverWait wait;
    protected final WebDriverWait longWait;
    protected final String        baseUrl;

    protected BasePage(WebDriver driver) {
        this.driver   = driver;
        this.wait     = new WebDriverWait(driver, DEFAULT_TIMEOUT);
        this.longWait = new WebDriverWait(driver, LONG_TIMEOUT);
        this.baseUrl  = System.getProperty("app.url", "http://localhost:4200");
    }

    // ── Navegación ────────────────────────────────────────────────────────────

    public void navigateTo(String path) {
        driver.get(baseUrl + path);
    }

    public void navigateAndWait(String path, By elementoConfirma) {
        driver.get(baseUrl + path);
        wait.until(ExpectedConditions.visibilityOfElementLocated(elementoConfirma));
    }

    // ── Interacciones ─────────────────────────────────────────────────────────

    public WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    public void type(By locator, String text) {
        WebElement element = waitForVisible(locator);
        element.clear();
        element.sendKeys(text);
    }

    public String getText(By locator) {
        return waitForVisible(locator).getText().trim();
    }

    public String getValue(By locator) {
        return waitForVisible(locator).getAttribute("value");
    }

    // ── Esperas de condición ──────────────────────────────────────────────────

    public void waitForUrlContains(String fragment) {
        wait.until(ExpectedConditions.urlContains(fragment));
    }

    public void waitForInvisible(By locator) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    public void waitForText(By locator, String expectedText) {
        wait.until(ExpectedConditions.textToBe(locator, expectedText));
    }

    public boolean waitForClickable(By locator) {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(locator));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void waitForOverlayToDisappear() {
        try {
            new WebDriverWait(driver, SHORT_TIMEOUT).until(
                ExpectedConditions.invisibilityOfElementLocated(
                    By.cssSelector(".modal-backdrop, .overlay, .cdk-overlay-backdrop, .modal-panel")
                )
            );
        } catch (Exception ignored) {
            // Sin overlay activo — continuar normalmente
        }
    }

    public boolean waitForSuccessOrError(By successLocator, By errorLocator) {
        longWait.until(d ->
            !d.findElements(successLocator).isEmpty() ||
            !d.findElements(errorLocator).isEmpty()
        );
        return !driver.findElements(successLocator).isEmpty();
    }

    // ── Utilidades ────────────────────────────────────────────────────────────

    public boolean isDisplayed(By locator) {
        try {
            return new WebDriverWait(driver, SHORT_TIMEOUT)
                .until(ExpectedConditions.visibilityOfElementLocated(locator))
                .isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isButtonDisabled(By locator) {
        WebElement btn = waitForVisible(locator);
        String ariaDisabled = btn.getAttribute("aria-disabled");
        String classAttr    = btn.getAttribute("class");
        return !btn.isEnabled()
            || "true".equals(ariaDisabled)
            || (classAttr != null && classAttr.contains("disabled"));
    }

    public void selectByValueOrText(By locator, String valueOrText) {
        WebElement select = waitForVisible(locator);
        // Intento 1: por atributo value exacto
        boolean found = select.findElements(By.tagName("option"))
            .stream()
            .filter(opt -> valueOrText.equals(opt.getAttribute("value")))
            .findFirst()
            .map(opt -> { opt.click(); return true; })
            .orElse(false);
        // Intento 2: por texto visible (case-insensitive)
        if (!found) {
            select.findElements(By.tagName("option"))
                .stream()
                .filter(opt -> opt.getText().trim().equalsIgnoreCase(valueOrText))
                .findFirst()
                .ifPresent(WebElement::click);
        }
    }

    /** Mantener compatibilidad con código existente que use selectByValue. */
    public void selectByValue(By locator, String value) {
        selectByValueOrText(locator, value);
    }

    public void scrollIntoView(By locator) {
        WebElement element = waitForVisible(locator);
        ((JavascriptExecutor) driver).executeScript(
            "arguments[0].scrollIntoView(true);", element
        );
    }

    public void waitForAngularLoad(By spinnerLocator) {
        try {
            new WebDriverWait(driver, SHORT_TIMEOUT)
                .until(ExpectedConditions.visibilityOfElementLocated(spinnerLocator));
            wait.until(ExpectedConditions.invisibilityOfElementLocated(spinnerLocator));
        } catch (Exception ignored) { }
    }
}
