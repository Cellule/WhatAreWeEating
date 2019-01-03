

export default class CancellablePromise<T> {
  private cancelled = false;
  private resolved = false;
  private cancellable: Promise<T>;
  private resolve: (value: T) => void;
  private reject: (...args: any) => void;
  private controller: AbortController;

  constructor(makePromise: (cancel: CancellablePromise<T>) => Promise<T>) {
    this.resolve = () => {};
    this.reject = () => {};
    this.cancellable = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.controller = new AbortController();
    (async (resolve, reject) => {
      try {
        const data = await makePromise(this);
        if (!this.cancelled) {
          this.resolved = true;
          resolve(data);
        }
      } catch (error) {
        if (!this.cancelled) {
          this.resolved = true;
          reject(error);
        }
      }
    })(this.resolve, this.reject);
  }

  get signal() {
    return this.controller.signal;
  }

  get isCancelled() {
    return this.cancelled;
  }

  cancel() {
    if (!this.resolved && !this.cancelled) {
      this.cancelled = true;
      this.controller.abort();
      this.reject(new Error("cancelled"));
    }
  }

  wait() {
    return this.cancellable;
  }
}