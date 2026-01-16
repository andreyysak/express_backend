"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryByMcc = exports.mccMap = void 0;
exports.mccMap = {
    5411: 'Продукти',
    5499: 'Продукти',
    5812: 'Ресторани та кафе',
    5814: 'Фастфуд',
    5541: 'Заправки',
    5542: 'Заправки',
    4121: 'Таксі',
    4814: 'Поповнення мобільного',
    5977: 'Косметика',
    5941: 'Спорт',
    6011: 'Зняття готівки',
    7997: 'Фітнес',
};
const getCategoryByMcc = (mcc) => {
    return exports.mccMap[mcc] || 'Інше';
};
exports.getCategoryByMcc = getCategoryByMcc;
