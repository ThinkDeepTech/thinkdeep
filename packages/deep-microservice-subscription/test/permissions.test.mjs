
// import chai from 'chai';
// const expect = chai.expect;

// import { hasReadAllAccess, isCurrentUser } from "../src/permissions.mjs";

// describe('permissions', () => {

//     describe('hasReadAllAccess', () => {

//         it('should return true if user has read:all scope', () => {
//             expect(hasReadAllAccess({ scope: 'read:all'})).to.equal(true);
//         })

//         it('should return false if the user does not have read:all scope', () => {
//             expect(hasReadAllAccess({ scope: 'openid email'})).to.equal(false);
//         })
//     })

//     describe('isCurrentUser', () => {

//         it('should ensure the me object is defined', () => {
//             const me = undefined;
//             const userEmail = 'someuser@email.com';
//             expect(isCurrentUser(userEmail, me)).to.equal(false);
//         })

//         it('should verify that the me object has an email field', () => {
//             const me = {};
//             const userEmail = 'someuser@email.com';
//             expect(isCurrentUser(userEmail, me)).to.equal(false);
//         })

//         it('should return false if the user email does not match the email present in me', () => {
//             const me = {
//                 email: 'anotheruser@email.com'
//             };
//             const userEmail = 'someuser@email.com';
//             expect(isCurrentUser(userEmail, me)).to.equal(false);
//         })

//         it('should ensure the user email matches the email present in the me object', () => {
//             const me = {
//                 email: 'someuser@email.com'
//             };
//             const userEmail = 'someuser@email.com';
//             expect(isCurrentUser(userEmail, me)).to.equal(true);
//         })
//     })

// })