const express = require('express');
const ExpressError = require('../expressError');
const Message = require('../models/message');
const router = new express.Router();
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn,async (req, res, send) => {
  try {
    let username = req.user.username;
    let message = await Message.get(req.params.id);
    
    if(message.from_user.username !== username && message.to_user.username !== username) {
      throw new ExpressError("Invalid message access", 401);
    }
    return res.json(message)

  } catch(e) {
    return next(e)
  }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async(req, res, send) => {
  try { 
    let message = await Message.create({
      from_username: req.user.username,
      to_username: req.body.username,
      body: req.body.body
    });
    return res.json({message})
  } catch (e) {
    return next(e)
  }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, send) => {
  try {
    let username = req.user.username;
    let msgGet = await Message.get(req.params.id);
    if(msgGet.to_user.username !== username){
      throw new ExpressError("Cannot set this message to read", 401);
    }
    let message = await Message.markRead(req.params.id);
    return res.json({message});

  } catch(e) {
    return next(e)
  }
})


module.exports = router;