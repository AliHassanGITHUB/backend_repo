export declare class HashingService {
    hash(plain: string): Promise<string>;
    verify(hash: string, plain: string): Promise<boolean>;
}
