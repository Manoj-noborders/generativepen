const fs = require("fs");
const path = require('path');
const { createCanvas, loadImage, Image } = require("canvas");
const console = require("console");
const { layersOrder, format, rarity, probability, ordering, duplicacy } = require("./config.js");
let {defaultEdition}  = require("./config.js");
const delay = require('delay');
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
let layersInfo = [];

if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

let manualImg = [];
const buildDir = `${process.env.PWD}/build`;
const metDataFile = '_metadata.json';
const layersDir = `${process.env.PWD}/layers`;
let metadata = [];
let creation_script_layer = [];
let creation_manual_data = [];

let creation_current_data = [];
let creation_current_edition = 0;

let orderingARR = [];
let probabilityInfo = {};
let rawdata = fs.readFileSync(path.resolve(buildDir, metDataFile));
if(rawdata)
  metadata = JSON.parse(rawdata);
// console.log(metadata);
let attributes = [];
let hash = [];
let decodedHash = [];
const Exists = new Map();

//to number the file
let size = 3;

const addRarity = _str => {
  let itemRarity;

  rarity.forEach((r) => {
    if (_str.includes(r.key)) {
      itemRarity = r.val;
    }
  });

  return itemRarity;
};

const cleanName = _str => {
  let name = _str.slice(0, -4);
  rarity.forEach((r) => {
    name = name.replace(r.key, "");
  });
  return name;
};

const getElements = path => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index + 1,
        name: cleanName(i),
        fileName: i,
        rarity: addRarity(i),
      };
    });
};

const layersSetup = layersOrder => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    name: layerObj.name,
    location: `${layersDir}/${layerObj.name}/`,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    position: { x: 0, y: 0 },
    size: { width: format.width, height: format.height },
    number: layerObj.number
  }));

  return layers;
};

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
};

const saveLayer = async (_canvas, _edition) => {
  // to file the name with fixed zeros
  let fileNumber = _edition;
  // fileNumber = fileNumber.toString();
  // while (fileNumber.length < size) fileNumber = "0" + fileNumber;
  //

  if(_edition.toString().length == 1) {
    fileNumber = "000"+_edition;
  } else if(_edition.toString().length == 2) {
    fileNumber = "00"+_edition;
  } else if(_edition.toString().length == 3) {
    fileNumber = "0"+_edition;
  } else if(_edition.toString().length == 4) {
    fileNumber = _edition;
  }

  await fs.writeFileSync(`${buildDir}/${fileNumber}.png`, _canvas.toBuffer("image/png"));
};

const addMetadata = _edition => {
  let dateTime = Date.now();
  let tempMetadata = {
    hash: hash.join(""),
    decodedHash: decodedHash,
    edition: _edition,
    date: dateTime,
    attributes: attributes,
  };
  metadata.push(tempMetadata);
  attributes = [];
  hash = [];
  decodedHash = [];
};

const addAttributes = (_element, _layer) => {
  let tempAttr = {
    id: _element.id,
    layer: _layer.name,
    name: _element.name,
    rarity: _element.rarity,
  };
  attributes.push(tempAttr);
  hash.push(_layer.id);
  hash.push(_element.id);
  decodedHash.push({ [_layer.id]: _element.id });
};

const randomReGeneration = _layerA => {
  // console.log("regeneartion")
  const randA = Math.random();
  let elementA =
  _layerA.elements[Math.floor(randA * _layerA.elements.length)] ? _layerA.elements[Math.floor(randA * _layerA.elements.length)] : null;
  // console.log(elementA)
  if(_layerA.elements.length > 0 && elementA == null) {
    return randomReGeneration(_layerA);
  }

  return elementA;
}

const randomReGenerationMain = (_layerA, notThis, flag) => {
  // console.log("regeneartion")
  const randA = Math.random();
  let elementA =
  _layerA.elements[Math.floor(randA * _layerA.elements.length)] ? _layerA.elements[Math.floor(randA * _layerA.elements.length)] : null;
  // console.log(elementA)
  if(_layerA.elements.length > 0 && elementA == null) {
    return randomReGeneration(_layerA, notThis);
  }

  // console.log(flag, elementA.fileName.includes(notThis))
  if(flag) {
    if(!elementA.fileName.includes(notThis)) {
      return randomReGenerationMain(_layerA, notThis, flag);
    }
  } else {
    if(elementA.fileName.includes(notThis)) {
      return randomReGenerationMain(_layerA, notThis, flag);
    }
  }

  return elementA;
}

const checkElementExists = async (newObj, layerFull) => {
  try {
    if(creation_manual_data.length > 0) {
      let conditionVal = 0;
      let ii=1;
      await creation_manual_data.forEach(async (singData) => {
        console.log("----count creation_manual_data", ii);
        if(conditionVal <= 1) {
          conditionVal = 0;
        }
        if(newObj.Body.length > 0 && singData.Body == newObj.Body) {
          console.log("Body", singData.Body);
          console.log("Body", newObj.Body);
          conditionVal += 1;
        }
        if(newObj.Eyes.length > 0 && singData.Eyes == newObj.Eyes) {
          console.log("Eyes", singData.Eyes);
          console.log("Eyes", newObj.Eyes);
          conditionVal += 1;
        }
        if(newObj.Glasses.length > 0 && singData.Glasses == newObj.Glasses) {
          console.log("Glasses", singData.Glasses);
          console.log("Glasses", newObj.Glasses);
          conditionVal += 1;
        }
        if(newObj.Hairs.length > 0 && singData.Hairs == newObj.Hairs) {
          console.log("Hairs", singData.Hairs);
          console.log("Hairs", newObj.Hairs);
          conditionVal += 1;
        }
        if(newObj.HairAccessories.length > 0 && singData.HairAccessories == newObj.HairAccessories) {
          console.log("HairAccessories", singData.HairAccessories);
          console.log("HairAccessories", newObj.HairAccessories);
          conditionVal += 1;
        }
        if(newObj.Clothes.length > 0 && singData.Clothes == newObj.Clothes) {
          console.log("Clothes", singData.Clothes);
          console.log("Clothes", newObj.Clothes);
          conditionVal += 1;
        }
        if(newObj.Earrings.length > 0 && singData.Earrings == newObj.Earrings) {
          console.log("Earrings", singData.Earrings);
          console.log("Earrings", newObj.Earrings);
          conditionVal += 1;
        }
        console.log("conditionVal", conditionVal)
        ii++;
      });
      if(conditionVal > 1) {
        console.log(creation_manual_data);
        console.log(newObj);
        console.log("conditionVal", conditionVal);

        element = await randomReGeneration(layerFull);
        creation_current_data["mainLayer"] = element;
        if(_layer.name == 'Hairs') {
          creation_current_data['Hairs'] = element.name;
        } else {
          creation_current_data[_layer.name] = element.name;      
        }
        return await checkElementExists(newObj, layerFull);
      }
    }
    return true;
  } catch(err) {
    console.log(err)
  }
}

