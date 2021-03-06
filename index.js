'use strict';

const which = require('which');
const child_process = require('child_process');

var INSTALL_CMD = {
    brew: 'brew install',
    port: 'sudo port install',
    pkgin: 'sudo pkgin install',
    choco: 'choco install',
    powershell: "powershell 'Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))'",
    'apt-get': 'sudo apt-get install',
    yum: 'sudo yum install',
    dnf: 'sudo dnf install',
    nix: 'nix-env --install',
    zypper: 'sudo zypper in',
    emerge: 'sudo emerge -a',
    pacman: 'sudo pacman -S',
    pkg: 'pkg install',
    pkg_add: 'pkg_add',
    crew: 'crew install'
};

var PKG_MANAGERS = {
    darwin: ['brew', 'port', 'pkgin'],
    win32: ['choco', 'powershell'],
    linux: ['apt-get', 'yum', 'dnf', 'nix', 'zypper', 'emerge', 'pacman', 'crew'],
    freebsd: ['pkg', 'pkg_add'],
    sunos: ['pkg'],
    netbsd: ['none']
};

function package_manager(reject) {
    if (!reject)
        var reject = (data) => {
            return new Error(data);
        }

    var managers = PKG_MANAGERS[process.platform];
    if (!managers || !managers.length) {
        return reject('unknown platform \'' + process.platform + '\'');
    }

    managers = managers.filter(function (mng) {
        try {
            // TODO: Optimize?
            which.sync(mng);
            return true;
        } catch (e) {
            return false;
        }
    });

    if (!managers.length) {
        return reject('your package_manager not found');
    }

    return INSTALL_CMD[managers[0]].split(' ');
}

/**
 * Gets the system package manager install command.
 *
 * @returns {object} ```{ needSudo: boolean `true or false`,
 * packager: string `your system packaging command`,
 * installerCommand: string `full install command` }```
 *
 * - E.g. 'sudo apg-get install' for Debian based systems.
 * - Defaults to 'your_package_manager install' if no package manager is found.
 * @throws if `process.platform` is none of darwin, freebsd, linux, sunos or win32.
 */
function packager() {
    const system_installer = package_manager();
    if (system_installer[0])
        return {
            needSudo: ((system_installer[0] == 'sudo') ? true : false),
            packager: ((!system_installer[2]) ? system_installer[0] : system_installer[1]),
            installerCommand: system_installer.join(' ')
        }
    else
        return new Error(system_installer);
};

/**
 * Install package using the system package manager command.
 *
 * @returns {string} Output of spawn command.
 * - E.g. 'sudo apg-get install' for Debian based systems.
 * - Defaults to 'your_package_manager install' if no package manager is found.
 * @throws Throws if `process.platform` is none of darwin, freebsd, linux, sunos or win32.
 */
function installer(application) {
    var installOutput = '';
    return new Promise(function (resolve, reject) {
        if (!application) return reject("No package, application name missing.");

        var system_installer = package_manager(reject);
        var cmd = system_installer[0];
        if (system_installer[1]) var args = [system_installer[1]];
        if (system_installer[2]) var install = [system_installer[2]];

        var whatToInstall = (Array.isArray(application)) ? [].concat(application).concat(['-y']) : [].concat([application]).concat(['-y']);
        var system = whatToInstall;
        if ((args) && (!install)) system = args.concat(whatToInstall);
        if ((args) && (install)) system = args.concat(install).concat(whatToInstall);
        if (cmd != 'powershell') {
            console.log('Running ' + cmd + ' ' + system);
            const spawn = child_process.spawn(cmd, system, {
                stdio: 'pipe'
            });

            spawn.on('error', (err) => {
                return reject(err);
            });
            spawn.on('close', () => {
                return resolve(installOutput);
            });
            spawn.on('exit', () => {
                return resolve(installOutput);
            });

            spawn.stdout.on('data', (data) => {
                installOutput += data.toString();
                if (system.includes('node-fake-tester')) {
                    spawn.kill('SIGKILL');
                    return resolve('For testing only, no package installed.');
                }

                if (data.includes('The package was not found') || data.includes('Unable to locate package')) {
                    return reject(data.toString());
                }
            });
            spawn.stderr.on('data', (data) => {
                return reject(data.toString());
            });

            if (system.includes('node-fake-tester') && Object.getOwnPropertyDescriptor(process, 'platform').value == 'darwin') {
                spawn.kill('SIGKILL');
                return resolve('For testing only, no package installed.');
            }

        }
        /* else if (process.platform == 'win32' && cmd == 'powershell') {
                        const PowerShell = require("powershell");
                        console.log('Download and Install Chocolatey');
                        const ps = new PowerShell("Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))", {
                            executionpolicy: 'Unrestricted'
                        });

                        ps.on('error', (err) => {
                            return reject(err);
                        });
                        ps.on('output', (data) => console.log(data));
                        ps.on('error-output', (data) => {
                            return reject(data);
                        });

                        ps.on('end', () => {
                            console.log('Running choco install ' + whatToInstall);
                            const spawn = child_process.spawn('choco', ['install'].concat(whatToInstall), {
                                stdio: 'pipe'
                            });

                            spawn.on('error', (err) => {
                                return reject(err);
                            });
                            spawn.on('close', (code) => {
                                return resolve(code);
                            });
                            spawn.on('exit', (code) => {
                                return resolve(code);
                            });

                            spawn.stdout.on('data', (data) => console.log(data.toString()));
                            spawn.stderr.on('data', (data) => {
                                return reject(data.toString());
                            });
                        });
                    } */
        else {
            return reject('No package manager installed!');
        }
    });
}

function system_installer() {}

module.exports = exports = system_installer;
exports.default = exports;
exports.packager = packager;
exports.installer = installer;

/**
 * Like the unix `which` utility.
 *
 * Finds the first instance of a specified executable in the PATH environment variable.
 *
 * @param String executable
 *
 * @returns String|Null
 */
exports.where = function (executable) {
    let found = which.sync(executable, {
        nothrow: true
    });

    return found;
};
