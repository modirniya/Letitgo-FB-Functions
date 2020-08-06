import * as functions from 'firebase-functions';
import admin = require("firebase-admin");

"use strict";

exports.newLike = functions.https.onCall(async (data, context) => {
    console.log("Start newLike");
    const language: string = data.language;
    const topic: string = data.topic;
    const target_uid: string = data.target_uid;
    if (!context.auth) {
        throwError(
            "failed-precondition",
            "The function must be called " + "while authenticated."
        );
    } else {
        const ref = admin.database().ref("Responses").child(language).child(topic).child(target_uid).child("vote_count");
        await intIncrementer(ref);
    }
    console.log("Stop newLike");
    return Promise.resolve([language, topic, target_uid]);

    function throwError(prompt: String, desc: string) {
        throw new functions.https.HttpsError("invalid-argument", String(desc));
    }

    async function intIncrementer(reference: admin.database.Reference) {
        return reference.transaction(function (current_value) {
            return (current_value || 0) + 1;
        });
    }
});