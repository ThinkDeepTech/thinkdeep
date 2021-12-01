// import chai from 'chai';
// import mockDb from 'mock-knex';
// import sinon from 'sinon';
// import sinonChai from 'sinon-chai';
// const expect = chai.expect;
// chai.use(sinonChai);

// import { AnalysisService } from '../src/analysis-service.mjs';
// import { TwitterDataSource } from '../src/datasource/twitter-datasource.mjs';

// describe('analysis-service', () => {

//     let dataSource;
//     let subject;
//     before((done) => {
//         dataSource = new TwitterDataSource();
//         TwitterDataSource.prototype.getTweets = sinon.spy();
//         subject = new AnalysisService(dataSource);
//         done();
//     });

//     after((done) => {
//         mockDb.unmock(dataSource.knex);
//         done();
//     });

//     describe('getSentiment', () => {

//     });
// });