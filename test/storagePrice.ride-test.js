/* import { transfer } from "@waves/js-test-env/augmentedGlobal"; */
//import {crypto} from "@waves/waves-crypto";
const wvs = 10 ** 8;

describe('wallet test suite', async function () {

    this.timeout(300000);
    let tokenTx;
    let assetTx;
    before(async function () {
        await setupAccounts(
            {
                caller1: 10.05 * wvs,
                caller2: 200.05 * wvs,
                wallet: 10.05 * wvs

            }
        );
        const walletAddress = address(accounts.wallet)
        const scriptToken = file('smartToken.ride')
            .replace(`base58'3MvHSFKcaY71wp62waNAqj2NPikV8fK5nh1'`, `base58'${walletAddress}'`)

        const compiledScriptToken = compile(scriptToken);
        const tx = await transfer({
            recipient: '3FcnGmACQVYgWGzLEFoQt8G4TZhUxvn3sPV',
            amount: 199 * wvs
        }, accounts.caller2);
        await broadcast(tx);
        await waitForTx(tx.id)
        const scriptPrice = compile(file('storagePrice.ride'));
        const ssTx = setScript({ script: scriptPrice }, accounts.wallet);
        tokenTx = setScript({ script: compiledScriptToken }, accounts.caller1)
        await broadcast(ssTx);
        await waitForTx(ssTx.id)
        //
        console.log('Script has been set')
    });

    it('can set price for different accounts', async function () {
        const price = 3;
        const price1 = 4;
        const iTxSet = invokeScript({
            dApp: address(accounts.wallet),
            call: {
                function: "setBuyPrice",
                args: [{ type: 'integer', value: price }],
                payment: null
            },
        }, accounts.caller1);

        await broadcast(iTxSet);
        await waitForTx(iTxSet.id);
        console.dir(iTxSet.call.args[0].value);
        expect(iTxSet.call.args[0].value).to.equal(price);

        const iTxSet1 = invokeScript({
            dApp: address(accounts.wallet),
            call: {
                function: "setBuyPrice",
                args: [{ type: 'integer', value: price1 }],
                payment: null
            },
        }, accounts.caller2);

        await broadcast(iTxSet1);
        await waitForTx(iTxSet1.id);
        expect(iTxSet1.call.args[0].value).to.equal(price1);
    })

    it('check price', async () => {
        const checkingPrice = 3;
        const addCaller = address(accounts.caller1);
        await accountData(address(accounts.wallet))
            .then((data) => {
                expect(data[addCaller].value).to.equal(checkingPrice)
            });
    })

    it('can update price', async () => {

        const newPrice = 2;
        const iTxSet = invokeScript({
            dApp: address(accounts.wallet),
            call: {
                function: "setBuyPrice",
                args: [{ type: 'integer', value: newPrice }],
                payment: null
            },
        }, accounts.caller1);
        // await expect(broadcast(iTxSet)).rejectedWith();
        await broadcast(iTxSet);
        await waitForTx(iTxSet.id)
    })
    it('check  new price', async () => {
        const checkingPrice = 2;
        const addCaller = address(accounts.caller1);
        await accountData(address(accounts.wallet))
            .then((data) => {
                expect(data[addCaller].value).to.equal(checkingPrice)
            });
    })
    it('can success deploy token', async function () {
        await broadcast(tokenTx);
        await waitForTx(tokenTx.id)
    })
    it('can success sell expensive then bought', async function () {
        const sellOrder = {
            orderType: 'sell',
            assetPair: {
                amountAsset: string | null,
                priceAsset: string | null,
            },
            price: 2,
            amount: 4,
            timestamp: number,
            expiration: number,
            matcherFee: number,
            matcherPublicKey: string
        }
        const buyOrder = {
            orderType: 'buy',
            assetPair: {
                amountAsset: string | null,
                priceAsset: string | null,
            },
            price: 2,
            amount: 3,
            timestamp: number,
            expiration: number,
            matcherFee: number,
            matcherPublicKey: string
        }
        const exchTx = {
            type: 7,
            order1: sellOrder,
            order2: buyOrder,
            price: 2,
            amount: 1,
            buyMatcherFee: 0.003,
            sellMatcherFee: 0.003
        }

    })
})      
