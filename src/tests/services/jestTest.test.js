import { describe, expect, jest } from '@jest/globals';
import { getUserTest } from './test';



describe("Just Testing", () => {
    test("adds numbers correctly", () => {
        expect(getUserTest(1)).toEqual(
            expect.objectContaining({
                
            })
        );
      });
})

