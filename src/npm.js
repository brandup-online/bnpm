#!/usr/bin/env node

const childProcess = require( 'child_process' );
const path = require( 'path' );
const { listPackages } = require('./utils');

const getArgsList = (startIndex = 3) => process.argv.reduce((acc, current, index) => index >= startIndex? acc += current + " " : '', '');

const commands = {
    install: (args) => `npm install ${args}`,
    update: (args) => `npm update ${args}`,
    build: (args) => `npm run build ${args}`,
	watch: (args) => `npm run watch ${args}`,
    version: (args) => `npm version ${args}`,
    pack: (args) => `npm pack ${args}`
}

const relativePackagesPath = process.env.NPM_PATH || 'npm';

if (!process.argv[2])
    throw new Error(`Not set command name. Available commands: ${Object.keys(commands)}`);

const commandName = process.argv[2].toLowerCase();
const command = commands[commandName];
if (!command)
    throw new Error(`Command ${commandName} is not found. Available commands: ${Object.keys(commands)}`);

const commandArgs = getArgsList();
const commandStr = command(commandArgs);

console.info(`-------begin ${commandName}-------`);
console.info('');

console.info(`command name: ${commandName}`);
console.info(`command argumments: ${commandArgs}`);

const packagesPath = path.join(process.cwd(), relativePackagesPath);
console.info(`packages path: ${packagesPath}`);

const childs = [];
const packages = listPackages(packagesPath);
packages.forEach(pkg => {
	const child = execute(commandName, pkg.dir, pkg.dirName, commandStr, commandName === "watch");
	childs.push(child);
});

// wait all child tasks
Promise.all(childs)
	.then(() => {
		console.info('');
		console.info(`-------end ${commandName}-------`);

		process.exit(0);
	})
	.catch(reason => {
		console.info('');
		console.info(`-------error ${commandName}-------`);

		process.exit(1);
	});

function execute(commandName, dirPath, dirName, command, multy) {
	console.info('');
	console.info(`-------${dirName}-------`);
	console.info('');

	console.info(`${dirPath} ${command}`);
	console.info('');

	if (multy) {
		const subprocess = childProcess.exec(`cd ${dirPath} && ${command}`, {
			encoding: 'utf8',
			shell: true,
			stdio: 'inherit',
			detached: false
		});

		subprocess.stdout.on('data', (data) => {
			console.log(`stdout ${dirName} ${commandName}: ${data}`);
		});
		
		subprocess.stderr.on('data', (data) => {
			console.error(`stderr ${dirName} ${commandName}: ${data}`);
		});

		subprocess.on('close', (code) => {
			console.log(`${dirName} ${commandName} exited with code ${code}`);
		});

		return new Promise((resolve, reject) => {
			subprocess.on('close', (code) => {
				if (code == 0)
					resolve(null);
				else
					reject(`${dirName} ${commandName} exited with code ${code}`);
			});
		});
	}
	else {
		childProcess.execSync(`cd ${dirPath} && ${command}`, {
			encoding: 'utf8',
			shell: true,
			stdio: 'inherit',
			detached: false
		});

		return new Promise((resolve, reject) => { resolve(null); });
	}
}