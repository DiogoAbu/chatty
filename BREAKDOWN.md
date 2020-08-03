# 5-Minute Breakdown

## Chatty App
A offline-first end-to-end encrypted chat with real-time capabilities and notifications.

## Chat
There is only one `Room` entity.
- One-to-one rooms must have only **two members**.
- Group rooms must have a name and can have **one or more members**.

Techs used:
- [WatermelonDB](https://github.com/Nozbe/WatermelonDB)

## Offline-frist
Apart from sign-in and finding people, the app requires no internet to run. Rooms can be created and messages can be written.
When internet is available the local database will send the changes to the server, and receive some too.

Techs used:
- [urql](https://github.com/FormidableLabs/urql)
- [WatermelonDB](https://github.com/Nozbe/WatermelonDB)

## Encryption
End-to-end encryption (E2EE), encrypted on the sender's device and decrypted only on the recipient's.

For one-to-one rooms, asymmetric:
- When a user creates an account a random string `salt` is generated and stored on the server.
- The `salt` is used with the user's `password` to derive a pair of keys (asymmetric).
- Given the same input, the pair of keys will be the same.
- This means the user can sign-in on multiple devices and have the same `secret key`, without the `secret key` or the `password` ever leaving the device.

For group rooms, symmetric:
- When a group is created, a `shared key` is generated (symmetric).
- This `shared key` is encrypted for each member and sent as message to them.
- The members decrypt the received message and store the `shared key` on their devices.
- Every message sent/received to the room is encrypted/decrypted using the `shared key`.
- This prevents the `shared key` from ever reaching the server.

*One thing that's missing is the encryption of the app's local database*

Techs used:
- [Sodium](https://github.com/lyubo/react-native-sodium)

## Real-time capabilities
By using GraphQL subscriptions a WebSocket is used to keep the connection open and receive messages real-time. This is achieved with the help of the `urql` client.

Techs used:
- [urql](https://github.com/FormidableLabs/urql)

## Notifications
The push notifications are data-only. This gives the user the option to not receive notifications, or receive silent ones, by muting rooms.

Techs used:
- [firebase](https://github.com/invertase/react-native-firebase)
