package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class ProcesosPage extends BasePage {

    private final By btnCrearProceso       = By.id("btn-crear-proceso");
    private final By filtroBtnTodos        = By.id("filtro-todos");
    private final By filtroBtnBorrador     = By.id("filtro-BORRADOR");
    private final By filtroBtnPublicado    = By.id("filtro-PUBLICADO");
    private final By filtroBtnInactivo     = By.id("filtro-INACTIVO");
    private final By successBanner         = By.id("success-banner");
    private final By errorBanner           = By.cssSelector(".error-banner");
    private final By loadingState          = By.cssSelector(".loading-state");
    private final By procesosGrid          = By.cssSelector(".procesos-grid");
    private final By emptyState            = By.cssSelector(".empty-state");

    private final By modalCrear            = By.id("modal-crear-proceso");
    private final By inputNombreCrear      = By.id("inp-nombre");
    private final By inputDescCrear        = By.id("inp-desc");
    private final By selectCatCrear        = By.id("inp-cat");
    private final By btnConfirmarCrear     = By.id("btn-confirmar-crear");
    private final By btnCerrarModal        = By.id("btn-cerrar-modal");
    private final By btnCancelarModal      = By.id("btn-cancelar-modal");

    private final By modalEditar           = By.id("modal-editar-proceso");
    private final By inputNombreEditar     = By.id("edit-nombre");
    private final By inputDescEditar       = By.id("edit-desc");
    private final By selectCatEditar       = By.id("edit-cat");
    private final By btnConfirmarEditar    = By.id("btn-confirmar-edit");

    private final By modalEliminar         = By.id("modal-confirmar-eliminar");
    private final By btnConfirmarDel       = By.id("btn-confirmar-del");

    private final By modalConfirmEstado    = By.id("modal-confirm-estado");
    private final By btnConfirmarEstado    = By.id("btn-confirmar-estado");

    private final By modalCompartir        = By.id("modal-compartir");
    private final By selectPoolDestino     = By.id("inp-pool-destino");
    private final By selectPermiso         = By.id("inp-permiso");
    private final By btnConfirmarCompartir = By.id("btn-confirmar-compartir");

    public ProcesosPage(WebDriver driver) {
        super(driver);
    }

    public ProcesosPage open() {
        navigateTo("/procesos");
        waitForAngularLoad(loadingState);
        wait.until(d ->
            !d.findElements(procesosGrid).isEmpty() ||
            !d.findElements(emptyState).isEmpty()
        );
        return this;
    }

    public void abrirModalCrear() {
        click(btnCrearProceso);
        waitForVisible(modalCrear);
    }

    public void crearProceso(String nombre, String descripcion, String categoria) {
        abrirModalCrear();
        type(inputNombreCrear, nombre);
        type(inputDescCrear, descripcion);
        selectByValueOrText(selectCatCrear, categoria);

        // Esperar que Angular habilite el botón (quita el atributo disabled del DOM)
        wait.until(d -> {
            WebElement btn = d.findElement(btnConfirmarCrear);
            return btn.getAttribute("disabled") == null
                && !"true".equals(btn.getAttribute("aria-disabled"))
                && btn.isEnabled();
        });

        click(btnConfirmarCrear);

        // Esperar que el modal cierre (Angular lo destruye con @if)
        wait.until(ExpectedConditions.invisibilityOfElementLocated(modalCrear));

        // Esperar el success-banner que ahora sí aparece tras el fix en procesos.ts
        wait.until(d -> !d.findElements(successBanner).isEmpty());
    }

    public void editarProceso(long procesoId, String nuevoNombre, String nuevaDesc) {
        By btnEditarIcon = By.cssSelector("#proceso-" + procesoId + " .btn-icon-edit");
        click(btnEditarIcon);
        waitForVisible(modalEditar);
        if (nuevoNombre != null) type(inputNombreEditar, nuevoNombre);
        if (nuevaDesc   != null) type(inputDescEditar,   nuevaDesc);
        click(btnConfirmarEditar);
        waitForInvisible(modalEditar);
    }

    public void eliminarProceso(long procesoId) {
        By btnEliminarIcon = By.cssSelector("#proceso-" + procesoId + " .btn-icon-delete");
        click(btnEliminarIcon);
        waitForVisible(modalEliminar);
        click(btnConfirmarDel);
        waitForInvisible(modalEliminar);
    }

    public void cambiarEstado(long procesoId, String btnClass) {
        By btnAccion = By.cssSelector("#proceso-" + procesoId + " ." + btnClass);
        click(btnAccion);
        waitForVisible(modalConfirmEstado);
        click(btnConfirmarEstado);
        waitForInvisible(modalConfirmEstado);
    }

    public void abrirEditor(long procesoId) {
        click(By.id("btn-editar-" + procesoId));
        waitForUrlContains("/editor/" + procesoId);
    }

    public void compartirConPool(long procesoId, String poolDestinoId, String permiso) {
        click(By.id("btn-compartir-" + procesoId));
        waitForVisible(modalCompartir);
        selectByValueOrText(selectPoolDestino, poolDestinoId);
        selectByValueOrText(selectPermiso, permiso);
        click(btnConfirmarCompartir);
        waitForInvisible(modalCompartir);
    }

    public void filtrarTodos()      { click(filtroBtnTodos);     }
    public void filtrarBorradores() { click(filtroBtnBorrador);  }
    public void filtrarPublicados() { click(filtroBtnPublicado); }
    public void filtrarInactivos()  { click(filtroBtnInactivo);  }

    public boolean isModalCrearVisible()  { return isDisplayed(modalCrear);    }
    public boolean isSuccessVisible()     { return isDisplayed(successBanner); }
    public boolean isErrorVisible()       { return isDisplayed(errorBanner);   }
    public boolean isGridVisible()        { return isDisplayed(procesosGrid);  }
    public boolean isEmptyStateVisible()  { return isDisplayed(emptyState);    }

    public boolean existeCardProceso(long procesoId) {
        return isDisplayed(By.id("proceso-" + procesoId));
    }

    public String getTextoCardProceso(long procesoId) {
        return getText(By.id("proceso-" + procesoId));
    }

    public int contarCardsProcesos() {
        try {
            waitForVisible(procesosGrid);
            return driver.findElements(By.cssSelector(".proceso-card")).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean isConfirmarCrearHabilitado() {
        WebElement btn = waitForVisible(btnConfirmarCrear);
        return btn.getAttribute("disabled") == null
            && !"true".equals(btn.getAttribute("aria-disabled"))
            && btn.isEnabled();
    }

    public void cerrarModalCrear() {
        click(btnCerrarModal);
        waitForInvisible(modalCrear);
    }
}