const { execSync } = require('child_process');
const getPackages = require('get-monorepo-packages');
const semver = require('semver');
const npmLogin = require('npm-cli-login');

function publishVersionChangedPackagesList(root_dir) {
    // Get package list in a directory.
    const packagesList = getPackages(root_dir);
    for (let index in packagesList) {
        try {
            const packageInfo = packagesList[index];

            // Skip private packages
            if (packageInfo["package"].hasOwnProperty("private") || packageInfo["package"]["private"]) {
                console.log(`Skipping private package ${packageInfo["package"]["name"]}`);
                continue;
            }

            // Get published package latest version.
            const latestPublisedVersion = execSync(`npm show ${packageInfo['package']['name']} version`).toString().replace(/\n/g, "");
            console.log(`Package ${packageInfo['package']['name']} latest version in npm registry: ${latestPublisedVersion}`);
            console.log(`Package ${packageInfo['package']['name']} version in repository: ${packageInfo["package"]["version"]}`);

            // Check whether the directory packge is greater than the published.
            if (semver.gt(packageInfo["package"]["version"], latestPublisedVersion)) {
                // Set NPM tokens.
              npmLogin(process.env.NPM_USER,
                process.env.NPM_PASSWORD,
                "admin@elpis.game",
                process.env.NPM_REGISTRY,
                "@colyseus");
                console.log(`publishing package ${packageInfo["package"]["name"]}`)

                // Execute NPM commands
                execSync(`cd ${packageInfo["location"]} && npm publish --registry ${process.env.NPM_REGISTRY}`, { stdio: 'inherit' });
            }
        } catch (error) {
            continue;
        }
    }
}

publishVersionChangedPackagesList("./");
