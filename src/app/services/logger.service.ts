import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly LOG_FILE = 'app.log';
  private readonly MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
  private isInitialized = false;

  constructor(private platform: Platform) {
    this.initialize();
  }

  private async initialize() {
    try {
      if (this.platform.is('capacitor')) {
        await this.ensureLogFile();
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Error initializing logger:', error);
    }
  }

  private async ensureLogFile() {
    try {
      await Filesystem.getUri({
        path: this.LOG_FILE,
        directory: Directory.Data
      });
    } catch {
      // File doesn't exist, create it
      await Filesystem.writeFile({
        path: this.LOG_FILE,
        data: '',
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
    }
  }

  private async writeToFile(level: string, message: string, data?: any): Promise<void> {
    if (!this.platform.is('capacitor') || !this.isInitialized) {
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [${level}] ${message}${data ? ': ' + JSON.stringify(data) : ''}\n`;

      // Check file size before writing
      const fileInfo = await Filesystem.getUri({
        path: this.LOG_FILE,
        directory: Directory.Data
      });

      const stat = await Filesystem.stat({
        path: this.LOG_FILE,
        directory: Directory.Data
      });

      // If file is too large, create a backup and start fresh
      if (stat.size > this.MAX_LOG_SIZE) {
        const backupName = `app_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
        await Filesystem.copy({
          from: this.LOG_FILE,
          to: backupName,
          directory: Directory.Data
        });
        await Filesystem.writeFile({
          path: this.LOG_FILE,
          data: '',
          directory: Directory.Data,
          encoding: Encoding.UTF8
        });
      }

      // Append the new log entry
      await Filesystem.appendFile({
        path: this.LOG_FILE,
        data: logEntry,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  async error(message: string, error: any): Promise<void> {
    console.error(`[ERROR] ${message}:`, error);
    await this.writeToFile('ERROR', message, error);
  }

  async warn(message: string, data?: any): Promise<void> {
    console.warn(`[WARN] ${message}:`, data);
    await this.writeToFile('WARN', message, data);
  }

  async info(message: string, data?: any): Promise<void> {
    console.info(`[INFO] ${message}:`, data);
    await this.writeToFile('INFO', message, data);
  }

  async debug(message: string, data?: any): Promise<void> {
    console.debug(`[DEBUG] ${message}:`, data);
    await this.writeToFile('DEBUG', message, data);
  }

  async getLogs(): Promise<string> {
    try {
      if (!this.platform.is('capacitor')) {
        return 'Logs are only available on native platforms';
      }

      const contents = await Filesystem.readFile({
        path: this.LOG_FILE,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });

      if (typeof contents.data === 'string') {
        return contents.data;
      } else {
        // Si es un Blob, lo convertimos a string
        return await contents.data.text();
      }
    } catch (error) {
      console.error('Error reading log file:', error);
      return 'Error reading log file';
    }
  }

  async clearLogs(): Promise<void> {
    try {
      if (this.platform.is('capacitor')) {
        await Filesystem.writeFile({
          path: this.LOG_FILE,
          data: '',
          directory: Directory.Data,
          encoding: Encoding.UTF8
        });
      }
    } catch (error) {
      console.error('Error clearing log file:', error);
    }
  }
}
