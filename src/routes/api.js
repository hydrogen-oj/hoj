/* eslint-disable no-unused-vars */
'use strict';

import express from 'express';
import config from '../config.js';
import error from '../error.js';
import sql from '../sql.js';
import cryptojs from 'crypto-js';

let router = express.Router();

router.get('/sql/:query', (req, res) => {
    sql.query(req.params.query, (err, result, field) => {
        if (err) throw err;
        res.send(result);
    });
});

router.post('/signup', (req, res) => {
    sql.query(`SELECT username FROM scoj.user_account where username='${req.body.username}'`, (err, result, field) => {
        if (err) throw err;
        if (result.length === 0) {
            sql.query(`INSERT INTO user_account (uid, username, password, reg_time)
                    VALUE (${config.uid_next}, '${req.body.username}', MD5(CONCAT('${req.body.password}', '${config.md5_salt}')), NOW())`);
            sql.query(`INSERT INTO user_account ((uid, nickname, avatar, sex, tag)
                VALUE (${config.uid_next}, '${req.body.username}', MD5(CONCAT('${req.body.password}', '${config.md5_salt}')), NOW())`);
            ++config.uid_next;
            res.redirect('/login');
        }
        else {
            res.json(error.signup_error);
        }
    });
});

router.post('/login', (req, res) => {
    sql.query(`SELECT username, password FROM scoj.user_account where username='${req.body.username}'`, (err, result, field) => {
        if (err) throw err;
        if (result.length === 1) {
            if (cryptojs.MD5(req.body.password + config.md5_salt).toString() === result[0].password) {
                req.session.username = req.body.username;
                res.redirect('/');
                return;
            }
        }
        res.json(error.login_error);
    });
});

export default router;