import { parseCurrency } from './currency';
import { parseOkko } from './okko';
import { parseWog } from './wog';
import { parseEcoData } from './eco';

export const runAllParsers = async () => {
    const [currency, okko, wog, eco] = await Promise.all([
        parseCurrency(),
        parseOkko(),
        parseWog(),
        parseEcoData()
    ]);

    return {
        currency,
        okko,
        wog,
        eco,
        timestamp: new Date()
    };
};