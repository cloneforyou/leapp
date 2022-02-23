<p align="center">
  <img src=".github/images/README-1.png#gh-dark-mode-only" alt="Leapp" height="150" />
    <img src=".github/images/README-1-dark.png#gh-light-mode-only" alt="Leapp" height="150" />
</p>

<h1 align="center">Leapp</h1>

<h4 align="center">
  <a href="https://www.leapp.cloud">Website</a> |
  <a href="https://roadmap.meilisearch.com/tabs/1-under-consideration">Roadmap</a> |
  <a href="https://medium.com/leapp-cloud">Blog</a> |
  <a href="https://join.slack.com/t/noovolari/shared_invite/zt-opn8q98k-HDZfpJ2_2U3RdTnN~u_B~Q">Slack</a> |
  <a href="https://docs.leapp.cloud">Documentation</a> |
  <a href="https://docs.leapp.cloud/troubleshooting/app-data/">Troubleshooting</a>
</h4>

<p align="center">
  <a href="https://lgtm.com/projects/g/Noovolari/leapp/context:javascript"><img src="https://img.shields.io/lgtm/grade/javascript/g/Noovolari/leapp.svg?logo=lgtm&logoWidth=18" alt="Javascript"></a>
  <a href="https://github.com/Noovolari/leapp/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/noovolari/leapp"></a>
  <a href="https://join.slack.com/t/noovolari/shared_invite/zt-opn8q98k-HDZfpJ2_2U3RdTnN~u_B~Q"><img src="https://img.shields.io/badge/slack-online-green" alt="Slack"></a>
</p>

<p align="center">⚡ Lightning Fast, Safe, Desktop App for Cloud credentials managing and generation</p>

**Leapp** is a Cross-Platform Cloud access App, built on top of [Electron](https://github.com/electron/electron).

The App is designed to **manage and secure Cloud Access in multi-account environments.**

For more information about features go to [our documentation](https://docs.leapp.cloud/).

<p align="center">
  <img src=".github/images/Leapp-animation.gif" alt="Web interface gif" />
</p>

## ✨ Features


> We Strongly believe that access information to Cloud in `~/.aws` or `~/.azure` files are not safe, and **[we prefer to store that information in an encrypted file managed by the system.](https://docs.leapp.cloud/contributing/system_vault/)**
> Credentials will be hourly rotated and accessible in those files only when they are needed, so only when Leapp is active.


- **Cloud credentials generation in 1 click**
- **Data [stored locally encrypted](https://docs.leapp.cloud/contributing/system_vault/) in the OS System Vault**
- **Multiple Cloud-Access supported [strategies](https://docs.leapp.cloud/use-cases/intro/)**
- **Automatic [short-lived credentials rotation](https://docs.leapp.cloud/concepts/)**
- **Automatic provisioning of [Sessions](https://docs.leapp.cloud/sessions/) from [AWS Single Sign-on](https://docs.leapp.cloud/use-cases/aws_sso/)**
- **Connect EC2 instances straight away**

All the covered access methods can be found [here](https://docs.leapp.cloud/use-cases/intro/).


# Installation
Get [here](https://www.leapp.cloud/releases) the latest release.

# Contributing

Please read through our [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md). Included are directions
for opening issues, coding standards, and notes on development.

Editor preferences are available in the [editor config](.editorconfig) for easy use in
common text editors. Read more and download plugins at [editorconfig.org](http://editorconfig.org).

# Developing

Development on Leapp can be done on Mac, Windows, or Linux as long as you have
[NodeJS](https://nodejs.org) and [Git](https://git-scm.com/). See the `.nvmrc` file located in the project for the correct Node version.

<details>
<summary>Initial Dev Setup</summary>

This repository is structured as a monorepo and contains many Node.JS packages. Each package has
its own set of commands, but the most common commands are available from the
root [`package.json`](package.json) and can be accessed using the `npm run ...` command. Here
are the only three commands you should need to start developing on the app.

```bash
# Install and Link Dependencies
npm install


# Start App without Live Reload
npm run electron-dev
```

If Electron is failing building the native Library `Keytar` just run before `npm run electron-dev`:
```bash
# Clear Electron and Keytar conflicts
npm run rebuild-keytar
```

</details>

<details>
<summary>Editor Requirements</summary>

You can use any editor you'd like, but make sure to have support/plugins for
the following tools:

- [ESLint](http://eslint.org/) – For catching syntax problems and common errors

</details>

# Our Sponsors

[<img hspace="5" src="https://avatars.githubusercontent.com/u/1290287?s=60&amp;v=4" width="90" height="90" alt="@taimos">](https://github.com/taimos)
[<img hspace="5" src="https://avatars.githubusercontent.com/u/2232217?s=60&amp;v=4" width="90" height="90" alt="@aws">](https://github.com/aws)


# Documentation
Refer to the documentation [website](https://docs.leapp.cloud).

# Links
- [Glossary](.github/GLOSSARY.md): find other information about the system
- [Contributing](./.github/CONTRIBUTING.md): follow the guidelines if you'd like to contribute to the project
# License
[Mozilla Public License v2.0](https://github.com/Noovolari/leapp/blob/master/LICENSE)
