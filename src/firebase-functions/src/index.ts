/**
 * @fileOverview Live Backend Cloud Functions for Sentrybase
 * This file contains live, deterministic backend logic for data processing,
 * indexing, and execution of core algorithms. It replaces all mock logic.
 */

import { onDocumentCreated, onDocumentDeleted, onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from 'firebase-admin';
import { logger } from "firebase-functions";
import {
  createTfIdfVector,
  buildVocabulary,
} from './text-analysis';

// Initialize Admin SDK
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

export const onUserCreate = onDocumentCreated('users/{userId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.info("User document created but no data found.");
        return;
    }
    const newUser = snapshot.data();
    const referrerId = newUser.referredBy;

    if (referrerId && referrerId !== newUser.id) {
        const referrerRef = db.collection("users").doc(referrerId);
        const referrerDoc = await referrerRef.get();

        if (referrerDoc.exists) {
            const referrerData = referrerDoc.data();
            if (!referrerData) {
                logger.warn(`Referrer document ${referrerId} has no data.`);
                return;
            }

            const batch = db.batch();

            const newUserColleagueRef = db.collection("users").doc(newUser.id).collection("colleagues").doc(referrerId);
            const referrerColleagueRef = db.collection("users").doc(referrerId).collection("colleagues").doc(newUser.id);
            batch.set(newUserColleagueRef, { addedAt: admin.firestore.FieldValue.serverTimestamp() });
            batch.set(referrerColleagueRef, { addedAt: admin.firestore.FieldValue.serverTimestamp() });

            const notificationRef = referrerRef.collection("notifications").doc();
            batch.set(notificationRef, {
                id: notificationRef.id,
                type: 'system',
                title: 'Referral Successful!',
                description: `${newUser.name} joined Sentrybase using your referral link.`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                isRead: false,
                link: `/u/${newUser.handle}`
            });

            await batch.commit();

            if (referrerData.fcmTokens && referrerData.fcmTokens.length > 0) {
                const message = {
                    notification: {
                        title: 'Referral Successful!',
                        body: `${newUser.name} just joined using your link!`,
                    },
                    tokens: referrerData.fcmTokens,
                };
                try {
                    await admin.messaging().sendEachForMulticast(message);
                    logger.info(`Push notification sent to ${referrerData.name} for successful referral of ${newUser.name}.`);
                } catch (error) {
                    logger.error(`Failed to send referral push notification to ${referrerData.name}`, error);
                }
            }
        } else {
            logger.warn(`Referrer document with ID ${referrerId} not found.`);
        }
    }
});


export const onProjectInvitation = onDocumentCreated('projects/{projectId}/invitations/{invitationId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.info("Invitation document created but no data found.");
        return;
    }

    const invitation = snapshot.data();
    const { inviteeId, inviterName, projectName } = invitation;

    if (!inviteeId) {
        logger.error("Invitation created without an inviteeId.", { invitationId: snapshot.id });
        return;
    }
    
    const inviteeDoc = await db.collection('users').doc(inviteeId).get();
    if (!inviteeDoc.exists) {
        logger.warn(`Invitee user document ${inviteeId} not found.`);
        return;
    }

    const inviteeData = inviteeDoc.data();
    
    if (inviteeData?.fcmTokens && inviteeData.fcmTokens.length > 0) {
        const message = {
            notification: {
                title: 'New Project Invitation',
                body: `${inviterName} invited you to join the project "${projectName}".`,
            },
            tokens: inviteeData.fcmTokens,
        };

        try {
            await admin.messaging().sendEachForMulticast(message);
            logger.info(`Push notification sent to ${inviteeData.name} for project invitation.`);
        } catch (error) {
            logger.error(`Failed to send project invitation push notification to ${inviteeData.name}.`, error);
        }
    }
});


export const onProjectMessage = onDocumentCreated('projects/{projectId}/messages/{messageId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const message = snapshot.data();
    const { senderId, senderName, content } = message;
    const { projectId } = event.params;

    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) return;
    const projectData = projectDoc.data();
    
    const membersSnapshot = await db.collection('projects').doc(projectId).collection('members').get();
    const memberIds = membersSnapshot.docs.map(doc => doc.id);
    
    const recipients = memberIds.filter(id => id !== senderId);

    if (recipients.length === 0) return;

    const usersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', recipients).get();
    
    const tokens: string[] = [];
    usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.fcmTokens) {
            tokens.push(...userData.fcmTokens);
        }
    });

    if (tokens.length > 0) {
        const notification = {
            title: `${senderName} in ${projectData?.projectName}`,
            body: content.substring(0, 100), 
        };
        
        try {
            await admin.messaging().sendEachForMulticast({ notification, tokens });
            logger.info(`Sent message notification to ${tokens.length} tokens for project ${projectId}.`);
        } catch (error) {
            logger.error("Error sending message notifications:", error);
        }
    }
});


