package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class MensajesPage extends BasePage {

    private final By procesosPanel      = By.cssSelector(".procesos-panel");
    private final By procesoItems       = By.cssSelector(".proceso-item");
    private final By eventosPanel       = By.cssSelector(".eventos-panel");
    private final By btnNuevoEvento     = By.cssSelector(".eventos-header .btn-primary");
    private final By eventoCards        = By.cssSelector(".evento-card");
    private final By eventosEmpty       = By.cssSelector(".eventos-empty");
    private final By mpError            = By.cssSelector(".mp-error");
    private final By mpLoading          = By.cssSelector(".mp-loading");
    private final By trazaTable         = By.cssSelector(".traza-table");

    // Modal crear evento
    private final By modalCrear         = By.cssSelector(".modal-box");
    private final By inputNombreMensaje = By.cssSelector(".modal-box .modal-input:first-of-type");
    private final By selectTipoEvento   = By.cssSelector(".modal-box select.modal-input");
    private final By btnGuardarEvento   = By.cssSelector(".modal-box .btn-primary");
    private final By btnCancelarEvento  = By.cssSelector(".modal-box .btn-secondary");

    // Modal lanzar mensaje — mismo .modal-box, se distingue por el contenido
    // El botón Lanzar es el .btn-primary dentro de .modal-actions del modal de lanzar
    // En el HTML: <button class="btn-primary" (click)="lanzarMensaje()">
    // Es el único .btn-primary cuando mostrarLanzar=true
    private final By textareaPayload    = By.cssSelector(".modal-box .modal-textarea");
    private final By btnLanzarMensaje   = By.cssSelector(".modal-box .modal-actions .btn-primary");

    // El resultado aparece con *ngIf cuando resultadoLanzamiento !== null
    private final By resultadoLanzar    = By.cssSelector(".lanzar-resultado");

    public MensajesPage(WebDriver driver) {
        super(driver);
    }

    public MensajesPage open() {
        navigateTo("/mensajes");
        return this;
    }

    public void seleccionarPrimerProceso() {
        waitForVisible(procesoItems);
        driver.findElements(procesoItems).get(0).click();
        waitForAngularLoad(mpLoading);
    }

    public void crearEvento(String nombreMensaje, String tipo) {
        click(btnNuevoEvento);
        waitForVisible(modalCrear);
        type(inputNombreMensaje, nombreMensaje);
        selectByValue(selectTipoEvento, tipo);
        click(btnGuardarEvento);
        waitForInvisible(modalCrear);
        // Esperar que la lista se actualice
        waitForAngularLoad(mpLoading);
    }

    public void lanzarPrimerMensaje(String payload) {
        waitForVisible(eventoCards);
        // Click en el primer botón lanzar
        driver.findElements(By.cssSelector(".btn-launch")).get(0).click();

        // Esperar que el modal de lanzar aparezca (tiene .modal-textarea)
        wait.until(ExpectedConditions.visibilityOfElementLocated(textareaPayload));

        // Limpiar y escribir el payload
        type(textareaPayload, payload);

        // Click en el botón Lanzar dentro del modal
        click(btnLanzarMensaje);

        // Esperar resultado exitoso (.lanzar-resultado) o error del backend (.mp-error)
        // Si no hay receptor activo el backend responde con error → errorMsg, no resultado
        wait.until(d ->
            !d.findElements(resultadoLanzar).isEmpty() ||
            !d.findElements(mpError).isEmpty()
        );
    }

    public boolean isEventosPanelVisible() { return isDisplayed(eventosPanel);  }
    public boolean isEmptyVisible()        { return isDisplayed(eventosEmpty);   }
    public boolean isErrorVisible()        { return isDisplayed(mpError);        }
    public boolean isTrazaVisible()        { return isDisplayed(trazaTable);     }

    public int contarEventos() {
        try {
            waitForVisible(eventoCards);
            return driver.findElements(eventoCards).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean isResultadoLanzarVisible() {
        return isDisplayed(resultadoLanzar);
    }
}