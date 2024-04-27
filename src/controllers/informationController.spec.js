/* eslint-disable no-unused-vars */
// const mongoose = require('mongoose');
const informationController = require('./informationController');
const { mockReq, mockRes, assertResMock } = require('../test');
const Information = require('../models/information');
const escapeRegex = require('../utilities/escapeRegex');
// const fetch = require('node-fetch');
jest.mock('../utilities/nodeCache');
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */

const cache = require('../utilities/nodeCache');

// jest.mock('node-fetch');

const makeSut = () => {
  const { addInformation, getInformations } = informationController(Information);

  return {
    addInformation,
    getInformations,
  };
};
// Define flushPromises function
// const flushPromises = () => new Promise(resolve => setImmediate(resolve));
const flushPromises = () => new Promise(setImmediate);

// const makeMockGetCache = (value) => {
//   const getCacheObject = {
//     // getCache: jest.fn(),
//     getCache: () => {},
//   };

//   const mockGetCache = jest.spyOn(getCacheObject, 'getCache').mockImplementationOnce(() => value);

//   cache.mockReturnValueOnce(() => getCacheObject);

//   return mockGetCache;
// };

const makeMockCache = (method, value) => {
  const cacheObject = {
    getCache: jest.fn(),
    removeCache: jest.fn(),
    hasCache: jest.fn(),
    setCache: jest.fn(),
  };

  const mockCache = jest.spyOn(cacheObject, method).mockImplementationOnce(() => value);

  cache.mockImplementationOnce(() => cacheObject);

  return { mockCache, cacheObject };
};

// const makeMockSortAndFind = (value = null) => {
//   const sortObject = {
//     sort: () => {},
//   };

//   const mockSort = jest
//     .spyOn(sortObject, 'sort')
//     .mockImplementationOnce(() => Promise.reject(value));

//   const findSpy = jest.spyOn(Information, 'find').mockReturnValueOnce(sortObject);

//   return {
//     mockSort,
//     findSpy
//   };
// };

describe('informationController module', () => {
  beforeAll(async () => {
    // await dbConnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // await dbDisconnect();
  });
  describe('addInformation function', () => {
    test('Ensure addInformation returns 500 if any error when adding any information', async () => {
      const { addInformation } = makeSut();
      /* eslint-disable prefer-promise-reject-errors */
      jest
        .spyOn(Information, 'find')
        .mockImplementationOnce(() => Promise.reject({ error: 'Error when finding infoName' }));
      const response = addInformation(mockReq, mockRes);

      assertResMock(500, { error: 'Error when finding infoName' }, response, mockRes);
    });
    // test('Ensure addInformation returns 400 if duplicate info Name', async () => {
    //   const sortObject = { sort: () => { } };
    //   const { addInformation } = makeSut();
    //   const data = [{infoName: "testInfo"}];
    //   const findSpy = jest.spyOn(Information, 'find').mockReturnValueOnce(sortObject);
    //   const sortSpy = jest
    //             .spyOn(sortObject, 'sort')
    //             .mockImplementationOnce(() => Promise.resolve(data));
    //   const newMockReq = {
    //     body: {
    //         ...mockReq.body,
    //         infoName: "testInfo",
    //     },
    // };
    //   const response = addInformation(newMockReq, mockRes);
    //   await flushPromises();
    //   expect(findSpy).toHaveBeenCalledWith({
    //     infoName: { $regex: escapeRegex(newMockReq.body.infoName), $options: 'i' },
    //   });
    //   assertResMock(400, { error: `Info Name must be unique. Another infoName with name ${newMockReq.body.infoName} already exists. Please note that info names are case insensitive`}, response, mockRes);
    //   });
  });
  // describe('getInformations function', () => {
  //   test('Ensure getInformations returns 404 if any error when no informations key and catching the any information', async () => {
  //     const sortObject = {
  //       sort: () => {},
  //     };

  //     // const mockGetCache = jest.spyOn(getCacheObject, 'getCache').mockImplementationOnce(() => value);

  //     // cache.mockReturnValueOnce(() => getCacheObject);
  //     // const { mockCache: hasCacheMock } = makeMockCache('hasCache', false);
  //     const getCacheMock = makeMockGetCache('')

  //     const { getInformations } = makeSut();
  //     const errorMsg = 'Error when finding informations and any information';
  //     // jest.spyOn(jest.fn(), 'getCache').mockReturnValueOnce(sortObject).mockImplementationOnce(() => value);
  //     // cache.mockImplementationOnce(() => cacheObject);
  //     // // const sortMock = jest
  //     //           .spyOn(sortObject, 'sort')
  //     //           .mockImplementationOnce(() => Promise.reject(new Error(errorMsg)));

  //     // const { findSpy, mockSort } = makeMockSortAndFind('');
  //     const response = getInformations(mockReq, mockRes);
  //     await flushPromises();

  //     // expect(mockSetCache).toHaveBeenCalledWith('informations', data);
  //     // expect(mockGetCache).toHaveBeenCalledWith('informations');
  //     // expect(findMock).toHaveBeenCalledWith(
  //     //   {},
  //     //   'infoName infoContent visibility'
  //     // );

  //     // expect(mockSort).toHaveBeenCalledWith({
  //     //   visibility: 1,
  //     // });

  //     // expect(mockRes.status).toHaveBeenCalledWith(403);
  //     expect(getCacheMock).toHaveBeenCalledWith('informations');
  //     // assertResMock(500, { error: 'Error when finding informations and any information' }, response, mockRes);
  //   });

  //   // test("Ensure getInformations returns 404 if there are no information in the database and any error occurs when getting the information", async () => {

  //   //   const mockGetCache = makeMockGetCache();

  //   //   const { getInformations } = makeSut();

  //   //   const { findSpy, mockSort } = makeMockSortAndFind();

  //   //   getInformations(mockReq, mockRes);

  //   //   await flushPromises();

  //   //   expect(mockGetCache).toHaveBeenCalledWith('informations');

  //   //   expect(findSpy).toHaveBeenCalledWith(
  //   //     {},
  //   //     'infoName infoContent visibility'
  //   //   );

  //   //   expect(mockSort).toHaveBeenCalledWith({
  //   //     visibility: 1,
  //   //   });
  //   //   expect(mockRes.status).toHaveBeenCalledWith(404);
  //   // });
  // });
});
