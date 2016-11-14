import uniqwith from 'lodash.uniqwith';
import hexrgb from 'hex-rgb';

function rgb(colorArray) {
    return {
        r: colorArray[0],
        g: colorArray[1],
        b: colorArray[2]
    };
}

function hex(hexstring) {
    return rgb(hexrgb(hexstring));
}

/*
 * the following loop was
 * modified from rainbowify
 * (https://github.com/maxogden/rainbowify)
 * which lifted from mocha
 * (https://github.com/visionmedia/mocha/blob/master/lib/reporters/nyan.js)
 * to generate the color palette
 */
var _rainbow = [];
for (var i = 0; i < (6 * 7); i++) {
    var pi3 = Math.floor(Math.PI / 3);
    var n = (i * (1.0 / 6));

    var r = Math.floor(3 * Math.sin(n) + 3) * 255 / 5;
    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3) * 255 / 5;
    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3) * 255 / 5;

    _rainbow.push(rgb([r, g, b]));
}

_rainbow = uniqwith(_rainbow, function (val1, val2) {
    return val1.r === val2.r && val1.g === val2.g && val1.b === val2.b;
});

var _colorSchemerPastelRainbow = [
    hex('#FFCCCC'),
    hex('#FFE0CC'),
    hex('#FFEACC'),
    hex('#FFF4CC'),
    hex('#FFFECC'),
    hex('#EFFAC8'),
    hex('#C7F5C4'),
    hex('#C4F0F4'),
    hex('#C4DAF4'),
    hex('#C9C4F4'),
    hex('#E1C4F4'),
    hex('#F6C6E6')
];

var _materialDesignRed = [
    hex('#FFEBEE'),
    hex('#FFCDD2'),
    hex('#EF9A9A'),
    hex('#E57373'),
    hex('#EF5350'),
    hex('#F44336'),
    hex('#E53935'),
    hex('#D32F2F'),
    hex('#C62828'),
    hex('#B71C1C')
];

var _materialDesignRedAlt = [
    hex('#FF8A80'),
    hex('#FF5252'),
    hex('#FF1744'),
    hex('#D50000')
];

var _materialDesignPink = [
    hex('#FCE4EC'),
    hex('#F8BBD0'),
    hex('#F48FB1'),
    hex('#F06292'),
    hex('#EC407A'),
    hex('#E91E63'),
    hex('#D81B60'),
    hex('#C2185B'),
    hex('#AD1457'),
    hex('#880E4F')
];

var _materialDesignPinkAlt = [
    hex('#FF80AB'),
    hex('#FF4081'),
    hex('#F50057'),
    hex('#C51162')
];

var _materialDesignPurple = [
    hex('#F3E5F5'),
    hex('#E1BEE7'),
    hex('#CE93D8'),
    hex('#BA68C8'),
    hex('#AB47BC'),
    hex('#9C27B0'),
    hex('#8E24AA'),
    hex('#7B1FA2'),
    hex('#6A1B9A'),
    hex('#4A148C')
];

var _materialDesignPurpleAlt = [
    hex('#EA80FC'),
    hex('#E040FB'),
    hex('#D500F9'),
    hex('#AA00FF')
];

var _materialDesignDeepPurple = [
    hex('#EDE7F6'),
    hex('#D1C4E9'),
    hex('#B39DDB'),
    hex('#9575CD'),
    hex('#7E57C2'),
    hex('#673AB7'),
    hex('#5E35B1'),
    hex('#512DA8'),
    hex('#4527A0'),
    hex('#311B92')
];

var _materialDesignDeepPurpleAlt = [
    hex('#B388FF'),
    hex('#7C4DFF'),
    hex('#651FFF'),
    hex('#6200EA')
];

var _materialDesignIndigo = [
    hex('#E8EAF6'),
    hex('#C5CAE9'),
    hex('#9FA8DA'),
    hex('#7986CB'),
    hex('#5C6BC0'),
    hex('#3F51B5'),
    hex('#3949AB'),
    hex('#303F9F'),
    hex('#283593'),
    hex('#1A237E')
];

