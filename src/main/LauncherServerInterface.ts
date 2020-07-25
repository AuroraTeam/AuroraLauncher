export interface LauncherServerInterface extends NodeJS.EventEmitter {

  on(event: 'postInit', listener: Function): this;
  once(event: 'postInit', listener: Function): this;
  addListener(event: 'postInit', listener: Function): this;
  removeListener(event: 'postInit', listener: Function): this;

  on(event: 'close', listener: Function): this;
  once(event: 'close', listener: Function): this;
  addListener(event: 'close', listener: Function): this;
  removeListener(event: 'close', listener: Function): this;
}