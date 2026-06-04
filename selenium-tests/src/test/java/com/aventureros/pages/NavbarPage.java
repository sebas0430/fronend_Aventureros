package com.aventureros.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * NavbarPage – Page Object para el sidebar de navegación (componente {@code app-navbar}).
 *
 * <p>Selectores extraídos de {@code navbar.html}:
 * <ul>
 *   <li>{@code a[routerLink="/procesos"]} → enlace a Procesos</li>
 *   <li>{@code a[routerLink="/empleados"]} → enlace a Equipo</li>
 *   <li>{@code a[routerLink="/roles-proceso"]} → enlace a Roles Proceso</li>
 *   <li>{@code a[routerLink="/roles-pool"]}    → enlace a Roles Pool</li>
 *   <li>{@code a[routerLink="/pools"]}          → enlace a Pools</li>
 *   <li>{@code a[routerLink="/lanes"]}          → enlace a Lanes</li>
 *   <li>{@code a[routerLink="/conectores"]}     → enlace a Conectores</li>
 *   <li>{@code a[routerLink="/mensajes"]}       → enlace a Mensajes</li>
 *   <li>{@code #btn-logout}                     → botón Salir</li>
 *   <li>{@code .toggle-btn}                     → botón colapsar sidebar</li>
 * </ul>
 * </p>
 */
public class NavbarPage extends BasePage {

    // ── Localizadores ────────────────────────────────────────────────────────
    private final By linkProcesos    = By.cssSelector("a[routerLink='/procesos']");
    private final By linkEmpleados   = By.cssSelector("a[routerLink='/empleados']");
    private final By linkRolesProceso = By.cssSelector("a[routerLink='/roles-proceso']");
    private final By linkRolesPool   = By.cssSelector("a[routerLink='/roles-pool']");
    private final By linkPools       = By.cssSelector("a[routerLink='/pools']");
    private final By linkLanes       = By.cssSelector("a[routerLink='/lanes']");
    private final By linkConectores  = By.cssSelector("a[routerLink='/conectores']");
    private final By linkMensajes    = By.cssSelector("a[routerLink='/mensajes']");
    private final By btnLogout       = By.id("btn-logout");
    private final By toggleBtn       = By.cssSelector(".toggle-btn");
    private final By sidebar         = By.cssSelector("nav.sidebar");

    public NavbarPage(WebDriver driver) {
        super(driver);
    }

    // ── Acciones de navegación ───────────────────────────────────────────────

    public void irAProcesos() {
        click(linkProcesos);
        waitForUrlContains("/procesos");
    }

    public void irAEmpleados() {
        click(linkEmpleados);
        waitForUrlContains("/empleados");
    }

    public void irARolesProceso() {
        click(linkRolesProceso);
        waitForUrlContains("/roles-proceso");
    }

    public void irARolesPool() {
        click(linkRolesPool);
        waitForUrlContains("/roles-pool");
    }

    public void irAPools() {
        click(linkPools);
        waitForUrlContains("/pools");
    }

    public void irALanes() {
        click(linkLanes);
        waitForUrlContains("/lanes");
    }

    public void irAConectores() {
        click(linkConectores);
        waitForUrlContains("/conectores");
    }

    public void irAMensajes() {
        click(linkMensajes);
        waitForUrlContains("/mensajes");
    }

    public void logout() {
        click(btnLogout);
        waitForUrlContains("/login");
    }

    public void toggleSidebar() {
        click(toggleBtn);
    }

    // ── Getters de estado ────────────────────────────────────────────────────

    public boolean isSidebarCollapsed() {
        return waitForVisible(sidebar).getAttribute("class").contains("collapsed");
    }

    public boolean isLinkProcesosVisible() {
        return isDisplayed(linkProcesos);
    }

    public boolean isLinkEmpleadosVisible() {
        return isDisplayed(linkEmpleados);
    }

    public boolean isLinkRolesProcesoVisible() {
        return isDisplayed(linkRolesProceso);
    }

    public boolean isLinkPoolsVisible() {
        return isDisplayed(linkPools);
    }

    public boolean isLinkMensajesVisible() {
        return isDisplayed(linkMensajes);
    }
}