var _materialDesignIndigoAlt = [
    hex('#8C9EFF'),
    hex('#536DFE'),
    hex('#3D5AFE'),
    hex('#304FFE')
];

var _materialDesignBlue = [
    hex('#E3F2FD'),
    hex('#BBDEFB'),
    hex('#90CAF9'),
    hex('#64B5F6'),
    hex('#42A5F5'),
    hex('#2196F3'),
    hex('#1E88E5'),
    hex('#1976D2'),
    hex('#1565C0'),
    hex('#0D47A1')
];

var _materialDesignBlueAlt = [
    hex('#82B1FF'),
    hex('#448AFF'),
    hex('#2979FF'),
    hex('#2962FF')
];

var _materialDesignLightBlue = [
    hex('#E1F5FE'),
    hex('#B3E5FC'),
    hex('#81D4FA'),
    hex('#4FC3F7'),
    hex('#29B6F6'),
    hex('#03A9F4'),
    hex('#039BE5'),
    hex('#0288D1'),
    hex('#0277BD'),
    hex('#01579B')
];

var _materialDesignLightBlueAlt = [
    hex('#80D8FF'),
    hex('#40C4FF'),
    hex('#00B0FF'),
    hex('#0091EA')
];

var _materialDesignCyan = [
    hex('#E0F7FA'),
    hex('#B2EBF2'),
    hex('#80DEEA'),
    hex('#4DD0E1'),
    hex('#26C6DA'),
    hex('#00BCD4'),
    hex('#00ACC1'),
    hex('#0097A7'),
    hex('#00838F'),
    hex('#006064')
];

var _materialDesignCyanAlt = [
    hex('#84FFFF'),
    hex('#18FFFF'),
    hex('#00E5FF'),
    hex('#00B8D4')
];

var _materialDesignTeal = [
    hex('#E0F2F1'),
    hex('#B2DFDB'),
    hex('#80CBC4'),
    hex('#4DB6AC'),
    hex('#26A69A'),
    hex('#009688'),
    hex('#00897B'),
    hex('#00796B'),
    hex('#00695C'),
    hex('#004D40')
];

var _materialDesignTealAlt = [
    hex('#A7FFEB'),
    hex('#64FFDA'),
    hex('#1DE9B6'),
    hex('#00BFA5')
];

var _materialDesignGreen = [
    hex('#E8F5E9'),
    hex('#C8E6C9'),
    hex('#A5D6A7'),
    hex('#81C784'),
    hex('#66BB6A'),
    hex('#4CAF50'),
    hex('#43A047'),
    hex('#388E3C'),
    hex('#2E7D32'),
    hex('#1B5E20')
];

var _materialDesignGreenAlt = [
    hex('#B9F6CA'),
    hex('#69F0AE'),
    hex('#00E676'),
    hex('#00C853')
];

var _materialDesignLightGreen = [
    hex('#F1F8E9'),
    hex('#DCEDC8'),
    hex('#C5E1A5'),
    hex('#AED581'),
    hex('#9CCC65'),
    hex('#8BC34A'),
    hex('#7CB342'),
    hex('#689F38'),
    hex('#558B2F'),
    hex('#33691E')
];

var _materialDesignLightGreenAlt = [
    hex('#CCFF90'),
    hex('#B2FF59'),
    hex('#76FF03'),
    hex('#64DD17')
    ];

var _materialDesignLime = [
    hex('#F9FBE7'),
    hex('#F0F4C3'),
    hex('#E6EE9C'),
    hex('#DCE775'),
    hex('#D4E157'),
    hex('#CDDC39'),
    hex('#C0CA33'),
    hex('#AFB42B'),
    hex('#9E9D24'),
    hex('#827717')
];

var _materialDesignLimeAlt = [
    hex('#F4FF81'),
    hex('#EEFF41'),
    hex('#C6FF00'),
    hex('#AEEA00')
];

