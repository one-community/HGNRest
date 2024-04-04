const express = require('express');

const router = function (team) {
  const controller = require('../controllers/teamController')(team);

  const teamRouter = express.Router();

  teamRouter.route('/team')
    .get(controller.getAllTeams)
    .post(controller.postTeam);


  teamRouter.route('/teamCode')
    .get(controller.getAllTeamCode);
    
  teamRouter.route('/team/:teamId')
    .get(controller.getTeamById)
    .put(controller.putTeam)
    .delete(controller.deleteTeam);

  teamRouter.route('/team/:teamId/users/')
    .post(controller.assignTeamToUsers)
    .get(controller.getTeamMembership);

  teamRouter.route('/team/:userId/teammates')
    .get(controller.findTeammatesForUser);
  return teamRouter;
};

module.exports = router;
