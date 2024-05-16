import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

declare module 'obsidian' {
  interface Workspace {
    leftSplit: WorkspaceSidedock | WorkspaceMobileDrawer;
    rightSplit: WorkspaceSidedock | WorkspaceMobileDrawer;
    leftSidebarToggleButtonEl: HTMLElement;
    rightSidebarToggleButtonEl: HTMLElement;
  }
  interface WorkspaceSidedock {
    containerEl: HTMLElement;
    size: number;
    toggle(): void;
  }
  interface WorkspaceMobileDrawer {
    containerEl: HTMLElement;
    size: number;
  }
  interface WorkspaceRibbon {
    containerEl: HTMLElement;
  }
}

interface ExpandOutSettings {
  movespeed: number;
}

export default class ExpandOut extends Plugin {
	settings: ExpandOutSettings;

	async onload() {
    await this.loadSettings();
    this.addSettingTab(new ExpandOutSettingTab(this.app, this));
    const leftButton = this.app.workspace.leftSidebarToggleButtonEl;
    const rightButton = this.app.workspace.rightSidebarToggleButtonEl;
    
    this.registerDomEvent(leftButton, 'click', () => {
      const workspace = this.app.workspace;
      const leftSplit = workspace.leftSplit;
      const leftSplitWidth = leftSplit.size + workspace.leftRibbon.containerEl.clientWidth;
      const pageWidth = workspace.containerEl.clientWidth;
      const pageHeight = workspace.containerEl.clientHeight;
      
      const start = window.innerWidth;
      const end = pageWidth - (leftSplit.collapsed ? leftSplitWidth : -leftSplitWidth);
      const step = (end - start) * this.settings.movespeed / 100;
      const animate = () => {
        if (Math.abs(window.innerWidth - end) < Math.abs(step)) {
          window.resizeTo(end, pageHeight);
          return;
        }
        window.resizeBy(step, 0);
        requestAnimationFrame(animate);
      };
      animate();
      
      const startLeft = window.screenLeft;
      const endLeft = window.screenLeft + (leftSplit.collapsed ? leftSplitWidth : -leftSplitWidth);
      const stepLeft = (endLeft - startLeft) * this.settings.movespeed / 100;
      const animateLeft = () => {
        if (Math.abs(window.screenLeft - endLeft) < Math.abs(stepLeft)) {
          window.moveTo(endLeft, window.screenTop);
          return;
        }
        window.moveBy(stepLeft, 0);
        requestAnimationFrame(animateLeft);
      };
      animateLeft();
    });
    
    this.registerDomEvent(rightButton, 'click', () => {
      const workspace = this.app.workspace;
      const rightSplit = workspace.rightSplit;
      const rightSplitWidth = rightSplit.size;
      const pageWidth = workspace.containerEl.clientWidth;
      const pageHeight = workspace.containerEl.clientHeight;
      const start = window.innerWidth;
      const end = pageWidth + (rightSplit.collapsed ? -rightSplitWidth : rightSplitWidth);
      const step = (end - start) * this.settings.movespeed / 100;
      const animate = () => {
        if (Math.abs(window.innerWidth - end) < Math.abs(step)) {
          window.resizeTo(end, pageHeight);
          return;
        }
        window.resizeBy(step, 0);
        requestAnimationFrame(animate);
      };
      animate();
    });
  }

	onunload() {
    this.saveSettings();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// settings

const DEFAULT_SETTINGS: ExpandOutSettings = {
  movespeed: 7,
}

class ExpandOutSettingTab extends PluginSettingTab {
  plugin: ExpandOut;
  
  constructor(app: App, plugin: ExpandOut) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this
    containerEl.empty()

    new Setting(containerEl)
      .setName('Expand Speed')
      .setDesc('The speed of expanding the split panel. Default is 10. Set to 0 to disable animation.(Not recommended)')
      .addSlider(slider => {
        slider
          .setLimits(0, 20, 1)
          .setValue(this.plugin.settings.movespeed)
          .setDynamicTooltip()
          .onChange(async value => {
            this.plugin.settings.movespeed = value
            await this.plugin.saveSettings()
          })
      })
      
  }
}