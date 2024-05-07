const core = require('@actions/core')
const exec = require('@actions/exec')
const fs = require('fs')
const path = require('path')

async function run() {
    try {
        const version = core.getInput('version', { required: true })
        const projectPath = core.getInput('project-path', { required: true })

        core.setOutput('Setting to version...', version)
        core.setOutput('Project path...', projectPath)

        if (!fs.existsSync(path.resolve(projectPath))) {
            core.setFailed('Project path does not exist')
            return;
        }

        const projectFullPath = path.resolve(projectPath)

        await exec.exec(`agvtool new-marketing-version ${version}`, [], { cwd: projectFullPath })

        const incrementMarketingVersionResult = await exec.exec('agvtool what-marketing-version', [], { cwd: projectFullPath })

        core.setOutput('New Marketing Version...', incrementMarketingVersionResult)

        const versionSplit = version.split(".");
        const majorVersion = Number(versionSplit[0])
        const minorVersion = Number(versionSplit[1])
        const patchVersion = Number(versionSplit[2])

        const buildVersion = majorVersion * 1000000 + minorVersion * 1000 + patchVersion;

        await exec.exec(`agvtool new-version -all ${buildVersion}`, [], { cwd: projectFullPath })

        const incrementBuildVersionResult = await exec.exec('agvtool what-version', [], { cwd: projectFullPath })

        core.setOutput('New Build Version...', incrementBuildVersionResult)
    } catch (error) {
        core.setFailed(error.message)
    }
}

run();
