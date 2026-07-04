import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

// Generate keypair on client connect
export function generateKeyPair() {
    const keyPair = nacl.box.keyPair();
    return {
        publicKey: encodeBase64(keyPair.publicKey),
        secretKey: encodeBase64(keyPair.secretKey),
    };
}

// Encrypt message for a specific recipient
export function encryptMessage(message, recipientPublicKey, mySecretKey) {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = decodeUTF8(message);
    const encrypted = nacl.box(
        messageUint8,
        nonce,
        decodeBase64(recipientPublicKey),
        decodeBase64(mySecretKey)
    );
    return {
        encryptedMsg: encodeBase64(encrypted),
        nonce: encodeBase64(nonce),
    };
}

// Decrypt received message
export function decryptMessage(encryptedMsg, nonce, senderPublicKey, mySecretKey) {
    const decrypted = nacl.box.open(
        decodeBase64(encryptedMsg),
        decodeBase64(nonce),
        decodeBase64(senderPublicKey),
        decodeBase64(mySecretKey)
    );
    if (!decrypted) return null;
    return encodeUTF8(decrypted);
}