# Chatty

## Generate

This project comes with templates to generate various aspects of the app, start by running:
```bash
yarn templategen
```

## Structure

- src/
  - components/
  - exchanges/
  - generated/
  - hooks/
  - models/
  - navigators/
  - screens/
    - SignIn
      - queries.ts
      - styles.ts
      - SignIn.ts
  - services/
  - stores/
  - utils/
  - App.ts
  - types.ts

## Screens

- Root (Stack Navigator)
  - SignIn
  - ForgotPass
  - ChangePass
  - Home (Tabs Navigator)
    - Chats
    - Feed
  - Chatting
  - FindFriends
  - Settings

## End-to-End Encryption
We will be using [react-native-sodium](https://github.com/lyubo/react-native-sodium).

### Two-way chat (asymmetric - public for encrypting and secret for decrypting)

Generate key pair for local user (secret and public keys)
- When a user creates an account a random string `salt` is generated and stored on the server.
- The `salt` is used with the user's `password` to derive a pair of keys.
- Given the same input, the pair of keys will be the same.
- This means the user can sign in on multiple devices and have the same `secret key`, without the `secret` or the `password` ever leaving the device.

Store pair of keys and share the public key, everyone will know everyone else's public key
```javascript
userModel.save((record) => {
  record.secretKey = secretKey;
  record.publicKey = publicKey;
});
```

Encrypt message with the recipient's public and sender's secret key
```javascript
const nonce = message.id;
const contentCipher = await Sodium.crypto_box_easy(
  content,
  nonce,
  recipient.publicKey,
  sender.secretKey
);
```

Decrypt message sent to me with MY secret key since it was encrypt with MY public key
```javascript
const nonce = message.id;
const content = await Sodium.crypto_box_open_easy(
  contentCipher,
  nonce,
  sender.publicKey,
  recipient.secretKey,
);
```

### Group chat

Generate key for the room (symmetric - same key for encrypting and decrypting)
```javascript
const sharedKey = await Sodium.crypto_secretbox_keygen();
```

Send to each member the symmetric key enconde with their public key
```javascript
members.map(async (member) => {
  const nonce = message.id;
  const contentCipher = await Sodium.crypto_box_easy(
    sharedKey,
    nonce,
    recipient.publicKey,
    sender.secretKey
  );
  roomModel.addMessage((record) => {
    record.content = contentCipher;
    record.type = 'key';
  });
});
```

Decrypt incoming message of type KEY with MY secret key since it was encrypt with MY public key
```javascript
const nonce = message.id;
const content = await Sodium.crypto_box_open_easy(
  contentCipher,
  nonce,
  sender.publicKey,
  recipient.secretKey,
);
```

Encrypt message with the room shared key
```javascript
const nonce = message.id;
const contentCipher = await Sodium.crypto_secretbox_easy(content, nonce, sharedKey);
```

Decrypt incoming message with room shared key
```javascript
const content = await Sodium.crypto_secretbox_open_easy(contentCipher, nonce, sharedKey);
```
