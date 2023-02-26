let generateNumber = 3000;
const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, 'build');
const directoryPath2 = path.join(__dirname, 'newbuild');

async function generateRandomNumberNFT(max, number, duplicate) {
    console.log(max, number, duplicate);
    var arr = [];
    while(arr.length < number){
        var r = Math.floor(Math.random() * max) + 1;
        if(duplicate) {
            arr.push(r);
        } else {
            if(arr.indexOf(r) === -1) arr.push(r);
        }
    }
    return arr;
}

async function start() {
    try {
        let generateRandom = await generateRandomNumberNFT(generateNumber, generateNumber, false);
        console.log("generateRandom", JSON.stringify(generateRandom));

        await fs.writeFileSync(`random.json`, JSON.stringify(generateRandom)+"\n");

        console.log(directoryPath)
        await fs.readdir(directoryPath, async function (err, files) {
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            console.log(files);
            aa=0;
            //listing all files using forEach
            await files.forEach(async function (file) {
                console.log("old file", aa, file);
                let newfile = generateRandom[aa];
                // console.log("newfile", aa, newfile);

                let fileNumber;
                if(newfile.toString().length == 1) {
                    fileNumber = "000"+newfile;
                } else if(newfile.toString().length == 2) {
                    fileNumber = "00"+newfile;
                } else if(newfile.toString().length == 3) {
                    fileNumber = "0"+newfile;
                } else if(newfile.toString().length == 4) {
                    fileNumber = newfile;
                }

                console.log("file", file, directoryPath+"/"+file);
                console.log("newfile", aa, fileNumber+".png", directoryPath2+"/"+fileNumber+".png");
                fs.rename(directoryPath+"/"+file, directoryPath2+"/"+fileNumber+".png", function (err) {
                  if (err) throw err;
                  console.log('File Renamed.');
                });
                aa++;
            });
        });
    } catch(err){
        console.log(err);
    }
}

start();