const drawLayer = async (_layer, _edition, _ij) => {
  const rand = Math.random();
  // let layer_filter = await layerFilteration(_layer, _edition);
  let orderingFlag = true;
  if(_edition == 1 && _layer.name == "Background") { rodLimit = 0; }
  let skipLimit = parseInt(defaultEdition) / 3;
  // console.log("skipLimit", skipLimit, "_edition", _edition)
  // if(skipLimit > parseInt(_edition)) {
    if(_layer.name == "EyeBrow" || _layer.name == "Head" || _layer.name == "Belt_Front" || _layer.name == "Armor" || _layer.name == "Cape" || _layer.name == "White_Body" || _layer.name == "White_face" || _layer.name == "Belt_Back" || _layer.name == "Weapon" || _layer.name == "Kimono" || _layer.name == "Neck" || _layer.name == "Eye_Cover") {
      let fetchRandSkip = Math.floor( Math.random() * (50000 - 1) + 1);
      // console.log("check SkiporNot", _layer.name, fetchRandSkip, fetchRandSkip % 2 == 0)
      if(fetchRandSkip % 2 != 0) {
        orderingFlag = false;
      }
      // console.log(parseInt(defaultEdition) - parseInt(_edition), _layer.name, _layer.elements.length);
      if(parseInt(defaultEdition) - parseInt(_edition) < _layer.elements.length) { orderingFlag = true; }
    }
  // }

  if(skipLimit < parseInt(_edition)) {
    if(_layer.name == 'White_face') { 
      orderingFlag = true; 
    }
  }


  let element =
   _layer.elements[Math.floor(rand * _layer.elements.length)] ? _layer.elements[Math.floor(rand * _layer.elements.length)] : null;

  // console.log(_layer.name, element);
  if(element == null) { element = randomReGeneration(_layer); }
  // if(_layer.name == "Rope") {
  //   console.log(_layer.name, "element", element, element.fileName.includes("Double-"), layersInfo[_edition-1]['weapon'], !layersInfo[_edition-1]['weapon'].includes('Dual'));
  // }
  
  if(_layer.name == 'Rope' && element.fileName.includes("Double-") && !layersInfo[_edition-1]['weapon'].includes('Dual')) {
    console.log("IN condition1")
    element = randomReGenerationMain(_layer, "Double-", false); 
    console.log("Rope", element) 
  }

  if(_layer.name == 'Rope' && !element.fileName.includes("Double-") && layersInfo[_edition-1]['weapon'].includes('Dual')) {
    console.log("IN condition2")
    element = randomReGenerationMain(_layer, "Double-", true); 
    console.log("Rope", element) 
  }

  if(_layer.name == 'Kimono' && layersInfo[_edition-1]['body'].includes('Original-')) {
    orderingFlag = true;
  } else if(_layer.name == 'Kimono' && !layersInfo[_edition-1]['body'].includes('Original-')) {
    orderingFlag = false;
  }

  if(_layer.name == 'White_face') {
    console.log("White_face", element.fileName, layersInfo[_edition-1]['white_body']);
    console.log(_layer.name == 'White_face', element.fileName.includes("Large"),  layersInfo[_edition-1]['white_body'] == undefined)
  }

  if(_layer.name == 'White_face' && layersInfo[_edition-1]['white_body'] == undefined) {
    console.log("IN condition78")
    element = randomReGenerationMain(_layer, "Large", true);
    orderingFlag = true;
  }

  // if(_layer.name == 'Eyes' && layersInfo[_edition-1]['white_face']) {
  //   console.log("IN condition785", layersInfo[_edition-1]['white_face'])
  //   element = randomReGenerationMain(_layer, "With White-", true);
  // }

  // if(_layer.name == 'Eyes' && layersInfo[_edition-1]['white_face'] == undefined) {
  //   console.log("IN condition786", layersInfo[_edition-1]['white_face'])
  //   element = randomReGenerationMain(_layer, "With No White-", true);
  // }



  // if(_layer.name == 'White_face' && element.fileName.includes("Large") && layersInfo[_edition-1]['white_body'] == undefined) {
  //   console.log("IN condition4")
  //   element = randomReGenerationMain(_layer, "Large", false); 
  //   console.log("White_face", element) 
  // }

  // if(_layer.name == 'White_face' && element.fileName.includes("Large") && (layersInfo[_edition-1]['white_body'].includes('King') || layersInfo[_edition-1]['white_body'].includes('Emperor'))) {
  //   console.log("IN condition2")
  //   element = randomReGenerationMain(_layer, "Large", false); 
  //   console.log("White_face", element) 
  // }

  // if(_layer.name == 'White_face' && !layersInfo[_edition-1]['white_body']) {
  //   console.log("IN condition4")
  //   element = randomReGenerationMain(_layer, "Large", true); 
  //   console.log("White_face", element) 
  // }


  let checkCond = customCond(_layer, _edition, element);
  // console.log("checkCond", _layer.name, checkCond)
  if (element && checkCond && orderingFlag) {
    keyMM = _edition - 1;
    _layerNameMM = _layer.name.replace(/ /g,'').toLowerCase();

    layersInfo[keyMM][_layerNameMM] = element.fileName;
    if(_layer.name == "Weapon" || _layer.name == "Body" || _layer.name == "Flippers" || _layer.name == "White_Body" || _layer.name == "White_Shoulder" || _layer.name == "White_Flipper" || _layer.name == "White_face" || _layer.name == "Eyes" || _layer.name == "Kimono" || _layer.name == "Belt_Back" || _layer.name == "Belt_Front" || _layer.name == "Eye_Cover" || _layer.name == "EyeBrow" || _layer.name == "Head" || _layer.name == "Armor" || _layer.name == "Cape" || _layer.name == "Neck" || _layer.name == "Rod") {
      // console.log("_layer.elements.length", _layer.elements.length);
      // console.log("element.name", element);
      // console.log("_layer.name.toString()", _layer.name.toString())
      let index = deepIndexOf(_layer.elements,{name:element.name});
      // console.log("index", index);
      if(orderingFlag) { _layer.elements.splice(index, 1); }
      // console.log("_layer.elements.length", _layer.elements.length);
      let regeneration = regenerationArr(_layer);
    }
    
    // console.log("element", element);
    if(creation_script_layer[_layer.name.toString()][element.name]) {
      creation_script_layer[_layer.name.toString()][element.name] += 1
    } else {
      creation_script_layer[_layer.name.toString()][element.name] = 1
    }
    
    // console.log("creation_script_layer--",creation_script_layer);
    addAttributes(element, _layer);
    const image = await loadImage(`${_layer.location}${element.fileName}`);

    ctx.drawImage(
      image,
      _layer.position.x,
      _layer.position.y,
      _layer.size.width,
      _layer.size.height
    );
    saveLayer(canvas, _edition);
  }
};

