// const stringToNumber = (str) => {
//     let result = 0;
//     for (let i = 0; i < str.length; i++) {
//         result *= 26;
//         result += str[i].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
//     }
//     return result;
// };

// const numberToString = (n) => {
//     let str = '';
//     let t;
//     while (n > 0) {
//         t = (n - 1) % 26;
//         str = String.fromCharCode(65 + t) + str;
//         n = ((n - t) / 26) | 0;
//     }
//     return str;
// };

const getNextAlphanumericSequence = (curString) => {
    var numericLen = 5;
    var str = curString.split('-');
    var first = str[0];
    var second = str[1];
    var chars = second != undefined ? second.slice(0, second.search(/\d/)) : '';
    var numbs = second != undefined ? second.replace(chars, '') : '';
    var numericIndex = Number(numbs);

    // let newLetSeqIndex;
    // let newLetterSeq = chars;

    if (numericIndex + 1 > ''.padStart(numericLen, '9')) {
        numericIndex = 1;
        // newLetSeqIndex = stringToNumber(chars) + 1;
        // newLetterSeq = numberToString(newLetSeqIndex);
    } else {
        numericIndex++;
        // newLetterSeq = chars;
    }

    return first + '-' + numericIndex.toString().padStart(numericLen, '0');
};

/**
 *
 * @param {*} string : Input - 'BN/YY/00001'
 * @param {*} currentYear
 * @returns Output - 'BN/YY/00002'
 */
const getNextYearSequenceNumber = (string, currentYear) => {
    var splittedStr = string.split('/');
    splittedStr[1] = currentYear;
    splittedStr[2] = parseInt(splittedStr[2], 10).toString().padStart('5', '0');
    return splittedStr.join('/');
};

/**
 *
 * @param {*} string : Input - '23/00001'
 * @param {*} currentYear
 * @returns Output - '23/00002'
 */
const getNextPieceNumber = (string, currentYear) => {
    var splittedString = string.split('/');

    let lastCPNumber = 1;
    if (splittedString[0] == currentYear) {
        lastCPNumber = parseInt(splittedString[1]) + 1;
    }
    lastCPNumber = lastCPNumber.toString();

    var zeroPad = 5;

    // let formattedCPNumber = zeroPad.substring(0, zeroPad - lastCPNumber.length) + lastCPNumber;
    let formattedCPNumber = lastCPNumber.padStart(zeroPad, '0');

    return `${currentYear}/${formattedCPNumber}`;
};

module.exports = { getNextAlphanumericSequence, getNextYearSequenceNumber, getNextPieceNumber };
