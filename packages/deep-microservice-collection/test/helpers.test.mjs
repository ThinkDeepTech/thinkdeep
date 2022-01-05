import chai from 'chai';

const expect = chai.expect;

import { validString } from '../src/helpers.mjs';

describe('helpers', () => {

    describe('validString', () => {

        it('should return false if the string is empty', () => {
            expect(validString('')).to.equal(false);
        })

        it('should return false if the object is not a string', () => {
            expect(validString({})).to.equal(false);
        })

        it('should return true if a populated string is passed', () => {
            expect(validString('something')).to.equal(true);
        })
    })
})