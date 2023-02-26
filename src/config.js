const layersOrder = [
    { name: 'Background', number: 1 }, //new
    { name: 'Weapon', number: 37 }, //old
    { name: 'Body', number: 27 }, //new
    { name: 'Flippers', number: 15 }, //old
    { name: 'White_Body', number: 9 }, //old
    { name: 'White_Shoulder', number: 2 }, //old
    { name: 'White_Flipper', number: 1 }, //old
    { name: 'White_face', number: 3 }, //old
    { name: 'Foot', number: 1 }, //old
    { name: 'Beak', number: 1 }, //old
    { name: 'Eyes', number: 18 }, //old
    { name: 'Kimono', number: 56 },  //new
    { name: 'Belt_Back', number: 4 }, //old
    { name: 'Rope', number: 4 }, //old
    { name: 'Belt_Front', number: 8 }, //old
    { name: 'Eye_Cover', number: 3 }, //old
    { name: 'EyeBrow', number: 48 }, //old
    { name: 'Head', number: 13 }, //old
    { name: 'Armor', number: 2 }, //old
    { name: 'Cape', number: 51 }, //new
    { name: 'Neck', number: 86 }, //old
    { name: 'Rod', number: 2 }, //old
];
  
const format = {
    width: 2000,
    height: 2000
};

const rarity = [
    { key: "", val: "original" },
    { key: "_r", val: "rare" },
    { key: "_sr", val: "super rare" },
];

const probability = [
    // { key: "sake_cask" },
    { key: "Weapon" },
    { key: "Body" },
    { key: "Flippers" },
    { key: "White_Body" },
    { key: "White_Shoulder" },
    { key: "White_Flipper" },
    { key: "White_face" },
    { key: "Eyes" },
    { key: "Kimono" },
    { key: 'Belt_Back'},
    { key: 'Belt_Front' },
    { key: "Eye_Cover" },
    { key: "EyeBrow" },
    { key: "Head" },
    { key: "Armor" },
    { key: "Cape" },
    { key: "Neck" },
    { key: "Rod" },
];

let ordering = false;

let duplicacy = false;

let defaultEdition = 3000;

module.exports = { layersOrder, format, rarity, probability, defaultEdition, ordering, duplicacy };