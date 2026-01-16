import {parseOkko} from "./okko";
import {parseWog} from "./wog";

export const runAllParsers = async () => {
    console.log('🔄 Starting all fuel parsers...');

    const [okkoData, wogData] = await Promise.all([
        parseOkko(),
        parseWog()
    ]);

    return {
        okko: okkoData,
        wog: wogData
    };
};