export const onGigApplication = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to apply.');
    }
    
    const { gigOwnerId, gigId, gigTitle, applicantId, applicantName, applicantMotivation, applicantAge } = request.data;
    
    if (!gigOwnerId || !gigId || !gigTitle || !applicantId || !applicantName || !applicantMotivation || !applicantAge) {
        throw new HttpsError('invalid-argument', 'Missing required application data.');
    }

    const notificationRef = db.collection('users').doc(gigOwnerId).collection('notifications').doc();
    const userJobRef = db.collection('users').doc(applicantId).collection('jobs').doc(gigId);
    
    const batch = db.batch();

    batch.set(notificationRef, {
        id: notificationRef.id,
        type: 'job_application',
        title: `New Application for "${gigTitle}"`,
        description: `${applicantName} has applied for your gig.`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isRead: false,
        link: `/gigs/${gigId}`,
        metadata: {
            applicantId,
            applicantName,
            applicantMotivation,
            applicantAge,
            gigId,
            gigTitle,
        }
    });

    batch.set(userJobRef, {
        gigId,
        gigTitle,
        gigOwnerId,
        status: 'applied',
        appliedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    try {
        await batch.commit();

        const gigOwnerDoc = await db.collection('users').doc(gigOwnerId).get();
        const gigOwnerData = gigOwnerDoc.data();

        if (gigOwnerData?.fcmTokens && gigOwnerData.fcmTokens.length > 0) {
            const message = {
                notification: {
                    title: `New Application for "${gigTitle}"`,
                    body: `${applicantName} has applied for your gig.`,
                },
                tokens: gigOwnerData.fcmTokens,
            };
            await admin.messaging().sendEachForMulticast(message);
            logger.info(`Push notification sent to ${gigOwnerData.name} for new application.`);
        }

        return { success: true, notificationId: notificationRef.id };
    } catch (error) {
        logger.error('Failed to create gig application notification:', error);
        throw new HttpsError('internal', 'Could not create notification.');
    }
});


export const uploadFile = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to upload files.');
  }

  const { fileData, fileName, fileType, path } = request.data;

  if (!fileData || !fileName || !fileType || !path) {
    throw new HttpsError('invalid-argument', 'Missing required file data for upload.');
  }

  const bucket = storage.bucket();
  const buffer = Buffer.from(fileData, 'base64');
  
  const filePath = `${path}/${request.auth.uid}/${Date.now()}-${fileName}`;
  const file = bucket.file(filePath);

  try {
    await file.save(buffer, {
      metadata: { contentType: fileType },
    });

    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return { downloadURL: publicUrl };
  } catch (error) {
    logger.error('File upload failed', error);
    throw new HttpsError('internal', 'An error occurred while uploading the file.');
  }
});


export const onPostCreated = onDocumentCreated('posts/{postId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const postData = snapshot.data();
    const postId = event.params.postId;

    if (postData?.userId) {
        const userRef = db.collection('users').doc(postData.userId);
        try {
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                await userRef.update({ postCount: admin.firestore.FieldValue.increment(1) });
            } else {
                 logger.warn(`User document ${postData.userId} not found. Cannot increment post count.`);
            }
        } catch (error) {
            logger.error(`Failed to increment post count for user ${postData.userId}`, error);
        }
    }
    
    if (postData.type === 'job_opportunity') {
        const userJobRef = db.collection('users').doc(postData.userId).collection('jobs').doc(postId);
        await userJobRef.set({
            gigId: postId,
            gigTitle: postData.jobDetails.title,
            gigOwnerId: postData.userId,
            status: 'posted',
            createdAt: postData.createdAt,
        });
    }

    if (postData.originalPost?.id) {
        const originalPostRef = db.collection('posts').doc(postData.originalPost.id);
        try {
            await originalPostRef.update({ repostCount: admin.firestore.FieldValue.increment(1) });
        } catch (error) {
            logger.error(`Failed to increment repost count for post ${postData.originalPost.id}`, error);
        }
    }
});


