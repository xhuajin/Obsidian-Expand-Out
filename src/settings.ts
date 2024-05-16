import { App, PluginSettingTab, Setting } from "obsidian";

import ExpandOut from "./main";

export interface ExpandOutSettings {
  expandspeed: number;
  expandgap: number;
}

export const DEFAULT_SETTINGS: ExpandOutSettings = {
  expandspeed: 10,
  expandgap: 10
}

export class ExpandOutSettingTab extends PluginSettingTab {
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
      .addText(text => text
        .setPlaceholder('10')
        .setValue(this.plugin.settings.expandspeed.toString())
        .onChange(async (value) => {
          this.plugin.settings.expandspeed = parseInt(value);
          await this.plugin.saveSettings();
        })
      );
  }
}
