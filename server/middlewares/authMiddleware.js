const express = require('express')

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(400).json()
        }
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}

module.exports = authMiddleware;