var _materialDesignYellow = [
    hex('#FFFDE7'),
    hex('#FFF9C4'),
    hex('#FFF59D'),
    hex('#FFF176'),
    hex('#FFEE58'),
    hex('#FFEB3B'),
    hex('#FDD835'),
    hex('#FBC02D'),
    hex('#F9A825'),
    hex('#F57F17')
];

var _materialDesignYellowAlt = [
    hex('#FFFF8D'),
    hex('#FFFF00'),
    hex('#FFEA00'),
    hex('#FFD600')
];

var _materialDesignAmber = [
    hex('#FFF8E1'),
    hex('#FFECB3'),
    hex('#FFE082'),
    hex('#FFD54F'),
    hex('#FFCA28'),
    hex('#FFC107'),
    hex('#FFB300'),
    hex('#FFA000'),
    hex('#FF8F00'),
    hex('#FF6F00')
];

var _materialDesignAmberAlt = [
    hex('#FFE57F'),
    hex('#FFD740'),
    hex('#FFC400'),
    hex('#FFAB00')
];

var _materialDesignOrange = [
    hex('#FFF3E0'),
    hex('#FFE0B2'),
    hex('#FFCC80'),
    hex('#FFB74D'),
    hex('#FFA726'),
    hex('#FF9800'),
    hex('#FB8C00'),
    hex('#F57C00'),
    hex('#EF6C00'),
    hex('#E65100')
];

var _materialDesignOrangeAlt = [
    hex('#FFD180'),
    hex('#FFAB40'),
    hex('#FF9100'),
    hex('#FF6D00')
];

var _materialDesignDeepOrange = [
    hex('#FBE9E7'),
    hex('#FFCCBC'),
    hex('#FFAB91'),
    hex('#FF8A65'),
    hex('#FF7043'),
    hex('#FF5722'),
    hex('#F4511E'),
    hex('#E64A19'),
    hex('#D84315'),
    hex('#BF360C')
];

var _materialDesignDeepOrangeAlt = [
    hex('#FF9E80'),
    hex('#FF6E40'),
    hex('#FF3D00'),
    hex('#DD2C00')
];

var _materialDesignBrown = [
    hex('#EFEBE9'),
    hex('#D7CCC8'),
    hex('#BCAAA4'),
    hex('#A1887F'),
    hex('#8D6E63'),
    hex('#795548'),
    hex('#6D4C41'),
    hex('#5D4037'),
    hex('#4E342E'),
    hex('#3E2723')
];

var _materialDesignGrey = [
    hex('#FAFAFA'),
    hex('#F5F5F5'),
    hex('#EEEEEE'),
    hex('#E0E0E0'),
    hex('#BDBDBD'),
    hex('#9E9E9E'),
    hex('#757575'),
    hex('#616161'),
    hex('#424242'),
    hex('#212121')
];

var _materialDesignBlueGrey = [
    hex('#ECEFF1'),
    hex('#CFD8DC'),
    hex('#B0BEC5'),
    hex('#90A4AE'),
    hex('#78909C'),
    hex('#607D8B'),
    hex('#546E7A'),
    hex('#455A64'),
    hex('#37474F'),
    hex('#263238')
];

var _materialDesignRainbow500 = [
    rgb([244, 67, 54]),
    rgb([233, 30, 99]),
    rgb([156, 39, 176]),
    rgb([103, 58, 183]),
    rgb([63, 81, 181]),
    rgb([33, 150, 243]),
    rgb([3, 169, 244]),
    rgb([0, 188, 212]),
    rgb([0, 150, 136]),
    rgb([76, 175, 80]),
    rgb([139, 195, 74]),
    rgb([205, 220, 57]),
    rgb([255, 235, 59]),
    rgb([255, 193, 7]),
    rgb([255, 152, 0]),
    rgb([255, 87, 34])
];

