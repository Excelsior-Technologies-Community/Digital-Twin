const DEFAULT_MAX_ENTRIES = 500;
const DEFAULT_TTL_MS = 5 * 60 * 1000;

const cloneValue = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const sanitizeTwinRecord = (twinRecord) => {
  if (!twinRecord || typeof twinRecord !== 'object') {
    return null;
  }

  const plain = typeof twinRecord.toJSON === 'function' ? twinRecord.toJSON() : twinRecord;
  const sanitized = cloneValue(plain);
  delete sanitized.rawResumeText;
  return sanitized;
};

const createTwinCache = ({ maxEntries = DEFAULT_MAX_ENTRIES, ttlMs = DEFAULT_TTL_MS } = {}) => {
  const store = new Map();
  const aliases = new Map();

  const deleteByCanonicalKey = (canonicalKey) => {
    const existing = store.get(canonicalKey);
    if (!existing) return;

    for (const aliasKey of existing.aliases) {
      if (aliases.get(aliasKey) === canonicalKey) {
        aliases.delete(aliasKey);
      }
    }
    store.delete(canonicalKey);
  };

  const resolveCanonicalKey = (identifier) => {
    if (typeof identifier !== 'string') return null;
    const trimmed = identifier.trim();
    if (!trimmed) return null;

    return aliases.get(`slug:${trimmed}`) || aliases.get(`resume:${trimmed}`) || null;
  };

  const get = (identifier) => {
    const canonicalKey = resolveCanonicalKey(identifier);
    if (!canonicalKey) return null;

    const entry = store.get(canonicalKey);
    if (!entry) return null;

    if (Date.now() >= entry.expiresAt) {
      deleteByCanonicalKey(canonicalKey);
      return null;
    }

    store.delete(canonicalKey);
    store.set(canonicalKey, entry);

    return cloneValue(entry.data);
  };

  const set = (twinRecord) => {
    const sanitized = sanitizeTwinRecord(twinRecord);
    if (!sanitized) return;

    const slugAlias = sanitized.publicSlug ? `slug:${String(sanitized.publicSlug).trim()}` : null;
    const resumeAlias = sanitized.resumeId ? `resume:${String(sanitized.resumeId).trim()}` : null;
    const canonicalKey = slugAlias || resumeAlias;
    if (!canonicalKey) return;

    const entryAliases = [slugAlias, resumeAlias].filter(Boolean);
    for (const aliasKey of entryAliases) {
      const staleCanonical = aliases.get(aliasKey);
      if (staleCanonical) {
        deleteByCanonicalKey(staleCanonical);
      }
    }
    deleteByCanonicalKey(canonicalKey);

    while (store.size >= maxEntries) {
      const oldestKey = store.keys().next().value;
      if (!oldestKey) break;
      deleteByCanonicalKey(oldestKey);
    }

    store.set(canonicalKey, {
      data: sanitized,
      expiresAt: Date.now() + ttlMs,
      aliases: entryAliases,
    });

    for (const aliasKey of entryAliases) {
      aliases.set(aliasKey, canonicalKey);
    }
  };

  const invalidate = (target) => {
    if (!target) return;

    if (typeof target === 'string') {
      const canonicalKey = resolveCanonicalKey(target);
      if (canonicalKey) {
        deleteByCanonicalKey(canonicalKey);
      }
      return;
    }

    if (typeof target === 'object') {
      const candidateAliases = [
        target.publicSlug ? `slug:${String(target.publicSlug).trim()}` : null,
        target.resumeId ? `resume:${String(target.resumeId).trim()}` : null,
      ].filter(Boolean);

      for (const aliasKey of candidateAliases) {
        const canonicalKey = aliases.get(aliasKey);
        if (canonicalKey) {
          deleteByCanonicalKey(canonicalKey);
        }
      }
    }
  };

  const clear = () => {
    store.clear();
    aliases.clear();
  };

  return {
    get,
    set,
    invalidate,
    clear,
    get size() {
      return store.size;
    },
  };
};

module.exports = createTwinCache();
