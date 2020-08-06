import * as functions from 'firebase-functions';
import admin = require("firebase-admin");


"use strict";

let userInfo: any;

exports.newEntry = functions.https.onCall((data, context) => {
    console.log("Start newEntry");
    const language: string = data.language;
    const topic: string = data.topic;
    const entry: string = data.entry;
    if (!context.auth) {
        throwError(
            "failed-precondition",
            "The function must be called " + "while authenticated."
        );
    } else {
        userInfo = {
            uid: context.auth.uid,
            name: context.auth.token.name,
            email: context.auth.token.email,
        };
        const ref = admin.database().ref("Responses").child(language).child(topic).child(userInfo.uid);
        /*ref.once("value", function (snapshot) {
            if (snapshot.numChildren() > 99) {
                snapshot.
            }
        })*/
        //TODO Create system to keep children under a 100
        return ref.set({"name": "Someone else", "text": entry, "vote_count": 0}).catch((er: any) => {
            throwError(er.title, er.message);
        });
    }
    console.log("Stop newEntry");
    return Promise.resolve([language, topic, entry]);

    function throwError(prompt: String, desc: string) {
        throw new functions.https.HttpsError("invalid-argument", String(desc));
    }
});