var _materialDesignRainbowA400 = [
    rgb([255, 23, 68]),
    rgb([245, 0, 87]),
    rgb([213, 0, 249]),
    rgb([101, 31, 255]),
    rgb([61, 90, 254]),
    rgb([41, 121, 255]),
    rgb([0, 176, 255]),
    rgb([0, 229, 255]),
    rgb([29, 233, 182]),
    rgb([0, 230, 118]),
    rgb([118, 255, 3]),
    rgb([198, 255, 0]),
    rgb([255, 234, 0]),
    rgb([255, 196, 0]),
    rgb([255, 145, 0]),
    rgb([255, 61, 0])
];

var _hueShiftRainbowChocolate = [
    hex('#d2691e'),
    hex('#e76038'),
    hex('#f45956'),
    hex('#f95477'),
    hex('#f65298'),
    hex('#ea53b7'),
    hex('#d656d2'),
    hex('#bc5be7'),
    hex('#9e63f4'),
    hex('#7d6cf9'),
    hex('#5c77f6'),
    hex('#3d81ea'),
    hex('#228bd6'),
    hex('#0d94bc'),
    hex('#009b9e'),
    hex('#00a07d'),
    hex('#00a25c'),
    hex('#0aa13d'),
    hex('#1e9e22'),
    hex('#38990d'),
    hex('#569100'),
    hex('#778800'),
    hex('#987d00'),
    hex('#b7730a')
]

var _blueBlack = [
    hex('#000000'),
    hex('#10142d'),
    hex('#20295b'),
    hex('#303d88'),
    hex('#3F51B5')
];

var _grayScale = [
    rgb([255, 255, 255]),
    rgb([0, 0, 0, 0])
];


export default {
    'default': _rainbow,
    'rainbow': _rainbow,

    'color-schemer-pastel-rainbow': _colorSchemerPastelRainbow,

    'material-design-red': _materialDesignRed,
    'material-design-red-alt': _materialDesignRedAlt,

    'material-design-pink': _materialDesignPink,
    'material-design-pink-alt': _materialDesignPinkAlt,

    'material-design-purple': _materialDesignPurple,
    'material-design-purple-alt': _materialDesignPurpleAlt,

    'material-design-deep-purple': _materialDesignDeepPurple,
    'material-design-deep-purple-alt': _materialDesignDeepPurpleAlt,

    'material-design-indigo': _materialDesignIndigo,
    'material-design-indigo-alt': _materialDesignIndigoAlt,

    'material-design-blue': _materialDesignBlue,
    'material-design-blue-alt': _materialDesignBlueAlt,

    'material-design-light-blue': _materialDesignLightBlue,
    'material-design-light-blue-alt': _materialDesignLightBlueAlt,

    'material-design-cyan': _materialDesignCyan,
    'material-design-cyan-alt': _materialDesignCyanAlt,

    'material-design-teal': _materialDesignTeal,
    'material-design-teal-alt': _materialDesignTealAlt,

    'material-design-green': _materialDesignGreen,
    'material-design-green-alt': _materialDesignGreenAlt,

    'material-design-light-green': _materialDesignLightGreen,
    'material-design-light-green-alt': _materialDesignLightGreenAlt,

    'material-design-lime': _materialDesignLime,
    'material-design-lime-alt': _materialDesignLimeAlt,

    'material-design-yellow': _materialDesignYellow,
    'material-design-yellow-alt': _materialDesignYellowAlt,

    'material-design-amber': _materialDesignAmber,
    'material-design-amber-alt': _materialDesignAmberAlt,

    'material-design-orange': _materialDesignOrange,
    'material-design-orange-alt': _materialDesignOrangeAlt,

    'material-design-deep-orange': _materialDesignDeepOrange,
    'material-design-deep-orange-alt': _materialDesignDeepOrangeAlt,

    'material-design-brown': _materialDesignBrown,
    'material-design-grey': _materialDesignGrey,
    'material-design-blue-grey': _materialDesignBlueGrey,

    'material-design-rainbow-500': _materialDesignRainbow500,
    'material-design-rainbow-a400': _materialDesignRainbowA400,
    'gray-scale': _grayScale,
    'blue-black': _blueBlack,

    'hue-shift-rainbow-chocolate': _hueShiftRainbowChocolate
};

//TODO: allow users to CRUD their own color palettes to localstorage
