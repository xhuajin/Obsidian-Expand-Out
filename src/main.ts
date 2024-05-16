import { DEFAULT_SETTINGS, ExpandOutSettings } from './settings';

import { Plugin } from 'obsidian';

// Remember to rename these classes and interfaces!

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

export default class ExpandOut extends Plugin {
	settings: ExpandOutSettings;

	async onload() {
    await this.loadSettings();
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
      const step = (end - start) / 10;
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
      const stepLeft = (endLeft - startLeft) / 10;
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
      const step = (end - start) / 10;
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

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}