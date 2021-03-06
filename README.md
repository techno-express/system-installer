system-installer
=======
[![NPM](https://nodei.co/npm/system-installer.png)](https://nodei.co/npm/system-installer/)

[![Dependencies Status](http://img.shields.io/david/techno-express/system-installer.svg)](https://david-dm.org/techno-express/system-installer) [![Node.js CI](https://github.com/techno-express/system-installer/workflows/Node.js%20CI/badge.svg)](https://github.com/techno-express/system-installer/actions) [![codecov](https://codecov.io/gh/techno-express/system-installer/branch/master/graph/badge.svg?token=nups0UsVPw)](https://codecov.io/gh/techno-express/system-installer) [![Maintainability](https://api.codeclimate.com/v1/badges/54f89d3ae887724ceb93/maintainability)](https://codeclimate.com/github/techno-express/system-install/maintainability) [![Release](http://img.shields.io/npm/v/system-installer.svg)](https://www.npmjs.org/package/system-installer)

> Get the install command or install a package using the system packaging manager, e.g. `sudo apt-get install` for Debian-based systems.

This package has been replaced with [node-sys](https://www.npmjs.com/package/node-sys).

`system-installer` will try to find which system packaging is installed for the given `process.platform`. If no system package manager is found, `'your_package_manager install'` is returned.

## Install

```sh
npm install system-installer
```

## Usage

### Node

```js
const sysInstaller = require('system-installer').packager();
/* - 'brew install' on OS X if homebrew is installed.
 * - 'sudo apt-get install' on debian platforms.
 * - 'sudo yum install' on red hat platforms.
 * - 'your_package_manager install' if no package manager is found.
 *
 * Throws if `process.platform` is none of darwin, freebsd, linux, sunos or win32.
 */

console.log(`Please install pandoc: ${sysInstaller.installerCommand} pandoc`);
```

### Install `vim` package onto host, using system's default package manager

* Returns a Promise

```sh
const sysInstaller = require('system-installer').installer;
sysInstaller('vim')
.then(function(data){
    // returns installation output
    console.log(data);
})
.catch(function(err) {
    console.log(err);
});
```

### CLI

```sh
$ npm i -g system-installer
$ system-installer
brew install
```

## Supported package managers

### FreeBSD
- [pkg]
- [pkg_add]

### Linux
- [apt-get] - Debian, Ubuntu
- [dnf] - fedora
- [emerge] - Gentoo
- [nix] - NixOS
- [pacman] - ArchLinux
- [yum] - fedora
- [zypper] - OpenSUSE
- [chromebrew] - Chrome OS

### OS X
- [brew]
- [pkgin]
- [port]

### Solaris
- [pkg](https://docs.oracle.com/cd/E23824_01/html/E21802/gihhp.html)

### Windows
- [chocolatey]

[apt-get]: https://help.ubuntu.com/community/AptGet/Howto
[brew]: http://brew.sh
[pacman]: https://wiki.archlinux.org/index.php/pacman
[yum]: https://fedoraproject.org/wiki/Yum
[dnf]: https://fedoraproject.org/wiki/Dnf
[nix]: https://nixos.org/nix/
[zypper]: https://en.opensuse.org/Portal:Zypper
[emerge]: https://wiki.gentoo.org/wiki/Portage
[port]: https://guide.macports.org/#using.port
[pkgin]: https://github.com/cmacrae/saveosx
[pkg]: https://www.freebsd.org/doc/handbook/pkgng-intro.html
[pkg_add]: https://www.freebsd.org/cgi/man.cgi?query=pkg_add&manpath=FreeBSD+7.2-RELEASE
[chocolatey]: https://chocolatey.org
[chromebrew]: https://github.com/skycocker/chromebrew
