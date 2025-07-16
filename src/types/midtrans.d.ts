declare module "midtrans-client" {
  namespace Midtrans {
    class Snap {
      constructor(config: { isProduction: boolean; serverKey: string });
      createTransaction(params: any): Promise<any>;

      transaction: {
        notification(body: any): Promise<any>;
      };
    }
    class CoreApi {
      constructor(config: {
        isProduction: boolean;
        serverKey: string;
        clientKey: string;
      });
      charge(params: any): Promise<any>;
    }
  }

  export = Midtrans;
}
