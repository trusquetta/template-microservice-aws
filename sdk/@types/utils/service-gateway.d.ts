export const serviceGateway: ServiceGateway;
export default serviceGateway;
declare class ServiceGateway {
    config: {
        profile: any;
        functionName: any;
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
    post({ action, payload }: {
        action: any;
        payload: any;
    }): Promise<any>;
    push({ action, payload }: {
        action: any;
        payload: any;
    }): Promise<import("@aws-sdk/client-lambda").InvokeCommandOutput>;
}
//# sourceMappingURL=service-gateway.d.ts.map