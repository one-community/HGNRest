const mongoose = require('mongoose');

// Utility to aid in testing
jest.mock('../utilities/permissions', () => ({
  hasPermission: jest.fn(),
}));

const flushPromises = () => new Promise(setImmediate);
const { mockReq, mockRes, assertResMock } = require('../test');
const { hasPermission } = require('../utilities/permissions');

// controller to test
const taskController = require('./taskController');

// MongoDB Model imports
const Task = require('../models/task');
const Project = require('../models/project');
const WBS = require('../models/wbs');

const makeSut = () => {
  const { getTasks, getWBSId, importTask, postTask, updateNum } = taskController(Task);

  return {
    getTasks,
    getWBSId,
    importTask,
    postTask,
    updateNum,
  };
};

describe('Unit Tests for taskController.js', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getTasks function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Returns 200 on successfully querying the document', async () => {
      const { getTasks } = makeSut();
      const mockData = 'some random data';

      const taskFindSpy = jest.spyOn(Task, 'find').mockResolvedValueOnce(mockData);

      const response = await getTasks(mockReq, mockRes);
      await flushPromises();

      assertResMock(200, mockData, response, mockRes);
      expect(taskFindSpy).toHaveBeenCalled();
      expect(taskFindSpy).toHaveBeenCalledTimes(1);
    });

    test('Returns 200 on successfully querying the document', async () => {
      const { getTasks } = makeSut();
      const error = 'some random error';

      const taskFindSpy = jest.spyOn(Task, 'find').mockRejectedValueOnce(error);

      const response = await getTasks(mockReq, mockRes);
      await flushPromises();

      assertResMock(404, error, response, mockRes);
      expect(taskFindSpy).toHaveBeenCalled();
      expect(taskFindSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getWBSId function', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Returns 200 on successfully querying the document', async () => {
      const { getWBSId } = makeSut();
      const mockData = 'some random data';

      const wbsFindByIdSpy = jest.spyOn(WBS, 'findById').mockResolvedValueOnce(mockData);

      const response = await getWBSId(mockReq, mockRes);
      await flushPromises();

      assertResMock(200, mockData, response, mockRes);
      expect(wbsFindByIdSpy).toHaveBeenCalled();
      expect(wbsFindByIdSpy).toHaveBeenCalledTimes(1);
    });

    test('Returns 200 on successfully querying the document', async () => {
      const { getWBSId } = makeSut();
      const error = 'some random error';

      const wbsFindByIdSpy = jest.spyOn(WBS, 'findById').mockRejectedValueOnce(error);

      const response = await getWBSId(mockReq, mockRes);
      await flushPromises();

      assertResMock(404, error, response, mockRes);
      expect(wbsFindByIdSpy).toHaveBeenCalled();
      expect(wbsFindByIdSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('importTasks function()', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Return 403 if `importTask` permission is missing', async () => {
      const { importTask } = makeSut();
      hasPermission.mockResolvedValueOnce(false);

      const error = { error: 'You are not authorized to create new Task.' };

      const response = await importTask(mockReq, mockRes);
      await flushPromises();

      assertResMock(403, error, response, mockRes);
    });

    test('Return 201 on successful import operation', async () => {
      const { importTask } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      mockReq.params.wbs = 'wbs123';
      mockReq.body.list = [
        {
          _id: 'mongoDB-Id',
          num: '1',
          level: 1,
          parentId1: null,
          parentId2: null,
          parentId3: null,
          mother: null,
          resources: ['parth|userId123|parthProfilePic', 'test|test123|testProfilePic'],
        },
      ];

      const saveMock = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ _id: '1', wbsId: 'wbs123' }));
      const TaskConstructorSpy = jest.spyOn(Task.prototype, 'save').mockImplementation(saveMock);

      const data = 'done';

      const response = await importTask(mockReq, mockRes);
      await flushPromises();

      assertResMock(201, data, response, mockRes);
      expect(TaskConstructorSpy).toBeCalled();
    });

    test('Return 400 on encountering any error while saving task', async () => {
      const { importTask } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      mockReq.params.wbs = 'wbs123';
      mockReq.body.list = [
        {
          _id: 'mongoDB-Id',
          num: '1',
          level: 1,
          parentId1: null,
          parentId2: null,
          parentId3: null,
          mother: null,
          resources: ['parth|userId123|parthProfilePic', 'test|test123|testProfilePic'],
        },
      ];

      const error = new Error('error while saving');

      const saveMock = jest.fn().mockImplementation(() => Promise.reject(error));
      const TaskConstructorSpy = jest.spyOn(Task.prototype, 'save').mockImplementation(saveMock);

      const response = await importTask(mockReq, mockRes);
      await flushPromises();

      assertResMock(400, error, response, mockRes);
      expect(TaskConstructorSpy).toBeCalled();
    });
  });

  describe('postTask function()', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Return 403 if `postTask` permission is missing', async () => {
      const { postTask } = makeSut();
      hasPermission.mockResolvedValueOnce(false);

      const error = { error: 'You are not authorized to create new Task.' };

      const response = await postTask(mockReq, mockRes);
      await flushPromises();

      assertResMock(403, error, response, mockRes);
    });

    test.each([
      [
        { taskName: undefined, isActive: true },
        'Task Name, Active status, Task Number are mandatory fields',
      ],
      [
        { taskName: 'some task name', isActive: undefined },
        'Task Name, Active status, Task Number are mandatory fields',
      ],
      [
        { taskName: undefined, isActive: undefined },
        'Task Name, Active status, Task Number are mandatory fields',
      ],
    ])('Return 400 if any required field is missing', async (body, expectedError) => {
      const { postTask } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      // Set the request body based on the current test case
      mockReq.body.taskName = body.taskName;
      mockReq.body.isActive = body.isActive;

      const error = { error: expectedError };

      const response = await postTask(mockReq, mockRes);
      await flushPromises();

      assertResMock(400, error, response, mockRes);
    });

    test('Return 201 on successfully saving a new Task', async () => {
      const { postTask } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      const newTask = {
        taskName: 'Sample Task',
        wbsId: new mongoose.Types.ObjectId(),
        num: '1',
        level: 1,
        position: 1,
        childrenQty: 0,
        isActive: true,
      };

      // Mock the current datetime
      const currentDate = Date.now();

      // Mock Task model
      const mockTask = {
        save: jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          wbsId: new mongoose.Types.ObjectId(),
          createdDatetime: currentDate,
          modifiedDatetime: currentDate,
        }),
      };
      const taskSaveSpy = jest.spyOn(Task.prototype, 'save').mockResolvedValue(mockTask);

      // Mock WBS model
      const mockWBS = {
        _id: new mongoose.Types.ObjectId(),
        projectId: 'projectId',
        modifiedDatetime: Date.now(),
        save: jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          projectId: 'projectId',
          modifiedDatetime: Date.now(),
        }),
      };
      const wbsFindByIdSpy = jest.spyOn(WBS, 'findById').mockResolvedValue(mockWBS);

      // Mock Project model
      const mockProjectObj = {
        save: jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          modifiedDatetime: currentDate,
        }),
        modifiedDatetime: currentDate,
      };
      const projectFindByIdSpy = jest.spyOn(Project, 'findById').mockResolvedValue(mockProjectObj);

      // add the necessary request params
      mockReq.params = {
        ...mockReq.params,
        id: new mongoose.Types.ObjectId(),
      };

      // add the necessary body parameters
      mockReq.body = {
        ...mockReq.body,
        ...newTask,
      };

      const response = await postTask(mockReq, mockRes);
      await flushPromises();

      assertResMock(201, expect.anything(), response, mockRes);
      expect(taskSaveSpy).toBeCalled();
      expect(wbsFindByIdSpy).toBeCalled();
      expect(projectFindByIdSpy).toBeCalled();
    });

    test('Return 400 on encountering any error during Promise.all', async () => {
      const { postTask } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      const newTask = {
        taskName: 'Sample Task',
        wbsId: new mongoose.Types.ObjectId(),
        num: '1',
        level: 1,
        position: 1,
        childrenQty: 0,
        isActive: true,
      };

      // Mock the current datetime
      const currentDate = Date.now();

      // Mock the Task model
      const mockTaskError = new Error('Failed to save task');

      // Use jest.fn() to mock the save method to reject with an error
      const taskSaveMock = jest.fn().mockRejectedValue(mockTaskError);

      // Spy on the Task prototype's save method
      const taskSaveSpy = jest.spyOn(Task.prototype, 'save').mockImplementation(taskSaveMock);

      // Mock WBS model
      const mockWBS = {
        _id: new mongoose.Types.ObjectId(),
        projectId: 'projectId',
        modifiedDatetime: Date.now(),
        save: jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(),
          projectId: 'projectId',
          modifiedDatetime: Date.now(),
        }),
      };
      // Mock `WBS.findById` to return `mockWBS`
      const wbsFindByIdSpy = jest.spyOn(WBS, 'findById').mockResolvedValue(mockWBS);

      // Mock Project model
      const mockProjectObj = {
        save: jest.fn().mockResolvedValueOnce({
          _id: new mongoose.Types.ObjectId(),
          modifiedDatetime: currentDate,
        }),
        modifiedDatetime: currentDate,
      };
      const projectFindByIdSpy = jest
        .spyOn(Project, 'findById')
        .mockResolvedValueOnce(mockProjectObj);

      // add the necessary request params
      mockReq.params = {
        ...mockReq.params,
        id: new mongoose.Types.ObjectId(),
      };

      // add the necessary body parameters
      mockReq.body = {
        ...mockReq.body,
        ...newTask,
      };

      const response = await postTask(mockReq, mockRes);
      await flushPromises();

      assertResMock(400, mockTaskError, response, mockRes);
      expect(taskSaveSpy).toBeCalled();
      expect(wbsFindByIdSpy).toBeCalled();
      expect(projectFindByIdSpy).toBeCalled();
    });
  });

  describe('updateNum function()', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Return 403 if `updateNum` permission is missing', async () => {
      const { updateNum } = makeSut();
      hasPermission.mockResolvedValueOnce(false);

      const error = { error: 'You are not authorized to create new projects.' };

      const response = await updateNum(mockReq, mockRes);
      await flushPromises();

      assertResMock(403, error, response, mockRes);
    });

    test('Return 400 if `nums` is missing from the request body', async () => {
      const { updateNum } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      const error = { error: 'Num is a mandatory fields' };
      mockReq.body.nums = null;

      const response = await updateNum(mockReq, mockRes);
      await flushPromises();

      assertResMock(400, error, response, mockRes);
    });

    test('Return 200 on successful update - nums is empty array', async () => {
      const { updateNum } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      mockReq.body.nums = [];

      const response = await updateNum(mockReq, mockRes);
      await flushPromises();

      assertResMock(200, true, response, mockRes);
    });

    test('Return 200 on successful update - nums is not an empty array', async () => {
      const { updateNum } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      mockReq.body.nums = [
        {
          id: 'sample-id',
          num: 'sample-num',
        },
      ];

      const mockDataForTaskFindByIdSpy = {
        num: 0,
        save: jest.fn().mockResolvedValue({}),
      };

      const taskFindByIdSpy = jest.spyOn(Task, 'findById').mockImplementation((id, callback) => {
        callback(null, mockDataForTaskFindByIdSpy);
      });

      const mockDataForTaskFindSpy = [];
      const taskFindSpy = jest.spyOn(Task, 'find').mockResolvedValueOnce(mockDataForTaskFindSpy);

      const response = await updateNum(mockReq, mockRes);
      await flushPromises();

      assertResMock(200, true, response, mockRes);
      expect(taskFindSpy).toBeCalled();
      expect(taskFindByIdSpy).toBeCalled();
    });

    test('Return 404 if error occurs on Task.find()', async () => {
      const { updateNum } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      mockReq.body.nums = [
        {
          id: 'sample-id',
          num: 'sample-num',
        },
      ];

      const mockDataForTaskFindByIdSpy = {
        num: 0,
        save: jest.fn().mockResolvedValue({}),
      };

      const taskFindByIdSpy = jest.spyOn(Task, 'findById').mockImplementation((id, callback) => {
        callback(null, mockDataForTaskFindByIdSpy);
      });

      const mockError = new Error({ error: 'some error occurred' });
      const taskFindSpy = jest.spyOn(Task, 'find').mockRejectedValueOnce(mockError);

      const response = await updateNum(mockReq, mockRes);
      await flushPromises();

      assertResMock(404, mockError, response, mockRes);
      expect(taskFindSpy).toBeCalled();
      expect(taskFindByIdSpy).toBeCalled();
    });

    test('Return 400 if error occurs while saving a Task within Task.findById()', async () => {
      const { updateNum } = makeSut();
      hasPermission.mockResolvedValueOnce(true);

      mockReq.body.nums = [
        {
          id: 'sample-id',
          num: 'sample-num',
        },
      ];

      const mockError = new Error({ error: 'some error occurred' });

      const mockDataForTaskFindByIdSpy = {
        num: 0,
        save: jest.fn().mockRejectedValueOnce(mockError),
      };

      const taskFindByIdSpy = jest.spyOn(Task, 'findById').mockImplementation((id, callback) => {
        callback(null, mockDataForTaskFindByIdSpy);
      });

      const mockDataForTaskFindSpy = [];
      const taskFindSpy = jest.spyOn(Task, 'find').mockResolvedValueOnce(mockDataForTaskFindSpy);

      const response = await updateNum(mockReq, mockRes);
      await flushPromises();

      assertResMock(400, mockError, response, mockRes);
      expect(taskFindSpy).toBeCalled();
      expect(taskFindByIdSpy).toBeCalled();
    });
  });
});