const regenerationArr = async (layer) => {
  try{

    let mainObj7 = [];
    await layer.elements.forEach(async (singlayerA) => {
      mainObj7.push(singlayerA);
    });
    layer.elements = mainObj7;
    layer.number = mainObj7.length;
    // console.log("layer.name", layer.name, mainObj7.length)
  }catch(err) {
    console.log(err)
  }
}

const createFiles = async (edition) => {
  let layers = layersSetup(layersOrder);
  const layer_probability = await prababilitySetup(probability, layers);
  await delay(5000);
  // console.log(layers); return false;
  const declaration_layer = await _declaration_layer(layersOrder); //for already done layers
  // console.log(layers);
  if(ordering) {
    layers  = await _redeclaration(layers);
  }
  await delay(5000);
  // console.log(layers)
  // return false;
  // const img = new Image();
  let numDupes = 0;
 for (let i = 1; i <= edition; i++) {
  let aab = 0;
    creation_current_data = [];
    ctx.clearRect(0, 0, format.width, format.height);
    layersInfo[i-1] = {};
     await layers.forEach(async (layer) => {
      aab++;
      creation_current_edition = i;
     await drawLayer(layer, i, aab);
   });

   let key = hash.toString();
   // console.log("hash", attributes)
   if (Exists.has(key)) {
     console.log(
       `Duplicate creation for edition ${i}. Same as edition ${Exists.get(
         key
       )}`
     );
     numDupes++;
     if (numDupes > edition) break; //prevents infinite loop if no more unique items can be created
     i--;
   } else {
     Exists.set(key, i);
     await changefileName(attributes, i);
     addMetadata(i);
     console.log("Creating edition " + i);
   }
 }
};

const createMetaData = () => {
  fs.stat(`${buildDir}/${metDataFile}`, (err) => {
    if(err == null || err.code === 'ENOENT') {
      fs.writeFileSync(`${buildDir}/${metDataFile}`, JSON.stringify(metadata, null, 2));
    } else {
        console.log('Oh no, error: ', err.code);
    }
  });
};

const getLayerShortName = (name) => {
  let shortName = name;
  if(name == 'Background'.toLowerCase()) {
    shortName = "bg";
  } else if (name == 'Weapon'.toLowerCase()) {
    shortName = "we";
  } else if (name == 'Body'.toLowerCase()) {
    shortName = "bdy";
  } else if (name == 'Flippers'.toLowerCase()) {
    shortName = "fl";
  } else if (name == 'Grow_spot_on_body'.toLowerCase()) {
    shortName = "gsb";
  } else if (name == 'White_Body'.toLowerCase()) {
    shortName = "wb";
  } else if (name == 'White_Shoulder'.toLowerCase()) {
    shortName = "ws";
  } else if (name == 'White_Flipper'.toLowerCase()) {
    shortName = "wf";
  } else if (name == 'White_face'.toLowerCase()) {
    shortName = "wfa";
  } else if (name == 'Spot_on_White'.toLowerCase()) {
    shortName = "gsw";
  } else if (name == 'Foot'.toLowerCase()) {
    shortName = "fo";
  } else if (name == 'Beak'.toLowerCase()) {
    shortName = "bk";
  } else if (name == 'Eyes'.toLowerCase()) {
    shortName = "ey";
  } else if (name == 'Belt_Front'.toLowerCase()) {
    shortName = "bef";
  } else if (name == 'Belt_Back'.toLowerCase()) {
    shortName = "beb";
  } else if (name == 'Kimono'.toLowerCase()) {
    shortName = "ki";
  } else if (name == 'Rope'.toLowerCase()) {
    shortName = "rp";
  } else if (name == 'Eye_Cover'.toLowerCase()) {
    shortName = "ec";
  } else if (name == 'Extra_Hair'.toLowerCase()) {
    shortName = "eh";
  } else if (name == 'EyeBrow'.toLowerCase()) {
    shortName = "eb";
  } else if (name == 'Head'.toLowerCase()) {
    shortName = "he";
  } else if (name == 'Neck'.toLowerCase()) {
    shortName = "nc";
  } else if (name == 'Rod'.toLowerCase()) {
    shortName = "rd";
  } else if (name == 'Armor'.toLowerCase()) {
    shortName = "arm";
  } else if (name == 'Cape'.toLowerCase()) {
    shortName = "cap";
  }

  return shortName;
}