export const onVoteWritten = onDocumentWritten('votes/{voteId}', async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!afterData) { 
        const { postId, direction } = beforeData as any;
        const postRef = db.collection('posts').doc(postId);
        const increment = direction === 'up' ? -1 : 1;
        return postRef.update({ voteCount: admin.firestore.FieldValue.increment(increment) });
    }

    if (!beforeData) { 
        const { postId, direction } = afterData as any;
        const postRef = db.collection('posts').doc(postId);
        const increment = direction === 'up' ? 1 : -1;
        return postRef.update({ voteCount: admin.firestore.FieldValue.increment(increment) });
    }

    if (beforeData.direction !== afterData.direction) { 
        const { postId } = afterData as any;
        const postRef = db.collection('posts').doc(postId);
        const increment = afterData.direction === 'up' ? 2 : -2;
        return postRef.update({ voteCount: admin.firestore.FieldValue.increment(increment) });
    }
    
    return null;
});


export const onReplyCreated = onDocumentCreated('posts/{postId}/replies/{replyId}', async (event) => {
    const { postId } = event.params;
    const postRef = db.collection('posts').doc(postId);
    await postRef.update({ replyCount: admin.firestore.FieldValue.increment(1) });
});

export const onReplyDeleted = onDocumentDeleted('posts/{postId}/replies/{replyId}', async (event) => {
    const { postId } = event.params;
    const postRef = db.collection('posts').doc(postId);
    await postRef.update({ replyCount: admin.firestore.FieldValue.increment(-1) });
});

export const onUserFollow = onDocumentCreated('users/{userId}/following/{followingId}', async (event) => {
    const { userId, followingId } = event.params;
    
    const userRef = db.collection('users').doc(userId);
    const followedUserRef = db.collection('users').doc(followingId);

    const batch = db.batch();
    batch.update(userRef, { followingCount: admin.firestore.FieldValue.increment(1) });
    batch.update(followedUserRef, { followerCount: admin.firestore.FieldValue.increment(1) });

    await batch.commit();

    try {
        const followerDoc = await userRef.get();
        const followedDoc = await followedUserRef.get();

        if (!followerDoc.exists || !followedDoc.exists) {
            logger.error('Follower or followed user document does not exist.');
            return;
        }

        const followerData = followerDoc.data();
        const followedData = followedDoc.data();
        
        const isFollowingBackDoc = await db.collection('users').doc(followingId).collection('following').doc(userId).get();
        const isFollowingBack = isFollowingBackDoc.exists;

        const notificationTitle = isFollowingBack ? 'New Connection!' : 'New Follower!';
        const notificationBody = isFollowingBack 
            ? `You and ${followerData?.name || 'Someone'} are now connected.`
            : `${followerData?.name || 'Someone'} is now following you.`;

        if (followedData?.fcmTokens && followedData.fcmTokens.length > 0) {
            const message = {
                notification: {
                    title: notificationTitle,
                    body: notificationBody,
                    icon: followerData?.avatar || '/favicon.ico',
                },
                tokens: followedData.fcmTokens,
            };

            await admin.messaging().sendEachForMulticast(message);
            logger.info(`Notification sent to ${followedData.name}`);
        }
    } catch (error) {
        logger.error('Failed to send follow notification:', error);
    }
});

export const onUserUnfollow = onDocumentDeleted('users/{userId}/following/{followingId}', async (event) => {
    const { userId, followingId } = event.params;

    const userRef = db.collection('users').doc(userId);
    const unfollowedUserRef = db.collection('users').doc(followingId);
    
    const batch = db.batch();
    batch.update(userRef, { followingCount: admin.firestore.FieldValue.increment(-1) });
    batch.update(unfollowedUserRef, { followerCount: admin.firestore.FieldValue.increment(-1) });

    await batch.commit();
});

