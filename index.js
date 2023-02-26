const myArgs = process.argv.slice(2);
const { buildSetup, createFiles, createMetaData } = require("./src/main.js");
const { defaultEdition } = require("./src/config.js");
const edition = myArgs.length > 0 ? Number(myArgs[0]) : defaultEdition;
const { exec } = require("child_process");

(async () => {
    buildSetup();
    await createFiles(edition);
    createMetaData();
    
    await runCommand();
    return false;
})();


const runCommand = async () => {
  try {
    await exec("pm2 stop index", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
  } catch(err) {
    console.log(err)
  }
}
