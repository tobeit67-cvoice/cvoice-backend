export {}

declare global {
    namespace Express {
        export interface Application {
            isListening: boolean;
            log: (message: string) => any;
        }
        export interface Request {
            user: {
                id: number;
                username: string;
                profile: string | null;
                roles: number[];
                createdAt: string;
            };
        }
    }
}