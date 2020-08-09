import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
//import * as admin from "firebase-admin";


"use strict";

let userInfo: any;

exports.newReport = functions.https.onCall((data, context) => {
    const language: string = data.language;
    const topic: string = data.topic;
    const category: string = data.category;
    const target_uid: string = data.target_uid;


    if (!context.auth) {
        throwError(
            "failed-precondition",
            "The function must be called while authenticated.");
        return;
    } else {
        userInfo = {
            uid: context.auth.uid,
            name: context.auth.token.name,
            email: context.auth.token.email,
        };

        const docRef = admin.firestore().collection('users').doc(target_uid).collection("reports").doc(category);
        const ref = admin.database().ref("Responses").child(language).child(topic).child(target_uid).child("reports");

        ref.child(userInfo.uid).once("value", async snapshot => {
            if (!snapshot.exists()) {
                console.log(userInfo.name, language, topic, target_uid, category)
                checkReportsBranch(docRef);
                await ref.child(userInfo.uid).set(category);
                let result: any = await intIncrementer(ref.child("count"));
                result = extractNumberFromPromise(result.snapshot);
                console.log("Result ", result);
                if (result >= 5) {
                    await ref.parent?.set(null)
                    console.log("Comment been deleted");
                }
                return result;
            }
            return
        }).catch(() => {
            throwError("Unknown", "Unknown")
        })
    }

    function checkReportsBranch(docRef: FirebaseFirestore.DocumentReference) {
        docRef.get().then(doc => {
            if (doc.exists) {
                const increment = admin.firestore.FieldValue.increment(1);
                return docRef.update({total_claims: increment});
            } else {
                return docRef.set({total_claims: 1});
            }
        }).catch(() => {
            throwError("Unknown error", "Unknown")
        })
    }

    function throwError(prompt: String, desc: string) {
        throw new functions.https.HttpsError("invalid-argument", String(desc));

    }

    async function intIncrementer(reference: admin.database.Reference) {
        return reference.transaction(function (current_value) {
            return (current_value || 0) + 1;
        });
    }
});

function extractNumberFromPromise(index: any) {
    return parseInt(extractStringFromPromise(index))
}

function extractStringFromPromise(input: any) {
    return JSON.stringify(input).replace(/\"/g, "")
}