const changefileName = async (_attributes, _edition) => {
  let newImagName = "";
  // console.log("creation_script_layer", creation_script_layer);
  let obj ={};
  await _attributes.forEach(async (imgNameMan) => {
    // if(imgNameMan['layer'] == 'Hairs2') { imgNameMan['layer'] = 'Hairs'; }
    if(newImagName.toString().length>1) { newImagName = newImagName+"-"; }
    layerShortform = getLayerShortName(imgNameMan['layer'].replace(/ /g,'').toLowerCase());
    newImagName = newImagName+layerShortform+"-"+imgNameMan['name'].replace(/ /g,'_');
    obj[imgNameMan['layer']] = imgNameMan['name'];
  });
  console.log("newImagName", newImagName)

  if(_edition.toString().length == 1) {
    fileNumber = "000"+_edition;
  } else if(_edition.toString().length == 2) {
    fileNumber = "00"+_edition;
  } else if(_edition.toString().length == 3) {
    fileNumber = "0"+_edition;
  } else if(_edition.toString().length == 4) {
    fileNumber = _edition;
  }
  let rename = true;

  
  if(!duplicacy) {
    // console.log("_edition", _edition)
    // console.log("creation_manual_data", creation_manual_data)
    rename = await checkAlreadyExists(obj);
  }
  // console.log("rename", rename)

  if(!rename) {
    newImagName = fileNumber+"+"+newImagName;
    console.log("newImagName", newImagName)
  } else {
    // console.log("creation_manual_data", creation_manual_data, obj)
    creation_manual_data.push(obj);
  }

  old = fs.readFileSync(`meta.json`, 'utf8');
  fs.writeFileSync(`meta.json`, old+fileNumber+": "+newImagName+"\n");
  // console.log("creation_manual_data", creation_manual_data)
  // creation_manual_data.push(obj);
  // console.log(`${buildDir}/${fileNumber}.png`, `${buildDir}/${newImagName}.png`)
  // await fs.rename(`${buildDir}/${fileNumber}.png`, `${buildDir}/${newImagName}.png`, function (err) {
  //   if (err) throw err;
  //   console.log('File Renamed.');
  // });
}

const checkAlreadyExists = async (newObj) => {
  try {
    if(creation_manual_data.length > 0) {
      let conditionVal = 0;
      let ii=1;
      return true;
      await creation_manual_data.forEach(async (singData) => {
        console.log("----count creation_manual_data", ii);
        if(conditionVal <= 1) {
          conditionVal = 0;
        }
        if(newObj.Body && singData.Body && newObj.Body.length > 0 && singData.Body == newObj.Body) {
          console.log("Body", singData.Body);
          console.log("Body", newObj.Body);
          conditionVal += 1;
        }
        if(newObj.Eyes && singData.Eyes && newObj.Eyes.length > 0 && singData.Eyes == newObj.Eyes) {
          console.log("Eyes", singData.Eyes);
          console.log("Eyes", newObj.Eyes);
          conditionVal += 1;
        }
        if(newObj.Hairs && singData.Hairs && newObj.Hairs.length > 0 && singData.Hairs == newObj.Hairs) {
          console.log("Hairs", singData.Hairs);
          console.log("Hairs", newObj.Hairs);
          conditionVal += 1;
        }
        if(newObj.Clothes && singData.Clothes && newObj.Clothes.length > 0 && singData.Clothes == newObj.Clothes) {
          console.log("Clothes", singData.Clothes);
          console.log("Clothes", newObj.Clothes);
          conditionVal += 1;
        }
        if(newObj.Earrings && singData.Earrings && newObj.Earrings.length > 0 && singData.Earrings == newObj.Earrings) {
          console.log("Earrings", singData.Earrings);
          console.log("Earrings", newObj.Earrings);
          conditionVal += 1;
        }
        if(newObj.EarringsLeft && singData.EarringsLeft && newObj.EarringsLeft.length > 0 && singData.EarringsLeft == newObj.EarringsLeft) {
          console.log("EarringsLeft", singData.EarringsLeft);
          console.log("EarringsLeft", newObj.EarringsLeft);
          conditionVal += 1;
        }
        if(newObj.EarringsRight && singData.EarringsRight && newObj.EarringsRight.length > 0 && singData.EarringsRight == newObj.EarringsRight) {
          console.log("Earrings", singData.EarringsRight);
          console.log("Earrings", newObj.EarringsRight);
          conditionVal += 1;
        }
        console.log("conditionVal", conditionVal)
        ii++;
      });
      if(conditionVal > 1) {
        console.log(creation_manual_data);
        console.log(newObj);
        console.log("conditionVal", conditionVal)
        return false;
      }
    }
    return true;
  } catch(err) {
    console.log(err)
  }
}

