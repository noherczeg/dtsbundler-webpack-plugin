import { Int1 } from './dir2/int1';

export class Clazz1 implements Int1 {
    attr1: boolean;

    test(): String {
        return 'Well done!';
    }

    greet(): String {
        return 'Hello!';
    }
}