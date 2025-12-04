// Simple encryption for local storage data
const ENCRYPTION_KEY = 'nodenest_secure_key_v1';

export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    // Base64 encode with a simple XOR cipher
    const encrypted = btoa(jsonString.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join(''));
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    // Base64 decode and reverse XOR cipher
    const decoded = atob(encryptedData);
    const decrypted = decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join('');
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};