const customCond = (_layer, _edition, value) => {
  key = _edition - 1;
  _layerName = _layer.name.replace(/ /g,'').toLowerCase();

  // layersInfo[key][_layerName] = value.fileName;
  // console.log(_layerName, layersInfo[key])
  if(_layerName == "flippers") {
    if(layersInfo[key]['body'].includes("Original-") || layersInfo[key]['body'].includes("Original Colored-")) {
      // console.log("customCond ",_layerName, layersInfo[key]['body'], true)
      return true; //skipped
    } else {
      // console.log("customCond ",_layerName, layersInfo[key]['body'], false)
      return false;
    }
  }

  // if(_layerName == "grow_spot_on_body") {
  //   if(layersInfo[key]['body'].includes("Original-")) {
  //     // console.log("customCond ",_layerName, layersInfo[key]['body'], true)
  //     return true; //skipped
  //   } else {
  //     // console.log("customCond ",_layerName, layersInfo[key]['body'], false)
  //     return false;
  //   }
  // }
  // if(_layerName == "white_face" && value.fileName.includes('Large')) {
  //   if(layersInfo[key]['white_body']) {
  //     // console.log("customCond ",_layerName, layersInfo[key]['body'], true)
  //     return false; //skipped
  //   }
  // }


  // if(_layerName == "white_face" && value.fileName.includes('Large')) {
  //   if(layersInfo[key]['white_body'] && (layersInfo[key]['white_body'].includes('Emperor') || layersInfo[key]['White_body'].includes('King Body'))) {
  //     // console.log("customCond ",_layerName, layersInfo[key]['body'], true)
  //     return false; //skipped
  //   }
  // }

  // if(_layerName == "white_face" && value.fileName.includes('Original')) {
  //   if(layersInfo[key]['White_body']) {
  //     // console.log("customCond ",_layerName, layersInfo[key]['body'], true)
  //     return false; //skipped
  //   }
  // }

  if(_layerName == "White_body" && (value.fileName.includes('Bird') || value.fileName.includes('Emperor') || value.fileName.includes('King Body'))) {
    if(layersInfo[key]['body'].includes("Original-") || layersInfo[key]['body'].includes("Original Colored-")) {
      return true; //skipped
    } else {
      return false;
    }
  }

  // if(_layerName == "kimono") {
  //   if(layersInfo[key]['body'].includes("Original-")) {
  //     // console.log("customCond ",_layerName, layersInfo[key]['body'], true)
  //     return true; //skipped
  //   } else {
  //     // console.log("customCond ",_layerName, layersInfo[key]['body'], false)
  //     return false;
  //   }
  // }

  if(_layerName == "rod") {
    if(layersInfo[key]['weapon']) {
      // console.log("customCond ",_layerName, "weapon",layersInfo[key]['weapon'], false)
      return false; //skipped
    }
  }

  if(_layerName == "belt_back") {
    if(layersInfo[key]['kimono']) {
      // console.log("customCond ",_layerName, "kimono",layersInfo[key]['kimono'], false)
      return false; //skipped
    }
  }

  if(_layerName == "belt_front") {
    if(layersInfo[key]['kimono'] || layersInfo[key]['belt_back']) {
      // console.log("customCond ",_layerName, "kimono",layersInfo[key]['kimono'], false)
      return false; //skipped
    }
  }

  if(_layerName == "neck") {
    if((value.fileName.includes('Long') || value.fileName.includes('Side')) && (layersInfo[key]['belt_back'] || layersInfo[key]['belt_front'])){
      return false; //skipped
    } else if(layersInfo[key]['kimono'] || layersInfo[key]['cape'] || layersInfo[key]['head'] || layersInfo[key]['armor']) {
      // console.log("customCond ",_layerName, "kimono",layersInfo[key]['kimono'], false)
      return false; //skipped
    }
  }

  if(_layerName == "rope") {
    if(layersInfo[key]['weapon']) {
      if(value.fileName.includes("Double-")) {
        if(layersInfo[key]['weapon'] && layersInfo[key]['weapon'].includes("Dual")) {
          if(layersInfo[key]['kimono']) {
            return false; //skipped
          } else {
            return true; //skipped
          }
        } else {
            return false; //skipped
        }
      } else {
        if(layersInfo[key]['kimono']) {
          // console.log("customCond ",_layerName, "kimono",layersInfo[key]['kimono'], false)
          return false; //skipped
        }
      }
    } else {
      return false; //skipped
    }
  }

  if(_layerName == "cape") {
    if(layersInfo[key]['kimono'] || layersInfo[key]['head'] || layersInfo[key]['eyebrow'] || layersInfo[key]['armor'] || (layersInfo[key]['weapon'] && layersInfo[key]['weapon'].includes("Umbrella-"))) {
      // console.log("customCond ",_layerName, "kimono", layersInfo[key]['kimono'], false)
      return false; //skipped
    }
  }

  if(_layerName == "armor") {
    if(layersInfo[key]['kimono'] || layersInfo[key]['belt_back'] || layersInfo[key]['belt_front']) {
      // console.log("customCond ",_layerName, "kimono", layersInfo[key]['kimono'], false)
      return false; //skipped
    }
  }

  if(_layerName == "eyebrow") {
    if(layersInfo[key]['weapon'] && layersInfo[key]['weapon'].includes("Umbrella-")) {
      return false; //skipped
    }
  }

  if(_layerName == "head") {
    if(layersInfo[key]['eyebrow']|| (layersInfo[key]['weapon'] && layersInfo[key]['weapon'].includes("Umbrella-"))) {
      // console.log("customCond ",_layerName, "eyebrow", layersInfo[key]['eyebrow'], false)
      return false; //skipped
    }
  }

  return true; 
}

