// TODO: swap this in-memory Set for a Redis-backed store before deploying
// to multiple instances — process-local state will not be shared across
// workers and is wiped on restart, so revocation is not durable.

const revokedJtis = new Set();

const revoke = (jti) => {
    if (jti) revokedJtis.add(jti);
};

const isRevoked = (jti) => revokedJtis.has(jti);

module.exports = { revoke, isRevoked };