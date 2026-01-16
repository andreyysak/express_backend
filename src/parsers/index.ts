import { parseOkko } from './okko';
import { parseWog } from './wog';
import {parseCurrency} from "./currency";

export const runAllParsers = async () => {
    console.log('🔄 Starting all parsers (Fuel & Currency)...');

    const [okkoData, wogData, currencyData] = await Promise.all([
        parseOkko(),
        parseWog(),
        parseCurrency()
    ]);

    return {
        okko: okkoData,
        wog: wogData,
        currency: currencyData
    };
};