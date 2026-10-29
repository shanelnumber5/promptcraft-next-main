// Unit tests must inject service fixtures. Accidental live AI calls fail immediately.
globalThis.fetch = async () => { throw Error('Live fetch is disabled in the offline unit suite. Inject a mock fetchImpl.'); };
