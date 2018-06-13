class DetoxJestAdapter /* implements JasmineReporter */ {
  constructor(detox) {
    this.detox = detox;
    this._currentSpec = null;
    this._todos = [];
  }

  async beforeEach() {
    await this._flush();
    await this.detox.beforeEach(this._currentSpec);
  }

  async afterAll() {
    await this._flush();
  }

  async _afterEach(previousSpec) {
    await this.detox.afterEach(previousSpec);
  }

  async _flush() {
    const t = this._todos;

    while (t.length > 0) {
      await Promise.resolve().then(t.shift()).catch(()=>{});
    }
  }

  tryToRegisterAsJasmineReporter() {
    if (typeof jasmine !== 'undefined' && typeof jest !== 'undefined') {
      jasmine.getEnv().addReporter(this);
    }

    return this;
  }

  specStarted(result) {
    if (result.pendingReason) {
      return;
    }

    const spec = {
      title: result.description,
      fullName: result.fullName,
      status: 'running',
    };

    this._currentSpec = spec;
  }

  specDone(result) {
    if (result.status === 'disabled' || result.pendingReason) {
      return;
    }

    const spec = {
      title: result.description,
      fullName: result.fullName,
      status: result.status,
    };

    this._enqueue(() => this._afterEach(spec));
  }

  _enqueue(fn) {
    this._todos.push(fn);
  }
}

module.exports = DetoxJestAdapter;