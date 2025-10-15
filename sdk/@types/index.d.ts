/**
 * SDKのインスタンス
 * @type {SDK}
 * @example
 * import {sdk} from '@madakaheri/service-client';
 *
 * sdk.configure({
 *  profile: 'default',
 *  functionName: 'my-service',
 * });
 *
 * const response = await sdk.ping({
 *  person: 'Alice',
 *  text: 'Hello, World!',
 * });
 * console.log(response);
 */
export const sdk: SDK;
export default sdk;
declare class SDK {
    config: {
        profile: any;
        functionName: string;
    };
    /**
     * 初期設定のオーバーライド
     * @param {Object} config
     * @param {string} config.profile - AWS profile name
     * @param {string} config.functionName - lambda function name
     * @returns {void}
     */
    configure(config?: {
        profile: string;
        functionName: string;
    }): void;
}
//# sourceMappingURL=index.d.ts.map