export const onUserUpdate = onDocumentWritten('users/{userId}', async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!after) {
        return;
    }

    const nameChanged = before?.name !== after.name;
    const handleChanged = before?.handle !== after.handle;
    const avatarChanged = before?.avatar !== after.avatar;
    const verificationChanged = before?.isSentrybaseVerified !== after.isSentrybaseVerified;

    if (nameChanged || handleChanged || avatarChanged || verificationChanged) {
        logger.info(`User ${event.params.userId} profile changed. Propagating updates.`);
        const postsQuery = db.collectionGroup('posts').where('author.id', '==', event.params.userId);
        const repliesQuery = db.collectionGroup('replies').where('author.id', '==', event.params.userId);

        const newAuthorData = {
          name: after.name,
          handle: after.handle,
          avatar: after.avatar,
        };

        try {
          const batch = db.batch();
          const [postsSnapshot, repliesSnapshot] = await Promise.all([
            postsQuery.get(),
            repliesQuery.get(),
          ]);

          postsSnapshot.forEach(doc => {
            batch.update(doc.ref, { author: newAuthorData });
          });

          repliesSnapshot.forEach(doc => {
            batch.update(doc.ref, { author: newAuthorData });
          });

          if (postsSnapshot.size > 0 || repliesSnapshot.size > 0) {
            await batch.commit();
            logger.info(`Propagated updates to ${postsSnapshot.size} posts and ${repliesSnapshot.size} replies for user ${event.params.userId}.`);
          }
        } catch (error) {
          logger.error(`Failed to propagate user profile updates for ${event.params.userId}`, error);
        }
    }
});


export const onUserOrProjectWrite = onDocumentWritten('{collectionId}/{docId}',
  async (event) => {
    const { collectionId, docId } = event.params;
    const collectionsToProcess = ['users', 'projects'];

    if (!collectionsToProcess.includes(collectionId)) {
      return;
    }

    const documentData = event.data?.after.data();

    if (!documentData) {
      logger.info(
        `Document ${docId} deleted from ${collectionId}. Cleaning up indices.`
      );
      return;
    }

    const textToAnalyze = documentData.bio || documentData.description || '';
    const skills: string[] =
      documentData.skills || documentData.requiredSkills || [];
    const vocabulary = new Set(skills.map((s: string) => s.toLowerCase())); 

    const batch = db.batch();

    if (vocabulary.size > 0) {
      logger.info(`Updating skill indices for document: ${docId}`);
      vocabulary.forEach((skill: string) => {
        const skillSlug = skill.replace(/\s+/g, '-');
        const indexRef = db.collection('skillIndex').doc(skillSlug);
        batch.set(
          indexRef,
          {
            docIds: admin.firestore.FieldValue.arrayUnion(docId),
          },
          { merge: true }
        );
      });
    }

    const corpusSnapshot = await db.collection(collectionId).limit(100).get();
    const corpus = corpusSnapshot.docs.map((doc) => {
      const data = doc.data();
      return data?.bio || data?.description || '';
    });
    const corpusVocabulary = buildVocabulary(corpus);

    const vector = createTfIdfVector(textToAnalyze, corpus, corpusVocabulary);

    const vectorObject: { [key: string]: number } = {};
    vector.forEach((value: number, key: string) => {
      vectorObject[key] = value;
    });

    if (event.data?.after.ref) {
      batch.update(event.data.after.ref, { vectors: vectorObject });
    }

    logger.info(`Successfully updated indices and vector for ${docId}.`);
    await batch.commit();
  }
);

export const onLessonWritten = onDocumentWritten('courses/{courseId}/modules/{moduleId}/lessons/{lessonId}', async (event) => {
    const { courseId, moduleId } = event.params;
    const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
    
    if (!event.data?.before.exists && event.data?.after.exists) {
        try {
            await moduleRef.update({ lessonCount: admin.firestore.FieldValue.increment(1) });
            logger.info(`Incremented lesson count for module ${moduleId}`);
        } catch (error) {
            logger.error(`Failed to increment lesson count for module ${moduleId}`, error);
        }
    } 
    else if (event.data?.before.exists && !event.data?.after.exists) {
        try {
            await moduleRef.update({ lessonCount: admin.firestore.FieldValue.increment(-1) });
            logger.info(`Decremented lesson count for module ${moduleId}`);
        } catch (error) {
            logger.error(`Failed to decrement lesson count for module ${moduleId}`, error);
        }
    }
});


