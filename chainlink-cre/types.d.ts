declare module "@chainlink/cre-capabilities" {
    export namespace evm {
        export function read(args: {
            address: string;
            abi: any[];
            functionName: string;
            args?: any[];
        }): Promise<any>;

        export function write(args: {
            address: string;
            abi: any[];
            functionName: string;
            args?: any[];
        }): Promise<any>;
    }
}
