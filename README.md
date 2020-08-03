<p align="center">
  <img
    alt="Logo by Nikita Ivanov"
    src="https://github.com/DiogoAbu/chatty/blob/master/src/assets/logo/icon@2x.png"
    srcset="https://github.com/DiogoAbu/chatty/blob/master/src/assets/logo/icon@0.75x.png 0.75x, https://github.com/DiogoAbu/chatty/blob/master/src/assets/logo/icon.png 1x, https://github.com/DiogoAbu/chatty/blob/master/src/assets/logo/icon@1.5x.png 1.5x, https://github.com/DiogoAbu/chatty/blob/master/src/assets/logo/icon@2x.png 2x, https://github.com/DiogoAbu/chatty/blob/master/src/assets/logo/icon@3x.png 3x, https://github.com/DiogoAbu/chatty/blob/master/src/assets/logo/icon@4x.png 4x"
  />
</p>

<h1 align="center">Chatty</h1>

<div align="center">
  <strong>Talk more</strong>
</div>

<div align="center">
  <h3>
    <a href="#">
      Website
    </a>
    <span> | </span>
    <a href="https://github.com/DiogoAbu/chatty-server">
      Server
    </a>
  </h3>
</div>

<div align="center">
    <a href="https://dribbble.com/shots/4856298-Logo-Challenge-Messaging-App">
      Logo by Nikita Ivanov (Pending permission)
    </a>
</div>

## Table of Contents <!-- omit in toc -->
- [Overview](#overview)
- [Development](#development)
- [Built with](#built-with)
- [License](#license)

## Overview
* **Talk more, say more.** Write it, say it, film it, post it. It's a chat, but it's got a little bit of a zing to it.
* **Make friends.** Use your location to find people near you, or don't, maybe you got enough. That's cool.
* **Cross platform.** App runs on iOS and Android.
* **Synchronized experience.** Always resume where you left off no matter what device.

Here's a [5-Minute Breakdown](BREAKDOWN.md) of the app features and techs used.

## Development
Want to contribute? Great, read [CONTRIBUTING.md](#) for details on our code of conduct. Take a look [here](ARCHITECTURE.md) for extra details.

To start developing, follow these steps:

- Fork the repo.
- Make sure you are on master (`git checkout master && git pull`).
- Create a new branch (`git checkout -b featureName`).
- Make the appropriate changes in the files.
- Add the files to reflect the changes made (`git add .`).
- Commit your changes (`git commit -m "fix: delay render of screen"`).
  - The message MUST follow the [conventional commit format](https://conventionalcommits.org/).
  - Examples:
    - `docs: correct spelling on README`
    - `fix: correct minor typos in code`
    - `feat(lang): add polish language`
- The commit will trigger linters and tests, check if everything finished successfully.
- Push the current branch (`git push`).
- Create a [Pull Request](https://github.com/DiogoAbu/chatty/compare) across forks.

*To write commits on VS Code you can use the extension Conventional Commits (vscode-conventional-commits)*

### Running the app
You can run the app with three different environments defined by the dotenv files.

The keystore password and alias are required to build a release variant:
`yarn cross-env RELEASE_KEY_ALIAS=alias RELEASE_KEY_PASSWORD=password yarn android-*`

**Dev**
  - Will read the `.env` and run as a debug variant.
  - `yarn run android`

**Dev as release**
  - Will read the `.env` and run as a release variant.
  - `yarn run android-dev`

**Staging**
  - Will read the `.env.staging` and run as a release variant.
  - `yarn run android-staging`

**Production**
  - Will read the `.env.production` and run as a release variant.
  - `yarn run android-release`

### Bug / Feature Request
Kindly open an issue [here](https://github.com/DiogoAbu/chatty/issues/new/choose) name it and label it accordingly.

### Releases
We use Github Actions to test, build, and release the app. This is a breakdown of each [workflow](https://github.com/DiogoAbu/chatty/blob/master/.github/workflows).

**Release workflow**
- Triggered by pushs on `master`, `beta`, or `maintenance branchs`.
- Set up the environment (node).
- Run tests.
- Analize commits to define next version.
- Update version on package.json and on the native side.
- Commit the changes.
- Publish a new tagged release with notes.

**Android workflow**
- Triggered when a release is published.
- Set up the environment (gradle, node).
- Get version from package.json.
- Build APK.
- Upload APK to release tagged with current version.

### Notes
**Associate tag with commit**
```bash
git tag -d TAGNAME
git tag TAGNAME COMMIT_HASH
git push origin :TAGNAME
git push origin TAGNAME
```
**Get file as a base64 string**
```bash
openssl base64 -A -in file.ext
```

## Built with
*Check out the projects to know more*

* [Apollo GraphQL](https://www.apollographql.com) - The [server](https://github.com/DiogoAbu/chatty-server)
* [React Native](https://facebook.github.io/react-native) - The [app](https://github.com/DiogoAbu/chatty)

## License
This project and it`s workspaces are licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details
