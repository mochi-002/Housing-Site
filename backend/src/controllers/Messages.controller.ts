import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import { Message } from '../models/Message.model.js'
import { User } from '../models/User.model.js'
import type { Response } from 'express'
import type { AuthRequest } from '../middlewares/Auth.middleware.js'
import { sendSuccess, sendError } from '../utils/response.util.js'
import { validateId } from '../middlewares/ErrorHandlers.middleware.js'

/**
 * @description Send a message to another user
 * @route /messages
 * @method POST
 * @access private
 */
const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { recipientId, content, aparmtnetId } = req.body
  if (!recipientId || !content?.trim()) {
    sendError(res, {
      message: 'recipientId and content are required',
      statusCode: 400,
    })
    return
  }

  if (!validateId(recipientId, res)) return

  if (recipientId === String(req.user!._id)) {
    sendError(res, { message: "You can't message yourself", statusCode: 400 })
    return
  }

  const recipient = await User.findById(recipientId)
  if (!recipient) {
    sendError(res, { message: 'Recipient not found', statusCode: 404 })
    return
  }

  const message = await Message.create({
    sender: req.user!._id,
    recipient: recipientId,
    listing: aparmtnetId ?? undefined,
    content: content.trim(),
  })

  sendSuccess(res, {
    message: 'Message sent successfully',
    data: { message },
    statusCode: 201,
  })
})

/**
 * @description Get the message thread between the logged-in user and another user
 * @route /messages/:userId
 * @method GET
 * @access private
 */
const getConversation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    const messages = await Message.find({
      $or: [
        { sender: req.user!._id, recipient: userId },
        { sender: userId, recipient: req.user!._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName email -_id')
      .populate('listing', 'location price')

    // Mark any messages the other user sent to us as read
    await Message.updateMany(
      { sender: userId, recipient: req.user!._id, read: false },
      { $set: { read: true } },
    )

    sendSuccess(res, {
      message: 'Conversation fetched successfully',
      data: { messages },
      statusCode: 200,
    })
  },
)

/**
 * @description Get a list of all conversations for the logged-in user (inbox preview)
 * @route /messages/mine
 * @method GET
 * @access private
 */
const getConversations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // 1. convert user id to use in mongoo
    const userId = new mongoose.Types.ObjectId(req.user!._id)

    const conversations = await Message.aggregate([
      // 1. get messages sent or recived by this user
      { $match: { $or: [{ sender: userId }, { recipient: userId }] } },
      // 2. sort by last recieved - sent
      { $sort: { createdAt: -1 } },
      // 3. get messages recieved
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', userId] }, '$recipient', '$sender'],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', userId] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      // joining
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'partner',
        },
      },
      // convert from an array to a js object
      { $unwind: '$partner' },
      // final response
      {
        $project: {
          _id: 0,
          partner: {
            _id: '$partner._id',
            fullName: '$partner.fullName',
            email: '$partner.email',
          },
          'lastMessage.content': 1,
          'lastMessage.createdAt': 1,
          'lastMessage.sender': 1,
          unreadCount: 1,
        },
      },
      // dort again because $project may effect the sorting
      { $sort: { 'lastMessage.createdAt': -1 } },
    ])

    sendSuccess(res, {
      message:
        conversations.length === 0
          ? `No conversations found`
          : `Conversations fetched successfully`,
      data: { conversations },
      statusCode: 200,
    })
  },
)

export { sendMessage, getConversation, getConversations }
