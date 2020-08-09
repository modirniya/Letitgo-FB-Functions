import * as functions from 'firebase-functions';
import admin = require("firebase-admin");


"use strict";

let userInfo: any;

exports.newEntry = functions.https.onCall(async (data, context) => {
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
        const ref = admin.database().ref("Responses").child(language).child(topic);
        const parentSnapshot = await ref.orderByKey().once("value")/*, function (snapshot) {
            console.log("Counter :",snapshot.numChildren().toString());
            /!*if (snapshot.numChildren() > 99) {

            }*!/
        })*/
        if (parentSnapshot.numChildren() > 3) {
            let childCount = 0;
            const updates = {};
            parentSnapshot.forEach((child) => {
                if (++childCount <= parentSnapshot.numChildren() - 3) {
                    // @ts-ignore
                    updates[child.key] = null;
                }
            });
            await ref.update(updates);
        }
        return ref.push({
            "name": userInfo.uid,
            "text": entry,
            "vote_count": 0
        }).catch((er: any) => {
            throwError(er.title, er.message);
        });
    }
    console.log("Stop newEntry");
    return Promise.resolve([language, topic, entry]);

    function throwError(prompt: String, desc: string) {
        throw new functions.https.HttpsError("invalid-argument", String(desc));
    }
});