const prababilitySetup = async (probabilityArr, layers) => {
  try{
    // console.log("probabilityArr", probabilityArr);
    if(probabilityArr.length > 0) {
        await layers.forEach(async (singlayer) => {
          // console.log("singlayer.name", singlayer.)
          if(singlayer.name == 'Weapon') {
            let mainObj2 = [];
            ii2 = 0;
            let bodyProbability = [0,75,90,90,90,90,37,38,75,75,240,90,90,240,120,90,30,30,30,90,60,60,60,60,60,60,90,75,45,45,60,60,60,75,75,75,90];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii2++;
                  mainObj2.push({ id: ii2, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            // console.log(mainObj2); return false;
            singlayer.elements = mainObj2;
            singlayer.number = mainObj2.length;
          }  else if(singlayer.name == 'Body') {
            let mainObj3 = [];
            ii3 = 0;
            let bodyProbability = [0,400,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,400,400,117,117,117,117,117,117,116,116,116];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii3++;
                  mainObj3.push({ id: ii3, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj3;
            singlayer.number = mainObj3.length;
          }  else if(singlayer.name == 'Flippers') {
            let mainObj4 = [];
            ii4 = 0;
            let bodyProbability = [0,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii4++;
                  mainObj4.push({ id: ii4, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj4;
            singlayer.number = mainObj4.length;
          } else if(singlayer.name == 'White_Body') {
            let mainObj6 = [];
            ii6 = 0;
            let bodyProbability = [0,330,480,480,150,450,450,120,120,120];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii6++;
                  mainObj6.push({ id: ii6, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj6;
            singlayer.number = mainObj6.length;
          } else if(singlayer.name == 'White_Shoulder') {
            let mainObj7 = [];
            ii7 = 0;
            let bodyProbability = [0,150,150];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii7++;
                  mainObj7.push({ id: ii7, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj7;
            singlayer.number = mainObj7.length;
          } else if(singlayer.name == 'White_Flipper') {
            let mainObj8 = [];
            ii8 = 0;
            let bodyProbability = [0,2700];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii8++;
                  mainObj8.push({ id: ii8, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj8;
            singlayer.number = mainObj8.length;
          } else if(singlayer.name == 'White_face') {
            let mainObj9 = [];
            ii9 = 0;
            let bodyProbability = [0,300,600,1200];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii9++;
                  mainObj9.push({ id: ii9, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj9;
            singlayer.number = mainObj9.length;
          } else if(singlayer.name == 'Eyes') {
            let mainObj11 = [];
            ii11 = 0;
            let bodyProbability = [0,172,171,172,171,172,171,171,164,163,164,163,164,164,164,163,164,163,164];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii11++;
                  mainObj11.push({ id: ii11, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj11;
            singlayer.number = mainObj11.length;
          } else if(singlayer.name == 'Belt_Back') {
            let mainObj13 = [];
            ii13 = 0;
            let bodyProbability = [0,75,75,75,75];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii13++;
                  mainObj13.push({ id: ii13, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj13;
            singlayer.number = mainObj13.length;
          } else if(singlayer.name == 'Belt_Front') {
            let mainObj13 = [];
            ii13 = 0;
            let bodyProbability = [0,25,25,25,37,38,75,75,150];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii13++;
                  mainObj13.push({ id: ii13, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj13;
            singlayer.number = mainObj13.length;
          } else if(singlayer.name == 'Kimono') {
            let mainObj14 = [];
            ii14 = 0;
            let bodyProbability = [0,11,12,11,11,22,23,15,15,15,4,5,4,5,4,5,4,5,4,5,4,5,4,5,4,5,4,5,4,5,15,15,15,11,11,12,11,7,8,7,8,7,8,7,8,7,8,7,8,7,8,7,8,7,8,22,23];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii14++;
                  mainObj14.push({ id: ii14, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj14;
            singlayer.number = mainObj14.length;
          } else if(singlayer.name == 'Eye_Cover') {
            let mainObj15 = [];
            ii15 = 0;
            let bodyProbability = [0,25,25,25];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii15++;
                  mainObj15.push({ id: ii15, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj15;
            singlayer.number = mainObj15.length;
          } else if(singlayer.name == 'EyeBrow') {
            let mainObj17 = [];
            ii17 = 0;
            let bodyProbability = [0,10,10,10,10,10,10,10,10,150,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,150,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,150,10,10,10,10,10,10,10];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii17++;
                  mainObj17.push({ id: ii17, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            // console.log(mainObj17);
            singlayer.elements = mainObj17;
            singlayer.number = mainObj17.length;
          } else if(singlayer.name == 'Head') {
            let mainObj18 = [];
            ii18 = 0;
            let bodyProbability = [0,15,15,300,25,25,25,25,25,25,120,150,75,75];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii18++;
                  mainObj18.push({ id: ii18, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj18;
            singlayer.number = mainObj18.length;
          } else if(singlayer.name == 'Armor') {
            let mainObj18 = [];
            ii18 = 0;
            let bodyProbability = [0,75,75];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii18++;
                  mainObj18.push({ id: ii18, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj18;
            singlayer.number = mainObj18.length;
          } else if(singlayer.name == 'Cape') {
            let mainObj18 = [];
            ii18 = 0;
            let bodyProbability = [0,5,5,6,5,5,5,6,5,6,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,4,5,5,6,5,5,6,5,5];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii18++;
                  mainObj18.push({ id: ii18, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj18;
            singlayer.number = mainObj18.length;
          } else if(singlayer.name == 'Neck') {
            let mainObj19 = [];
            ii19 = 0;
            let bodyProbability = [0,18,18,17,18,17,18,18,18,17,18,17,18,17,18,17,18,18,8,9,8,9,8,9,8,9,8,8,9,8,8,8,9,8,8,8,18,18,17,18,17,18,18,18,17,18,17,18,17,18,17,18,18,18,17,18,17,18,18,18,17,18,17,18,17,18,17,18,18,18,17,18,17,18,18,18,17,18,17,18,17,18,17,18];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii19++;
                  mainObj19.push({ id: ii19, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj19;
            singlayer.number = mainObj19.length;
          } else if(singlayer.name == 'Rod') {
            let mainObj20 = [];
            ii20 = 0;
            let bodyProbability = [0,45,45];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii20++;
                  mainObj20.push({ id: ii20, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj20;
            singlayer.number = mainObj20.length;
          }
          console.log(singlayer.name, singlayer.elements, singlayer.number)
        });
    }
    return probabilityInfo;
  } catch(err) {
    console.log(err);
  }
}

const prababilitySetup10 = async (probabilityArr, layers) => {
  try{
    // console.log("probabilityArr", probabilityArr);
    if(probabilityArr.length > 0) {
        await layers.forEach(async (singlayer) => {
          // console.log("singlayer.name", singlayer.)
          if(singlayer.name == 'Weapon') {
            let mainObj2 = [];
            ii2 = 0;
            let bodyProbability = [0,7,9,9,9,9,4,4,8,7,24,9,9,24,12,9,3,3,3,9,6,6,6,6,6,6,9,7,5,5,6,6,6,7,7,8,9];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii2++;
                  mainObj2.push({ id: ii2, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            // console.log(mainObj2); return false;
            singlayer.elements = mainObj2;
            singlayer.number = mainObj2.length;
          }  else if(singlayer.name == 'Body') {
            let mainObj3 = [];
            ii3 = 0;
            let bodyProbability = [0,40,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,40,40,12,12,12,11,11,12,12,12,11];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii3++;
                  mainObj3.push({ id: ii3, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj3;
            singlayer.number = mainObj3.length;
          }  else if(singlayer.name == 'Flippers') {
            let mainObj4 = [];
            ii4 = 0;
            let bodyProbability = [0,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii4++;
                  mainObj4.push({ id: ii4, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj4;
            singlayer.number = mainObj4.length;
          } else if(singlayer.name == 'White_Body') {
            let mainObj6 = [];
            ii6 = 0;
            let bodyProbability = [0,33,48,48,15,45,45,12,12,12];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii6++;
                  mainObj6.push({ id: ii6, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj6;
            singlayer.number = mainObj6.length;
          } else if(singlayer.name == 'White_Shoulder') {
            let mainObj7 = [];
            ii7 = 0;
            let bodyProbability = [0,15,15];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii7++;
                  mainObj7.push({ id: ii7, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj7;
            singlayer.number = mainObj7.length;
          } else if(singlayer.name == 'White_Flipper') {
            let mainObj8 = [];
            ii8 = 0;
            let bodyProbability = [0,270];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii8++;
                  mainObj8.push({ id: ii8, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj8;
            singlayer.number = mainObj8.length;
          } else if(singlayer.name == 'White_face') {
            let mainObj9 = [];
            ii9 = 0;
            let bodyProbability = [0,30,60,120];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii9++;
                  mainObj9.push({ id: ii9, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj9;
            singlayer.number = mainObj9.length;
          } else if(singlayer.name == 'Eyes') {
            let mainObj11 = [];
            ii11 = 0;
            let bodyProbability = [0,17,17,18,17,17,17,17,16,16,17,16,16,17,16,16,17,16,17];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii11++;
                  mainObj11.push({ id: ii11, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj11;
            singlayer.number = mainObj11.length;
          } else if(singlayer.name == 'Belt_Back') {
            let mainObj13 = [];
            ii13 = 0;
            let bodyProbability = [0,7,8,7,8];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii13++;
                  mainObj13.push({ id: ii13, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj13;
            singlayer.number = mainObj13.length;
          } else if(singlayer.name == 'Belt_Front') {
            let mainObj13 = [];
            ii13 = 0;
            let bodyProbability = [0,2,3,3,3,4,7,8,15];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii13++;
                  mainObj13.push({ id: ii13, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj13;
            singlayer.number = mainObj13.length;
          } else if(singlayer.name == 'Kimono') {
            let mainObj14 = [];
            ii14 = 0;
            let bodyProbability = [0,1,1,1,1,2,3,1,2,1,1,0,1,0,1,1,0,1,0,0,1,0,1,0,1,1,0,1,0,0,1,2,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,0,1,1,1,1,1,0,1,2,2];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii14++;
                  mainObj14.push({ id: ii14, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj14;
            singlayer.number = mainObj14.length;
          } else if(singlayer.name == 'Eye_Cover') {
            let mainObj15 = [];
            ii15 = 0;
            let bodyProbability = [0,2,3,2];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii15++;
                  mainObj15.push({ id: ii15, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj15;
            singlayer.number = mainObj15.length;
          } else if(singlayer.name == 'EyeBrow') {
            let mainObj17 = [];
            ii17 = 0;
            let bodyProbability = [0,1,1,1,1,1,1,1,1,15,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,15,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,15,1,1,1,1,1,1,1];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii17++;
                  mainObj17.push({ id: ii17, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            // console.log(mainObj17);
            singlayer.elements = mainObj17;
            singlayer.number = mainObj17.length;
          } else if(singlayer.name == 'Head') {
            let mainObj18 = [];
            ii18 = 0;
            let bodyProbability = [0,2,1,30,2,3,2,3,2,3,12,15,7,8];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii18++;
                  mainObj18.push({ id: ii18, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj18;
            singlayer.number = mainObj18.length;
          } else if(singlayer.name == 'Armor') {
            let mainObj18 = [];
            ii18 = 0;
            let bodyProbability = [0,7,8];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii18++;
                  mainObj18.push({ id: ii18, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj18;
            singlayer.number = mainObj18.length;
          } else if(singlayer.name == 'Cape') {
            let mainObj18 = [];
            ii18 = 0;
            let bodyProbability = [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii18++;
                  mainObj18.push({ id: ii18, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj18;
            singlayer.number = mainObj18.length;
          } else if(singlayer.name == 'Neck') {
            let mainObj19 = [];
            ii19 = 0;
            let bodyProbability = [0,2,2,2,2,2,2,2,1,2,1,2,1,2,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,2,2,2,2,2,2,2,1,2,1,2,1,2,1,2,2,2,2,2,2,2,2,2,2,1,2,1,2,1,2,1,2,2,2,2,2,2,2,2,2,2,1,2,1,2,1,2,1,2,2,2];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii19++;
                  mainObj19.push({ id: ii19, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj19;
            singlayer.number = mainObj19.length;
          } else if(singlayer.name == 'Rod') {
            let mainObj20 = [];
            ii20 = 0;
            let bodyProbability = [0,4,5];

            await singlayer.elements.forEach(async (singlayerA) => {
              if(singlayerA.name.toString()) {
                let loopBe = bodyProbability[parseInt(singlayerA.id.toString())]; 
                for(ij=0;ij<loopBe;ij++) {
                  ii20++;
                  mainObj20.push({ id: ii20, name: singlayerA.name.toString(), fileName: singlayerA.fileName.toString(), rarity: 'original' });
                }
              }
            });

            singlayer.elements = mainObj20;
            singlayer.number = mainObj20.length;
          }
          console.log(singlayer.name, singlayer.elements, singlayer.number)
        });
    }
    return probabilityInfo;
  } catch(err) {
    console.log(err);
  }
}

const _declaration_layer = async(layerOrder) => {
  await layerOrder.forEach(async (layerObj) => {
    creation_script_layer[layerObj.name.toString()] = {};
  });
}

const layerFilteration = async (layer, edition) => {
  if(probabilityInfo[layer.name.toString()]) {
    console.log("probability", layer.name.toString())
    console.log("step1",Object.keys(creation_script_layer[layer.name.toString()]).length);
    if(Object.keys(creation_script_layer[layer.name.toString()]).length > 0) {
      // console.log("creation_script_layer", creation_script_layer);
      // console.log("probabilityInfo", probabilityInfo);
      // console.log(layer);
      console.log("step2",edition);

      await Object.keys(creation_script_layer[layer.name.toString()]).forEach(async (innerInfo) => {
        // console.log("innerInfo", innerInfo, parseInt(innerInfo));
        // console.log("pattern color", probabilityInfo[layer.name.toString()]['pattern_color'][parseInt(innerInfo).toString()]);
        // console.log("pattern color limit", probabilityInfo[layer.name.toString()]['pattern_share'][probabilityInfo[layer.name.toString()]['pattern_color'][parseInt(innerInfo).toString()].toString()]);
        // console.log("pattern color already done", creation_script_layer[layer.name.toString()][innerInfo]);
        console.log("step3",edition);
        if(parseInt(creation_script_layer[layer.name.toString()][innerInfo]) === parseInt(probabilityInfo[layer.name.toString()]['pattern_share'][probabilityInfo[layer.name.toString()]['pattern_color'][parseInt(innerInfo).toString()].toString()])) {
           console.log("step4",edition);
           //delete pattern color from layer list
          console.log("delete pattern color from layer list");
          console.log("innerInfo", innerInfo)
          let index = deepIndexOf(layer.elements,{name:innerInfo});
          console.log("index", index)
          if(index != -1) {
            console.log("index inner", index);
            layer.elements.splice(index, 1);
            console.log("delete finish1");            
          }
          console.log("delete finish2");
        }
        console.log("delete finish3");
      });
      console.log("delete finish4");
      // return layer;
    }
    console.log("delete finish5");
    return true;
  } else {
    console.log("Not exists in probability", layer.name.toString())
    return true;
  }
}

function deepIndexOf(arr, obj) {
  // console.log("in 1")
  return arr.findIndex( function (cur) {
    // console.log("in 2")
    return Object.keys(obj).every(function (key) {
      // console.log("in 3")
      return obj[key] === cur[key];
      // console.log("in 4")
    });
  });
}

async function _redeclaration(_layer) {
  try {
    if(ordering) {
      key = ["Hairs"];
      hairs = [1,2,3,5,7,8,14,16,17,26,32,33,34,35,36,38];
      // console.log("_layer", _layer);
      let removeElem = [];
      await _layer.forEach(async (singlayer) => {
        if(key.includes(singlayer.name)) {
          // console.log("singlayer name", singlayer);
          let aa = 0;
          let mainObj = [];
          await singlayer.elements.forEach(async (singElement) => {
            // console.log("singElement", singElement);

            // console.log("hairs", hairs);
            // console.log("parseInt(singElement.name.toString())", parseInt(singElement.name.toString()));
            // console.log("hairs.includes(parseInt(singElement.name.toString()))", hairs.includes(parseInt(singElement.name.toString())));
            if(hairs.includes(parseInt(singElement.name.toString()))) {
              // console.log("singElement.name.toString()", singElement.name.toString());
              aa++;
              mainObj.push({ id: aa, name: singElement.name.toString(), fileName: singElement.fileName.toString(), rarity: 'original' });
              removeElem.push(singElement.id);
              // let index = deepIndexOf(singlayer.elements,{id:singElement.id});
              // console.log("index", index);
              // singlayer.elements.splice(index, 1);
              // console.log(singlayer.elements.length)
              // singlayer.number -= 1;
            }
          });
          // console.log("mainObj", mainObj);

          // _layer[5].number = mainObj.length;
          // _layer[5].elements = mainObj;
          _layer[0].number = 0; //spcB
          _layer[0].elements = []; //spcB
        }
      });
      // console.log("_layer", _layer);

      // _layer[2].number = 0; //spcB
      // _layer[2].elements = []; //spcB
      // _layer[5].number = 0; //spcB
      // _layer[5].elements = []; //spcB
      // _layer[6].number = 0; //spcB
      // _layer[6].elements = []; //spcB
      // _layer[8].number = 0; //spcB
      // _layer[8].elements = []; //spcB

      let mainOBJ55 = [];
      console.log("removeElem", removeElem.length);
      await _layer[7].elements.forEach(async (singlayer2) => { //HAIRS
        // console.log("singlayer2", singlayer2)
        if(removeElem.includes(singlayer2.id)) {

        } else {
          mainOBJ55.push(singlayer2)
        }
      });

      if(mainOBJ55.length > 0) {
        _layer[7].number = mainOBJ55.length;
        _layer[7].elements = mainOBJ55;
      }

      console.log("_layer", _layer);
    }
    return _layer;
  } catch(err) {
    console.log(err);
  }
}


module.exports = { buildSetup, createFiles, createMetaData };
