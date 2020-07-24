export class LogHelper {
  static dev(msg: any) {
      this.log(LogLevel.DEV, msg)
  }

  static debug(msg: any) {
      this.log(LogLevel.DEV, msg)
  }

  static info(msg: any) {
      this.log(LogLevel.DEV, msg)
  }

  static warn(msg: any) {
      this.log(LogLevel.DEV, msg)
  }

  static error(msg: any) {
      this.log(LogLevel.DEV, msg)
  }

  static raw(msg: any) {}

  private static log(level: LogLevel, msg: any) {
    
    switch(level) {
        case "dev": 
    }
  }
}

enum LogLevel {
    DEV = "dev",
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}