export const scheduledDataProcessing = onSchedule('every 24 hours', async (event) => {
    logger.info('Starting daily scheduled data processing...');

    const allDocsSnapshot = await db.collection('users').get();
    const documents: string[] = allDocsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return data?.bio || '';
    });
    const vocabulary = buildVocabulary(documents);
    const idfMap: { [key: string]: number } = {};

    vocabulary.forEach((term: string) => {
      const docsWithTerm = documents.filter((doc) =>
        (doc || '').toLowerCase().includes(term)
      ).length;
      if (docsWithTerm > 0) {
        idfMap[term] = Math.log(documents.length / docsWithTerm);
      }
    });

    const idfRef = db.collection('system').doc('idfGlobal');
    await idfRef.set({
      idfMap,
      lastUpdated: admin.firestore.Timestamp.now(),
    });

    logger.info(`Global IDF map updated for ${vocabulary.size} terms.`);
  }
);


export const createMeeting = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { title, description } = request.data;
  const hostId = request.auth.uid;

  if (!title) {
    throw new HttpsError('invalid-argument', 'The function must be called with a "title" argument.');
  }

  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const meetingRef = await db.collection('meetings').add({
      title,
      description: description || 'A new Sentrybase meeting.',
      hostId,
      participantIds: [hostId],
      status: 'lobby',
      joinCode,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        lockMeeting: false,
        allowScreenShare: true,
      },
    });
    
    logger.info(`Meeting ${meetingRef.id} created by ${hostId} with join code ${joinCode}.`);
    return { meetingId: meetingRef.id, joinCode };

  } catch (error) {
    logger.error('Error creating meeting:', error);
    throw new HttpsError('internal', 'Failed to create meeting.');
  }
});


export const joinMeetingByCode = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { joinCode } = request.data;
  const userId = request.auth.uid;

  if (!joinCode || typeof joinCode !== 'string') {
    throw new HttpsError('invalid-argument', 'The function must be called with a "joinCode" string argument.');
  }

  try {
    const meetingsRef = db.collection('meetings');
    const querySnapshot = await meetingsRef.where('joinCode', '==', joinCode.toUpperCase()).limit(1).get();

    if (querySnapshot.empty) {
      throw new HttpsError('not-found', `No active meeting found with code: ${joinCode}`);
    }

    const meetingDoc = querySnapshot.docs[0];
    const meetingData = meetingDoc.data();

    if (meetingData.settings.lockMeeting) {
        throw new HttpsError('failed-precondition', 'This meeting is currently locked by the host.');
    }
    
    if (meetingData.status !== 'lobby') {
        throw new HttpsError('failed-precondition', 'This meeting is no longer accepting new participants.');
    }
    
    if (meetingData.participantIds.includes(userId)) {
      logger.info(`User ${userId} is already in meeting ${meetingDoc.id}.`);
      return { meetingId: meetingDoc.id, message: 'Already a participant.' };
    }

    await meetingDoc.ref.update({
      participantIds: admin.firestore.FieldValue.arrayUnion(userId)
    });

    logger.info(`User ${userId} successfully joined meeting ${meetingDoc.id}.`);
    return { meetingId: meetingDoc.id };

  } catch (error: any) {
    logger.error(`Error joining meeting with code ${joinCode}:`, error);
    if (error instanceof HttpsError) {
        throw error;
    }
    throw new HttpsError('internal', 'Failed to join meeting.');
  }
});


export const createCallOffer = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to create a call.');
    }
    const { meetingId, calleeId, offer } = request.data;
    if (!meetingId || !calleeId || !offer) {
        throw new HttpsError('invalid-argument', 'Missing required arguments: meetingId, calleeId, offer.');
    }

    const callDocRef = db.collection('meetings').doc(meetingId).collection('calls').doc();
    
    await callDocRef.set({
        callerId: request.auth.uid,
        calleeId,
        offer,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { callId: callDocRef.id };
});


export const createCallAnswer = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to answer a call.');
    }
    const { meetingId, callId, answer } = request.data;
     if (!meetingId || !callId || !answer) {
        throw new HttpsError('invalid-argument', 'Missing required arguments: meetingId, callId, answer.');
    }
    
    const callDocRef = db.collection('meetings').doc(meetingId).collection('calls').doc(callId);
    
    const callDoc = await callDocRef.get();
    if (!callDoc.exists || !request.auth || callDoc.data()?.calleeId !== request.auth.uid) {
        throw new HttpsError('not-found', 'Call document not found or you are not the callee.');
    }
    await callDocRef.update({ answer });
    return { success: true };
});
