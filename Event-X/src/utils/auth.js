const PASSWORD_HASH_ITERATIONS = 310000;

const bytesToHex = (bytes) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const hexToBytes = (hex) =>
  new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const derivePasswordHash = async (password, salt) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: "SHA-256"
    },
    key,
    256
  );

  return new Uint8Array(bits);
};

export const createPasswordCredential = async (password) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);

  return {
    passwordSalt: bytesToHex(salt),
    passwordHash: bytesToHex(hash)
  };
};

export const verifyPassword = async (password, account) => {
  if (
    !/^[0-9a-f]{32}$/i.test(account?.passwordSalt || "") ||
    !/^[0-9a-f]{64}$/i.test(account?.passwordHash || "")
  ) {
    return false;
  }

  const salt = hexToBytes(account.passwordSalt);
  const expectedHash = hexToBytes(account.passwordHash);
  const actualHash = await derivePasswordHash(password, salt);

  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  return actualHash.reduce(
    (difference, byte, index) => difference | (byte ^ expectedHash[index]),
    0
  ) === 0;
};

export const toPublicUser = (user) => {
  const publicUser = { ...user };
  delete publicUser.passwordSalt;
  delete publicUser.passwordHash;
  return publicUser;
};
