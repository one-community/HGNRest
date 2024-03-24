/* eslint-disable quotes */
const express = require("express");

const route = function () {
  const controller = require("../controllers/reportsController")();

  const reportsRouter = express.Router();

  reportsRouter
    .route("/reports/recepients/:userid")
    .patch(controller.saveReportsRecepients)
    .delete(controller.deleteReportsRecepients);

  reportsRouter
    .route("/reports/getrecepients")
    .get(controller.getReportRecipients);

  reportsRouter
    .route("/reports/weeklysummaries")
    .get(controller.getWeeklySummaries);

  reportsRouter
    .route("/reports/overviewsummaries/bluestats")
    .get(controller.getBlueSquareStats);

  reportsRouter
  .route("/reports/overviewsummaries/volunteerrolestats")
  .get(controller.getVolunteerRoleStats);

  return reportsRouter;
};

module.exports = route;
