import {EconomicEntityFactory, EconomicEntityType} from '@thinkdeep/model';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import moment from 'moment';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {TweetStore} from '../../src/datasource/tweet-store.js';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('tweet-store', () => {
  let mongoCollection;
  const economicEntityName = 'somebusiness';
  const economicEntityType = EconomicEntityType.Business;
  const economicEntity = EconomicEntityFactory.get({
    name: economicEntityName,
    type: economicEntityType,
  });

  const numTweetsToReturn = 12;
  const databaseData = [
    {
      utcDateTime: moment().utc().format(),
      tweets: [
        {
          text: 'This is a raw tweet',
        },
      ],
    },
  ];
  let subject;
  beforeEach(() => {
    mongoCollection = {
      find: sinon.stub(),
      sort: sinon.stub(),
      limit: sinon.stub(),
      toArray: sinon.stub(),
      insertOne: sinon.stub(),
    };
    mongoCollection.find.returns(mongoCollection);
    mongoCollection.sort.returns(mongoCollection);
    mongoCollection.limit.returns(mongoCollection);
    mongoCollection.toArray.returns(databaseData);

    subject = new TweetStore(mongoCollection);
  });

  describe('readRecentTweets', () => {
    it('should throw if an invalid economic entity is supplied', async () => {
      const invalidEconomicEntity = {name: 'magical', type: 'MAGICAL'};
      await expect(
        subject.readRecentTweets(invalidEconomicEntity, 1)
      ).to.be.rejectedWith(Error);
    });

    it('should limit the number of returned results to numRecentTweets', async () => {
      await subject.readRecentTweets(economicEntity, numTweetsToReturn);
      const limit = mongoCollection.limit.getCall(0).args[0];
      expect(limit).to.equal(numTweetsToReturn);
    });

    it('should sort the tweets in descending order', async () => {
      await subject.readRecentTweets(economicEntity, numTweetsToReturn);
      const sortOptions = mongoCollection.sort.getCall(0).args[0];

      // NOTE: A value of -1 indicates a sort in descending order.
      expect(sortOptions.utcDateTime).to.equal(-1);
    });

    it('should read tweets from the database', async () => {
      await subject.readRecentTweets(economicEntity, numTweetsToReturn);
      expect(mongoCollection.find.callCount).to.be.greaterThan(0);
    });

    it('should package database tweets as an array', async () => {
      await subject.readRecentTweets(economicEntity, numTweetsToReturn);
      expect(mongoCollection.toArray.callCount).to.be.greaterThan(0);
    });

    it('should reduce the tweets', async () => {
      const tweets = [
        {
          utcDateTime: moment().utc().format(),
          tweets: [
            {
              text: 'This is a raw tweet',
            },
          ],
        },
        {
          utcDateTime: moment().utc().format(),
          tweets: [
            {
              text: 'Something here',
            },
            {
              text: 'second tweet',
            },
          ],
        },
      ];
      mongoCollection.find.returns(mongoCollection);
      mongoCollection.toArray.returns(tweets);

      const result = await subject.readRecentTweets(
        economicEntity,
        numTweetsToReturn
      );

      expect(result[0].utcDateTime).to.equal(tweets[0].utcDateTime);
      expect(result[0].tweets.length).to.equal(1);
      expect(result[1].utcDateTime).to.equal(tweets[1].utcDateTime);
      expect(result[1].tweets.length).to.equal(2);
    });

    it('should return [] if an error occurs', async () => {
      mongoCollection.find.throws();

      const result = await subject.readRecentTweets(
        economicEntity,
        numTweetsToReturn
      );

      expect(result.length).to.equal(0);
    });
  });

  describe('createTweets', () => {
    it('should insert the data into the database', async () => {
      const utcDateTime = moment().utc().format();
      const tweets = [
        {
          text: 'i have something to say',
        },
        {
          text: 'something else',
        },
      ];

      await subject.createTweets(utcDateTime, economicEntity, tweets);

      expect(mongoCollection.insertOne.callCount).to.be.greaterThan(0);
    });

    it('should return true if the insert succeeds', async () => {
      const utcDateTime = moment().utc().format();
      const tweets = [
        {
          text: 'i have something to say',
        },
        {
          text: 'something else',
        },
      ];

      const success = await subject.createTweets(
        utcDateTime,
        economicEntity,
        tweets
      );

      expect(success).to.equal(true);
    });

    it('should return false if the insert fails', async () => {
      const utcDateTime = moment().utc().format();
      const tweets = [
        {
          text: 'i have something to say',
        },
        {
          text: 'something else',
        },
      ];

      mongoCollection.insertOne.throws();

      const success = await subject.createTweets(
        utcDateTime,
        economicEntity,
        tweets
      );

      expect(success).to.equal(false);
    });
  });
});
