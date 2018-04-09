"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ensureKeyOnObject(obj, key, defaultValue) {
    if (!obj.hasOwnProperty(key)) {
        obj[key] = defaultValue;
    }
}
function indexIntoObject(baseObject, item, field) {
    var value, nextFields, currentField;
    if (Array.isArray(field)) {
        currentField = field[0], nextFields = field.slice(1);
    }
    else {
        currentField = field;
    }
    value = item[currentField];
    if (value === null) {
        return;
    }
    if (Array.isArray(nextFields) && nextFields.length) {
        ensureKeyOnObject(baseObject, value, {});
        indexIntoObject(baseObject[value], item, nextFields);
    }
    else {
        ensureKeyOnObject(baseObject, value, []);
        baseObject[value].push(item);
    }
}
exports.indexListByFields = function () {
    var fields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fields[_i] = arguments[_i];
    }
    return function (list) {
        // preinitialize all fields
        var indexedBaseObj = fields.reduce(function (obj, field) {
            if (typeof field === 'string') {
                obj[field] = {};
            }
            else if (Array.isArray(field)) {
                obj[field.join('')] = {};
            }
            return obj;
        }, {});
        for (var i = 0, len = list.length; i < len; i++) {
            var item = list[i];
            for (var j = 0, subLen = fields.length; j < subLen; j++) {
                var field = fields[j];
                var key = Array.isArray(field) ? field.join('') : field;
                indexIntoObject(indexedBaseObj[key], item, field);
            }
        }
        return indexedBaseObj;
    };
};
function isArrayEqual(a, b) {
    // step 1: if one is something and the other is nothing, clearly not the same
    if ((!a && b) || (a && !b) || !a.length || !b.length) {
        return false;
    }
    // step 2: if they are not the same length, clearly not the same
    if (a.length !== b.length) {
        return false;
    }
    // step 3: if they contain different objects at the same index, clearly not the same
    for (var i = a.length - 1; i >= 0; i--) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
exports.memoizeIndexedArray = function (fn) {
    var lastResult;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var nextResult = fn.apply(void 0, args);
        if (lastResult) {
            var outerChanged_1 = false;
            var nextIndexed = Object.keys(nextResult).reduce(function (state, field) {
                var innerChanged = false;
                var nextValueIndexedList = Object.keys(nextResult[field]).reduce(function (acc, value) {
                    if (isArrayEqual(lastResult[field][value], nextResult[field][value])) {
                        acc[value] = lastResult[field][value];
                    }
                    else {
                        innerChanged = true;
                        acc[value] = nextResult[field][value];
                    }
                    return acc;
                }, {});
                state[field] = innerChanged
                    ? nextValueIndexedList
                    : lastResult[field];
                outerChanged_1 = innerChanged || outerChanged_1;
                return state;
            }, {});
            return outerChanged_1 ? (lastResult = nextIndexed) : lastResult;
        }
        else {
            return (lastResult = nextResult);
        }
    };
};
