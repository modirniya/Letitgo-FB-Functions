'use strict'

import admin = require("firebase-admin");

admin.initializeApp();

const entries = require("./newEntry");
exports.newEntry = entries.newEntry;

const likes = require("./newLike");
exports.newLike = likes.newLike;

const reports = require("./newReport");
exports.newReport = reports.newReport;

